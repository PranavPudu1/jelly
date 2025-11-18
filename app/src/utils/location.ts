import { Linking, Platform } from 'react-native';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const R = 3959; // Radius of the Earth in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Format distance to human readable string
 */
export function formatDistance(miles: number): string {
    if (miles < 0.1) {
        return 'Nearby';
    }
    else if (miles < 1) {
        return `${(miles * 5280).toFixed(0)} ft`;
    }
    else {
        return `${miles.toFixed(1)} mi`;
    }
}

/**
 * Open location in Google Maps app or browser
 */
export async function openInMaps(
    lat: number,
    lon: number,
    label?: string,
): Promise<void> {
    const scheme = Platform.select({
        ios: 'maps://0,0?q=',
        android: 'geo:0,0?q=',
    });
    const latLng = `${lat},${lon}`;
    const labelParam = label ? `(${label})` : '';
    const url = Platform.select({
        ios: `${scheme}${labelParam}@${latLng}`,
        android: `${scheme}${latLng}${labelParam}`,
    });

    try {
        const supported = await Linking.canOpenURL(url!);
        if (supported) {
            await Linking.openURL(url!);
        }
        else {
            // Fallback to Google Maps web
            const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
            await Linking.openURL(webUrl);
        }
    }
    catch (error) {
        console.error('Error opening maps:', error);
    }
}
