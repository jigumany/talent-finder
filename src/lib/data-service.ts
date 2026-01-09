
'use server';

import type { Candidate, Booking } from './types';
import { format } from 'date-fns';

const API_BASE_URL = 'https://gslstaging.mytalentcrm.com/api/v2/open';

// This map translates API short codes into human-readable category names.
const detailTypeMap: Record<string, string> = {
    'EYFS': 'Key Stages',
    'KS1': 'Key Stages',
    'KS2': 'Key Stages',
    'KS3': 'Key Stages',
    'KS4': 'Key Stages',
    'KS5': 'Key Stages',
    'Quals': 'Qualifications',
    'Add': 'Additional Qualifications',
    'Langs': 'Languages',
    'SEND': 'SEND',
};

const transformCandidateData = (apiCandidate: any): Candidate => {
    // This is the structured object we will build.
    const details: Record<string, string[]> = {};
    const qualifications: string[] = [];
    
    // Combine both 'details' and 'key_stages' from the API into one array to process.
    const allApiDetails = [...(apiCandidate.details || []), ...(apiCandidate.key_stages || [])];
    const seenValues = new Set<string>();

    for (const detail of allApiDetails) {
        // Skip if there's no value or if we've already processed this exact value to prevent duplicates.
        if (!detail.detail_type_value || seenValues.has(detail.detail_type_value)) {
            continue;
        }
        seenValues.add(detail.detail_type_value);

        // Use our map to get the proper category name, or fall back to the API's name.
        const category = detailTypeMap[detail.detail_type] || detail.detail_type;
        
        // If the category doesn't exist on our details object, initialize it.
        if (!details[category]) {
            details[category] = [];
        }
        
        // Add the value to the correct category.
        details[category].push(detail.detail_type_value);

        // Also add to the flat 'qualifications' array for backwards compatibility/other uses.
        if (!qualifications.includes(detail.detail_type_value)) {
            qualifications.push(detail.detail_type_value);
        }
    }

    const role = apiCandidate.candidate_type?.name || apiCandidate.job_title?.name || 'Educator';
    const location = apiCandidate.location?.address_line_1 || apiCandidate.location?.city || 'Location not specified';
    const status = apiCandidate.status?.name || apiCandidate.availability_status?.name || 'Inactive';
    
    let rateType: 'hourly' | 'daily' = 'daily';
    if (apiCandidate.pay_type?.toLowerCase() === 'hourly' || apiCandidate.pay_type?.toLowerCase() === 'daily') {
        rateType = apiCandidate.pay_type.toLowerCase();
    } else if (apiCandidate.rate_type?.toLowerCase() === 'hourly' || apiCandidate.rate_type?.toLowerCase() === 'daily') {
        rateType = apiCandidate.rate_type.toLowerCase();
    }

    return {
        id: apiCandidate.id.toString(),
        name: `${apiCandidate.first_name} ${apiCandidate.last_name || ''}`.trim(),
        email: apiCandidate.email,
        role: role,
        rate: apiCandidate.pay_rate || 0,
        rateType: rateType,
        rating: Math.round((Math.random() * (5 - 4) + 4) * 10) / 10,
        reviews: Math.floor(Math.random() * 30),
        location: location,
        qualifications: qualifications,
        details: details, // This is now the correctly structured object.
        availability: apiCandidate.dates?.next_available_date ? [apiCandidate.dates.next_available_date] : [],
        imageUrl: `https://picsum.photos/seed/${apiCandidate.id}/100/100`,
        cvUrl: '#',
        bio: `An experienced ${role} based in ${location}.`,
        status: status,
    };
};

export async function fetchCandidates(): Promise<Candidate[]> {
    const allCandidates: Candidate[] = [];
    let nextPageUrl: string | null = `${API_BASE_URL}/candidates?with_key_stages=1&per_page=100`;

    console.log("Starting to fetch all candidates...");

    while (nextPageUrl) {
        try {
            const response = await fetch(nextPageUrl, {
                next: { revalidate: 3600 }
            });

            if (!response.ok) {
                console.error(`Failed to fetch from ${nextPageUrl}: ${response.statusText}`);
                break; 
            }

            const jsonResponse = await response.json();
            const candidatesOnPage = jsonResponse.data.map(transformCandidateData);
            allCandidates.push(...candidatesOnPage);
            
            nextPageUrl = jsonResponse.links.next;
            
            console.log(`Fetched page ${jsonResponse.meta.current_page} of ${jsonResponse.meta.last_page}. Total so far: ${allCandidates.length}`);

            if (!nextPageUrl || jsonResponse.meta.current_page >= jsonResponse.meta.last_page) {
                console.log(`Finished fetching. Total candidates: ${allCandidates.length}`);
                break;
            }

        } catch (error) {
            console.error(`Error fetching from ${nextPageUrl}:`, error);
            break;
        }
    }
    
    return allCandidates;
}


export async function fetchCandidateById(id: string): Promise<Candidate | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${id}?with_key_stages=1`, {
             next: { revalidate: 3600 } 
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch candidate with id ${id}: ${response.statusText}`);
        }
        
        const jsonResponse = await response.json();
        if (jsonResponse.data) {
            const candidate = transformCandidateData(jsonResponse.data);
            
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
        
        const allCandidates: Candidate[] = await fetchCandidates();
        const candidateMap = new Map(allCandidates.map((c: Candidate) => [c.id, c]));

        const bookingsPromises = jsonResponse.data.map(async (booking: any): Promise<Booking> => {
            const candidateId = booking.candidate_id?.toString();
            const candidate = candidateId ? candidateMap.get(candidateId) : undefined;
            
            return {
                id: booking.id.toString(),
                candidateId: candidateId,
                candidateName: candidate?.name || 'Unknown Candidate',
                candidateRole: candidate?.role || 'Unknown Role',
                date: booking.start_date,
                startDate: booking.start_date,
                endDate: booking.end_date,
                status: booking.status,
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
    const companyId = '118008';
    
    if (!dates || dates.length === 0) {
        return { success: false };
    }

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
           candidateName: '',
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
    if (updateData.role) apiPayload.job_title_id = updateData.role;

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

// In a real app, this would come from the API
export async function getUniqueCandidateRoles(): Promise<string[]> {
    // This is a mock. A real implementation would query the API for distinct roles.
    return ['Teacher', 'Teaching Assistant', 'Non Class Support', 'Tutor'];
}
