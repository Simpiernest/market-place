import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://businessbridge.com'

  // Fetch real slugs from the API
  let listings: string[] = []
  try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/sitemap-slugs`)
      const slugs = await response.json()
      listings = slugs.map((s: string) => `/businesses/${s}`)
  } catch (e) {
      // Fallback for build time if API is not reachable
      listings = ['/businesses/ai-customer-support-saas']
  }

  const staticRoutes = [
    '',
    '/marketplace',
    '/sell',
    '/valuation',
    '/how-it-works',
    '/resources',
    '/about',
    '/contact',
    '/faq'
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }))

  const listingEntries: MetadataRoute.Sitemap = listings.map((slug) => ({
    url: `${baseUrl}${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticEntries, ...listingEntries]
}
