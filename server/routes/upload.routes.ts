import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const uploadRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * POST /api/upload
 * Accepts base64 image or raw payload, saves to disk, returns public URL (Section 42)
 */
uploadRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { imageBase64, filename = 'custom-print.jpg' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'imageBase64 payload required.',
      });
    }

    // Strip header if present (data:image/jpeg;base64,...)
    const matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    const ext = matches ? matches[1].replace('jpeg', 'jpg') : 'jpg';
    const data = matches ? matches[2] : imageBase64;

    const safeId = `px-upload-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeId);

    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

    const publicUrl = `/uploads/${safeId}`;

    return res.status(201).json({
      success: true,
      url: publicUrl,
      filename: safeId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save uploaded image.',
    });
  }
});
