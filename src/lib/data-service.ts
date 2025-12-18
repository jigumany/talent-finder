
import type { Candidate } from './types';

const API_BASE_URL = 'https://gslstaging.mytalentcrm.com/api/v2/open/candidates';

// This function transforms the raw data from your API into the Candidate type used by the application.
const transformCandidateData = (apiCandidate: any): Candidate => {
    const qualifications = apiCandidate.details?.map((detail: any) => detail.detail_type_value) || [];
    
    // Use the new candidate_type.name or job_title.name if available
    const role = apiCandidate.candidate_type?.name || apiCandidate.job_title?.name || 'Educator';

    return {
        id: apiCandidate.id.toString(),
        name: `${apiCandidate.first_name} ${apiCandidate.last_name}`,
        role: role,
        // The API does not seem to provide these, so we'll use placeholders.
        rate: Math.floor(Math.random() * (60 - 25 + 1)) + 25, // Random rate between 25-60
        rateType: Math.random() > 0.5 ? 'hourly' : 'daily',
        rating: Math.round((Math.random() * (5 - 4) + 4) * 10) / 10, // Random rating between 4.0-5.0
        reviews: Math.floor(Math.random() * 30),
        
        location: apiCandidate.location?.city || 'Location not specified',
        qualifications: qualifications,
        availability: apiCandidate.dates?.next_available_date ? [apiCandidate.dates.next_available_date] : [],
        
        // Using a placeholder for image URL as it's not in the API response
        imageUrl: `https://picsum.photos/seed/${apiCandidate.id}/100/100`,
        cvUrl: '#', // Placeholder
        bio: `An experienced ${role} based in ${apiCandidate.location?.city || 'the UK'}.`, // Placeholder bio
    };
};

// Fetches all candidates from the API
export async function fetchCandidates(): Promise<Candidate[]> {
    try {
        const response = await fetch(`${API_BASE_URL}?with_key_stages_only=1&with_key_stages=1&per_page=20`, {
            // This tells Next.js to cache the result for 1 hour.
            // You can adjust this as needed.
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
        return []; // Return an empty array on error
    }
}

// Fetches a single candidate by their ID
export async function fetchCandidateById(id: string): Promise<Candidate | null> {
    try {
        // NOTE: The provided API seems to lack a direct /candidates/{id} endpoint.
        // We will fetch all and then find by ID. This is not efficient for a large dataset
        // and should be replaced with a direct lookup if the API supports it.
        const candidates = await fetchCandidates();
        const candidate = candidates.find(c => c.id === id);

        return candidate || null;

    } catch (error) {
        console.error(`Error fetching candidate with id ${id}:`, error);
        return null;
    }
}
