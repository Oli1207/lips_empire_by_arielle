import { Helmet } from 'react-helmet-async'
import { SITE, buildTitle, truncate } from '../utils/seo'

function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  product,
  noindex = false,
}) {
  const metaTitle = buildTitle(title)
  const metaDesc = truncate(description)
  const metaImage = image || SITE.defaultImage
  const metaUrl = url ? `${SITE.url}${url}` : SITE.url
  const robots = noindex ? 'noindex, nofollow' : 'index, follow'

  const productSchema = product
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: truncate(product.description, 300),
        image: product.image,
        url: metaUrl,
        brand: { '@type': 'Brand', name: SITE.name },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'CAD',
          price: product.price,
          availability:
            product.stock_qty > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: SITE.name },
        },
        ...(product.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews ?? 1,
          },
        }),
      })
    : null

  return (
    <Helmet>
      <html lang="fr" />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content="fr_CA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {/* JSON-LD Product */}
      {productSchema && (
        <script type="application/ld+json">{productSchema}</script>
      )}
    </Helmet>
  )
}

export default SEO
