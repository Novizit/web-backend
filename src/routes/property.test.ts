import request from 'supertest';
import express from 'express';
import propertyRoutes from './property.routes';

// Check if we have a database connection
const hasDatabaseConnection = () => {
  return process.env.DATABASE_URL && process.env.DATABASE_URL !== '';
};

describe('Property Endpoints', () => {
  const app = express();
  app.use(express.json());
  app.use('/properties', propertyRoutes);

  // Skip tests if no database connection is available
  const runTest = hasDatabaseConnection() ? it : it.skip;

  runTest('should add a property', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  runTest('should get properties and filter by location', async () => {
    try {
      // First add a property
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
          bhkType: 'TwoBHK',
          furnishing: 'Unfurnished',
          preferredTenant: 'Any',
          ownerType: 'Landlord',
          ownerName: 'Suresh Reddy',
          contactNumber: '9123456789'
        });
      
      // Then search for it
      const res = await request(app as any).get('/properties?location=Madhapur');
      
      console.log('Search response status:', res.status);
      console.log('Search response body:', res.body);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.some(function(p: any) { return p.location === 'Madhapur, Hyderabad'; })).toBe(true);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 10000); // Increase timeout to 10 seconds
}); 