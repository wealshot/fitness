// Vercel Serverless Function: POST /api/save
// Commits updated client data and images directly to GitHub repository (Zero Database!)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, clientData, pendingImages, githubToken } = req.body || {};
  if (!slug || !clientData) {
    return res.status(400).json({ error: 'Missing slug or clientData' });
  }

  // Priority: 1. Request body token, 2. Vercel env variable
  const GITHUB_TOKEN = (githubToken || process.env.GITHUB_TOKEN || '').trim();
  const REPO_OWNER = process.env.REPO_OWNER || 'wealshot';
  const REPO_NAME = process.env.REPO_NAME || 'fitness';
  const BRANCH = 'main';

  // If GITHUB_TOKEN is not configured
  if (!GITHUB_TOKEN) {
    console.log('[API SAVE] GITHUB_TOKEN not configured. Returning local success.');
    return res.status(200).json({
      success: true,
      mode: 'local',
      message: 'Сохранено локально в браузере. Для глобального обновления всех пользователей укажите GitHub Token.'
    });
  }

  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Pulse-Admin-Engine'
  };

  try {
    // 1. Process and upload any pending images
    if (pendingImages && Object.keys(pendingImages).length > 0) {
      for (const [key, img] of Object.entries(pendingImages)) {
        if (!img || !img.data) continue;
        const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '');
        let targetPath = '';

        if (key === 'newCaseBefore') {
          targetPath = `cases/${slug}_case_before.jpg`;
          clientData.cases[0].beforeImage = `/${targetPath}`;
        } else if (key === 'newCaseAfter') {
          targetPath = `cases/${slug}_case_after.jpg`;
          clientData.cases[0].afterImage = `/${targetPath}`;
        } else if (key.startsWith('newReview')) {
          const revIdx = parseInt(key.replace('newReview', ''), 10);
          targetPath = `cases/${slug}_review_${revIdx + 1}.jpg`;
          if (clientData.reviews && clientData.reviews[revIdx]) {
            clientData.reviews[revIdx].image = `/${targetPath}`;
          }
        }

        if (targetPath) {
          // Check if file exists to get SHA for update
          let existingSha = null;
          try {
            const checkRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${targetPath}?ref=${BRANCH}`, { headers });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              existingSha = checkData.sha;
            }
          } catch (e) {}

          const putImgRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${targetPath}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: `chore(admin): upload ${targetPath} for ${slug}`,
              content: base64Data,
              sha: existingSha || undefined,
              branch: BRANCH
            })
          });

          if (!putImgRes.ok) {
            console.error('[API SAVE] Failed to upload image:', targetPath, await putImgRes.text());
          }
        }
      }
    }

    // 2. Fetch current clients.js from GitHub
    const getRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/clients.js?ref=${BRANCH}`, { headers });
    if (!getRes.ok) {
      throw new Error('Failed to fetch clients.js from GitHub: ' + (await getRes.text()));
    }
    const getData = await getRes.json();
    const currentSha = getData.sha;
    const currentContent = Buffer.from(getData.content, 'base64').toString('utf-8');

    // 3. Update the specific client block in clients.js
    const clientJson = JSON.stringify(clientData, null, 2);
    const regex = new RegExp(`("${slug}":\\s*\\{[\\s\\S]*?\\n  \\})(,?)`, 'm');
    let updatedContent = '';

    if (regex.test(currentContent)) {
      updatedContent = currentContent.replace(regex, `"${slug}": ${clientJson}$2`);
    } else {
      updatedContent = currentContent.replace('window.CLIENTS = {', `window.CLIENTS = {\n  "${slug}": ${clientJson},`);
    }

    // 4. Commit updated clients.js back to GitHub
    const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/clients.js`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore(admin): update ${slug} via admin panel`,
        content: Buffer.from(updatedContent, 'utf-8').toString('base64'),
        sha: currentSha,
        branch: BRANCH
      })
    });

    if (!putRes.ok) {
      throw new Error('Failed to commit clients.js: ' + (await putRes.text()));
    }

    return res.status(200).json({
      success: true,
      mode: 'github-commit',
      message: 'Изменения закоммичены в GitHub! Vercel пересобирает сайт (20 сек).'
    });

  } catch (err) {
    console.error('[API SAVE ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}
