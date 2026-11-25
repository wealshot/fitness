// Vercel Serverless Function: GET & POST /api/analytics
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  const slug = (req.query?.slug || body?.slug || 'bernetskiy').toLowerCase().trim();
  const type = (req.query?.type || body?.type || 'visit').toLowerCase().trim(); // 'visit' or 'click'
  const action = (req.query?.action || body?.action || '').toLowerCase().trim();
  
  // Format local date YYYY-MM-DD
  const todayDate = (req.query?.date || body?.date || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, '').slice(0, 10);

  const keyAll = `fitprod_v1_${slug}_${type}s`;
  const keyToday = `fitprod_v1_${slug}_${type}s_${todayDate}`;

  // POST or GET with ?action=hit
  if (req.method === 'POST' || action === 'hit') {
    try {
      const [allRes, todayRes] = await Promise.all([
        fetch(`https://countapi.mileshilliard.com/api/v1/hit/${keyAll}`).then(r => r.json()).catch(() => ({})),
        fetch(`https://countapi.mileshilliard.com/api/v1/hit/${keyToday}`).then(r => r.json()).catch(() => ({}))
      ]);
      return res.status(200).json({
        success: true,
        type,
        value: allRes.value || 1,
        valueToday: todayRes.value || 1
      });
    } catch (err) {
      return res.status(200).json({ success: false, error: err.message, fallback: true });
    }
  }

  // GET: Fetch visits and clicks for both All Time and Today
  try {
    const visitsKeyAll = `fitprod_v1_${slug}_visits`;
    const clicksKeyAll = `fitprod_v1_${slug}_clicks`;
    const visitsKeyToday = `fitprod_v1_${slug}_visits_${todayDate}`;
    const clicksKeyToday = `fitprod_v1_${slug}_clicks_${todayDate}`;

    const [vAllRes, cAllRes, vTodayRes, cTodayRes] = await Promise.all([
      fetch(`https://countapi.mileshilliard.com/api/v1/get/${visitsKeyAll}`).then(r => r.json()).catch(() => ({ value: 0 })),
      fetch(`https://countapi.mileshilliard.com/api/v1/get/${clicksKeyAll}`).then(r => r.json()).catch(() => ({ value: 0 })),
      fetch(`https://countapi.mileshilliard.com/api/v1/get/${visitsKeyToday}`).then(r => r.json()).catch(() => ({ value: 0 })),
      fetch(`https://countapi.mileshilliard.com/api/v1/get/${clicksKeyToday}`).then(r => r.json()).catch(() => ({ value: 0 }))
    ]);

    const visitsAll = typeof vAllRes.value === 'number' ? vAllRes.value : 0;
    const clicksAll = typeof cAllRes.value === 'number' ? cAllRes.value : 0;
    const visitsToday = typeof vTodayRes.value === 'number' ? vTodayRes.value : 0;
    const clicksToday = typeof cTodayRes.value === 'number' ? cTodayRes.value : 0;

    const conversionAll = visitsAll > 0 ? ((clicksAll / visitsAll) * 100).toFixed(1) + '%' : '0.0%';
    const conversionToday = visitsToday > 0 ? ((clicksToday / visitsToday) * 100).toFixed(1) + '%' : '0.0%';

    return res.status(200).json({
      slug,
      today: {
        visits: visitsToday,
        clicks: clicksToday,
        conversion: conversionToday
      },
      all: {
        visits: visitsAll,
        clicks: clicksAll,
        conversion: conversionAll
      },
      // Backward compatibility
      visits: visitsAll,
      clicks: clicksAll,
      conversion: conversionAll
    });
  } catch (err) {
    return res.status(200).json({
      slug,
      today: { visits: 0, clicks: 0, conversion: '0.0%' },
      all: { visits: 0, clicks: 0, conversion: '0.0%' },
      visits: 0,
      clicks: 0,
      conversion: '0.0%',
      error: err.message
    });
  }
}
