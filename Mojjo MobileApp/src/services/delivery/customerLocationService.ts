import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { DeliveryZoneService, KATHMANDU_VALLEY_DELIVERY_ZONES } from './deliveryZoneService';
import { DeliveryZone, ServiceabilityCheckResult } from '../../types/address';

export interface DetectedLocationResult {
  latitude: number;
  longitude: number;
  streetAddress: string;
  area: string;
  city: string;
  landmark?: string;
  formattedAddress: string;
  isServiceable: boolean;
  etaMinutes: number;
  matchedZone?: DeliveryZone;
  permissionGranted: boolean;
}

export class CustomerLocationService {
  /**
   * Request device location permission and fetch current GPS coordinates.
   */
  public static async requestAndGetLocation(): Promise<DetectedLocationResult> {
    try {
      // 1. Request Foreground Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return {
          latitude: 27.6782,
          longitude: 85.3123,
          streetAddress: 'Jhamsikhel Road, Ward 3',
          area: 'Jhamsikhel',
          city: 'Lalitpur',
          landmark: "Near St. Xavier's College",
          formattedAddress: 'Jhamsikhel, Lalitpur (Default)',
          isServiceable: true,
          etaMinutes: 10,
          permissionGranted: false,
        };
      }

      // 2. Fetch High-Accuracy Device GPS Location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 3. Reverse Geocode Coordinates into Street, Area & City
      return await this.reverseGeocodeAndMatchZone(latitude, longitude);
    } catch (error) {
      console.warn('Location detection fallback:', error);
      // Return Jhamsikhel default zone
      return {
        latitude: 27.6782,
        longitude: 85.3123,
        streetAddress: 'House #14, Jhamsikhel Road',
        area: 'Jhamsikhel',
        city: 'Lalitpur',
        landmark: "Near St. Xavier's College",
        formattedAddress: 'Jhamsikhel, Lalitpur',
        isServiceable: true,
        etaMinutes: 10,
        permissionGranted: true,
      };
    }
  }

  /**
   * Reverse geocodes coordinates to a human-readable address and matches nearest Kathmandu Dark Store zone.
   */
  public static async reverseGeocodeAndMatchZone(
    latitude: number,
    longitude: number
  ): Promise<DetectedLocationResult> {
    let detectedArea = 'Jhamsikhel';
    let detectedCity = 'Lalitpur';
    let detectedStreet = 'Main Road';
    let detectedLandmark = '';

    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        detectedCity = place.city || place.subregion || 'Kathmandu';
        detectedArea = place.district || place.name || place.subregion || 'Jhamsikhel';
        detectedStreet = place.street || place.name || `${detectedArea} Marg`;
        detectedLandmark = place.streetNumber ? `Near House #${place.streetNumber}` : '';
      }
    } catch (e) {
      // Fallback matching by coordinate proximity
      const matched = this.matchNearestKathmanduZone(latitude, longitude);
      detectedArea = matched.name;
      detectedCity = matched.city;
      detectedStreet = `${matched.name} Road`;
    }

    // Check delivery zone serviceability
    const serviceability: ServiceabilityCheckResult = DeliveryZoneService.checkServiceability(
      detectedArea,
      detectedCity
    );

    const formattedAddress = `${detectedArea}, ${detectedCity}`;

    return {
      latitude,
      longitude,
      streetAddress: detectedStreet,
      area: serviceability.areaName || detectedArea,
      city: serviceability.cityName || detectedCity,
      landmark: detectedLandmark,
      formattedAddress,
      isServiceable: serviceability.isServiceable,
      etaMinutes: serviceability.etaMinutes || 10,
      permissionGranted: true,
    };
  }

  /**
   * Helper: Finds closest known dark store delivery zone in Kathmandu/Lalitpur by coordinates
   */
  private static matchNearestKathmanduZone(lat: number, lng: number): DeliveryZone {
    // If latitude is south of Bagmati River (Lalitpur side)
    if (lat < 27.685) {
      return KATHMANDU_VALLEY_DELIVERY_ZONES[0]; // Jhamsikhel
    }
    // Kathmandu side
    return (
      KATHMANDU_VALLEY_DELIVERY_ZONES.find((z) => z.city.toLowerCase() === 'kathmandu') ||
      KATHMANDU_VALLEY_DELIVERY_ZONES[0]
    );
  }
}
