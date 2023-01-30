import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      cookiePrefix: "marblez",
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  pwa: {
    dest: "../../public",
    runtimeCaching: [],
  },
  env: {
    SUPABASE_ENDPOINT: process.env.SUPABASE_ENDPOINT,
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
    ORDER_ASSETS_CDN_URL: process.env.ORDER_ASSETS_CDN_URL,
  },
  images: {
    domains: [new URL(process.env.ORDER_ASSETS_CDN_URL!).host],
  },
  /* Uncomment this to customize the webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  */
}

module.exports = config
