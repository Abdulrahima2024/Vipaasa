import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "12px",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090, // New Delhi
};

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface LiveLocationProps {
  onLocationSelect: (locationData: {
    lat: number;
    lng: number;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  }) => void;
  onCancel: () => void;
}

export default function LiveLocationMap({ onLocationSelect, onCancel }: LiveLocationProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [currentPos, setCurrentPos] = useState(defaultCenter);
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [addressDetails, setAddressDetails] = useState({
    formattedAddress: "Locating...",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [isLocating, setIsLocating] = useState(true);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!geocoder) return;
      setIsLocating(true);
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setIsLocating(false);
        if (status === "OK" && results && results[0]) {
          const result = results[0];
          let city = "";
          let state = "";
          let postalCode = "";
          let addressLine1 = result.formatted_address;

          // Parse address components
          result.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes("locality")) city = component.long_name;
            else if (!city && types.includes("administrative_area_level_2")) city = component.long_name;
            if (types.includes("administrative_area_level_1")) state = component.long_name;
            if (types.includes("postal_code")) postalCode = component.long_name;
          });

          // Simplify address line 1
          const split = addressLine1.split(",");
          if (split.length > 2) {
            addressLine1 = split.slice(0, 2).join(",").trim();
          }

          setAddressDetails({
            formattedAddress: result.formatted_address,
            addressLine1,
            city,
            state,
            postalCode,
          });
        } else {
          setAddressDetails((prev) => ({
            ...prev,
            formattedAddress: "Could not fetch address details",
          }));
        }
      });
    },
    [geocoder]
  );

  // Initialize Geocoder and get user location
  useEffect(() => {
    if (isLoaded && !geocoder) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [isLoaded, geocoder]);

  useEffect(() => {
    if (geocoder) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentPos(pos);
            setMarkerPos(pos);
            if (mapRef.current) {
              mapRef.current.panTo(pos);
              mapRef.current.setZoom(16);
            }
            reverseGeocode(pos.lat, pos.lng);
          },
          (err) => {
            console.warn("Geolocation failed or denied:", err);
            // Default to center
            reverseGeocode(defaultCenter.lat, defaultCenter.lng);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        reverseGeocode(defaultCenter.lat, defaultCenter.lng);
      }
    }
  }, [geocoder, reverseGeocode]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarkerPos(newPos);
        setCurrentPos(newPos);
        if (mapRef.current) {
          mapRef.current.panTo(newPos);
          mapRef.current.setZoom(16);
        }
        reverseGeocode(newPos.lat, newPos.lng);
      }
    }
  };

  const handleConfirm = () => {
    onLocationSelect({
      lat: markerPos.lat,
      lng: markerPos.lng,
      addressLine1: addressDetails.addressLine1,
      city: addressDetails.city || "Unknown City",
      state: addressDetails.state || "Unknown State",
      postalCode: addressDetails.postalCode || "000000",
    });
  };

  if (loadError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">
        Failed to load Google Maps. Please check your API key and connection.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-8 h-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#5C6E61] font-semibold text-sm">Loading maps...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in relative">
      
      {/* Map Header with Search */}
      <div className="p-4 border-b border-[#EAE6DB] bg-white z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-[#113C27]">Set Delivery Location</h3>
          <button onClick={onCancel} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <Autocomplete
            onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              type="text"
              placeholder="Search for an area or building"
              className="w-full bg-[#FAF9F5] border border-[#EAE6DB] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] font-semibold text-[#1F3E2F]"
            />
          </Autocomplete>
          <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-[#738276]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {/* Google Map */}
      <div className="relative flex-1 bg-gray-100">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%", minHeight: "350px" }}
          center={currentPos}
          zoom={15}
          onLoad={onMapLoad}
          onClick={(e) => {
            if (e.latLng) {
              const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
              setMarkerPos(newPos);
              reverseGeocode(newPos.lat, newPos.lng);
            }
          }}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          <Marker
            position={markerPos}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
            animation={window.google.maps.Animation.DROP}
          />
        </GoogleMap>

        {/* Current Location Button */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCurrentPos(newPos);
                setMarkerPos(newPos);
                mapRef.current?.panTo(newPos);
                reverseGeocode(newPos.lat, newPos.lng);
              });
            }
          }}
          className="absolute bottom-6 right-4 bg-white p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-gray-50 transition-colors text-[#2D6A4F]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </button>
      </div>

      {/* Address Details & Confirm Footer */}
      <div className="bg-white p-5 border-t border-[#EAE6DB] rounded-b-3xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-0.5 text-[#2D6A4F]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#1F3E2F] text-sm mb-1 line-clamp-1">
              {addressDetails.addressLine1 || "Selected Location"}
            </h4>
            <p className="text-[#5C6E61] text-xs leading-relaxed line-clamp-2">
              {isLocating ? "Fetching address..." : addressDetails.formattedAddress}
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isLocating}
          className="w-full bg-[#1B4332] hover:bg-[#113C27] text-white py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Location
        </button>
      </div>

    </div>
  );
}
