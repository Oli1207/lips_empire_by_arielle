export const SITE = {
  name: 'Lips Empire by Arielle',
  url: 'https://lipsempirebyarielle.store',
  defaultImage: 'https://lipsempirebyarielle.store/og-cover.jpg',
  defaultDescription:
    'Gloss hydratants, brillants vegans et cosmétiques tendance livrés au Canada et à l\'international.',
  twitter: '@lipsempirearielle',
}

export function buildTitle(pageTitle) {
  if (!pageTitle) return `${SITE.name} — Gloss & Cosmétiques livrés au Canada`
  return `${pageTitle} | ${SITE.name}`
}

export function truncate(str, max = 160) {
  if (!str) return SITE.defaultDescription
  const plain = str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return plain.length > max ? plain.slice(0, max - 1) + '…' : plain
}
