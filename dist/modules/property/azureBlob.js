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
exports.generateUploadSasUrl = generateUploadSasUrl;
const storage_blob_1 = require("@azure/storage-blob");
const uuid_1 = require("uuid");
const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || '';
const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY || '';
const AZURE_BLOB_CONTAINER = process.env.AZURE_BLOB_CONTAINER || 'property-images';
if (!AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_ACCESS_KEY) {
    throw new Error('Azure Blob Storage credentials are not set in environment variables.');
}
const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`, sharedKeyCredential);
function generateUploadSasUrl(filename_1) {
    return __awaiter(this, arguments, void 0, function* (filename, contentType = 'image/jpeg') {
        const containerClient = blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER);
        const blobName = `${(0, uuid_1.v4)()}-${filename}`;
        const blobClient = containerClient.getBlockBlobClient(blobName);
        // Set SAS token expiration (e.g., 10 minutes)
        const expiresOn = new Date(Date.now() + 10 * 60 * 1000);
        const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
            containerName: AZURE_BLOB_CONTAINER,
            blobName,
            permissions: storage_blob_1.BlobSASPermissions.parse('cw'), // create, write
            startsOn: new Date(),
            expiresOn,
            protocol: storage_blob_1.SASProtocol.Https,
            contentType,
        }, sharedKeyCredential).toString();
        const uploadUrl = `${blobClient.url}?${sasToken}`;
        // Return the public URL (without SAS token) for display
        const publicUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_BLOB_CONTAINER}/${blobName}`;
        return {
            uploadUrl,
            blobUrl: publicUrl, // Use public URL instead of SAS URL
            expiresOn,
        };
    });
}
