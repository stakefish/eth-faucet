export class UnwhitelistedWallet extends Error {
  code = 401
  message = "Your wallet is not permitted to use this faucet"
}
