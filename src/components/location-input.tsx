
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationInputProps {
    value: string;
    onChange: (address: string, lat?: number, lng?: number) => void;
    className?: string;
}

export function LocationInput({ value, onChange, className }: LocationInputProps) {
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.formatted_address) {
                const lat = place.geometry.location?.lat();
                const lng = place.geometry.location?.lng();
                onChange(place.formatted_address, lat, lng);
            }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

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
                    value={value}
                    onChange={handleInputChange}
                    className={cn("pl-10", className)}
                    placeholder="Enter a location"
                />
            </div>
        </Autocomplete>
    );
}
