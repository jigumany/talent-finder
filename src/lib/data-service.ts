
import type { Candidate } from './types';

const API_BASE_URL = 'https://gslstaging.mytalentcrm.com/api/v2/open/candidates';

const transformCandidateData = (apiCandidate: any): Candidate => {
    const qualifications = apiCandidate.details?.map((detail: any) => detail.detail_type_value) || [];
    
    const details: Record<string, string[]> = {};
    if (apiCandidate.details) {
        for (const detail of apiCandidate.details) {
            const type = detail.detail_type;
            const value = detail.detail_type_value;
            if (!details[type]) {
                details[type] = [];
            }
            details[type].push(value);
        }
    }

    const role = apiCandidate.candidate_type?.name || apiCandidate.job_title?.name || 'Educator';

    return {
        id: apiCandidate.id.toString(),
        name: `${apiCandidate.first_name} ${apiCandidate.last_name}`,
        role: role,
        rate: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
        rateType: Math.random() > 0.5 ? 'hourly' : 'daily',
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
        const response = await fetch(`${API_BASE_URL}?with_key_stages_only=1&with_key_stages=1&per_page=20`, {
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
        const candidates = await fetchCandidates();
        const candidate = candidates.find(c => c.id === id);

        return candidate || null;

    } catch (error) {
        console.error(`Error fetching candidate with id ${id}:`, error);
        return null;
    }
}
