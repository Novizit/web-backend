import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || '';
const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY || '';
const AZURE_BLOB_CONTAINER = process.env.AZURE_BLOB_CONTAINER || 'property-images';
const AZURE_CDN_URL = process.env.AZURE_CDN_URL || '';

// Only initialize Azure Blob Storage if credentials are available
let sharedKeyCredential: StorageSharedKeyCredential | null = null;
let blobServiceClient: BlobServiceClient | null = null;

if (AZURE_STORAGE_ACCOUNT && AZURE_STORAGE_ACCESS_KEY) {
  try {
    sharedKeyCredential = new StorageSharedKeyCredential(
      AZURE_STORAGE_ACCOUNT,
      AZURE_STORAGE_ACCESS_KEY
    );

    blobServiceClient = new BlobServiceClient(
      `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
      sharedKeyCredential
    );
  } catch (error) {
    console.warn('Failed to initialize Azure Blob Storage:', error);
  }
}

export async function generateUploadSasUrl(filename: string, contentType: string = 'image/jpeg') {
  if (!sharedKeyCredential || !blobServiceClient) {
    throw new Error('Azure Blob Storage is not configured. Please set AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY environment variables.');
  }

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
  // Prefer CDN host if configured, otherwise fall back to Blob Storage URL
  const storageBaseUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`;
  const cdnBaseUrl = AZURE_CDN_URL ? AZURE_CDN_URL.replace(/\/+$/, '') : '';
  const publicBaseUrl = cdnBaseUrl || storageBaseUrl;
  const publicUrl = `${publicBaseUrl}/${AZURE_BLOB_CONTAINER}/${blobName}`;
  
  return {
    uploadUrl,
    blobUrl: publicUrl, // Use public URL instead of SAS URL
    expiresOn,
  };
} 