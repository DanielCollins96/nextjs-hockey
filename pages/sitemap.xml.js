const SITE_URL = 'https://nextjs-hockey.vercel.app';

function generateSiteMap({ playerIds, draftYears, teamIds }) {
  const today = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/players</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/teams</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/drafts</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/seasons</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Player pages -->
  ${playerIds
    .map(
      ({ playerId }) => `
  <url>
    <loc>${SITE_URL}/players/${playerId}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}

  <!-- Team pages -->
  ${teamIds
    .map(
      ({ id }) => `
  <url>
    <loc>${SITE_URL}/teams/${id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}

  <!-- Draft year pages -->
  ${draftYears
    .map(
      ({ draftYear }) => `
  <url>
    <loc>${SITE_URL}/drafts/${draftYear}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;
}

export async function getServerSideProps({ res, req }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;

  const [playersResponse, draftsResponse, teamsResponse] = await Promise.all([
    fetch(`${protocol}://${host}/api/players/ids`),
    fetch(`${protocol}://${host}/api/drafts`),
    fetch(`${protocol}://${host}/api/teams/ids`),
  ]);

  const playersPayload = playersResponse.ok ? await playersResponse.json() : {};
  const draftsPayload = draftsResponse.ok ? await draftsResponse.json() : {};
  const teamsPayload = teamsResponse.ok ? await teamsResponse.json() : {};

  const playerIds = playersPayload?.playerIds || [];
  const draftYears = draftsPayload?.years || [];
  const teamIds = teamsPayload?.teamIds || [];

  const sitemap = generateSiteMap({
    playerIds: playerIds || [],
    draftYears: draftYears || [],
    teamIds: teamIds || [],
  });

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  // This component won't render since we're handling response in getServerSideProps
  return null;
}
