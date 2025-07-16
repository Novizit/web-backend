import { Request, Response, RequestHandler } from 'express';
import { z } from 'zod';
import { propertyService, CreatePropertyInput, PropertyFilters } from '../../services/property.service';
import { createError, asyncHandler } from '../../middleware/errorHandler';

const PropertySchema = z.object({
  propertyName: z.string().min(1, 'Property name is required'),
  rent: z.number().positive('Rent must be a positive number'),
  securityDeposit: z.number().positive('Security deposit must be a positive number'),
  maintenance: z.number().min(0, 'Maintenance must be a non-negative number'),
  location: z.string().min(1, 'Location is required'),
  availableFrom: z.string().datetime('Available from must be a valid date'),
  propertyType: z.enum(['Individual', 'Apartment', 'Villa']),
  bhkType: z.enum(['OneRK', 'OneBHK', 'TwoBHK', 'ThreeBHK', 'FourBHK']),
  furnishing: z.enum(['Unfurnished', 'SemiFurnished', 'FullFurnished']),
  preferredTenant: z.enum(['Any', 'Family', 'Bachelor']),
  ownerType: z.enum(['Landlord', 'Other']),
  ownerName: z.string().min(1, 'Owner name is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  imageUrls: z.array(z.string()).optional(),
});

export const addProperty: RequestHandler = asyncHandler(async (req, res) => {
  // Convert numeric fields if they come as strings
  const body = {
    ...req.body,
    rent: typeof req.body.rent === 'string' ? Number(req.body.rent) : req.body.rent,
    securityDeposit: typeof req.body.securityDeposit === 'string' ? Number(req.body.securityDeposit) : req.body.securityDeposit,
    maintenance: typeof req.body.maintenance === 'string' ? Number(req.body.maintenance) : req.body.maintenance,
  };
  
  const result = PropertySchema.safeParse(body);
  if (!result.success) {
    throw createError('Invalid input data', 400);
  }
  
  const property = await propertyService.createProperty(result.data);
  res.status(201).json({
    ...property,
    formattedBhkType: propertyService.formatBhkType(property.bhkType),
    formattedFurnishing: propertyService.formatFurnishing(property.furnishing),
  });
});

export const getProperties: RequestHandler = asyncHandler(async (req, res) => {
  const { 
    location, 
    minRent, 
    maxRent, 
    propertyType, 
    bhkType, 
    furnishing, 
    preferredTenant, 
    page = '1', 
    limit = '10' 
  } = req.query;
  
  // Prepare filters object
  const filters: PropertyFilters = {};
  
  if (location && typeof location === 'string' && location.trim() !== '') {
    const trimmedLocation = location.trim();
    
    // For multiple locations, check if any individual location is at least 2 characters
    if (trimmedLocation.includes(',')) {
      const locations = trimmedLocation.split(',').map(loc => loc.trim()).filter(loc => loc.length >= 2);
      if (locations.length > 0) {
        filters.location = locations.join(',');
      }
    } else {
      // Single location - check if it's at least 2 characters
      if (trimmedLocation.length >= 2) {
        filters.location = trimmedLocation;
      }
    }
  }
  
  if (minRent && !isNaN(Number(minRent))) {
    filters.minRent = Number(minRent);
  }
  
  if (maxRent && !isNaN(Number(maxRent))) {
    filters.maxRent = Number(maxRent);
  }
  
  if (propertyType && typeof propertyType === 'string' && propertyType.trim() !== '') {
    filters.propertyType = propertyType.trim() as 'Individual' | 'Apartment' | 'Villa';
  }
  
  if (bhkType) {
    const bhkTypes = Array.isArray(bhkType) ? bhkType : [bhkType];
    const convertedBhkTypes = bhkTypes
      .filter(bhk => bhk && String(bhk).trim() !== '')
      .map(bhk => propertyService.convertBhkTypeToEnum(String(bhk)))
      .filter(bhk => bhk !== null) as ('OneRK' | 'OneBHK' | 'TwoBHK' | 'ThreeBHK' | 'FourBHK')[];
    
    if (convertedBhkTypes.length > 0) {
      filters.bhkType = convertedBhkTypes;
    }
  }
  
  if (furnishing && typeof furnishing === 'string' && furnishing.trim() !== '') {
    filters.furnishing = furnishing.trim() as 'Unfurnished' | 'SemiFurnished' | 'FullFurnished';
  }
  
  if (preferredTenant && typeof preferredTenant === 'string' && preferredTenant.trim() !== '') {
    filters.preferredTenant = preferredTenant.trim() as 'Any' | 'Family' | 'Bachelor';
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));

  const result = await propertyService.getProperties(filters, pageNum, limitNum);

  res.json({
    total: result.total,
    page: result.page,
    limit: result.limit,
    results: result.properties,
  });
});

export const getPropertyById: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const propertyId = parseInt(id, 10);
  
  if (isNaN(propertyId)) {
    throw createError('Invalid property ID', 400);
  }
  
  const property = await propertyService.getPropertyById(propertyId);
  if (!property) {
    throw createError('Property not found', 404);
  }
  
  res.json(property);
}); 

// GET /api/similar-properties/:propertyId
// Returns an array of similar properties based on the current property's characteristics.
export const getSimilarProperties: RequestHandler = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const id = parseInt(propertyId, 10);
  
  if (isNaN(id)) {
    throw createError('Invalid property ID', 400);
  }
  
  const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string, 10) : 6;
  const { properties, isFallback } = await propertyService.getSimilarProperties(id, maxResults);
  
  res.json({ properties, isFallback });
}); 