import "app/core/styles/index.css"
import {
  AppProps,
  ErrorBoundary,
  ErrorComponent,
  ErrorFallbackProps,
  useQueryErrorResetBoundary,
} from "blitz"
import { useEffect } from "react"
import OneSignal from "react-onesignal"

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  useEffect(() => {
    ;(async () => {
      await OneSignal.init({
        appId: "8972ff5a-8050-4c42-b0db-3940884fafdf",
        allowLocalhostAsSecureOrigin: true,
      })
      OneSignal.showSlidedownPrompt()
    })()
  }, [])

  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      onReset={useQueryErrorResetBoundary().reset}
    >
      {getLayout(<Component {...pageProps} />)}
    </ErrorBoundary>
  )
}

function RootErrorFallback({ error }: ErrorFallbackProps) {
  return <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
}
