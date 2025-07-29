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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const property_routes_1 = __importDefault(require("./property.routes"));
// Check if we have a database connection
const hasDatabaseConnection = () => {
    return process.env.DATABASE_URL && process.env.DATABASE_URL !== '';
};
describe('Property Endpoints', () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/properties', property_routes_1.default);
    // Skip tests if no database connection is available
    const runTest = hasDatabaseConnection() ? it : it.skip;
    runTest('should add a property', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const res = yield (0, supertest_1.default)(app)
                .post('/properties')
                .send({
                propertyName: 'Sunshine Villa',
                rent: 25000,
                securityDeposit: 50000,
                maintenance: 2000,
                location: 'Banjara Hills, Hyderabad',
                availableFrom: '2024-07-15',
                propertyType: 'Villa',
                bhkType: 'ThreeBHK',
                furnishing: 'SemiFurnished',
                preferredTenant: 'Family',
                ownerType: 'Landlord',
                ownerName: 'Ravi Kumar',
                contactNumber: '9876543210'
            });
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.propertyName).toBe('Sunshine Villa');
        }
        catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    }));
    runTest('should get properties and filter by location', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // First add a property
            yield (0, supertest_1.default)(app)
                .post('/properties')
                .send({
                propertyName: 'Another Apartment',
                rent: 18000,
                securityDeposit: 36000,
                maintenance: 1500,
                location: 'Madhapur, Hyderabad',
                availableFrom: '2024-08-01',
                propertyType: 'Apartment',
                bhkType: 'TwoBHK',
                furnishing: 'Unfurnished',
                preferredTenant: 'Any',
                ownerType: 'Landlord',
                ownerName: 'Suresh Reddy',
                contactNumber: '9123456789'
            });
            // Then search for it
            const res = yield (0, supertest_1.default)(app).get('/properties?location=Madhapur');
            console.log('Search response status:', res.status);
            console.log('Search response body:', res.body);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.results)).toBe(true);
            expect(res.body.results.some(function (p) { return p.location === 'Madhapur, Hyderabad'; })).toBe(true);
        }
        catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    }), 10000); // Increase timeout to 10 seconds
});
