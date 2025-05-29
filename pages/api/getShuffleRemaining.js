import nextConnect from 'next-connect'
import GET_SHUFFLE_REMAINING from "../../queries/getShuffleRemaining"
import client from "../../lib/apolloclient"
const handler = nextConnect()

handler.get(async (req, res) => {
    await client.mutate({
        mutation: GET_SHUFFLE_REMAINING
    }).then((senddata) => {
        //console.log("get shuffles remaining", senddata)
        res.json({success: true, count: senddata?.data?.aggregateShuffle?.count})
    }).catch((err)=>{ 
        //console.log("error getting shuffles remaining", err)
        res.json({success: false, count: 0})
    }) 
}) 

export default handler