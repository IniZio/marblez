import { Document, Html, DocumentHead, Main, BlitzScript /*DocumentContext*/ } from "blitz"

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
        <DocumentHead />
        <body className="overflow-y-scroll max-h-screen text-gray-600">
          <Main />
          <BlitzScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
