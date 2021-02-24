# eth-auth-test

Follow these steps to replicate the issue:

* Rename file .sample-env to .env

* Update the file by adding valid Ethereum address after `ETHEREUM_ADDRESS=`, and its associated private key after `PRIVATE_KEY=`, and create an Infura project and add its id after `INFURA_PROJECT_ID=`

* Run the following to install dependencies
```
npm install
```

* Run this script, which is a simplied version of the code in the eth-auth repo https://github.com/senarma/eth-auth that I've written to replicate the issue I'm encountering:

```
node index.js
```

Below is the log of running the code.

I'm trying to figure out why I encounter this issue https://github.com/senarma/eth-auth/issues/1. Even though I provide a valid Ethereum address in the example below of `0x91bf7377928de15c34fbded25b7d7b8dacc881b1`, and go through the process of generating and signing a 'challenge' to generate a 'signature' with its associated private key, I'm not able to 'recover' the original Ethereum address (it recovers a different one each time, in the output below it recovered `0x1ef35b15a96263ebbb808b8d71354df31b3bc90f`), and so since it recovers the wrong Ethereum address, it is unable to retrieve the challenge that was stored in Node cache since it needs to use the original Ehtereum address as the key.

```
original address:  0x91bf7377928de15c34fbded25b7d7b8dacc881b1

challenge created:  {"types":{"EIP712Domain":[{"name":"dApp","type":"string"},{"name":"action","type":"string"}],"Challenge":[{"name":"challenge","type":"string"}]},"domain":{"dApp":"*** WARNING *** Put your dApp name *** WARNING ***","action":"Authentication"},"primaryType":"Challenge","message":{"challenge":"d895e855c9521289aea911c137802af53e24a20dfbb00c974f10aeecd2a2633e"}}

challenge for recovery:  {"types":{"EIP712Domain":[{"name":"dApp","type":"string"},{"name":"action","type":"string"}],"Challenge":[{"name":"challenge","type":"string"}]},"domain":{"dApp":"*** WARNING *** Put your dApp name *** WARNING ***","action":"Authentication"},"primaryType":"Challenge","message":{"challenge":"d895e855c9521289aea911c137802af53e24a20dfbb00c974f10aeecd2a2633e"}}

signature:  0x00c998e7b16f1f7def0927713f177929930449ee54f3970f30096446117d8f4914f6b9073937772b09ea3ae742f10615d19f0ac747ef12affa36e0dbdb93eb001b

recovered address ? 0x1ef35b15a96263ebbb808b8d71354df31b3bc90f

storedChallenge:  undefined

storedChallenge === challenge ?  false
```
