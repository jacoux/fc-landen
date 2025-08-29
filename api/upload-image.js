// api/upload-image.js
import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  const allowedOrigins = ['https://fclanden.be', 'https://fc-landen.vercel.app/', 'http://localhost:4200'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const repo = "jacoux/fc-landen";

  if (!githubToken) {
    return res.status(500).json({ message: 'GitHub token not configured' });
  }

  try {
    // Parse the multipart form data
    const form = new IncomingForm();
    const [fields, files] = await form.parse(req);

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
      });
    }

    // Read file content
    const fileBuffer = readFileSync(imageFile.filepath);

    // Generate a unique filename based on content hash
    const hash = createHash('md5').update(fileBuffer).digest('hex');
    const extension = imageFile.originalFilename.split('.').pop().toLowerCase();
    const fileName = `i${hash}.${extension}`;
    const filePath = `assets/images/${fileName}`;

    // Check if file already exists
    const fileCheck = await fetch(`https://api.github.com/repos/${repo}/contents/src/${filePath}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let fileUrl;
    if (fileCheck.ok) {
      // File already exists, return existing file info
      const existingFile = await fileCheck.json();
      fileUrl = existingFile.download_url;
    } else if (fileCheck.status === 404) {
      // File doesn't exist, upload it
      const requestBody = {
        message: `Upload image ${fileName}`,
        content: fileBuffer.toString('base64'),
      };

      const result = await fetch(`https://api.github.com/repos/${repo}/contents/src/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await result.json();

      if (!result.ok) {
        const errorMessages = {
          401: 'GitHub authentication failed',
          409: 'File conflict',
          422: 'Invalid file content or path'
        };

        return res.status(result.status).json({
          message: errorMessages[result.status] || 'GitHub API request failed',
          error: data
        });
      }

      fileUrl = data.content?.download_url;
    } else {
      const errorData = await fileCheck.json().catch(() => ({ message: 'Unknown error' }));
      return res.status(fileCheck.status).json({
        message: 'Failed to check file existence',
        error: errorData
      });
    }

    return res.status(200).json({
      success: 1,
      file: {
        url: fileUrl,
        name: fileName,
        size: imageFile.size
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
