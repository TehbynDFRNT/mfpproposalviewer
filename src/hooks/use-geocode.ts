'use client';

import { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

// Define libraries array as a static constant outside of the component
// This prevents the "LoadScript has been reloaded unintentionally" warning
// Define proper type for Google Maps libraries
import type { Libraries } from '@react-google-maps/api';
// Use type assertion to ensure the array is correctly typed
const GOOGLE_MAPS_LIBRARIES = ['places'] as Libraries;

interface GeocodingResult {
  lat: number;
  lng: number;
}

interface UseGeocodeOptions {
  fallbackLocation?: { lat: number; lng: number };
  region?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Hook to geocode an address using Google Maps API
 * 
 * @param address The address to geocode
 * @param options Options for geocoding and fallback
 * @returns The geocoded location, loading state, and error if any
 */
export function useGeocode(
  address: string | undefined | null,
  options: UseGeocodeOptions = {}
) {
  // Default options
  const {
    fallbackLocation = { lat: -31.9523, lng: 115.8613 }, // Perth, Australia as default
    region = 'au',
    bounds = {
      north: -10.0, // Northern Australia approx
      south: -45.0, // Southern Australia approx
      east: 155.0,  // Eastern Australia approx
      west: 110.0   // Western Australia approx
    }
  } = options;

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // State for geocoded location
  const [location, setLocation] = useState<GeocodingResult>(fallbackLocation);
  const [error, setError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Store previous address to avoid re-geocoding the same address
  const [previousAddress, setPreviousAddress] = useState<string | null>(null);

  // Geocode the address when the API is loaded and address changes
  useEffect(() => {
    // Skip if API isn't loaded or address is missing
    if (!isLoaded || !address) {
      return;
    }

    // Skip if we've already geocoded this address to avoid infinite re-geocoding
    if (address === previousAddress) {
      return;
    }
    
    setPreviousAddress(address);
    setIsGeocoding(true);
    setError(null);

    // Geocode the address
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode(
      { 
        address,
        region,
        bounds: new window.google.maps.LatLngBounds(
          { lat: bounds.south, lng: bounds.west },
          { lat: bounds.north, lng: bounds.east }
        )
      },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log("Successfully geocoded to:", results[0].formatted_address);
          }
          setLocation({ lat: loc.lat(), lng: loc.lng() });
          setError(null);
        } else {
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.error('Geocode was not successful:', status);
          }
          setError(`Geocoding failed: ${status}`);
          setLocation(fallbackLocation);
        }
        setIsGeocoding(false);
      }
    );
  }, [isLoaded, address, region, bounds, fallbackLocation]);

  return {
    isLoaded,
    location,
    isGeocoding,
    error
  };
}