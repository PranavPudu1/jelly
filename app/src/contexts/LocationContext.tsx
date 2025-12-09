import { createContext, PropsWithChildren, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';

// Set to true to use test location (Madrid, Spain)
// Set to false to use real GPS location
const USE_TEST_LOCATION = true;

const TEST_LOCATION = {
    latitude: 40.4168,  // Madrid, Spain
    longitude: -3.7038,
};

interface LocationContextType {
    userLocation: { latitude: number; longitude: number } | null;
    locationPermission: Location.PermissionStatus | null;
    isLoading: boolean;
    requestPermission: () => Promise<void>;
}

export const LocationContext = createContext<LocationContextType>({
    userLocation: null,
    locationPermission: null,
    isLoading: true,
    requestPermission: async () => {},
});

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error(' must be used within LocationProvider');
    }
    return context;
}

export default function LocationProvider({ children }: PropsWithChildren) {
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationPermission, setLocationPermission] =
        useState<Location.PermissionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkPermissionAndGetLocation();
    }, []);

    async function checkPermissionAndGetLocation() {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            setLocationPermission(status);

            if (status === Location.PermissionStatus.GRANTED) {
                await getCurrentLocation();
            }
        }
        catch (error) {
            console.error('Error checking location permission:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    async function getCurrentLocation() {
        try {
            if (USE_TEST_LOCATION) {
                // Use test location for testing
                setUserLocation(TEST_LOCATION);
            } else {
                // Use real GPS location
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        }
        catch (error) {
            console.error('Error getting location:', error);
        }
    }

    async function requestPermission() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status);

            if (status === Location.PermissionStatus.GRANTED) {
                await getCurrentLocation();
            }
        }
        catch (error) {
            console.error('Error requesting location permission:', error);
        }
    }

    return (
        <LocationContext.Provider
            value={ {
                userLocation,
                locationPermission,
                isLoading,
                requestPermission,
            } }
        >
            { children }
        </LocationContext.Provider>
    );
}
