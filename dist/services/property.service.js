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
exports.propertyService = exports.PropertyService = void 0;
const prisma_service_1 = require("./prisma.service");
class PropertyService {
    createProperty(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const property = yield prisma_service_1.prisma.property.create({
                    data: Object.assign(Object.assign({}, data), { availableFrom: new Date(data.availableFrom) }),
                });
                return property;
            }
            catch (error) {
                throw new Error(`Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Helper to format BHK and furnishing for display
    formatBhkType(bhkType) {
        if (!bhkType)
            return '';
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
    // Helper to convert frontend BHK types to backend enum values
    convertBhkTypeToEnum(bhkType) {
        if (!bhkType)
            return null;
        switch (bhkType.toUpperCase()) {
            case '1RK': return 'OneRK';
            case '1BHK': return 'OneBHK';
            case '2BHK': return 'TwoBHK';
            case '3BHK': return 'ThreeBHK';
            case '4BHK': return 'FourBHK';
            default: return null;
        }
    }
    formatFurnishing(furnishing) {
        if (!furnishing)
            return '';
        switch (furnishing.toUpperCase().replace(/\s|-/g, '')) {
            case 'UNFURNISHED': return 'Unfurnished';
            case 'SEMIFURNISHED': return 'Semi-Furnished';
            case 'FULLFURNISHED': return 'Full-Furnished';
            default: return furnishing;
        }
    }
    getProperties() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            try {
                const where = {};
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
                    }
                    else {
                        // Single location search
                        where.location = {
                            contains: locationSearch,
                            mode: 'insensitive',
                        };
                    }
                }
                if (filters.minRent || filters.maxRent) {
                    where.rent = {};
                    if (filters.minRent)
                        where.rent.gte = filters.minRent;
                    if (filters.maxRent)
                        where.rent.lte = filters.maxRent;
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
                const [properties, total] = yield Promise.all([
                    prisma_service_1.prisma.property.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }),
                    prisma_service_1.prisma.property.count({ where }),
                ]);
                // Format BHK and furnishing for all properties
                const formattedProperties = properties.map((property) => (Object.assign(Object.assign({}, property), { formattedBhkType: this.formatBhkType(property.bhkType), formattedFurnishing: this.formatFurnishing(property.furnishing) })));
                return {
                    properties: formattedProperties,
                    total,
                    page,
                    limit,
                };
            }
            catch (error) {
                throw new Error(`Failed to fetch properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    getPropertyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const property = yield prisma_service_1.prisma.property.findUnique({
                    where: { id },
                });
                if (!property)
                    return null;
                return Object.assign(Object.assign({}, property), { formattedBhkType: this.formatBhkType(property.bhkType), formattedFurnishing: this.formatFurnishing(property.furnishing) });
            }
            catch (error) {
                throw new Error(`Failed to fetch property: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    updateProperty(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateData = Object.assign({}, data);
                if (data.availableFrom) {
                    updateData.availableFrom = new Date(data.availableFrom);
                }
                const property = yield prisma_service_1.prisma.property.update({
                    where: { id },
                    data: updateData,
                });
                return property;
            }
            catch (error) {
                throw new Error(`Failed to update property: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    deleteProperty(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_service_1.prisma.property.delete({
                    where: { id },
                });
            }
            catch (error) {
                throw new Error(`Failed to delete property: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Returns similar properties based on location, BHK type (+/-1), rent (+/-20%), property type, and furnishing.
     * Properties are scored and sorted by relevance. Excludes the current property.
     */
    getSimilarProperties(propertyId_1) {
        return __awaiter(this, arguments, void 0, function* (propertyId, maxResults = 6) {
            // 1. Fetch the current property
            const current = yield this.getPropertyById(propertyId);
            if (!current)
                throw new Error('Property not found');
            // Build BHK type filter: current, +/-1 neighbor
            const bhkEnumList = ['OneRK', 'OneBHK', 'TwoBHK', 'ThreeBHK', 'FourBHK'];
            const currentIndex = bhkEnumList.indexOf(current.bhkType);
            const bhkTypes = [];
            if (currentIndex !== -1) {
                bhkTypes.push(bhkEnumList[currentIndex]);
                if (bhkEnumList[currentIndex - 1])
                    bhkTypes.push(bhkEnumList[currentIndex - 1]);
                if (bhkEnumList[currentIndex + 1])
                    bhkTypes.push(bhkEnumList[currentIndex + 1]);
            }
            let isFallback = false;
            // Add back rent filter
            const minRent = current.rent * 0.8;
            const maxRent = current.rent * 1.2;
            let candidates = yield prisma_service_1.prisma.property.findMany({
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
                candidates = yield prisma_service_1.prisma.property.findMany({
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
                candidates = yield prisma_service_1.prisma.property.findMany({
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
                candidates = yield prisma_service_1.prisma.property.findMany({
                    where: {
                        id: { not: propertyId },
                        bhkType: { in: bhkTypes },
                    },
                    take: 20,
                });
                isFallback = true;
            }
            // Advanced scoring
            function getScore(candidate) {
                let score = 0;
                // Location
                if (candidate.location === current.location)
                    score += 5;
                else if (candidate.location && current.location && candidate.location.toLowerCase().includes(current.location.toLowerCase()))
                    score += 2;
                // BHK
                if (candidate.bhkType === current.bhkType)
                    score += 4;
                else if (bhkTypes.includes(candidate.bhkType))
                    score += 2;
                // Rent proximity
                const rentDiff = Math.abs(candidate.rent - current.rent);
                if (rentDiff < current.rent * 0.1)
                    score += 2;
                else if (rentDiff < current.rent * 0.2)
                    score += 1;
                // Furnishing
                if (candidate.furnishing === current.furnishing)
                    score += 1;
                // Property type
                if (candidate.propertyType === current.propertyType)
                    score += 1;
                return score;
            }
            const sorted = candidates
                .map((p) => (Object.assign(Object.assign({}, p), { _score: getScore(p) })))
                .sort((a, b) => b._score - a._score)
                .slice(0, maxResults)
                .map((property) => (Object.assign(Object.assign({}, property), { formattedBhkType: this.formatBhkType(property.bhkType), formattedFurnishing: this.formatFurnishing(property.furnishing) })));
            console.log("Final similar property candidates (isFallback:", isFallback, "):", sorted.length, sorted.map((p) => ({
                id: p.id, location: p.location, bhkType: p.bhkType, propertyType: p.propertyType, furnishing: p.furnishing, rent: p.rent
            })));
            return { properties: sorted, isFallback };
        });
    }
}
exports.PropertyService = PropertyService;
exports.propertyService = new PropertyService();
