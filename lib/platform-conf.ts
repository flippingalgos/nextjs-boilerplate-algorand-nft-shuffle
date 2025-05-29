import { addrToB64 } from './algorand'

type AlgodConf = {
    server: string
    port: number
    token: string
    network: string
};
type IpfsConf = {
    display: string
    ipfsGateway: string
    token: string
};
type IndexerConf = {
    server: string
    port: number
    token: string
};
type AppConf = {
    app_id: number      // ID of application
    owner_addr: string  // Address of price/tag token owner
    admin_addr: string  // Address of app creator 
    fee_amt: number     // Amount to be sent to app onwer on sales
    name: string        // Full name of App 
    unit: string        // Unit name for price/tag tokens
};

type DevConf = {
    debug_txns: boolean
    accounts: {
        [key: string]: string[]
    }
};

type PlatformConf = {
    domain: string
    graphQL: string
    graphQLkey: string
    algod: AlgodConf
    ipfs: IpfsConf
    indexer: IndexerConf
    explorer: string
    application: AppConf
    dev: DevConf
};

const platform_settings = require("../config.json") as PlatformConf;

function get_template_vars(override: any): any {
    return {
        "TMPL_APP_ID": platform_settings.application.app_id,
        "TMPL_ADMIN_ADDR": addrToB64(platform_settings.application.admin_addr),
        "TMPL_OWNER_ADDR": addrToB64(platform_settings.application.owner_addr),
        "TMPL_FEE_AMT": platform_settings.application.fee_amt,
        ...override
    }
}


//@ts-ignore
export { platform_settings, AppConf, get_template_vars }