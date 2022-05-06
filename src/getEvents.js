const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const Evee = require('./contracts/Evee.json')
const EveeNFT = require('./contracts/EveeNFT.json')
const Recipiant = require('./contracts/Recipiant.json')

export default async function getEvents(
  eventName,
  fromContract_add,
  filter_for_posts,
) {
  // get com post part
  const {
    eveeContract,
    RcipiantContract,
    EveeNFTContract,} = await init(fromContract_add)
  let fromContract = 0
  if      (fromContract_add == eveeContract._address    ) fromContract =  eveeContract
  else if (fromContract_add == RcipiantContract._address) fromContract =  RcipiantContract
  else if (fromContract_add == EveeNFTContract._address ) fromContract =  EveeNFTContract
  if (fromContract == 0) return 0
  let ev
  let not_done = true
    while (not_done)
    {
      try{
        ev = await fromContract.getPastEvents(
          eventName,
          filter_for_posts
        )
        not_done  = false
      }catch(e){
        if (e.code == -32603 || e.code == -32005){
          await new Promise((resolve) => setTimeout(resolve, 50));
          not_done = true
          
        }
        else {
          throw e     
          }
      }
    }
    return ev
  }
    
  

  
  const init = async () => { 
    //WEX xhane to `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCH_KEY}`
    const web3 = createAlchemyWeb3(
      `https://polygon-mumbai.g.alchemy.com/v2/SpBoPf3H3TQRDtwtBdMIaG-DUQzSEB-N`
    )
    const networkId = await web3.eth.net.getId()
    //WEX xhane to process.env.E_WALLET_PKEY
    const RcipiantContract = new web3.eth.Contract(
      Recipiant.abi,
      Recipiant.networks[networkId].address
    )
    const eveeContract = new web3.eth.Contract(
      Evee.abi,
      Evee.networks[networkId].address
    )
    const EveeNFTContract = new web3.eth.Contract(
      EveeNFT.abi,
      EveeNFT.networks[networkId].address
    )
    const contract_of_remote = RcipiantContract._address
    return {
      eveeContract,
      RcipiantContract,
      EveeNFTContract,
    }
  }
  