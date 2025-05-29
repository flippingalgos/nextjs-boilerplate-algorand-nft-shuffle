/* eslint-disable no-console */
import {platform_settings as ps} from './platform-conf'
import algosdk, {LogicSigAccount} from 'algosdk' 
import { showErrorToaster, showNetworkError, showNetworkSuccessTx, showNetworkWaiting } from "../src/Toaster"

export const dummy_addr = "b64(YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=)"
export const dummy_id = "b64(AAAAAAAAAHs=)"

let client = undefined;
export function getAlgodClient(){
    if(client===undefined){
        const {token, server, port} = ps.algod
        client = new algosdk.Algodv2(token, server, port)
    }
    return client
}

let indexer = undefined;
export function getIndexer() {
    if(indexer===undefined){
        const {token, server, port} = ps.indexer
        indexer = new algosdk.Indexer(token, server, port)
        //indexer = new algosdk.Indexer({ 'X-API-key' : token}, server, port)
    }
    return indexer
}

export function existsInArray(arr, search) {
    return arr.some(row => row.includes(search));
}

export async function getWalletAssetData(address: string, tokens: any): Promise<any> {
    const indexer  = getIndexer()
    const assets = []
    const tokenBal = []
    const walletAssets = []
    const optOutAssets = []
    const result = await indexer.lookupAccountByID(address).do().then((data) => {
        return data
    }).catch((err)=>{ 
        //console.log("error", err)
        return undefined
    })

    let algoBalance = 0
    if(result !== undefined) {
        algoBalance = result?.amount
        for(let asset in result?.assets){
            assets.push({ asset_id: result?.assets[asset]['asset-id'], optin: false})
            if(result?.assets[asset]['amount']>0){
                walletAssets.push({ asset_id: result?.assets[asset]['asset-id'], amount: result?.assets[asset]?.amount})
            } else {
                optOutAssets.push({ asset_id: result?.assets[asset]['asset-id'], amount: result?.assets[asset]?.amount})
            }
        }
    }
    for(let token in tokens){
        const tokenMatch = (result !== undefined) ? result?.assets?.find((r)=>{ return r['asset-id'] == tokens[token].asset_id }) : undefined
        tokenBal.push({ asset_id: tokens[token].asset_id, 
                        balance:(tokenMatch !== undefined)? tokenMatch['amount'] : 0, 
                        name: tokens[token].name, 
                        image: tokens[token].image, 
                        unitname: tokens[token].unitname, 
                        isactive: tokens[token].isactive, 
                        decimal: tokens[token].decimal, 
                        rate: tokens[token].rate //'Loading...' //(data)? data.price.toFixed(3) : 
        })
    }
    return { walletassets: walletAssets, optoutassets: optOutAssets, assets: assets, tokenBal: tokenBal, algoBalance: algoBalance }
}

export async function getCurrentVaultBalance(mintedAsset: number, appId: number):Promise<any> {
    const vault = { id:0, state: undefined, assets: [], address: "" }
    const client = getAlgodClient();
    const vaultAssets = await getIndexer().lookupAccountByID(algosdk.getApplicationAddress(appId)).do()
        .then(async (data) => {
            const assets = data.assets.filter(asset => asset['asset-id'] !== mintedAsset);
            const assetInfos = await Promise.all(assets.map(asset => client.getAssetByID(asset['asset-id']).do()));
            return assets.map((asset, index) => {
                const assetInfo = assetInfos[index] as any;
                const formatedAmount = asset.amount / Math.pow(10, assetInfo?.params?.decimals || 0);
                return { ...asset, amount: formatedAmount, name: assetInfo?.params?.name, reserve: assetInfo?.params?.reserve, url: assetInfo?.params?.url, unitname: assetInfo?.params['unit-name'] }; 
            });
        })
        .catch((err) => {
            // Handle error
            console.error("Error fetching asset info:", err);
            return [];
        });

    let appData = await getIndexer().lookupApplications(appId).do()
    vault.id = appData.id
    vault.state = decodeKvPairs(appData.params["global-state"])
    vault.assets = vaultAssets
    vault.address = algosdk.getApplicationAddress(appId)
    return vault
}

export function uintToB64(x: number): string {
    return Buffer.from(algosdk.encodeUint64(x)).toString('base64')
}

export function addrToB64(addr: string): string {
    if (addr == "" ){
        return dummy_addr
    }
    try {
        const dec = algosdk.decodeAddress(addr)
        return "b64("+Buffer.from(dec.publicKey).toString('base64')+")"
    }catch(err){
        return dummy_addr
    }
}

export function b64ToAddr(x){
    return algosdk.encodeAddress(new Uint8Array(Buffer.from(x, "base64")));
}

export function decodeKvPairs(kvPairs) {
    const decodedValues = {};
    for(let i=0; i<kvPairs.length; i++) {
        const kvPair = kvPairs[i];
        const key = Buffer.from(kvPair.key, 'base64').toString();
        let value = kvPair['value'];
        if(key === 'manager' || key === 'reserve') {
            value = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'));
        } else {
            value = value.uint;
        }
        decodedValues[key] = value;
    }
    return decodedValues;
}

export async function sendWait(signed: any[], isLargerThan768: boolean):Promise<string> {
    const client = getAlgodClient()
    if(ps.dev.debug_txns) download_txns("grouped.txns", signed.map((t)=>{return t.blob}))

    try {
        const {txId} = await client.sendRawTransaction(signed.map((t)=>{return t.blob})).do()
        showNetworkWaiting(txId)

        const result = await waitForConfirmation(client, txId, 3)
        if(result) {
            showNetworkSuccessTx(txId, isLargerThan768)
            return txId
        }  
    } catch (error) { 
        if(error.status === 400 && error.message.indexOf("Received status 400: TransactionPool.Remember:") !== -1){
            showErrorToaster("Sorry but your Balance is below the ticket cost" + error)
            //console.log("Sorry but your Balance is below the ticket cost", error)
        }
    }
    return undefined 
}

export async function getTransaction(txid: string) {
    return await waitForConfirmation(getAlgodClient(), txid, 3)
}

export async function waitForConfirmation(algodclient, txId, timeout) {
    if (algodclient == null || txId == null || timeout < 0) {
      throw new Error('Bad arguments.');
    }

    const status = await algodclient.status().do();
    if (typeof status === 'undefined')
      throw new Error('Unable to get node status');

    const startround = status['last-round'] + 1;
    let currentround = startround;
  
    /* eslint-disable no-await-in-loop */
    while (currentround < startround + timeout) {
      const pending = await algodclient
        .pendingTransactionInformation(txId)
        .do();

      if (pending !== undefined) {
        if ( pending['confirmed-round'] !== null && pending['confirmed-round'] > 0) 
          return pending;
  
        if ( pending['pool-error'] != null && pending['pool-error'].length > 0) 
          throw new Error( `Transaction Rejected pool error${pending['pool-error']}`);
      }

      await algodclient.statusAfterBlock(currentround).do();
      currentround += 1;
    }

    /* eslint-enable no-await-in-loop */
    throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
}

export function download_txns(name, txns) {
    let b = new Uint8Array(0);
    for(const txn in txns){
        b = concatTypedArrays(b, txns[txn])
    }
    var blob = new Blob([b], {type: "application/octet-stream"});

    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

export function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}