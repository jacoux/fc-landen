const { Octokit } = require('@octokit/rest');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { menuItems } = req.body;

    if (!menuItems) {
      return res.status(400).json({ error: 'Menu items are required' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'FCLanden/FCLanden-front';
    
    if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    const octokit = new Octokit({
      auth: githubToken,
    });

    const menuConfig = {
      menuItems
    };

    const content = JSON.stringify(menuConfig, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');
    const filePath = 'src/assets/menu-config.json';

    let sha;
    try {
      // Try to get the existing file to get its SHA
      const existingFile = await octokit.rest.repos.getContent({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        path: filePath,
      });
      sha = existingFile.data.sha;
    } catch (error) {
      // File doesn't exist, sha will be undefined (creating new file)
      console.log('Creating new menu config file');
    }

    const requestBody = {
      message: `Update menu configuration\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`,
      content: encodedContent,
      ...(sha && { sha }) // Only include sha if file exists
    };

    const result = await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.split('/')[0],
      repo: repo.split('/')[1],
      path: filePath,
      ...requestBody
    });

    res.status(200).json({ 
      success: true, 
      message: 'Menu configuration saved successfully',
      sha: result.data.content.sha
    });

  } catch (error) {
    console.error('Error saving menu configuration:', error);
    res.status(500).json({ 
      error: 'Failed to save menu configuration', 
      details: error.message 
    });
  }
}