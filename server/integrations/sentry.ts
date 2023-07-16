import { RewriteFrames } from "@sentry/integrations"
import * as Sentry from "@sentry/node"
import getConfig from "next/config"

const config = getConfig()

console.log("SENTRY_DSN", process.env.SENTRY_DSN)

if (process.env.SENTRY_DSN && config) {
  const distDir = `${config.serverRuntimeConfig.rootDir}/.next`
  Sentry.init({
    integrations: [
      new RewriteFrames({
        iteratee: (frame: any) => {
          frame.filename = frame.filename.replace(distDir, "app:///_next")
          return frame
        },
      }),
    ],
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
    beforeSend(event, hint) {
      const error = hint?.originalException
      if (error && error instanceof Error) {
        switch (error.name) {
          case "NotFoundError":
          case "ChunkLoadError":
            return null
          default:
        }
      }
      return event
    },
  })
}

export default Sentry
