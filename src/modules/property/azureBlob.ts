import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || '';
const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY || '';
const AZURE_BLOB_CONTAINER = process.env.AZURE_BLOB_CONTAINER || 'property-images';

if (!AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_ACCESS_KEY) {
  throw new Error('Azure Blob Storage credentials are not set in environment variables.');
}

const sharedKeyCredential = new StorageSharedKeyCredential(
  AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_ACCESS_KEY
);

const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  sharedKeyCredential
);

export async function generateUploadSasUrl(filename: string, contentType: string = 'image/jpeg') {
  const containerClient = blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER);
  const blobName = `${uuidv4()}-${filename}`;
  const blobClient = containerClient.getBlockBlobClient(blobName);

  // Set SAS token expiration (e.g., 10 minutes)
  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);

  const sasToken = generateBlobSASQueryParameters({
    containerName: AZURE_BLOB_CONTAINER,
    blobName,
    permissions: BlobSASPermissions.parse('cw'), // create, write
    startsOn: new Date(),
    expiresOn,
    protocol: SASProtocol.Https,
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
} 