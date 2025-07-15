import request from 'supertest';
import express from 'express';
import propertyRoutes from './property.routes';

describe('Property Endpoints', () => {
  const app = express();
  app.use(express.json());
  app.use('/properties', propertyRoutes);

  it('should add a property', async () => {
    const res = await request(app as any)
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
  });

  it('should get properties and filter by location', async () => {
    await request(app as any)
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
    const res = await request(app as any).get('/properties?location=Madhapur');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(function(p: any) { return p.location === 'Madhapur, Hyderabad'; })).toBe(true);
  });
}); 