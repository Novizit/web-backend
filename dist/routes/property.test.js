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
describe('Property Endpoints', () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/properties', property_routes_1.default);
    it('should add a property', () => __awaiter(void 0, void 0, void 0, function* () {
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
            bhkType: '3BHK',
            furnishing: 'Semi-furnished',
            preferredTenant: 'Family',
            ownerType: 'Owner',
            ownerName: 'Ravi Kumar',
            contactNumber: '9876543210'
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.propertyName).toBe('Sunshine Villa');
    }));
    it('should get properties and filter by location', () => __awaiter(void 0, void 0, void 0, function* () {
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
            bhkType: '2BHK',
            furnishing: 'Unfurnished',
            preferredTenant: 'Any',
            ownerType: 'Broker',
            ownerName: 'Suresh Reddy',
            contactNumber: '9123456789'
        });
        const res = yield (0, supertest_1.default)(app).get('/properties?location=Madhapur');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some(function (p) { return p.location === 'Madhapur, Hyderabad'; })).toBe(true);
    }));
});
