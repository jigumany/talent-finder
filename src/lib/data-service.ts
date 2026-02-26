
'use server';

import type { Candidate, Booking, UserProfile } from './types';
import { format, startOfDay } from 'date-fns';
import { cookies } from 'next/headers';
import { logout } from '@/app/auth/actions';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gslstaging.mytalentcrm.com/api/v1/talent-finder';

async function getAuthHeaders() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        console.log("✅ Auth token found. Attaching to request header.");
        const normalizedToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        headers['Authorization'] = `Bearer ${normalizedToken}`;
    } else {
        console.warn("🚨 Auth token not found for API request.");
    }

    return headers;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
        ...(await getAuthHeaders()),
        ...(options.headers || {}),
    };
    const response = await fetch(url, {
        ...options,
        headers,
        cache: options.cache ?? 'no-store',
    });

    if (response.status === 401) {
        await logout();
    }

    return response;
}

function isNextRedirectError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'digest' in error &&
        typeof (error as { digest?: unknown }).digest === 'string' &&
        (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    );
}

type CandidateListPayload = {
    candidates: any[];
    meta?: any;
    links?: any;
};

function extractCandidateListPayload(jsonResponse: any): CandidateListPayload {
    // Shape A: { data: [...], meta, links }
    if (Array.isArray(jsonResponse?.data)) {
        return {
            candidates: jsonResponse.data,
            meta: jsonResponse.meta,
            links: jsonResponse.links,
        };
    }

    // Shape B: { success: true, data: { data: [...], meta, links } }
    if (Array.isArray(jsonResponse?.data?.data)) {
        return {
            candidates: jsonResponse.data.data,
            meta: jsonResponse.data.meta ?? jsonResponse.meta,
            links: jsonResponse.data.links ?? jsonResponse.links,
        };
    }

    // Shape C: plain array [...]
    if (Array.isArray(jsonResponse)) {
        return {
            candidates: jsonResponse,
        };
    }

    return {
        candidates: [],
        meta: jsonResponse?.meta,
        links: jsonResponse?.links,
    };
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

const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const toNonNegativeInt = (value: unknown): number | null => {
    const num = toNumber(value);
    if (num === null) return null;
    return Math.max(0, Math.round(num));
};

function extractReviewsData(apiCandidate: any): Candidate['reviewsData'] {
    if (!Array.isArray(apiCandidate?.reviews)) {
        return undefined;
    }

    const reviews = apiCandidate.reviews
        .map((review: any) => {
            const rating = Math.min(5, Math.max(0, toNumber(review?.rating) ?? 0));
            const reviewerName =
                review?.reviewer_name ||
                review?.reviewer?.name ||
                review?.client_name ||
                'Anonymous';
            const comment =
                review?.comment ||
                review?.review_text ||
                review?.review ||
                '';
            const date =
                review?.date ||
                review?.reviewed_at ||
                review?.created_at ||
                new Date().toISOString();

            return {
                reviewerName: String(reviewerName),
                rating,
                comment: String(comment),
                date: String(date),
            };
        })
        .filter((review: any) => review.comment || review.rating > 0);

    return reviews.length > 0 ? reviews : undefined;
}

function extractRatingAndReviewCount(apiCandidate: any): { rating: number; reviews: number } {
    const ratingCandidates: unknown[] = [
        apiCandidate?.rating,
        apiCandidate?.average_rating,
        apiCandidate?.reviews_avg_rating,
        apiCandidate?.reviews_average_rating,
        apiCandidate?.feedback_average_rating,
        apiCandidate?.talent_finder?.rating,
    ];

    const countCandidates: unknown[] = [
        apiCandidate?.reviews,
        apiCandidate?.reviews_count,
        apiCandidate?.rating_count,
        apiCandidate?.feedback_count,
        apiCandidate?.total_reviews,
        apiCandidate?.talent_finder?.reviews_count,
    ];

    const extractedReviews = extractReviewsData(apiCandidate);
    const extractedCount = extractedReviews?.length ?? 0;
    const extractedAverage = extractedCount > 0
        ? extractedReviews!.reduce((sum, review) => sum + review.rating, 0) / extractedCount
        : 0;

    const rating =
        ratingCandidates.map(toNumber).find((n): n is number => n !== null) ??
        extractedAverage;
    const reviews =
        countCandidates.map(toNonNegativeInt).find((n): n is number => n !== null) ??
        extractedCount;

    return {
        rating: Math.min(5, Math.max(0, Math.round(rating * 10) / 10)),
        reviews,
    };
}

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

    const role = apiCandidate.candidate_type?.name || apiCandidate.job_title?.name || 'Educator';
    
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
    const payRateString = String(apiCandidate.talent_finder?.talent_finder_pay_rate || '0');
    const rate = parseFloat(payRateString.replace(/[^0-9.]/g, '')) || 0;

    let rateType: 'hourly' | 'daily' = 'daily';
    if (apiCandidate.pay_frequency?.toLowerCase() === 'hourly') {
        rateType = 'hourly';
    }

    const { rating, reviews } = extractRatingAndReviewCount(apiCandidate);
    const reviewsData = extractReviewsData(apiCandidate);

    return {
        id: apiCandidate.id.toString(),
        name: `${apiCandidate.first_name} ${apiCandidate.last_name || ''}`.trim(),
        email: apiCandidate.email,
        role: role,
        rate: rate,
        rateType: rateType,
        rating,
        reviews,
        reviewsData,
        location: location,
        qualifications: flatQualifications,
        details: details,
        availability: apiCandidate.dates?.next_available_date ? [apiCandidate.dates.next_available_date] : [],
        imageUrl: `https://picsum.photos/seed/${apiCandidate.id}/100/100`,
        cvUrl: apiCandidate.talent_finder?.profile_url || '#',
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
            console.log(`📡 Fetching data from: ${nextPageUrl}`);
            const response: Response = await fetchWithAuth(nextPageUrl);

            if (!response.ok) {
                console.error(`Error ${response.status} from ${nextPageUrl}: ${response.statusText}`);
                const errorBody = await response.text();
                console.error('Error body:', errorBody);
                break; 
            }

            const jsonResponse = await response.json();
            const { candidates: candidateRows, meta, links } = extractCandidateListPayload(jsonResponse);
            if (!Array.isArray(candidateRows)) {
                // Keep this log for debugging response-shape issues across environments.
                console.error('Unexpected candidates payload shape:', jsonResponse);
                break;
            }
            const candidatesOnPage = candidateRows.map(transformCandidateData);
            allCandidates.push(...candidatesOnPage);
            
            const nextLink = Array.isArray(links?.next) ? links.next[0] : links?.next;
            nextPageUrl = nextLink;

            const currentPage = Array.isArray(meta?.current_page) ? meta.current_page[0] : meta?.current_page;
            const lastPage = Array.isArray(meta?.last_page) ? meta.last_page[0] : meta?.last_page;


            if (!nextPageUrl || currentPage >= lastPage) {
                break;
            }

        } catch (error) {
            if (isNextRedirectError(error)) {
                throw error;
            }
            console.error(`Error fetching from ${nextPageUrl}:`, error);
            break;
        }
    }
    
    return allCandidates;
}

export interface FilteredPaginationParams {
    page?: number;
    perPage?: number;
    search?: string;
    role?: string;
    subject?: string;
    location?: string;
    pay_frequency?: string;
    min_rate?: string;
    max_rate?: string;
    status?: string;
}

export async function fetchCandidatesFilteredPaginated(params: FilteredPaginationParams): Promise<{data: Candidate[], currentPage: number, totalPages: number, total: number}> {
    try {
        const page = params.page || 1;
        const perPage = params.perPage || 12;
        
        const queryParams = new URLSearchParams({
            with_key_stages: '1',
            per_page: perPage.toString(),
            page: page.toString(),
        });

        // Add filters to query params if they exist and are not the 'all' value
        if (params.search) queryParams.append('search', params.search);
        if (params.role && params.role !== 'all') queryParams.append('role', params.role);
        if (params.subject && params.subject !== 'all') queryParams.append('subject', params.subject);
        if (params.location) queryParams.append('location', params.location);
        if (params.pay_frequency && params.pay_frequency !== 'all') queryParams.append('pay_frequency', params.pay_frequency);
        if (params.min_rate) queryParams.append('min_rate', params.min_rate);
        if (params.max_rate) queryParams.append('max_rate', params.max_rate);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);

        const url = `${API_BASE_URL}/candidates?${queryParams.toString()}`;

        const response = await fetchWithAuth(url);

        if (!response.ok) {
            console.error(`Error ${response.status} fetching candidates: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { data: [], currentPage: page, totalPages: 0, total: 0 };
        }

        const jsonResponse = await response.json();
        const { candidates: candidateRows, meta } = extractCandidateListPayload(jsonResponse);
        if (!Array.isArray(candidateRows)) {
            console.error('Unexpected filtered candidates payload shape:', jsonResponse);
            return { data: [], currentPage: page, totalPages: 0, total: 0 };
        }

        const candidates = candidateRows.map(transformCandidateData);

        const currentPage = Array.isArray(meta?.current_page) ? meta.current_page[0] : (meta?.current_page ?? page);
        const totalPages = Array.isArray(meta?.last_page) ? meta.last_page[0] : (meta?.last_page ?? 0);
        const total = Array.isArray(meta?.total) ? meta.total[0] : (meta?.total ?? candidates.length);
        
        return {
            data: candidates,
            currentPage: currentPage,
            totalPages: totalPages,
            total: total
        };
    } catch (error) {
        if (isNextRedirectError(error)) {
            throw error;
        }
        console.error(`Error fetching candidates:`, error);
        return { data: [], currentPage: 1, totalPages: 0, total: 0 };
    }
}

export async function getFilterMetadata(): Promise<{roles: string[], statuses: string[]}> {
    try {
        const url = `${API_BASE_URL}/metadata/filters`;
        console.log(`📡 Fetching data from: ${url}`);
        const response = await fetchWithAuth(url);

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
        if (isNextRedirectError(error)) {
            throw error;
        }
        console.error('Error fetching filter metadata:', error);
        return { roles: [], statuses: [] };
    }
}


export async function fetchCandidateById(id: string): Promise<Candidate | null> {
    try {
        const url = `${API_BASE_URL}/candidates/${id}`;
        const response = await fetchWithAuth(url);

        if (!response.ok) {
            console.error(`Error ${response.status} fetching candidate with id ${id}: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return null;
        }
        
        const jsonResponse = await response.json();
        
        // Check both the new structure (success: true, data: {...}) and fallback to old structure
        if (jsonResponse.success && jsonResponse.data) {
            console.log('Candidate API data (talent_finder):', jsonResponse.data.talent_finder);
            // New API structure - the data is already in the correct format
            const candidate = transformCandidateData(jsonResponse.data);
            console.log('Transformed candidate cvUrl:', candidate.cvUrl);
            
            // Add bio if available (you might want to ensure bio is in your CandidateResource)
            // candidate.bio = jsonResponse.data.bio || candidate.bio;
            
            return candidate;
        } 
        // Fallback for old API structure (just in case)
        else if (jsonResponse.data) {
            console.log('Candidate API data (fallback talent_finder):', jsonResponse.data.talent_finder);
            const apiCandidate = jsonResponse.data;
            
            // Reconstruct for old API structure
            const reconstructedApiData = {
                id: apiCandidate.id,
                first_name: apiCandidate.first_name,
                last_name: apiCandidate.last_name,
                email: apiCandidate.email,
                candidate_type: { name: 'Educator' },
                status: apiCandidate.status,
                availability_status: apiCandidate.availability?.status,
                location: { city: apiCandidate.location?.city },
                pay_rate: 0,
                pay_frequency: 'daily',
                talent_finder: apiCandidate.talent_finder,
                details: [],
                key_stages: [],
                cvUrl: apiCandidate.talent_finder.profile_url,
            };
            
            const candidate = transformCandidateData(reconstructedApiData);
            console.log('Transformed candidate cvUrl (fallback):', candidate.cvUrl);
            candidate.bio = apiCandidate.bio || `An experienced educator.`;

            return candidate;
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching candidate with id ${id}:`, error);
        return null;
    }
}

export interface CandidateAvailabilityDates {
    available: string[];
    booked: string[];
    interview: string[];
}

export async function fetchCandidateAvailabilities(candidateId: string): Promise<CandidateAvailabilityDates> {
    try {
        const url = `${API_BASE_URL}/candidates/${candidateId}/availabilities`;
        const response = await fetchWithAuth(url);

        if (!response.ok) {
            console.error(`Error ${response.status} fetching candidate availabilities for ${candidateId}: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { available: [], booked: [], interview: [] };
        }

        const jsonResponse = await response.json();
        const rawRows = Array.isArray(jsonResponse?.data)
            ? jsonResponse.data
            : Array.isArray(jsonResponse?.data?.data)
                ? jsonResponse.data.data
                : Array.isArray(jsonResponse)
                    ? jsonResponse
                    : [];

        const available = new Set<string>();
        const booked = new Set<string>();
        const interview = new Set<string>();

        rawRows.forEach((row: any) => {
            const rawDate =
                row?.date ||
                row?.availability_date ||
                row?.available_date ||
                row?.start_date;
            if (!rawDate) return;

            const parsedDate = new Date(rawDate);
            if (Number.isNaN(parsedDate.getTime())) return;
            const date = format(parsedDate, 'yyyy-MM-dd');

            const rawStatus =
                row?.status?.name ||
                row?.availability_status?.name ||
                row?.status ||
                row?.availability_status ||
                row?.type ||
                'available';
            const normalizedStatus = String(rawStatus).toLowerCase();

            if (normalizedStatus.includes('interview')) {
                interview.add(date);
                return;
            }
            if (
                normalizedStatus.includes('booked') ||
                normalizedStatus.includes('confirm') ||
                normalizedStatus.includes('pending') ||
                normalizedStatus.includes('pencilled')
            ) {
                booked.add(date);
                return;
            }
            available.add(date);
        });

        return {
            available: Array.from(available),
            booked: Array.from(booked),
            interview: Array.from(interview),
        };
    } catch (error) {
        if (isNextRedirectError(error)) {
            throw error;
        }
        console.error(`Error fetching candidate availabilities for ${candidateId}:`, error);
        return { available: [], booked: [], interview: [] };
    }
}

export async function fetchBookings(): Promise<Booking[]> {
    try {
        const url = `${API_BASE_URL}/bookings?per_page=100`;
        console.log(`📡 Fetching data from: ${url}`);
        const response = await fetchWithAuth(url);
        
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

// Transform booking data from API
const transformBookingData = (apiBooking: any): Booking => {
    const candidate = apiBooking.candidate;
    
    return {
        id: apiBooking.id.toString(),
        candidateId: apiBooking.candidate_id?.toString(),
        candidateName: candidate?.name || 'Unknown Candidate',
        candidateRole: apiBooking.booking_role || 'Unknown Role',
        candidateLocation: 'Location not specified', // Your API doesn't return location in booking data
        date: apiBooking.start_date,
        startDate: apiBooking.start_date,
        endDate: apiBooking.end_date,
        status: apiBooking.status || 'Unknown',
        bookingType: apiBooking.booking_type || 'Day',
        payRate: apiBooking.pay_rate || 0,
        charge: apiBooking.charge || 0,
        recurring: apiBooking.recurring || false,
        bookingPattern: apiBooking.booking_pattern || [],
        createdBy: apiBooking.createdby || 'System',
        createdAt: apiBooking.created_at,
        updatedAt: apiBooking.updated_at,
    };
};

export async function fetchBookingsPaginated(page: number = 1, perPage: number = 10): Promise<{data: Booking[], currentPage: number, totalPages: number, total: number}> {
    try {
        const url = `${API_BASE_URL}/bookings?per_page=${perPage}&page=${page}`;
        const response = await fetchWithAuth(url);
        
        if (!response.ok) {
            console.error(`Error ${response.status} fetching paginated bookings: ${response.statusText}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { data: [], currentPage: page, totalPages: 0, total: 0 };
        }

        const jsonResponse = await response.json();

        if (!jsonResponse.success) {
            console.error('API returned unsuccessful response:', jsonResponse);
            return { data: [], currentPage: page, totalPages: 0, total: 0 };
        }

        const bookings = jsonResponse.data.map(transformBookingData);

        const currentPage = jsonResponse.meta?.current_page || page;
        const totalPages = jsonResponse.meta?.last_page || 1;
        const total = jsonResponse.meta?.total || bookings.length;
        
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
    companyId: number;
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
    const { candidateId, companyId, candidateName, start_date, end_date, booking_pattern, booking_type, booking_role, recurring, payRate, charge } = params;
    
    const bookingData = {
        candidate_id: parseInt(candidateId),
        company_id: companyId,
        start_date: start_date,
        end_date: end_date,
        booking_type: booking_type,
        pay_rate: payRate,
        charge: charge,
        recurring: recurring ? 1 : 0,
        booking_pattern: booking_pattern,
        booking_role: booking_role,
        status: 'Pencilled',
        createdby: 'MyTalent Support',
    };

    console.log("📦 Sending booking data to API:", JSON.stringify(bookingData, null, 2));
    
    try {
        const url = `${API_BASE_URL}/bookings`;
        console.log(`📡 Posting data to: ${url}`);
        const response = await fetchWithAuth(url, {
            method: 'POST',
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
         const response = await fetchWithAuth(`${API_BASE_URL}/bookings/${id}`, {
            method: 'PUT',
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

export async function fetchUserProfile(): Promise<{ data?: UserProfile; error?: string }> {
    try {
        const url = `${API_BASE_URL}/profile`;
        console.log(`📡 Fetching user profile from: ${url}`);
        const response = await fetchWithAuth(url);

        const jsonResponse = await response.json();

        if (!response.ok) {
            console.error(`Error ${response.status} fetching user profile: ${response.statusText}`);
            console.error('Error body:', jsonResponse);
            return { error: jsonResponse.message || `API error: ${response.statusText}` };
        }

        if (jsonResponse.success && jsonResponse.data) {
            console.log("✅ User profile fetched successfully.");
            return { data: jsonResponse.data };
        } else {
            console.error("Failed to fetch user profile:", jsonResponse.message);
            return { error: jsonResponse.message || "Failed to fetch user profile." };
        }

    } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error instanceof Error) {
          return { error: error.message };
        }
        return { error: "An unknown error occurred while fetching your profile." };
    }
}
    
