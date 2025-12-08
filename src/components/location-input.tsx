
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationInputProps {
    value: string;
    onChange: (address: string, lat?: number, lng?: number) => void;
    className?: string;
}

export function LocationInput({ value, onChange, className }: LocationInputProps) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: ['places'],
    });

    const [inputValue, setInputValue] = useState(value);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocompleteInstance;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.formatted_address) {
                const lat = place.geometry.location?.lat();
                const lng = place.geometry.location?.lng();
                onChange(place.formatted_address, lat, lng);
                setInputValue(place.formatted_address);
            }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        // We only call the parent onChange here to allow free text entry if needed
        // The selection will override it.
        onChange(e.target.value);
    };

    if (!isLoaded) {
        return (
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    value={inputValue}
                    className={cn("pl-10", className)}
                    placeholder="Loading..."
                    disabled
                />
            </div>
        );
    }

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: 'gb' },
              fields: ["address_components", "geometry", "icon", "name", "formatted_address"]
            }}
        >
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    className={cn("pl-10", className)}
                    placeholder="Enter a location"
                />
            </div>
        </Autocomplete>
    );
}
