import React, { useContext, useEffect, useState } from "react";
import { SessionWallet, PermissionResult, SignedTxn, Wallet } from '../../lib/algorand-session-wallet'
import { platform_settings as ps } from '../../lib/platform-conf'
import { PopupPermission, DefaultPopupProps } from '../RequestPopup'

export interface FraktionContextType {
  defaultWallet: string;
  sessionWallet: Wallet;
  updateWallet: Function;
  handleFetch: Function;
  tokenList: any;
  algoBalance: any;
  walletAssets: any;
  currency: any;
  setCurrency: any;
  remainingShuffleCount: any;
  connected: Promise<boolean>;
  loading: boolean;
  popupProps: typeof DefaultPopupProps;
}

export const NavigtionContext = React.createContext<FraktionContextType>({
  //@ts-ignore
  defaultWallet: '',
  //@ts-ignore
  sessionWallet: () => {},
  //@ts-ignore
  updateWallet: () => {},
  //@ts-ignore
  handleFetch: () => {},
  //@ts-ignore
  tokenList: () => {},
  //@ts-ignore
  algoBalance: () => {},
  //@ts-ignore
  walletAssets: () => {},
  //@ts-ignore
  currency: () => {},
  //@ts-ignore
  setCurrency: () => {},
  //@ts-ignore
  remainingShuffleCount: () => {},
  //@ts-ignore
  connected: async (): Promise<boolean> => { return false; },
  //@ts-ignore
  loading: false,
});

export const NavigtionProvider = ({
  children = null,
}: {
  children: JSX.Element | null;
}): JSX.Element => {
  
  const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));
  const popupCallback = {
    async request(pr: PermissionResult): Promise<SignedTxn[]> {
      let result = PopupPermission.Undecided;
      setPopupProps({isOpen:true, handleOption: (res: PopupPermission)=>{ result = res} })		
      
      async function wait(): Promise<SignedTxn[]> {
        while(result === PopupPermission.Undecided) await timeout(50);

        if(result == PopupPermission.Proceed) return pr.approved()
        return pr.declined()
      }

      //get signed
      const txns = await wait()

      //close popup
      setPopupProps(DefaultPopupProps)

      //return signed
      return txns
    }
  }
  const sw = new SessionWallet(ps.algod.network)
  const [sessionWallet, setSessionWallet] =  useState<any>(sw)
  const [defaultWallet, setDefaultWallet] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  //@ts-ignore
  const [popupProps, setPopupProps] = React.useState<any>(DefaultPopupProps)
  const [connected, setConnected] = React.useState<Promise<boolean>>(sw.connected())
  const [walletAssets, setWalletAssets] = React.useState([])
  const [tokenList, setTokenList] = React.useState([])
  const [algoBalance, setAlgoBalance] = React.useState()
  const [remainingShuffleCount, setRemainingShuffleCount] = React.useState(0)
  const [currency, setCurrency] = React.useState({asset_id:0, decimal: 6, unitname:"ALGO", rate:"1"})

  const updateWallet = async (sw: SessionWallet) => {
    setSessionWallet(sw)
    setConnected(sw.connected())
    const defaultAccount = await sessionWallet.getDefaultAccount()
    setDefaultWallet(defaultAccount)
  };

  const handleFetch = async (sortOrder: string = '') => {
      const shuffleResponse = await fetch("/api/getShuffleRemaining", {
          method: 'GET'
      })
      const shuffleData = await shuffleResponse.json()
      setRemainingShuffleCount(shuffleData?.count)
      setLoading(true)
  }

  useEffect(()=>{ 
      const handleFetchCurrentWallet = async () => {
        const defaultAccount = await sessionWallet.getDefaultAccount()
        setDefaultWallet(defaultAccount)
      }
      if(!sessionWallet.connected()) return 
        handleFetchCurrentWallet()
  }, [sessionWallet])

  React.useEffect(()=> {
    handleFetch()
    if(!connected) return
      updateWallet(sw)

  },[connected])
  //@ts-ignore

  return (
    <NavigtionContext.Provider
      value={{
        defaultWallet,
        sessionWallet,
        updateWallet,
        handleFetch,
        tokenList,
        algoBalance,
        walletAssets,
        currency,
        setCurrency,
        remainingShuffleCount,
        //@ts-ignore
        connected,
        //@ts-ignore
        loading,
        popupProps
      }}
    >
      {children}
    </NavigtionContext.Provider>
  );
};

export const useNavigation = () => {
  const {
    defaultWallet,
    sessionWallet,
    updateWallet,
    handleFetch,
    tokenList,
    algoBalance,
    walletAssets,
    currency,
    setCurrency,
    remainingShuffleCount,
    connected,
    loading,
    popupProps
  } = useContext(NavigtionContext);
  return {
    defaultWallet,
    sessionWallet,
    updateWallet,
    handleFetch,
    tokenList,
    algoBalance,
    walletAssets,
    currency,
    setCurrency,
    remainingShuffleCount,
    connected,
    loading,
    popupProps
  };
};
