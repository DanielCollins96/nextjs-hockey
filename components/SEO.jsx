import Head from 'next/head';

const SITE_URL = 'https://nextjs-hockey.vercel.app';
const SITE_NAME = 'NHL Hockey Stats';
const DEFAULT_OG_IMAGE = `${SITE_URL}/Hockey-Net.svg`;

/**
 * SEO Component for consistent meta tags across pages
 * @param {Object} props
 * @param {string} props.title - Page title (will be appended with site name)
 * @param {string} props.description - Meta description
 * @param {string} [props.path] - Page path for canonical URL (e.g., '/players')
 * @param {string} [props.ogImage] - Open Graph image URL
 * @param {string} [props.ogType] - Open Graph type (default: 'website')
 * @param {Object} [props.jsonLd] - JSON-LD structured data object
 */
export default function SEO({
  title,
  description,
  path = '',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  jsonLd = null,
}) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}

/**
 * Generate JSON-LD for a Person (player)
 */
export function generatePlayerJsonLd({ name, image, birthDate, birthPlace, team }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    image,
    birthDate,
    birthPlace: birthPlace ? { '@type': 'Place', name: birthPlace } : undefined,
    affiliation: team ? { '@type': 'SportsTeam', name: team } : undefined,
    jobTitle: 'Professional Ice Hockey Player',
  };
}

/**
 * Generate JSON-LD for a SportsTeam
 */
export function generateTeamJsonLd({ name, logo, sport = 'Ice Hockey' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name,
    sport,
    logo,
    memberOf: {
      '@type': 'SportsOrganization',
      name: 'National Hockey League',
    },
  };
}

/**
 * Generate JSON-LD for BreadcrumbList
 */
export function generateBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
