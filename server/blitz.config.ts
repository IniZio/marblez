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
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
  },
  images: {
    domains: [new URL(process.env.ORDER_ASSETS_CDN_URL!).host],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias["@sentry/node"] = "@sentry/browser"
    }

    return config
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "https://missmarble-inizio.vercel.app/pos",
        permanent: false,
      },
    ]
  },
}

module.exports = config
