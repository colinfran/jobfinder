/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://jobfinder.dev/",
  exclude: ["/icon.svg", "/apple-icon.png", "/manifest.webmanifest", "/tags/*"],
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
}

export default config
