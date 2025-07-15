export type PropertyType = 'Individual' | 'Apartment' | 'Villa';
export type BhkType = '1RK' | '1BHK' | '2BHK' | '3BHK' | '4BHK';
export type Furnishing = 'Unfurnished' | 'Semi-Furnished' | 'Full-Furnished';
export type PreferredTenant = 'Any' | 'Family' | 'Bachelor';
export type OwnerType = 'Landlord' | 'Other';

export interface Property {
  id: number;
  propertyName: string;
  rent: number;
  securityDeposit: number;
  maintenance: number;
  location: string;
  availableFrom: string; // ISO date string
  propertyType: PropertyType;
  bhkType: BhkType;
  furnishing: Furnishing;
  preferredTenant: PreferredTenant;
  ownerType: OwnerType;
  ownerName: string;
  contactNumber: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
} 