import { prisma } from './prisma.service';

export interface CreatePropertyInput {
  propertyName: string;
  rent: number;
  securityDeposit: number;
  maintenance: number;
  location: string;
  availableFrom: string;
  propertyType: 'Individual' | 'Apartment' | 'Villa';
  bhkType: 'OneRK' | 'OneBHK' | 'TwoBHK' | 'ThreeBHK' | 'FourBHK';
  furnishing: 'Unfurnished' | 'SemiFurnished' | 'FullFurnished';
  preferredTenant: 'Any' | 'Family' | 'Bachelor';
  ownerType: 'Landlord' | 'Other';
  ownerName: string;
  contactNumber: string;
  imageUrls?: string[];
}

export interface PropertyFilters {
  location?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: 'Individual' | 'Apartment' | 'Villa';
  bhkType?: ('OneRK' | 'OneBHK' | 'TwoBHK' | 'ThreeBHK' | 'FourBHK')[];
  furnishing?: 'Unfurnished' | 'SemiFurnished' | 'FullFurnished';
  preferredTenant?: 'Any' | 'Family' | 'Bachelor';
}

export class PropertyService {
  async createProperty(data: CreatePropertyInput): Promise<any> {
    try {
      const property = await prisma.property.create({
        data: {
          ...data,
          availableFrom: new Date(data.availableFrom),
        },
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper to format BHK and furnishing for display
  formatBhkType(bhkType: string): string {
    if (!bhkType) return '';
    switch (bhkType.toUpperCase()) {
      case 'ONERK':
      case '1RK': return '1RK';
      case 'ONEBHK':
      case '1BHK': return '1BHK';
      case 'TWOBHK':
      case '2BHK': return '2BHK';
      case 'THREEBHK':
      case '3BHK': return '3BHK';
      case 'FOURBHK':
      case '4BHK': return '4BHK';
      default: return bhkType;
    }
  }

  // Helper to convert frontend BHK types to backend enum values/check
  convertBhkTypeToEnum(bhkType: string): 'OneRK' | 'OneBHK' | 'TwoBHK' | 'ThreeBHK' | 'FourBHK' | null {
    if (!bhkType) return null;
    switch (bhkType.toUpperCase()) {
      case '1RK': return 'OneRK';
      case '1BHK': return 'OneBHK';
      case '2BHK': return 'TwoBHK';
      case '3BHK': return 'ThreeBHK';
      case '4BHK': return 'FourBHK';
      default: return null;
    }
  }

  formatFurnishing(furnishing: string): string {
    if (!furnishing) return '';
    switch (furnishing.toUpperCase().replace(/\s|-/g, '')) {
      case 'UNFURNISHED': return 'Unfurnished';
      case 'SEMIFURNISHED': return 'Semi-Furnished';
      case 'FULLFURNISHED': return 'Full-Furnished';
      default: return furnishing;
    }
  }

  async getProperties(filters: PropertyFilters = {}, page: number = 1, limit: number = 10): Promise<{
    properties: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const where: any = {};

      if (filters.location && filters.location.trim().length >= 2) {
        const locationSearch = filters.location.trim();
        
        // Handle multiple locations separated by commas
        if (locationSearch.includes(',')) {
          const locations = locationSearch.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
          if (locations.length > 0) {
            // Use OR condition for multiple locations
            where.OR = locations.map(location => ({
              location: {
                contains: location,
                mode: 'insensitive',
              }
            }));
          }
        } else {
          // Single location search
          where.location = {
            contains: locationSearch,
            mode: 'insensitive',
          };
        }
      }

      if (filters.minRent || filters.maxRent) {
        where.rent = {};
        if (filters.minRent) where.rent.gte = filters.minRent;
        if (filters.maxRent) where.rent.lte = filters.maxRent;
      }

      if (filters.propertyType) {
        where.propertyType = filters.propertyType;
      }

      if (filters.bhkType && filters.bhkType.length > 0) {
        where.bhkType = {
          in: filters.bhkType,
        };
      }

      if (filters.furnishing) {
        where.furnishing = filters.furnishing;
      }

      if (filters.preferredTenant) {
        where.preferredTenant = filters.preferredTenant;
      }

      const skip = (page - 1) * limit;

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.property.count({ where }),
      ]);

      // Format BHK and furnishing for all properties
      const formattedProperties = properties.map((property: any) => ({
        ...property,
        formattedBhkType: this.formatBhkType(property.bhkType),
        formattedFurnishing: this.formatFurnishing(property.furnishing),
      }));

      return {
        properties: formattedProperties,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Failed to fetch properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPropertyById(id: number): Promise<any | null> {
    try {
      const property = await prisma.property.findUnique({
        where: { id },
      });
      if (!property) return null;
      return {
        ...property,
        formattedBhkType: this.formatBhkType(property.bhkType),
        formattedFurnishing: this.formatFurnishing(property.furnishing),
      };
    } catch (error) {
      throw new Error(`Failed to fetch property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProperty(id: number, data: Partial<CreatePropertyInput>): Promise<any> {
    try {
      const updateData: any = { ...data };
      if (data.availableFrom) {
        updateData.availableFrom = new Date(data.availableFrom);
      }

      const property = await prisma.property.update({
        where: { id },
        data: updateData,
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to update property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteProperty(id: number): Promise<void> {
    try {
      await prisma.property.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Returns similar properties based on location, BHK type (+/-1), rent (+/-20%), property type, and furnishing.
   * Properties are scored and sorted by relevance. Excludes the current property.
   */
  async getSimilarProperties(propertyId: number, maxResults: number = 6): Promise<{ properties: any[], isFallback: boolean }> {
    // 1. Fetch the current property
    const current = await this.getPropertyById(propertyId);
    if (!current) throw new Error('Property not found');

    // Build BHK type filter: current, +/-1 neighbor
    const bhkEnumList: ('OneRK' | 'OneBHK' | 'TwoBHK' | 'ThreeBHK' | 'FourBHK')[] = ['OneRK', 'OneBHK', 'TwoBHK', 'ThreeBHK', 'FourBHK'];
    const currentIndex = bhkEnumList.indexOf(current.bhkType);
    const bhkTypes: ('OneRK' | 'OneBHK' | 'TwoBHK' | 'ThreeBHK' | 'FourBHK')[] = [];
    if (currentIndex !== -1) {
      bhkTypes.push(bhkEnumList[currentIndex]);
      if (bhkEnumList[currentIndex - 1]) bhkTypes.push(bhkEnumList[currentIndex - 1]);
      if (bhkEnumList[currentIndex + 1]) bhkTypes.push(bhkEnumList[currentIndex + 1]);
    }
    let isFallback = false;
    // Add back rent filter
    const minRent = current.rent * 0.8;
    const maxRent = current.rent * 1.2;
    let candidates = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        location: { contains: current.location, mode: 'insensitive' },
        bhkType: { in: bhkTypes },
        rent: { gte: minRent, lte: maxRent },
        propertyType: current.propertyType,
        furnishing: current.furnishing,
      },
      take: 20,
    });
    if (candidates.length === 0) {
      candidates = await prisma.property.findMany({
        where: {
          id: { not: propertyId },
          location: { contains: current.location, mode: 'insensitive' },
          bhkType: { in: bhkTypes },
          rent: { gte: minRent, lte: maxRent },
          propertyType: current.propertyType,
        },
        take: 20,
      });
    }
    if (candidates.length === 0) {
      candidates = await prisma.property.findMany({
        where: {
          id: { not: propertyId },
          location: { contains: current.location, mode: 'insensitive' },
          bhkType: { in: bhkTypes },
          rent: { gte: minRent, lte: maxRent },
        },
        take: 20,
      });
    }
    if (candidates.length === 0) {
      candidates = await prisma.property.findMany({
        where: {
          id: { not: propertyId },
          bhkType: { in: bhkTypes },
        },
        take: 20,
      });
      isFallback = true;
    }
    // Advanced scoring
    function getScore(candidate: any): number {
      let score = 0;
      // Location
      if (candidate.location === current.location) score += 5;
      else if (candidate.location && current.location && candidate.location.toLowerCase().includes(current.location.toLowerCase())) score += 2;
      // BHK
      if (candidate.bhkType === current.bhkType) score += 4;
      else if (bhkTypes.includes(candidate.bhkType)) score += 2;
      // Rent proximity
      const rentDiff = Math.abs(candidate.rent - current.rent);
      if (rentDiff < current.rent * 0.1) score += 2;
      else if (rentDiff < current.rent * 0.2) score += 1;
      // Furnishing
      if (candidate.furnishing === current.furnishing) score += 1;
      // Property type
      if (candidate.propertyType === current.propertyType) score += 1;
      return score;
    }
    const sorted = candidates
      .map((p: any) => ({ ...p, _score: getScore(p) }))
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, maxResults)
      .map((property: any) => ({
        ...property,
        formattedBhkType: this.formatBhkType(property.bhkType),
        formattedFurnishing: this.formatFurnishing(property.furnishing),
      }));

    return { properties: sorted, isFallback };
  }
}

export const propertyService = new PropertyService(); 