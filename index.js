const NodeCache = require('node-cache');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

require('dotenv').config()
const Web3 = require('web3');

const secret = uuidv4();
let cache = new NodeCache({
  stdTTL: 600
});

const options = {
  signature: 'MetaSignature',
  message: 'MetaMessage',
  address: 'MetaAddress',
  dAppName: '*** WARNING *** Put your dApp name *** WARNING ***',
  action: 'Authentication'
}

async function run(address, message, signature) {
  // Address is passed & isValidAddress
  if (address) {
    if (ethUtil.isValidAddress(address)) {
      const challenge = createChallenge(address);

      return challenge;
    }
  }

  // Challenge message returned with signature
  if (message && signature) {
    const recovered = await checkChallenge(message, signature)

    return recovered;
  }
}

function createChallenge(address) {
  console.log('\n\noriginal address: ', address)
  const hash = crypto.createHmac('sha256', secret)
    .update(address + uuidv4())
    .digest('hex');

  cache.set(address.toLowerCase(), hash);

  const domain = [
    {name:'dApp' , type:'string'},
    {name:'action', type:'string'}
  ]

  const message = [
    {name:'challenge', type:'string'}
  ]

  const domainData = {
    dApp: options.dAppName,
    action: options.action
  }

  const messageData = {
    challenge: hash
  }

  const challenge = JSON.stringify({
    types: {
        EIP712Domain: domain,
        Challenge: message
    },
    domain: domainData,
    primaryType: "Challenge",
    message: messageData
  })
  console.log('\n\nchallenge created: ', challenge)

  return challenge;
}

async function checkChallenge(challenge, sig) {
  const domain = [
    {name:'dApp' , type:'string'},
    {name:'action', type:'string'}
  ]

  const message = [
    {name:'challenge', type:'string'}
  ]

  const domainData = {
    dApp: options.dAppName,
    action: options.action
  }

  const messageData = {
    challenge: challenge
  }

  const data = {
    types: {
        EIP712Domain: domain,
        Challenge: message
    },
    domain: domainData,
    primaryType: "Challenge",
    message: messageData
  }
  
  console.log('\n\nchallenge for recovery: ', challenge)
  console.log('\n\nsignature: ', sig)

  const recovered = await sigUtil.recoverTypedSignature({
    data,
    sig
  });
  console.log('\n\nrecovered address ?', recovered)

  const storedChallenge = cache.get(recovered.toLowerCase());
  console.log('\n\nstoredChallenge: ', storedChallenge)

  if (storedChallenge === challenge) {
    cache.del(recovered);
    return recovered;
  }
  console.log('\n\nstoredChallenge === challenge ? ', storedChallenge === challenge)
  return false;
}

// Example of generating the signature from the challenge for use with eth-auth library
async function generateSignature(challenge) {
  const infuraHttpProviderUrl = `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
  const web3Provider = new Web3.providers.HttpProvider(infuraHttpProviderUrl);
  const web3 = new Web3(web3Provider);

  const metaAuthChallenge = challenge;
  const { PRIVATE_KEY } = process.env;
  const metaAuthSignature = web3.eth.accounts.sign(metaAuthChallenge, PRIVATE_KEY);

  return metaAuthSignature.signature;
}

const main = async () => {
  const address = process.env.ETHEREUM_ADDRESS;
  const challenge = await run(address, null, null);
  const signature = await generateSignature(challenge);
  const recovered = await run(null, challenge, signature);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
