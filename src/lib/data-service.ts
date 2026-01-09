
'use server';

import type { Candidate, Booking } from './types';
import { format } from 'date-fns';

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

export async function fetchCandidates(page = 1): Promise<{ candidates: Candidate[]; totalPages: number }> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates?with_key_stages_only=1&with_key_stages=1&per_page=20&page=${page}`, {
            next: { revalidate: 3600 } 
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch candidates: ${response.statusText}`);
        }

        const totalPages = parseInt(response.headers.get('X-Total-Pages') || '1', 10);
        const jsonResponse = await response.json();
        const candidates = jsonResponse.data.map(transformCandidateData);
        
        return { candidates, totalPages };
    } catch (error) {
        console.error("Error fetching candidates:", error);
        return { candidates: [], totalPages: 1 };
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
            const candidate = transformCandidateData(jsonResponse.data);
            
            // Add mock reviews data if it doesn't exist
            if (!candidate.reviewsData) {
                 candidate.reviewsData = [
                    { reviewerName: 'Greenwood Academy', rating: 5, comment: 'An exceptional educator. Their passion is infectious, and our students were thoroughly engaged.', date: '2024-06-10' },
                    { reviewerName: 'Northwood School', rating: 4, comment: 'A very knowledgeable and professional teacher. We would happily have them back.', date: '2024-05-22' },
                ]
            }
            return candidate;
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
        const response = await fetch(`${API_BASE_URL}/schedulers`, {
             cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        
        // Enrich booking data with candidate details if needed
        const { candidates: fetchedCandidates } = await fetchCandidates();
        const candidateMap = new Map(fetchedCandidates.map(c => [c.id, c]));

        const bookingsPromises = jsonResponse.data.map(async (booking: any): Promise<Booking> => {
            const candidateId = booking.candidate_id?.toString();
            let candidate = candidateId ? candidateMap.get(candidateId) : undefined;
            
            // If candidate is not in our initial list, fetch them directly
            if (!candidate && candidateId) {
                const fetchedCandidate = await fetchCandidateById(candidateId);
                if (fetchedCandidate) {
                    candidate = fetchedCandidate;
                }
            }

            return {
                id: booking.id.toString(),
                candidateId: candidateId,
                candidateName: candidate?.name || 'Unknown Candidate',
                candidateRole: candidate?.role || 'Unknown Role',
                date: booking.start_date, // Using start_date for the main date
                startDate: booking.start_date,
                endDate: booking.end_date,
                status: booking.status, // Assuming status is a direct mapping
                confirmationStatus: booking.confirmation_status,
                bookingType: booking.booking_type,
                session: booking.session_type,
            };
        });

        const bookings = await Promise.all(bookingsPromises);
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
    bookingType?: 'Day' | 'Hourly';
    session?: 'AllDay' | 'AM' | 'PM';
}

export async function createBooking({ candidateId, dates, role, bookingType, session }: CreateBookingParams): Promise<{success: boolean; bookings?: Booking[]}> {
    const companyId = '118008'; // Hardcoded as per instructions
    
    if (!dates || dates.length === 0) {
        return { success: false };
    }

    // Sort dates to easily find min and max
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    const bookingData = {
        candidate_id: parseInt(candidateId),
        company_id: parseInt(companyId),
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        booking_type: bookingType,
        session_type: session,
        status: 'Pencilled',
        confirmation_status: 'Pending',
        createdby: 'MyTalent Support',
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/schedulers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok || result.errors) {
            console.error("Booking creation failed:", result.errors);
            return { success: false };
        }
        
        const newBooking = {
           id: result.data.id.toString(),
           candidateId: result.data.candidate_id?.toString(),
           candidateName: '', // This would need to be fetched or passed
           candidateRole: role,
           date: result.data.start_date,
           startDate: result.data.start_date,
           endDate: result.data.end_date,
           status: result.data.status,
           confirmationStatus: result.data.confirmation_status,
           bookingType: result.data.booking_type,
           session: result.data.session_type,
       };

        return { success: true, bookings: [newBooking] };

    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false };
    }
}

interface UpdateBookingParams {
    id: string;
    candidateId?: string;
    dates?: Date[];
    role?: string;
    bookingType?: 'Day' | 'Hourly';
    session?: 'AllDay' | 'AM' | 'PM';
    status?: string;
}

export async function updateBooking(params: UpdateBookingParams): Promise<{success: boolean; booking?: Booking}> {
    const { id, ...updateData } = params;

    const apiPayload: any = {};
    
    if (updateData.dates && updateData.dates.length > 0) {
        const sortedDates = updateData.dates.sort((a,b) => a.getTime() - b.getTime());
        apiPayload.start_date = format(sortedDates[0], 'yyyy-MM-dd');
        apiPayload.end_date = format(sortedDates[sortedDates.length - 1], 'yyyy-MM-dd');
    }
    if (updateData.bookingType) apiPayload.booking_type = updateData.bookingType;
    if (updateData.session) apiPayload.session_type = updateData.session;
    if (updateData.status) apiPayload.status = updateData.status;
    if (updateData.candidateId) apiPayload.candidate_id = parseInt(updateData.candidateId);
    if (updateData.role) apiPayload.job_title_id = updateData.role; // Assuming role maps to job_title_id, which might be incorrect. This is a placeholder.

    try {
         const response = await fetch(`${API_BASE_URL}/schedulers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(apiPayload)
        });

        const result = await response.json();
        
        if (!response.ok || result.errors) {
            console.error(`Booking update failed for id ${id}:`, result.errors);
            return { success: false };
        }

        const updatedBooking = {
           id: result.data.id.toString(),
           candidateId: result.data.candidate_id?.toString(),
           candidateName: '',
           candidateRole: params.role || '',
           date: result.data.start_date,
           startDate: result.data.start_date,
           endDate: result.data.end_date,
           status: result.data.status,
           confirmationStatus: result.data.confirmation_status,
           bookingType: result.data.booking_type,
           session: result.data.session_type,
       };

        return { success: true, booking: updatedBooking };
    } catch (error) {
        console.error(`Error updating booking ${id}:`, error);
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
