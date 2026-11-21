// Vercel Serverless Function: POST /api/save
// Commits updated client data and images directly to GitHub repository (Zero Database!)

function replaceClientInContent(content, slug, clientData) {
  const target = `"${slug}":`;
  const pos = content.indexOf(target);
  const formattedJson = JSON.stringify(clientData, null, 2);
  const indentedJson = formattedJson.split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n');

  if (pos === -1) {
    const insertMarker = 'window.CLIENTS = {';
    const insPos = content.indexOf(insertMarker);
    if (insPos !== -1) {
      const splitAt = insPos + insertMarker.length;
      return content.slice(0, splitAt) + `\n  "${slug}": ` + indentedJson + ',' + content.slice(splitAt);
    }
    return content;
  }

  const braceStart = content.indexOf('{', pos);
  if (braceStart === -1) return content;

  let count = 1;
  let i = braceStart + 1;
  let inString = false;
  let escape = false;

  while (i < content.length && count > 0) {
    const ch = content[i];
    if (escape) {
      escape = false;
    } else if (ch === '\\') {
      escape = true;
    } else if (ch === '"') {
      inString = !inString;
    } else if (!inString) {
      if (ch === '{') count++;
      else if (ch === '}') count--;
    }
    i++;
  }

  if (count === 0) {
    return content.slice(0, pos) + `"${slug}": ` + indentedJson + content.slice(i);
  }
  return content;
}

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

  const { slug, clientData, pendingImages, githubToken, adminPassword } = req.body || {};
  if (!slug || !clientData) {
    return res.status(400).json({ error: 'Missing slug or clientData' });
  }

  // Password verification
  const coachPasswords = {
    bernetskiy: ['1234', 'vlad2026', 'bernetskiy', 'bernetskiy2026', 'vB8$kL!92xQ#2026', 'vB8$kL!92xQ'],
    radionov:   ['1234', 'radionov2026', 'nR9#mX2$84!vP2026', 'nR9#mX2$84!'],
    rodionov:   ['1234', 'radionov2026', 'nR9#mX2$84!vP2026', 'nR9#mX2$84!'],
    felix:      ['1234', 'felix2026', 'fL7!qZ9#31$wK2026', 'fL7!qZ9#31$']
  };
  const masterPasswords = ['1234', 'admin2026', 'PulseAdmin#X9v2!2026', 'Pulse#SuperAdmin2026!'];
  const allowed = [...(coachPasswords[slug] || []), ...masterPasswords];
  if (process.env.ADMIN_PASSWORD) allowed.push(process.env.ADMIN_PASSWORD);

  if (adminPassword && !allowed.includes(adminPassword)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
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
      message: 'Сохранено локально. Для глобальной публикации укажите серверный ключ доступа.'
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

        if (key === 'newHeroImage') {
          targetPath = `images/${slug}-hero.jpg`;
          clientData.heroImage = `/${targetPath}`;
        } else if (key === 'newCaseBefore') {
          targetPath = `cases/${slug}_case_before.jpg`;
          if (clientData.cases && clientData.cases[0]) {
            clientData.cases[0].beforeImage = `/${targetPath}`;
          }
        } else if (key === 'newCaseAfter') {
          targetPath = `cases/${slug}_case_after.jpg`;
          if (clientData.cases && clientData.cases[0]) {
            clientData.cases[0].afterImage = `/${targetPath}`;
          }
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
              message: `chore(portal): upload ${targetPath} for ${slug}`,
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

    // 3. Update the specific client block in clients.js using robust parser
    const updatedContent = replaceClientInContent(currentContent, slug, clientData);

    // 4. Commit updated clients.js back to GitHub
    const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/clients.js`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore(portal): update ${slug} via admin panel`,
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
      message: 'Изменения успешно применены! Сервер обновляет данные (20 сек).'
    });

  } catch (err) {
    console.error('[API SAVE ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}
