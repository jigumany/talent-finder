
'use server';

import type { Candidate, Booking } from './types';
import { format, startOfDay } from 'date-fns';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gslstaging.mytalentcrm.com/api/v1/talent-finder';

function getAuthHeaders() {
    const cookieStore = cookies();
    const token = cookieStore.get('session_token')?.value;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        console.log("✅ Auth token found. Attaching to request header.");
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn("🚨 Auth token not found for API request.");
    }

    return headers;
}

// This map translates API short codes into human-readable category names.
const detailTypeMap: Record<string, string> = {
    'EYFS': 'Key Stages',
    'KS1': 'Key Stages',
    'KS2': 'Key Stages',
    'KS3': 'Key Stages',
    'KS4': 'Key Stages',
    'KS5': 'Key Stages',
    'Quals': 'Qualifications',
    'Additional Criteria': 'Additional Qualifications',
    'Langs': 'Languages',
    'SEND': 'SEND',
};

const transformCandidateData = (apiCandidate: any): Candidate => {
    // This is the structured object we will build.
    const details: Record<string, string[]> = {};
    const flatQualifications: string[] = [];
    const seenValues = new Set<string>();

    // Combine both 'details' and 'key_stages' from the API into one array to process.
    const allApiDetails = [...(apiCandidate.details || []), ...(apiCandidate.key_stages || [])];

    for (const detail of allApiDetails) {
        // Skip if there's no value or if we've already processed this exact value to prevent duplicates.
        if (!detail.detail_type_value || seenValues.has(detail.detail_type_value)) {
            continue;
        }
        seenValues.add(detail.detail_type_value);

        // Use our map to get the proper category name, or fall back to the API's name.
        const category = detailTypeMap[detail.detail_type] || detail.detail_type;
        
        if (!details[category]) {
            details[category] = [];
        }
        
        details[category].push(detail.detail_type_value);

        if (!flatQualifications.includes(detail.detail_type_value)) {
            flatQualifications.push(detail.detail_type_value);
        }
    }

    const role = apiCandidate.candidate_type?.name || 'Educator';
    
    const address_line_1 = apiCandidate.location?.address_line_1 || '';
    const city = apiCandidate.location?.city || '';
    let location = 'Location not specified';
    if (address_line_1 && city && !address_line_1.toLowerCase().includes(city.toLowerCase())) {
        location = `${address_line_1}, ${city}`;
    } else if (address_line_1) {
        location = address_line_1;
    } else if (city) {
        location = city;
    }

    // Use availability_status as primary
    const status = apiCandidate.availability_status?.name || apiCandidate.status?.name || 'Inactive';
    
    // Parse pay_rate safely, removing currency symbols and whitespace
    const payRateString = String(apiCandidate.pay_rate || '0');
    const rate = parseFloat(payRateString.replace(/[^0-9.]/g, '')) || 0;

    let rateType: 'hourly' | 'daily' = 'daily';
    if (apiCandidate.pay_frequency?.toLowerCase() === 'hourly') {
        rateType = 'hourly';
    }

    return {
        id: apiCandidate.id.toString(),
        name: `${apiCandidate.first_name} ${apiCandidate.last_name || ''}`.trim(),
        email: apiCandidate.email,
        role: role,
        rate: rate,
        rateType: rateType,
        rating: Math.round((Math.random() * (5 - 4) + 4) * 10) / 10,
        reviews: Math.floor(Math.random() * 30),
        location: location,
        qualifications: flatQualifications,
        details: details,
        availability: apiCandidate.dates?.next_available_date ? [apiCandidate.dates.next_available_date] : [],
        imageUrl: `https://picsum.photos/seed/${apiCandidate.id}/100/100`,
        cvUrl: '#',
        bio: `An experienced ${role} based in ${location}.`,
        status: status,
    };
};

export async function fetchCandidates(): Promise<Candidate[]> {
    const allCandidates: Candidate[] = [];
    let nextPageUrl: string | null = `${API_BASE_URL}/candidates?per_page=100`;

    console.log("Starting to fetch all candidates...");

    while (nextPageUrl) {
        try {
            console.log(`📡 Fetching data from: ${nextPageUrl}`);
            const response = await fetch(nextPageUrl, {
                headers: getAuthHeaders(),
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error(`Error ${response.status} from ${nextPageUrl}: ${response.statusText}`);
                const errorBody = await response.text();
                console.error('Error body:', errorBody);
                break; 
            }

            const jsonResponse = await response.json();
            const candidatesOnPage = jsonResponse.data.map(transformCandidateData);
            allCandidates.push(...candidatesOnPage);
            
            const nextLink = Array.isArray(jsonResponse.links.next) ? jsonResponse.links.next[0] : jsonResponse.links.next;
            nextPageUrl = nextLink;

            const currentPage = Array.isArray(jsonResponse.meta.current_page) ? jsonResponse.meta.current_page[0] : jsonResponse.meta.current_page;
            const lastPage = Array.isArray(jsonResponse.meta.last_page) ? jsonResponse.meta.last_page[0] : jsonResponse.meta.last_page;


            if (!nextPageUrl || currentPage >= lastPage) {
                break;
            }

        } catch (error) {
            console.error(`Error fetching from ${nextPageUrl}:`, error);
            break;
        }
    }
    
    return allCandidates;
}

export interface FilteredPaginationParams {
    page?: number;
    perPage?: number;
    searchTerm?: string;
    role?: string;
    subject?: string;
    location?: string;
    rateType?: string;
    minRate?: string;
    maxRate?: string;
    status?: string;
}

export async function fetchCandidatesFilteredPaginated(params: FilteredPaginationParams): Promise<{data: Candidate[], currentPage: number, totalPages: number, total: number}> {
    try {
        const page = params.page || 1;
        const perPage = params.perPage || 12;
        
        const queryParams = new URLSearchParams({
            per_page: perPage.toString(),
            page: page.toString(),
        });

        // Add filters to query params if they exist and are not the 'all' value
        if (params.searchTerm) queryParams.append('q', params.searchTerm);
        if (params.role && params.role !== 'all') queryParams.append('role', params.role);
        if (params.subject && params.subject !== 'all') queryParams.append('subject', params.subject);
        if (params.location) queryParams.append('location', params.location);
        if (params.rateType && params.rateType !== 'all') queryParams.append('rate_type', params.rateType);
        if (params.minRate) queryParams.append('min_rate', params.minRate);
        if (params.maxRate) queryParams.append('max_rate', params.maxRate);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);


        const url = `${API_BASE_URL}/candidates?${queryParams.toString()}`;
        console.log(`📡 Fetching data from: ${url}`);

        const response = await fetch(url, {
            headers: getAuthHeaders(),
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`Error ${response.status} fetching candidates: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { data: [], currentPage: page, totalPages: 0, total: 0 };
        }

        const jsonResponse = await response.json();
        const candidates = jsonResponse.data.map(transformCandidateData);

        const currentPage = Array.isArray(jsonResponse.meta.current_page) ? jsonResponse.meta.current_page[0] : jsonResponse.meta.current_page;
        const totalPages = Array.isArray(jsonResponse.meta.last_page) ? jsonResponse.meta.last_page[0] : jsonResponse.meta.last_page;
        const total = Array.isArray(jsonResponse.meta.total) ? jsonResponse.meta.total[0] : jsonResponse.meta.total;
        
        return {
            data: candidates,
            currentPage: currentPage,
            totalPages: totalPages,
            total: total
        };
    } catch (error) {
        console.error(`Error fetching candidates:`, error);
        return { data: [], currentPage: 1, totalPages: 0, total: 0 };
    }
}

export async function getFilterMetadata(): Promise<{roles: string[], statuses: string[]}> {
    try {
        const url = `${API_BASE_URL}/metadata/filters`;
        console.log(`📡 Fetching data from: ${url}`);
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Error ${response.status} fetching filter metadata: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { roles: [], statuses: [] };
        }

        const jsonResponse = await response.json();
        
        // The API returns roles and availability_status as arrays of objects
        const roles = jsonResponse.data.roles.map((r: { name: string }) => r.name).sort() || [];
        const statuses = jsonResponse.data.availability_status.map((s: { name: string }) => s.name).sort() || [];
        
        return { roles, statuses };
    } catch (error) {
        console.error('Error fetching filter metadata:', error);
        return { roles: [], statuses: [] };
    }
}


export async function fetchCandidateById(id: string): Promise<Candidate | null> {
    try {
        const url = `${API_BASE_URL}/candidates/${id}`;
        console.log(`📡 Fetching data from: ${url}`);
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            cache: 'no-store' 
        });

        if (!response.ok) {
            console.error(`Error ${response.status} fetching candidate with id ${id}: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return null;
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

export async function fetchBookings(): Promise<Booking[]> {
    try {
        const url = `${API_BASE_URL}/bookings?per_page=100`;
        console.log(`📡 Fetching data from: ${url}`);
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            cache: 'no-store'
        });
        
        if (!response.ok) {
            console.error(`Error ${response.status} fetching bookings: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return [];
        }

        const jsonResponse = await response.json();
        const candidateIds = new Set<string>();
        jsonResponse.data.forEach((booking: any) => {
            if (booking.candidate_id) {
                candidateIds.add(booking.candidate_id.toString());
            }
        });

        const candidatePromises = Array.from(candidateIds).map(id => 
            fetchCandidateById(id).catch(error => {
                console.error(`Error fetching candidate ${id}:`, error);
                return null;
            })
        );

        const candidates = await Promise.all(candidatePromises);
        const candidateMap = new Map<string, Candidate>();
        
        candidates.forEach(candidate => {
            if (candidate) {
                candidateMap.set(candidate.id, candidate);
            }
        });

        const bookings = jsonResponse.data.map((booking: any): Booking => {
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

        return bookings;

    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

export async function fetchBookingsPaginated(page: number = 1, perPage: number = 50): Promise<{data: Booking[], currentPage: number, totalPages: number, total: number}> {
    try {
        const url = `${API_BASE_URL}/bookings?per_page=${perPage}&page=${page}`;
        console.log(`📡 Fetching data from: ${url}`);
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            cache: 'no-store'
        });
        
        if (!response.ok) {
            console.error(`Error ${response.status} fetching paginated bookings: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { data: [], currentPage: page, totalPages: 0, total: 0 };
        }

        const jsonResponse = await response.json();
        const candidateIds = new Set<string>();
        jsonResponse.data.forEach((booking: any) => {
            if (booking.candidate_id) {
                candidateIds.add(booking.candidate_id.toString());
            }
        });

        const candidatePromises = Array.from(candidateIds).map(id => 
            fetchCandidateById(id).catch(error => {
                console.error(`Error fetching candidate ${id}:`, error);
                return null;
            })
        );

        const candidates = await Promise.all(candidatePromises);
        const candidateMap = new Map<string, Candidate>();
        
        candidates.forEach(candidate => {
            if (candidate) {
                candidateMap.set(candidate.id, candidate);
            }
        });

        const bookings = jsonResponse.data.map((booking: any): Booking => {
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

        const currentPage = Array.isArray(jsonResponse.meta?.current_page) ? jsonResponse.meta.current_page[0] : jsonResponse.meta?.current_page || page;
        const totalPages = Array.isArray(jsonResponse.meta?.last_page) ? jsonResponse.meta.last_page[0] : jsonResponse.meta?.last_page || 1;
        const total = Array.isArray(jsonResponse.meta?.total) ? jsonResponse.meta.total[0] : jsonResponse.meta?.total || bookings.length;
        
        return {
            data: bookings,
            currentPage: currentPage,
            totalPages: totalPages,
            total: total
        };

    } catch (error) {
        console.error("Error fetching bookings:", error);
        return { data: [], currentPage: page, totalPages: 0, total: 0 };
    }
}

interface CreateBookingParams {
    candidateId: string;
    candidateName: string;
    payRate: number;
    charge: number;
    recurring: boolean;
    booking_pattern: any;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    booking_type: 'Day' | 'Hourly';
    booking_role: string;
}

export async function createBooking(params: CreateBookingParams): Promise<{success: boolean; bookings?: Booking[]}> {
    const { candidateId, candidateName, start_date, end_date, booking_pattern, booking_type, booking_role, recurring, payRate, charge } = params;
    const companyId = '118008';
    
    const bookingData = {
        candidate_id: parseInt(candidateId),
        company_id: parseInt(companyId),
        start_date: start_date,
        end_date: end_date,
        booking_type: booking_type,
        pay_rate: payRate,
        charge: charge,
        recurring: recurring ? 1 : 0,
        booking_pattern: booking_pattern,
        booking_role: booking_role,
        booking_details: `Booking for ${booking_role}`,
        createdby: 'MyTalent Support',
    };

    console.log("📦 Sending booking data to API:", JSON.stringify(bookingData, null, 2));
    
    try {
        const url = `${API_BASE_URL}/bookings`;
        console.log(`📡 Posting data to: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok || !result.success || result.errors) {
            console.error("Booking creation failed:", result.errors || result.message);
            return { success: false };
        }
        
       const newBooking = {
           id: result.data.id.toString(),
           candidateId: result.data.candidate_id?.toString(),
           candidateName: candidateName,
           candidateRole: booking_role,
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
        apiPayload.start_date = format(startOfDay(sortedDates[0]), 'yyyy-MM-dd');
        apiPayload.end_date = format(startOfDay(sortedDates[sortedDates.length - 1]), 'yyyy-MM-dd');
    }
    if (updateData.bookingType) apiPayload.booking_type = updateData.bookingType;
    if (updateData.session) apiPayload.session_type = updateData.session;
    if (updateData.status) apiPayload.status = updateData.status;
    if (updateData.role) apiPayload.job_title_id = updateData.role;

    try {
         const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
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
    
