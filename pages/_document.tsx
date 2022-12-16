import { GetServerSideProps } from "next"
import { Html, Head, Main, NextScript } from "next/document"
import { setCookies } from "cookies-next"

const Document = () => (
  <Html>
    <Head>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <link rel="icon" href="/eth.svg" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
)

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const referer = req.headers.referer || ""

  const whitelistedUrls = ["https://stakefish-website-main.vercel.app", "http://localhost:3000"]
  const originRegexp = new RegExp(
    "https://[^.]+.stake.fish|https://stakefish-website-[^.]+.vercel.app|https://.*.stakefish.link",
    "gi"
  )

  const isWhitelistedUrl = whitelistedUrls.reduce((result: boolean, url: string) => {
    if (result) {
      return true
    }

    return referer.startsWith(url)
  }, false)

  if (isWhitelistedUrl || originRegexp.test(referer)) {
    setCookies("stakefish_referer", "1", { req, res, maxAge: 60 * 7 * 24 })
  }

  return { props: {} }
}

export default Document
