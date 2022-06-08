const bsv = require('bsv')
const axios = require('axios')

const wocNetwork = 'test'    // The network for the whatsonchain URL - 'main' or 'test'

const bsvNetwork = 'testnet' // The network for BSV library - 'livenet' or 'testnet'

const dataString = 'test' // the data to write to the blockchain.

const myArgs = process.argv.slice(2)

switch (myArgs[0]) {
  case 'generate':
    generateAddress()
    break
  case 'write':
    if (!myArgs[1]) {
      console.log('please supply your WIF.')
      break
    }
    write(myArgs[1])
    break
  default:
    console.log('Usage:\ngenerate: create a wallet\nwrite <WIF>: write data to the chain')
}

// generate testnet address

// print the WIF and return
function generateAddress () {
  const privateKey = bsv.PrivateKey()
  const wif = privateKey.toWIF()
  const addr = privateKey.toAddress(bsvNetwork).toString() 
  console.log('Your WIF:     ' + wif)
  console.log('Your address: ' + addr)
  if (wocNetwork === 'test') {
    console.log('Send some test coins to the address from to https://faucet.bitcoincloud.net/')
  }
}

async function write (wif) {
  const privateKey = bsv.PrivateKey.fromWIF(wif)
  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(privateKey.publicKey.toBuffer()).toString('hex')

  const addr = privateKey.toAddress(bsvNetwork).toString()

  // get UTXOs for the address
  const response = await axios.get(`https://api.whatsonchain.com/v1/bsv/${wocNetwork}/address/${addr}/unspent`)

  const unspentArr = response.data

  // unspent is an array that looks like this:
  // [
  //    {
  //        height: 0,
  //        tx_pos: 0,
  //        tx_hash: '7aec649a14d752e86bcb419324e88c73433bf8043b6aa16b7fb38b3a90ec4c27',
  //        value: 99300
  //    }
  // ]

  if (unspentArr.length < 1) {
    console.log('no UTXOs for address ' + addr)
    console.log('get some test coins from to https://faucet.bitcoincloud.net/')
  }
  const unspent = unspentArr[0]

  // create a utxo object
  const utxo = {
    txid: unspent.tx_hash,
    outputIndex: unspent.tx_pos,
    scriptPubKey: bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`).toHex(),
    amount: unspent.value / 1E8
  }

  const tx = new bsv.Transaction()
  tx.from(utxo)

  // add data output
  tx.addSafeData(dataString)

  // add change
  tx.addOutput(new bsv.Transaction.Output({
    script: bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`).toHex(),
    satoshis: unspent.value - 50
  }))
  tx.sign(privateKey)

  // submit tx
  const txHex = tx.toString('hex')
  const url = `https://api.whatsonchain.com/v1/bsv/${wocNetwork}/tx/raw`
  const submitResponse = await axios({
    method: 'post',
    url: url,
    data: {
      txhex: txHex
    }
  })

  const txid = submitResponse.data
  console.log('txid: ' + txid)
}
