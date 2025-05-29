import nextConnect from 'next-connect'
import { UPDATE_SHUFFLE } from "../../queries/updateShuffle"
import client from "../../lib/apolloclient"
import { getAlgodClient } from '../../lib/algorand'
import { base64Decode } from '../../lib/base64'
const handler = nextConnect()
const algosdk = require('algosdk')

handler.post(async (req, res) => {

    const transactionsToSend = [];

    for (const transaction of req.body.signedTransactions) {
        transactionsToSend.push(base64Decode(transaction));
    }

    const assetIndex = algosdk.decodeSignedTransaction(transactionsToSend[2]).txn.assetIndex;

    try {
        const algodClient = getAlgodClient();
        const listTransactions = await algodClient.sendRawTransaction(transactionsToSend).do();
        await algosdk.waitForConfirmation(algodClient, listTransactions.txId, 8);
        await client.mutate({
            mutation: UPDATE_SHUFFLE,
            variables: { asset_id: parseInt(assetIndex) },
        }).then((senddata) => {
            //console.log("shuffle updated", senddata)
            res.json({success: true, asset_id: parseInt(assetIndex) })
        }).catch((err)=>{ 
            //console.log("error updating shuffle", err.graphQLErrors)
            res.status(500).json({ error: 'Internal Server Error' })
        }) 

    } catch (e) {
        if (e.response.text.includes('overspend')) {
            return res.status(400).send('Not Enough Funds!')
        } else {
            //console.log(" error ", e)
            res.status(500).json({ error: e })
        }
    }
}) 

export default handler