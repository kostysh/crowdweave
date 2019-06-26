# crowdweave
A simple crowdfunding Dapp on Arweave blockchain

> This demo application is made according to [Open Web Hackathon: Build A Simple Permaweb App](https://gitcoin.co/issue/ArweaveTeam/Bounties/1/2929)  

- You should be looged in into Dapp to create new projects and invest existed ones
- You can create unlimited count of simple funding projects and publish them on the [Arweave blockchain](https://www.arweave.org/).  
- Anyone who have a Arweave wallet can invest AR tokens in your project

Application is constantly available on the link: [https://arweave.net/-hSB7R6ysWaiauuHRXT5laHA-XbSgMt18FXuovroUzE](https://arweave.net/-hSB7R6ysWaiauuHRXT5laHA-XbSgMt18FXuovroUzE)

## Initialisation
```sh
npm i
```

## Start app locally

Then app started it should be available via web browser by address http://localhost:3000

```sh
npm start
```

## App deployment

Be sure your wallet keyfile is placed in the root (ignored on GitHub).  
This file should be named: `arweave-keyfile.json`.  
If you don't have a wallet, please get one [here](https://tokens.arweave.org/).

```sh
npm run savekey
npm run deploy
```
