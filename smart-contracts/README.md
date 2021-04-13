# Loaner Smart Contracts

Uncollateralized lending protocol built on Celo. While collateralized lending has seen dramatic growth and use on the Ethereum blockchain, it is not capital efficient nor lending in the sense that a line of credit is extended to the borrower. It is impractical in use cases for loans such as covering a sudden medical emergency or capital to start your own business, where it unreasonable to expect overcollaterization for a loan.

At the core of extending credit is credit scores that assess the trustworthiness of a borrower to repay the loan. Many impoverised and vulnerable communities lack the credit history and credit score to take out a loan where the only source of creditworthiness is based on the trust from other members of the community. In the absence of protocols on chain to verify and compute credit scores, our solution is to delegate the credit assessment offchain to community managers, local banks or microfinancing institutions.

The high interest rates of micro credit and mico financing is often attributed to the small size of the loans in comparison to the large overhead in operating expenses. By working with organisations such as the Grameen Foundation with its partnerships with local business and microfinancing institutions, the automated nature of these smart contracts can aim to reduce operating expense and thus give better lending rates to entrepreneurs or to meet basic critical needs such as food or medicine during times of crisis.

## Installation

Install the [yarn](https://yarnpkg.com/) package manager to install the dependencies for the smart contracts

```bash
yarn
```

## Usage

A minimal work flow for the process of taking out and repaying a loan can be seen in `test/Loaner.test.ts` and can be run with.

```bash
yarn test
```

## Deployment

not deployed yet

## Figma Designs

https://www.figma.com/file/zqQYDMcWqvkqlaHuRBBe1h/Loanr?node-id=0%3A1
