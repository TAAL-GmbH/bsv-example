# BSV Example

Writes 'test' to the blockchain. Change this text in **dataString** in `index.js`

To run

`npm install`

`node index.js generate`

This generates a private key and prints out the WIF (Wallet Interchange Format) and address.

The WIF will be used later. Now send some test coins to your address using the faucet website https://faucet.bitcoincloud.net

Now call write adding your WIF as another arguement.

`node index.js write KwpVuu478dqjR7R7qUnUMqdC72X2X5HrHy39djdTMsDSwCVTK17B`

This will return the transaction Id which you can use to look up the transaction on [test.whatsonchain.com](https://test.whatsonchain.com/)