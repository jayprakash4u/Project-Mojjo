import { DeliveryZone, ServiceabilityCheckResult } from '../../types/address';

export const KATHMANDU_VALLEY_DELIVERY_ZONES: DeliveryZone[] = [
  // Lalitpur Dark Store Cluster
  {
    id: 'zone-jhamsikhel',
    name: 'Jhamsikhel',
    city: 'Lalitpur',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-sanepa',
    name: 'Sanepa',
    city: 'Lalitpur',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-pulchowk',
    name: 'Pulchowk',
    city: 'Lalitpur',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-kupondole',
    name: 'Kupondole',
    city: 'Lalitpur',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-patan',
    name: 'Patan / Mangalbazar',
    city: 'Lalitpur',
    standardEtaMinutes: 12,
    expressEtaMinutes: 10,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-jawalakhel',
    name: 'Jawalakhel',
    city: 'Lalitpur',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-kumaripati',
    name: 'Kumaripati',
    city: 'Lalitpur',
    standardEtaMinutes: 12,
    expressEtaMinutes: 10,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-balkumari',
    name: 'Balkumari',
    city: 'Lalitpur',
    standardEtaMinutes: 15,
    expressEtaMinutes: 12,
    isExpressAvailable: true,
    isRestricted: false,
  },

  // Kathmandu Central Dark Store Cluster
  {
    id: 'zone-baneshwor',
    name: 'New Baneshwor',
    city: 'Kathmandu',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-thamel',
    name: 'Thamel',
    city: 'Kathmandu',
    standardEtaMinutes: 12,
    expressEtaMinutes: 10,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-naxal',
    name: 'Naxal / Gairidhara',
    city: 'Kathmandu',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-baluwatar',
    name: 'Baluwatar',
    city: 'Kathmandu',
    standardEtaMinutes: 12,
    expressEtaMinutes: 10,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-lazimpat',
    name: 'Lazimpat',
    city: 'Kathmandu',
    standardEtaMinutes: 12,
    expressEtaMinutes: 10,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-maitighar',
    name: 'Maitighar',
    city: 'Kathmandu',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-koteshwor',
    name: 'Koteshwor',
    city: 'Kathmandu',
    standardEtaMinutes: 12,
    expressEtaMinutes: 10,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-tinkune',
    name: 'Tinkune',
    city: 'Kathmandu',
    standardEtaMinutes: 10,
    expressEtaMinutes: 8,
    isExpressAvailable: true,
    isRestricted: false,
  },
  {
    id: 'zone-maharajgunj',
    name: 'Maharajgunj',
    city: 'Kathmandu',
    standardEtaMinutes: 15,
    expressEtaMinutes: 12,
    isExpressAvailable: true,
    isRestricted: false,
  },
];

export class DeliveryZoneService {
  /**
   * Returns all serviceable delivery zones in Kathmandu Valley
   */
  public static getServiceableAreas(): DeliveryZone[] {
    return KATHMANDU_VALLEY_DELIVERY_ZONES.filter((z) => !z.isRestricted);
  }

  /**
   * Evaluates if a given area and city are inside the 10-minute dark store delivery radius
   */
  public static checkServiceability(
    areaName: string,
    cityName?: string
  ): ServiceabilityCheckResult {
    if (!areaName || !areaName.trim()) {
      return {
        isServiceable: false,
        areaName: '',
        cityName: cityName || 'Kathmandu Valley',
        etaMinutes: 0,
        isExpressAvailable: false,
        isRestricted: false,
        message: 'Please enter an area or select from serviceable zones.',
      };
    }

    const cleanArea = areaName.trim().toLowerCase();
    const cleanCity = cityName ? cityName.trim().toLowerCase() : '';

    const matchedZone = KATHMANDU_VALLEY_DELIVERY_ZONES.find((zone) => {
      const zoneName = zone.name.toLowerCase();
      const zoneCity = zone.city.toLowerCase();

      const areaMatches = zoneName.includes(cleanArea) || cleanArea.includes(zoneName);
      if (cleanCity) {
        return areaMatches && zoneCity.includes(cleanCity);
      }
      return areaMatches;
    });

    if (matchedZone) {
      if (matchedZone.isRestricted) {
        return {
          isServiceable: false,
          areaName: matchedZone.name,
          cityName: matchedZone.city,
          etaMinutes: 0,
          isExpressAvailable: false,
          isRestricted: true,
          message: matchedZone.restrictionReason || 'Deliveries temporarily restricted in this zone.',
        };
      }

      return {
        isServiceable: true,
        areaName: matchedZone.name,
        cityName: matchedZone.city,
        etaMinutes: matchedZone.standardEtaMinutes,
        isExpressAvailable: matchedZone.isExpressAvailable,
        isRestricted: false,
        message: `⚡ 10-Min Delivery Available (${matchedZone.standardEtaMinutes} mins ETA)`,
      };
    }

    // Unmatched / outside 10-min radius
    return {
      isServiceable: false,
      areaName,
      cityName: cityName || 'Kathmandu Valley',
      etaMinutes: 0,
      isExpressAvailable: false,
      isRestricted: false,
      message: '📍 Location is currently outside our 10-min dark-store delivery radius.',
    };
  }
}
