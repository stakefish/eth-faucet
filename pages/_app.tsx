import type { AppProps } from "next/app"
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"
import { Goerli, DAppProvider, Config } from "@usedapp/core"
import Head from "next/head"
import { setCookie } from "cookies-next"
import { OpenSourceMemo } from "../components/OpenSourceMemo"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { Layout } from "../components/Layout"
import { Content } from "../components/Content"
import { pollingInterval } from "../consts/env"

const config: Config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]: process.env.NEXT_PUBLIC_ETH_API_URL as string
  },
  pollingInterval
}

const theme = createTheme()

const EthereumFaucet = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>Claim Görli ETH</title>
    </Head>
    <DAppProvider config={config}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Content>
            <Header />
            <Component {...pageProps} />
            <OpenSourceMemo />
          </Content>
          <Footer />
        </Layout>
      </ThemeProvider>
    </DAppProvider>
  </>
)

EthereumFaucet.getInitialProps = async ({ ctx: { req, res } }: any) => {
  if (typeof window !== "undefined") {
    return {}
  }
  const referer = req?.headers?.referer || ""
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
    setCookie("stakefish_referer", "1", { req, res, maxAge: 60 * 7 * 24 })
  }

  return {}
}

export default EthereumFaucet
