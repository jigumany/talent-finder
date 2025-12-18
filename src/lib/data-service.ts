
import type { Candidate, Booking } from './types';

const API_BASE_URL = 'https://gslstaging.mytalentcrm.com/api/v2/open';

const detailTypeMap: Record<string, string> = {
    'KS1': 'Key Stage 1',
    'KS2': 'Key Stage 2',
    'KS3': 'Key Stage 3',
    'KS4': 'Key Stage 4',
    'KS5': 'Key Stage 5',
    'SEND': 'SEND',
    'Add': 'Additional Criteria',
    'Langs': 'Languages',
    'Quals': 'Qualifications',
};

const transformCandidateData = (apiCandidate: any): Candidate => {
    const qualifications = apiCandidate.details?.map((detail: any) => detail.detail_type_value) || [];
    
    const details: Record<string, string[]> = {};
    if (apiCandidate.details) {
        for (const detail of apiCandidate.details) {
            const rawType = detail.detail_type;
            const mappedType = detailTypeMap[rawType] || rawType; // Use mapped name or fallback to raw name
            const value = detail.detail_type_value;
            if (!details[mappedType]) {
                details[mappedType] = [];
            }
            details[mappedType].push(value);
        }
    }

    const role = apiCandidate.candidate_type?.name || apiCandidate.job_title?.name || 'Educator';

    // Ensure rateType is either 'hourly' or 'daily'
    let rateType: 'hourly' | 'daily' = 'daily'; // Default to daily
    if (apiCandidate.pay_type?.toLowerCase() === 'hourly' || apiCandidate.pay_type?.toLowerCase() === 'daily') {
        rateType = apiCandidate.pay_type.toLowerCase();
    }
    
    return {
        id: apiCandidate.id.toString(),
        name: `${apiCandidate.first_name} ${apiCandidate.last_name}`,
        role: role,
        rate: apiCandidate.pay_rate || 0, // Use pay_rate from API or default to 0
        rateType: rateType,
        rating: Math.round((Math.random() * (5 - 4) + 4) * 10) / 10,
        reviews: Math.floor(Math.random() * 30),
        location: apiCandidate.location?.city || 'Location not specified',
        qualifications: qualifications,
        details: details,
        availability: apiCandidate.dates?.next_available_date ? [apiCandidate.dates.next_available_date] : [],
        imageUrl: `https://picsum.photos/seed/${apiCandidate.id}/100/100`,
        cvUrl: '#',
        bio: `An experienced ${role} based in ${apiCandidate.location?.city || 'the UK'}.`,
    };
};

export async function fetchCandidates(): Promise<Candidate[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates?with_key_stages_only=1&with_key_stages=1&per_page=20`, {
            next: { revalidate: 3600 } 
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch candidates: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        const transformedCandidates = jsonResponse.data.map(transformCandidateData);
        
        return transformedCandidates;
    } catch (error) {
        console.error("Error fetching candidates:", error);
        return [];
    }
}

export async function fetchCandidateById(id: string): Promise<Candidate | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${id}?with_key_stages_only=1&with_key_stages=1`, {
             next: { revalidate: 3600 } 
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch candidate with id ${id}: ${response.statusText}`);
        }
        
        const jsonResponse = await response.json();
        if (jsonResponse.data) {
            return transformCandidateData(jsonResponse.data);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching candidate with id ${id}:`, error);
        return null;
    }
}

export async function fetchCandidateAvailabilities(candidateId: string): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/availabilities`);
        if (!response.ok) {
            throw new Error(`Failed to fetch availabilities for candidate ${candidateId}`);
        }
        const jsonResponse = await response.json();
        return jsonResponse.data || [];
    } catch (error) {
        console.error(`Error fetching candidate availabilities for ${candidateId}:`, error);
        return [];
    }
}


export async function fetchBookings(): Promise<Booking[]> {
    try {
        // NOTE: The API for schedulers/bookings wasn't specified, so I'm using the candidates endpoint as a placeholder.
        // This should be updated to point to the correct schedulers/bookings endpoint.
        const response = await fetch(`${API_BASE_URL}/schedulers`, {
             cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        
        // Enrich booking data with candidate details if needed
        const candidates = await fetchCandidates();
        const candidateMap = new Map(candidates.map(c => [c.id, c]));

        const bookings: Booking[] = jsonResponse.data.map((booking: any) => {
            const candidate = candidateMap.get(booking.candidate_id?.toString());
            return {
                id: booking.id.toString(),
                candidateId: booking.candidate_id?.toString(),
                candidateName: candidate?.name || 'Unknown Candidate',
                candidateRole: candidate?.role || 'Unknown Role',
                date: booking.start_date, // Using start_date for the main date
                startDate: booking.start_date,
                endDate: booking.end_date,
                status: booking.status, // Assuming status is a direct mapping
            };
        });

        return bookings;

    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

interface CreateBookingParams {
    candidateId: string;
    dates: Date[];
    role: string;
    bookingType: 'Day' | 'Hourly';
    session: 'AllDay' | 'AM' | 'PM';
}

export async function createBooking({ candidateId, dates, role, bookingType, session }: CreateBookingParams): Promise<{success: boolean; bookings?: Booking[]}> {
    const companyId = '118008'; // Hardcoded as per instructions
    
    try {
        const responses = await Promise.all(dates.map(date => {
            // Note: The API does not seem to support AM/PM sessions directly.
            // We are passing 'Day' as the booking_type.
            // In a real scenario, you might need to send start/end times if the API supported it.
            const bookingData = {
                candidate_id: parseInt(candidateId),
                company_id: parseInt(companyId),
                start_date: date.toISOString().split('T')[0],
                end_date: date.toISOString().split('T')[0],
                booking_type: bookingType,
                status: 'Confirmed'
            };
            
            return fetch(`${API_BASE_URL}/schedulers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });
        }));

        const results = await Promise.all(responses.map(res => res.json()));

        const failed = results.some(res => !res.data || res.errors);
        if (failed) {
            results.forEach(res => {
                if(res.errors) console.error("Booking creation failed:", res.errors);
            });
            throw new Error('One or more bookings failed to be created.');
        }

        const newBookings = results.map(res => {
             return {
                id: res.data.id.toString(),
                candidateId: res.data.candidate_id?.toString(),
                candidateName: '', // This would need to be fetched or passed
                candidateRole: role,
                date: res.data.start_date,
                startDate: res.data.start_date,
                endDate: res.data.end_date,
                status: res.data.status,
            };
        });

        return { success: true, bookings: newBookings };

    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false };
    }
}

export async function cancelBooking(bookingId: string): Promise<{success: boolean}> {
     try {
        const response = await fetch(`${API_BASE_URL}/schedulers/${bookingId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to cancel booking: ${response.statusText}`);
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error canceling booking:", error);
        return { success: false };
    }
}
