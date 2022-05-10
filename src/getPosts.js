import getEvents from './getEvents'
export default async function getPosts(
  recipiantContract,
  eveeNFTContract,
  filter_for_posts,
) {
  // get com post part
  let not_done = true
  let posts_com = await getEvents('post_com',recipiantContract._address, {
    filter: filter_for_posts, // use prev : x to see all x's replies
    fromBlock: 0,
    toBlock: 'latest',
  })
    

  // get msg post part
  let posts_msg = await getEvents('post_msg',recipiantContract._address, {
    filter: filter_for_posts, // use prev : x to see all x's replies
    fromBlock: 0,
    toBlock: 'latest',
  })

  //get sommercial's uri of each post (its located in EveeNFT)
  for (const p of posts_com) {
    p.returnValues.urlLink = null
    if (!p.returnValues.freePost) {
      p.returnValues.uri = null
    } else {
      // try to extract metadata from uri, otherwise uri will be the the image
      try {
        p.returnValues.uri = await eveeNFTContract.methods
          .tokenURI(p.returnValues.tokenId)
          .call()
        try {
          const obj = await fetch(p.returnValues.uri)
          // console.log('obj', obj)
          const jsoni = await obj.json()
          p.returnValues.uri = jsoni.image
          // console.log('the json', jsoni)
          p.returnValues.urlLink = jsoni.external_url
        } catch (e) {
          //console.log('something went wrong with meta data extraction', e)
        }
      } catch (e) {
        //console.log('something went wrong with image of commercial', e)
      }
      //id 0's defulat commercial
    }
  }

  const posts = []
  for (let i = 0; i < posts_msg.length; i++) {
    const comIndex = posts_com.find(
      ({ returnValues }) => returnValues.id === posts_msg[i].returnValues.id
    )
    //console.log('post ', posts_msg[i].returnValues.id, ' com ', comIndex)
    var date = new Date(posts_msg[i].returnValues.timestamp*1000);
    console.log("Date: "+date.getDate())
    posts[i] = {
      id: posts_msg[i].returnValues.id,
      prev: posts_msg[i].returnValues.prev,
      body: posts_msg[i].returnValues.body,
      sender: posts_msg[i].returnValues.sender,
      timestamp: date,
      NFTContract: comIndex.returnValues.NFTContract,
      tokenId: comIndex.returnValues.tokenId,
      uri: comIndex.returnValues.uri,
      freePost: comIndex.returnValues.freePost,
    }   
  }
  
  return posts
}
