// Vercel Serverless Function: GET & POST /api/analytics
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const slug = (req.query?.slug || req.body?.slug || 'new').toLowerCase().trim();
  const type = (req.query?.type || req.body?.type || 'visit').toLowerCase().trim(); // 'visit' or 'click'
  const key = `fitprod_v1_${slug}_${type}s`;

  if (req.method === 'POST') {
    try {
      const response = await fetch(`https://countapi.mileshilliard.com/api/v1/hit/${key}`);
      const data = await response.json();
      return res.status(200).json({ success: true, type, value: data.value || 1 });
    } catch (err) {
      return res.status(200).json({ success: false, error: err.message, fallback: true });
    }
  }

  // GET: Fetch visits and clicks
  try {
    const visitsKey = `fitprod_v1_${slug}_visits`;
    const clicksKey = `fitprod_v1_${slug}_clicks`;

    const [visitsRes, clicksRes] = await Promise.all([
      fetch(`https://countapi.mileshilliard.com/api/v1/get/${visitsKey}`)
        .then(r => r.json())
        .catch(() => ({ value: 0 })),
      fetch(`https://countapi.mileshilliard.com/api/v1/get/${clicksKey}`)
        .then(r => r.json())
        .catch(() => ({ value: 0 }))
    ]);

    const visits = typeof visitsRes.value === 'number' ? visitsRes.value : 0;
    const clicks = typeof clicksRes.value === 'number' ? clicksRes.value : 0;
    const conversion = visits > 0 ? ((clicks / visits) * 100).toFixed(1) + '%' : '0.0%';

    return res.status(200).json({
      slug,
      visits,
      clicks,
      conversion
    });
  } catch (err) {
    return res.status(200).json({
      slug,
      visits: 0,
      clicks: 0,
      conversion: '0.0%',
      error: err.message
    });
  }
}
