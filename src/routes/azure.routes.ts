import { Router, Request, Response } from 'express';
import { generateUploadSasUrl } from '../modules/property/azureBlob';

const router = Router();

// POST /api/azure/sas-url
router.post('/sas-url', (req: Request, res: Response): void => {
  (async () => {
    try {
      const { filename, contentType } = req.body;
      if (!filename) {
        res.status(400).json({ message: 'Filename is required' });
        return;
      }
      const result = await generateUploadSasUrl(filename, contentType);
      res.json(result);
    } catch (error) {
      console.error('Error generating Azure SAS URL:', error);
      res.status(500).json({ message: 'Failed to generate SAS URL', error: error instanceof Error ? error.message : error });
    }
  })();
});

export default router; 