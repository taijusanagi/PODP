# HackFEVM Submission

This is HackFEVM submission repository

## Product Concept

![how-it-works](./docs/how-it-works.jpg)

## Lotus

lotus wallet new
f1lluo4ltqdzcvb7h6bnf3a7lo3lpz6j5tskxr2my

https://explorer.glif.io/message/?network=wallabynet&cid=bafy2bzaceanh37nauda6zvdxylwkj4hbloouhj27pzbdk5y76hjso4ryiirrs

## Tested Data

Target Filecoin Deal which is recommended to use as the sample data

https://wallaby.filecoin.tools/baga6ea4seaqlkg6mss5qs56jqtajg5ycrhpkj2b66cgdkukf2qjmmzz6ayksuci

Payload CID: mAXCg5AIg8YBXbFjtdBy1iZjpDYAwRSt0elGLF5GvTqulEii1VcM

## Data Retrieval

Data retrieval is done by

```
lotus client retrieve --provider t01113 mAXCg5AIgmtJq7yh1JTsGJkPrA1hLaSnXZIE+MfeeP1bT8OOGb4A data/mAXCg5AIgmtJq7yh1JTsGJkPrA1hLaSnXZIE+MfeeP1bT8OOGb4A.png
```

and the retrieved image is

![mAXCg5AIgmtJq7yh1JTsGJkPrA1hLaSnXZIE+MfeeP1bT8OOGb4A](./data/mAXCg5AIgmtJq7yh1JTsGJkPrA1hLaSnXZIE%2BMfeeP1bT8OOGb4A.png)

For this hackathon, the above image is used for testing

## Other Testing

## Get Filecoin Address

add mnemonic.txt at the project root, then run

```
yarn workspace @hackfevm/contracts test-filecoin-basic
```

then you may get this result

```
Get Filecoin Address ---
Ethereum address: 0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8
f4address (for use with faucet) =  f410ffget537trrovugzpne7c3emomggm77oyut4rq3i
```
