import type { NextApiRequest, NextApiResponse } from "next"
import { getCookie } from "cookies-next"
import { InsufficientFundsError } from "../../errors/InsufficientFundsError"
import { NonceExpiredError } from "../../errors/NonceExpiredError"
import { NonEmptyWalletError } from "../../errors/NonEmptyWalletError"
import { SignatureMismatchError } from "../../errors/SignatureMismatchError"
import { UnwhitelistedWallet } from "../../errors/UnwhitelistedWallet"
import { WalletAlreadyFunded } from "../../errors/WalletAlreadyFunded"
import { DefaultResponse } from "../../interfaces/Response"
import { bootstrapEthereum } from "../../utils/bootstrapEthereum"
import { isNil } from "lodash"

type ClaimParams = {
  address: string
  message: string
  signature: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
  try {
    const ethereum = bootstrapEthereum()

    const { address, message, signature }: ClaimParams = req.body

    await ethereum.verifyMessage(address, message, signature)
    if (isNil(getCookie("stakefish_referer"))) {
      await ethereum.isEligible(address)
    }
    await ethereum.fundWallet(address)

    return res.status(200).json({ status: "ok" })
  } catch (e) {
    if (
      e instanceof NonceExpiredError ||
      e instanceof SignatureMismatchError ||
      e instanceof InsufficientFundsError ||
      e instanceof NonEmptyWalletError ||
      e instanceof WalletAlreadyFunded ||
      e instanceof UnwhitelistedWallet
    ) {
      return res.status(e.code).json({ status: "error", message: e.message })
    }

    console.error(e)
    return res.status(500).json({ status: "error", message: "Something went wrong" })
  }
}

export default handler
