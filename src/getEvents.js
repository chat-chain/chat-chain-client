

export default async function getEvents(
  eventName,
  fromContract,
  filter_for_posts,
) {
  // get com post part
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
        if (e.code == -32603){
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
    
  

  
 