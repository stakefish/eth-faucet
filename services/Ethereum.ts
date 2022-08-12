import { recoverPersonalSignature } from "@metamask/eth-sig-util"
import { ethers } from "ethers"
import { InsufficientFundsError } from "../errors/InsufficientFundsError"
import { NonceExpiredError } from "../errors/NonceExpiredError"
import { SignatureMismatchError } from "../errors/SignatureMismatchError"
import { UnwhitelistedWallet } from "../errors/UnwhitelistedWallet"
import { Blockchain } from "../interfaces/Blockchain"
import { Nonce } from "../interfaces/Nonce"
import { TransactionHistory } from "../interfaces/TransactionHistory"
import { extractNonceFromMessage } from "../utils/textMessage"
import { WalletClassification } from "./WalletClassification"

export class Ethereum implements Blockchain {
  constructor(
    private readonly wallet: ethers.Wallet,
    private readonly nonceService: Nonce,
    private readonly classificationService: WalletClassification,
    private readonly transactionHistoryService: TransactionHistory | undefined = undefined
  ) {}

  async fundWallet(address: string): Promise<void> {
    try {
      const amount = this.classificationService.retrieveAmount(address)
      const value = ethers.BigNumber.from(amount.toString())

      const transaction = {
        to: address,
        value
      }
      await this.wallet.sendTransaction(transaction)

      // Added after the video was released to prevent user from draining system's wallet
      if (this.transactionHistoryService === undefined) {
        return
      }

      await this.transactionHistoryService.recordTransaction(address)
    } catch (e: any) {
      if (e?.code === "INSUFFICIENT_FUNDS") {
        throw new InsufficientFundsError()
      }

      throw e
    }
  }

  async verifyMessage(address: string, message: string, signature: string): Promise<boolean> {
    const nonce = extractNonceFromMessage(message)
    const isValid = await this.nonceService.verify(nonce)

    if (!isValid) {
      throw new NonceExpiredError()
    }

    const recoveredAddress = recoverPersonalSignature({
      data: message,
      signature
    })

    if (address.toLowerCase() !== recoveredAddress.toLowerCase()) {
      throw new SignatureMismatchError()
    }

    return true
  }

  async isEligible(address: string): Promise<void> {
    if (!this.classificationService.isPrivileged(address)) {
      throw new UnwhitelistedWallet()
    }
  }
}
