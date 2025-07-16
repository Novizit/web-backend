"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarProperties = exports.getPropertyById = exports.getProperties = exports.addProperty = void 0;
const zod_1 = require("zod");
const property_service_1 = require("../../services/property.service");
const errorHandler_1 = require("../../middleware/errorHandler");
const PropertySchema = zod_1.z.object({
    propertyName: zod_1.z.string().min(1, 'Property name is required'),
    rent: zod_1.z.number().positive('Rent must be a positive number'),
    securityDeposit: zod_1.z.number().positive('Security deposit must be a positive number'),
    maintenance: zod_1.z.number().min(0, 'Maintenance must be a non-negative number'),
    location: zod_1.z.string().min(1, 'Location is required'),
    availableFrom: zod_1.z.string().datetime('Available from must be a valid date'),
    propertyType: zod_1.z.enum(['Individual', 'Apartment', 'Villa']),
    bhkType: zod_1.z.enum(['OneRK', 'OneBHK', 'TwoBHK', 'ThreeBHK', 'FourBHK']),
    furnishing: zod_1.z.enum(['Unfurnished', 'SemiFurnished', 'FullFurnished']),
    preferredTenant: zod_1.z.enum(['Any', 'Family', 'Bachelor']),
    ownerType: zod_1.z.enum(['Landlord', 'Other']),
    ownerName: zod_1.z.string().min(1, 'Owner name is required'),
    contactNumber: zod_1.z.string().min(1, 'Contact number is required'),
    imageUrls: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.addProperty = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Convert numeric fields if they come as strings
    const body = Object.assign(Object.assign({}, req.body), { rent: typeof req.body.rent === 'string' ? Number(req.body.rent) : req.body.rent, securityDeposit: typeof req.body.securityDeposit === 'string' ? Number(req.body.securityDeposit) : req.body.securityDeposit, maintenance: typeof req.body.maintenance === 'string' ? Number(req.body.maintenance) : req.body.maintenance });
    const result = PropertySchema.safeParse(body);
    if (!result.success) {
        throw (0, errorHandler_1.createError)('Invalid input data', 400);
    }
    const property = yield property_service_1.propertyService.createProperty(result.data);
    res.status(201).json(Object.assign(Object.assign({}, property), { formattedBhkType: property_service_1.propertyService.formatBhkType(property.bhkType), formattedFurnishing: property_service_1.propertyService.formatFurnishing(property.furnishing) }));
}));
exports.getProperties = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { location, minRent, maxRent, propertyType, bhkType, furnishing, preferredTenant, page = '1', limit = '10' } = req.query;
    // Prepare filters object
    const filters = {};
    if (location && typeof location === 'string' && location.trim() !== '') {
        const trimmedLocation = location.trim();
        // For multiple locations, check if any individual location is at least 2 characters
        if (trimmedLocation.includes(',')) {
            const locations = trimmedLocation.split(',').map(loc => loc.trim()).filter(loc => loc.length >= 2);
            if (locations.length > 0) {
                filters.location = locations.join(',');
            }
        }
        else {
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
        filters.propertyType = propertyType.trim();
    }
    if (bhkType) {
        const bhkTypes = Array.isArray(bhkType) ? bhkType : [bhkType];
        const convertedBhkTypes = bhkTypes
            .filter(bhk => bhk && String(bhk).trim() !== '')
            .map(bhk => property_service_1.propertyService.convertBhkTypeToEnum(String(bhk)))
            .filter(bhk => bhk !== null);
        if (convertedBhkTypes.length > 0) {
            filters.bhkType = convertedBhkTypes;
        }
    }
    if (furnishing && typeof furnishing === 'string' && furnishing.trim() !== '') {
        filters.furnishing = furnishing.trim();
    }
    if (preferredTenant && typeof preferredTenant === 'string' && preferredTenant.trim() !== '') {
        filters.preferredTenant = preferredTenant.trim();
    }
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const result = yield property_service_1.propertyService.getProperties(filters, pageNum, limitNum);
    res.json({
        total: result.total,
        page: result.page,
        limit: result.limit,
        results: result.properties,
    });
}));
exports.getPropertyById = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const propertyId = parseInt(id, 10);
    if (isNaN(propertyId)) {
        throw (0, errorHandler_1.createError)('Invalid property ID', 400);
    }
    const property = yield property_service_1.propertyService.getPropertyById(propertyId);
    if (!property) {
        throw (0, errorHandler_1.createError)('Property not found', 404);
    }
    res.json(property);
}));
// GET /api/similar-properties/:propertyId
// Returns an array of similar properties based on the current property's characteristics.
exports.getSimilarProperties = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { propertyId } = req.params;
    const id = parseInt(propertyId, 10);
    if (isNaN(id)) {
        throw (0, errorHandler_1.createError)('Invalid property ID', 400);
    }
    const maxResults = req.query.maxResults ? parseInt(req.query.maxResults, 10) : 6;
    const { properties, isFallback } = yield property_service_1.propertyService.getSimilarProperties(id, maxResults);
    res.json({ properties, isFallback });
}));
