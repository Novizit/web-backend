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
const express_1 = require("express");
const azureBlob_1 = require("../modules/property/azureBlob");
const router = (0, express_1.Router)();
// POST /api/azure/sas-url
router.post('/sas-url', (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { filename, contentType } = req.body;
            if (!filename) {
                res.status(400).json({ message: 'Filename is required' });
                return;
            }
            const result = yield (0, azureBlob_1.generateUploadSasUrl)(filename, contentType);
            res.json(result);
        }
        catch (error) {
            console.error('Error generating Azure SAS URL:', error);
            res.status(500).json({ message: 'Failed to generate SAS URL', error: error instanceof Error ? error.message : error });
        }
    }))();
});
exports.default = router;
