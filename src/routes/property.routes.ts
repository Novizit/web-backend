import { Router } from 'express';
import { addProperty, getProperties, getPropertyById, getSimilarProperties } from '../modules/property/property.controller';

const router = Router();

// Owner: Add property
router.post('/', addProperty);

// Tenant: Search/filter properties
router.get('/', getProperties);

// Tenant: Get similar properties (must come before /:id route)
router.get('/similar-properties/:propertyId', getSimilarProperties);

// Tenant: Get property by ID (must come after specific routes)
router.get('/:id', getPropertyById);

export default router; 