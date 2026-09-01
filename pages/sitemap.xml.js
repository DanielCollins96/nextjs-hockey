import { playerUrl, teamUrl } from '../lib/routes';
import { loadSitemapPlayers } from '../lib/player-data';
import { loadTeamIds } from '../lib/team-data';
import { loadDraftYears } from '../lib/draft-data';

const SITE_URL = 'https://www.hocke.ca';

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
      (player) => {
        const playerId =
          player?.playerId ||
          player?.id ||
          (typeof player === 'string' || typeof player === 'number' ? player : null);
        const playerName = player?.player_name || player?.name || player?.fullName;

        return `
  <url>
    <loc>${SITE_URL}${playerUrl(playerName, playerId)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    )
    .join('')}

  <!-- Team pages -->
  ${teamIds
    .map(
      (team) => {
        const id =
          team?.id ||
          (typeof team === 'string' || typeof team === 'number' ? team : null);
        const name = team?.name || team?.fullName || team?.abbreviation;

        return `
  <url>
    <loc>${SITE_URL}${teamUrl(name, id)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
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

export async function getServerSideProps({ res }) {
  const [playersPayload, draftsPayload, teamsPayload] = await Promise.all([
    loadSitemapPlayers().catch(() => ({})),
    loadDraftYears().catch(() => ({})),
    loadTeamIds().catch(() => ({})),
  ]);

  const playerIds = playersPayload?.players || [];
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
