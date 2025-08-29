// api/save-to-github.js
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

  const { filePath, content, sha } = req.body;

  if (!filePath || !content) {
    return res.status(400).json({
      message: 'Missing required fields: filePath and content are required'
    });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const repo = "jacoux/fc-landen";

  if (!githubToken) {
    return res.status(500).json({ message: 'GitHub token not configured' });
  }

  try {
    let currentSha = sha;
    let isNewFile = false;

    // Check if file exists when no SHA provided
    if (!currentSha) {
      const fileCheck = await fetch(`https://api.github.com/repos/${repo}/contents/src/${filePath}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (fileCheck.ok) {
        const fileData = await fileCheck.json();
        currentSha = fileData.sha;
      } else if (fileCheck.status === 404) {
        isNewFile = true;
      } else {
        const errorData = await fileCheck.json().catch(() => ({ message: 'Unknown error' }));
        return res.status(fileCheck.status).json({
          message: 'Failed to check file existence',
          error: errorData
        });
      }
    }

    // Prepare request body
    const requestBody = {
      message: isNewFile ? `Create ${filePath}` : `Update ${filePath}`,
      content: Buffer.from(content).toString('base64'),
    };

    if (currentSha) {
      requestBody.sha = currentSha;
    }

    // Save/update file
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
        409: 'File conflict - refresh and try again',
        422: 'Invalid file content or path'
      };

      return res.status(result.status).json({
        message: errorMessages[result.status] || 'GitHub API request failed',
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      action: isNewFile ? 'created' : 'updated',
      filePath,
      sha: data.content?.sha,
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
