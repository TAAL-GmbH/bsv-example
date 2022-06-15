# BSV Example

Writes text to the blockchain.

To run

`npm install`

`node index.js generate`

This generates a private key and saves your newly generated WIF (Wallet Interchange Format) to a text file (wif.txt). It will also print out your address.

The WIF will be used later. Now send some test coins to your address using the faucet website https://faucet.bitcoincloud.net or https://witnessonchain.com/faucet/tbsv

Now call write adding the text you want to write as another arguement.

`node index.js write hello`

This will return the transaction Id which you can use to look up the transaction on [test.whatsonchain.com](https://test.whatsonchain.com/)