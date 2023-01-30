/* eslint-disable @next/next/no-page-custom-font */
import { BlitzScript, /*DocumentContext*/ Document, DocumentHead, Html, Main } from "blitz"

class MyDocument extends Document {
  // Only uncomment if you need to customize this behaviour
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return {...initialProps}
  // }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Html lang="en">
        <DocumentHead>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </DocumentHead>
        <body className="max-h-screen overflow-y-scroll text-gray-600">
          <Main />
          <BlitzScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
