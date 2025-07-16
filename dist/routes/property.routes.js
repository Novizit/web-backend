"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = require("../modules/property/property.controller");
const router = (0, express_1.Router)();
// Owner: Add property
router.post('/', property_controller_1.addProperty);
// Tenant: Search/filter properties
router.get('/', property_controller_1.getProperties);
// Tenant: Get similar properties (must come before /:id route)
router.get('/similar-properties/:propertyId', property_controller_1.getSimilarProperties);
// Tenant: Get property by ID (must come after specific routes)
router.get('/:id', property_controller_1.getPropertyById);
exports.default = router;
