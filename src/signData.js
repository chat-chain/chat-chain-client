import axios from 'axios'
import { api } from './environment'
const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')

export const paidPost = async (
  text,
  prev,
  account,
  recipiantContract,
  currentProvider
) => {
  recipiantContract.methods.post(text, prev).send({ from: account, gasLimit: 6000000 })
}


export const signData = async (
  text,
  prev,
  account,
  recipiantContract,
  currentProvider
) => {
  const signer = account
  const deadline = Date.now() + 100000
  console.log('RECI', recipiantContract)
  console.log(deadline)
  const contract_of_remote = recipiantContract._address
  console.log('contract_of_remote', contract_of_remote)
  const txData = recipiantContract.methods.post(text, prev).encodeABI()
  /*bug
  const txData  = await recipiantContract.methods
  .land(await recipiantContract.methods
    .post('AHA',0).encodeABI(),4,'0x5e1feaa2C0b62302e670BF621a216D751be037FC','0x5e1feaa2C0b62302e670BF621a216D751be037FC').encodeABI()
  */ 

  currentProvider.sendAsync(
    {
      method: 'net_version',
      params: [],
      jsonrpc: '2.0',
    },
    (err, result) => {
      const netId = result.result
      const chainID = 5
      console.log('netId', netId)
      const msgParams = JSON.stringify({
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          land: [
            { name: 'txData', type: 'bytes' },
            { name: 'sender', type: 'address' },
            { name: 'deadline', type: 'uint' },
          ],
        },
        //make sure to replace verifyingContract with address of deployed contract
        primaryType: 'land',
        domain: {
          name: 'Evee',
          version: '1',
          chainId: chainID,
          verifyingContract: contract_of_remote,
        },
        message: {
          txData: txData,
          sender: signer,
          deadline: deadline,
        },
      })

      const from = signer

      console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
      const params = [from, msgParams]
      console.dir(params)
      const method = 'eth_signTypedData_v4'

      currentProvider.sendAsync(
        {
          method,
          params,
          from,
        },
        async function (err, result) {
          if (err) return console.dir(err)
          if (result.error) {
            alert(result.error.message)
          }
          if (result.error) return console.error('ERROR', result)
          console.log('TYPED SIGNED:' + JSON.stringify(result.result))

          const recovered = sigUtil.recoverTypedSignature({
            data: JSON.parse(msgParams),
            sig: result.result,
          })

          if (
            ethUtil.toChecksumAddress(recovered) ===
            ethUtil.toChecksumAddress(from)
          ) {
          } else {
            alert(
              'Failed to verify signer when comparing ' + result + ' to ' + from
            )
          }

          //getting r s v from a signature
          const signature = result.result.substring(2)
          const r = '0x' + signature.substring(0, 64)
          const s = '0x' + signature.substring(64, 128)
          const v = parseInt(signature.substring(128, 130), 16)
          console.log('r:', r)
          console.log('s:', s)
          console.log('v:', v)
          console.log('result:', result)

          const reqMsg = {
            v,
            r,
            s,
            signer,
            contract_of_remote,
            deadline,
            txData,
          }
          try {
            const res = await axios.post(`${api}/sig`, reqMsg)
            console.log('res: ', res)
          } catch (err) {
            console.log('err:', err)
          }
        }
      )
    }
  )
}
