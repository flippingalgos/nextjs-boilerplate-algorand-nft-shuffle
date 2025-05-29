import nextConnect from 'next-connect'
import GET_SHUFFLE_ITEMS from "../../queries/getShuffleItems"
import client from "../../lib/apolloclient"
import { sendWaitApi, getAlgodClient } from '../../lib/algorand'
import { base64Encode } from '../../lib/base64';
const algosdk = require('algosdk')
const shuffleAccount = algosdk.mnemonicToSecretKey(process.env.KEY)
const shuffleWallet = shuffleAccount.addr //"You May Need to set the wallet to send from if your using a re-keyed wallet"
const handler = nextConnect()

handler.post(async (req, res) => {
    let nft = undefined
    let data = req.body
    await client.mutate({
        mutation: GET_SHUFFLE_ITEMS
    }).then((senddata) => {
        //console.log("get data", senddata)
        const shuffleItems = senddata.data.queryShuffle
        if (shuffleItems?.length > 0) {
            const randomIndex = Math.floor(Math.random() * shuffleItems.length);
            nft = shuffleItems[randomIndex];
        } 
    }).catch((err)=>{ 
        console.log("error getting data", err)
    }) 

    if (!nft) return res.json({success: false, txns: []});
        
    const algodClient = getAlgodClient();
    const params = await algodClient.getTransactionParams().do();
    const payment_amount = algosdk.algosToMicroalgos(0);
    // Adjust the valid rounds
    const adjustedFirstValid = params.firstRound + 1; // Increment first valid round by 1
    const adjustedLastValid = params.firstRound + 1000; // Set last valid round 1000 rounds after the first valid round

    let uniqueCounter = Date.now().toString();

    const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams: {
            ...params,
            firstRound: adjustedFirstValid,
            lastRound: adjustedLastValid,
        },
        from: data.address,
        to: shuffleWallet,
        amount: payment_amount,
        note: new Uint8Array(Buffer.from(`payment-${uniqueCounter}`)), // Add unique note
    })

    const opt_in = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
            ...params,
            firstRound: adjustedFirstValid,
            lastRound: adjustedLastValid,
        },
        from: data.address,
        to: data.address,
        assetIndex: nft.asset_id,
        amount: 0,
        note: new Uint8Array(Buffer.from(`optin-${uniqueCounter}`)), // Add unique note
    });

    const asset_transfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
            ...params,
            firstRound: adjustedFirstValid,
            lastRound: adjustedLastValid,
        },
        from: shuffleWallet,
        to: data.address,
        assetIndex: nft.asset_id,
        amount: 1,
        note: new Uint8Array(Buffer.from(`transfer-${uniqueCounter}`)),
    });

    let signed_asset_transfer;
    let transactions_to_sign;

    let group = [payment, opt_in, asset_transfer];

    const groupID = algosdk.computeGroupID(group)
    payment.group = groupID;
    opt_in.group = groupID;
    asset_transfer.group = groupID;

    signed_asset_transfer = algosdk.signTransaction(asset_transfer, shuffleAccount.sk)

    transactions_to_sign = [
        base64Encode(algosdk.encodeUnsignedTransaction(payment)),
        base64Encode(algosdk.encodeUnsignedTransaction(opt_in)),
        base64Encode(signed_asset_transfer.blob)
    ];

    return res.json({success: true, txns: transactions_to_sign});
}) 

export default handler