# Examples

## Fetch Compound debt and collateral

As of now, to get all cTokens along with a user's debt on Compound you need to perform over 10 calls to the Ethereum node to different contracts or rely on a centralized API. With DeFi SDK, you can call

```solidity
getProtocolBalances('0xdead...beef', ['Compound'])
```

on the [api.zerion.eth](https://etherscan.io/address/0x06fe76b2f432fdfecaef1a7d4f6c3d41b5861672#code){target=_blank} smart contract and get all borrowed and supplied tokens

```javascript
[{
  metadata: {
    name: 'Compound',
    description: 'Decentralized Lending & Borrowing Protocol',
    websiteURL: 'compound.finance',
    iconURL: 'protocol-icons.s3.amazonaws.com/compound.png',
    version: '0'
  },
  adapterBalances: [{
    metadata: {
      adapterAddress: '0x90F0Ed76cfCf75Ccab31A9b4E51782F230aA0747',
      adapterType: 'Asset'
    },
    balances: [{
      base: {
        metadata: {
          token: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
          name: 'Compound Basic Attention Token',
          symbol: 'cBAT',
          decimals: '8'
        },
        amount: '314159265'
      },
      underlying: [{
        metadata: {
          token: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
          name: 'Basic Attention Token',
          symbol: 'BAT',
          decimals: '18'
        },
        amount: '6626070040000000000'
      }]
    }]
  },{
      metadata: {
        adapterAddress: '0xD0646777520Aff625F976a8D81b95B5B42cDa1B9',
        adapterType: 'Debt'
      },
      balances: [{
        base: {
          metadata: {
            token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: '18'
          },
          amount: '1971081500000000000'
        },
        underlying: []
      }]
    }
  ]
}]
```

## Make sense of tokens like `UNI-V1 ETH-cDAI`

<p align="center">
  <img src="https://i.ibb.co/ZHq39S3/derivatives.png" width="650">
</p>

Sometimes, a DeFi token contains several other tokens, and to calculate their price, you need to know their underlying assets. For example, a `Uniswap V1 cDAI pool` consists of `ETH` and `cDAI`. `cDAI`, in turn, has `DAI` as an underlying token. With DeFi SDK you can call

```solidity 
// Uniswap V1 cDAI pool
getFinalFullTokenBalance('0x34E89740adF97C3A9D3f63Cc2cE4a914382c230b', "Uniswap V1 Pool Token")
```

 and fetch the decomposition of UNI-token into ERC20 tokens, like `ETH` and `DAI`

```javascript
0.98 ETH
215.6 DAI
```

## Get account balances across all supported DeFi protocols

In case you want to get account balances across all supported DeFi protocols, you can call

```solidity 
// bankless.zerion.eth portfolio 
getBalances('0x0ef51b7dac3933b8109482e7d910c21848e45da0f') 
```

and obtain all balances for a given account. The response from the smart-contract will contain information about each of the protocols

```javascript
100 DAI // collateral on Compound
0.1 ETH // debt on Compound
100 USDC // locked in PoolTogether
213 TUSD + 201 USDC + 82 USDT + 11 DAI // Curve Y Pool
...
```
