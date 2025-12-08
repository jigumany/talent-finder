
'use client';

import { LoadScript } from '@react-google-maps/api';

const libraries: "places"[] = ["places"];

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("Google Maps API key is missing. Please add it to your .env.local file.");
        return <>{children}</>;
    }

    return (
        <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
            {children}
        </LoadScript>
    );
}
