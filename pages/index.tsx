import Head from 'next/head'
import {
  Box,
  Button,
  Image,
  VStack,
  Center,
  Text
} from '@chakra-ui/react'
import * as React from 'react'
import Navigation from '../components/Navigation'
import Loader from '../components/Loader'
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import algosdk from 'algosdk'
import { base64Decode, base64Encode } from '../lib/base64';

export default function HomePage(props) {
  const { defaultWallet, sessionWallet, updateWallet, connected, currency, loading, remainingShuffleCount, handleFetch } = useNavigation()
  const [claimedImage, setClaimedImage] = React.useState(null);
  const [isShuffling, setIsShuffling] = React.useState(false);
  
  async function getShuffleTransactions() {
    setIsShuffling(true)
    const response = await fetch('/api/getShuffleTransactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            address: defaultWallet
        })
    });
    const shuffle_transactions_response = await response.json();
    const shuffle_transactions = [];

    if (shuffle_transactions_response.success) {
        shuffle_transactions.push(algosdk.decodeUnsignedTransaction(base64Decode(shuffle_transactions_response.txns[0])));
        shuffle_transactions.push(algosdk.decodeUnsignedTransaction(base64Decode(shuffle_transactions_response.txns[1])));
        shuffle_transactions.push(algosdk.decodeSignedTransaction(base64Decode(shuffle_transactions_response.txns[2])).txn)
        let transactionsToSend = [];
      
        try {
          const signedTransactions = await sessionWallet.signTxn(shuffle_transactions);
          let count = 0;
          signedTransactions.forEach((signedTransaction) => {
            if(Object.keys(signedTransaction).length > 0 && count < 2) {
              transactionsToSend.push(base64Encode(signedTransaction?.blob));
              count++;
            }
          });
        } catch (e) {
          console.log("getShuffleTransactions() ERROR: ", e)
          setIsShuffling(false)
        }

        if (!transactionsToSend || transactionsToSend.length === 0) return;
        
        shuffle(transactionsToSend);
    } else {
      showErrorToaster("NFT Shuffled Sold Out!");
      setIsShuffling(false)
      handleFetch()
    }
}

async function shuffle(signed_transactions) {
  try {
      const response = await fetch("api/shuffle", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              signedTransactions: signed_transactions
          })
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          if (['NFT Already Shuffled!', 'Not On The Whitelist!', 'No More Shuffles Allowed!', 'Not Enough Funds!'].includes(errorData)) {
              console.log(errorData);
          } else {
              showErrorToaster("NFT Already Shuffled!");
          }
      } else {
          const data = await response.json();
          const apiResponse = await fetch("https://api.flippingalgos.xyz/api/asa/"+data.asset_id+"/verify")
          const tokenData = await apiResponse.json()
          if(tokenData?.success) {
            setClaimedImage(tokenData.image);
          }
          showNetworkSuccess("Shuffled Successfully!")
          setIsShuffling(false)
          handleFetch()
      }
  } catch (e) {
      console.log(e);
      setIsShuffling(false)
  } finally {
      //not needed?
      setIsShuffling(false)
  }
}

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Boilerplate Shuffle - Algorand</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        {!loading ? (
              <>
              <Box mt='2'>
                <Center>
                  <VStack>
                    <Text fontSize='xl'>Loading...</Text>
                    <Loader />
                  </VStack>
                </Center>
              </Box>
              </>
            ) : (
              <>
              <Center>
                <VStack m={3} p={3} bg={'gray.800'} borderRadius={'lg'}>
                  <Box>
                      <Text color={'white'} fontSize='xl'>Shuffle {(remainingShuffleCount > 0)? 'Live' : 'Sold Out'}</Text>
                  </Box>
                  <Box>
                    <Image width={250} height={250} borderRadius='lg' src={'/nft-preview.jpg'} alt='NFT Preview' />
                  </Box>
                  <Box p={2}>
                      <VStack>
                        <Text color={'white'} fontSize='md'>NFTs Remaining In Shuffle: {remainingShuffleCount}</Text>
                        {connected ? (
                          <>
                          {remainingShuffleCount > 0 ? (
                          <Button colorScheme={'blue'} isLoading={isShuffling} loadingText='Shuffling...' onClick={getShuffleTransactions}>Shuffle</Button>
                          ) : (
                            <Text fontSize='lg' color={'red'}>SOLD OUT</Text>
                          ) }
                          </>
                        ) : (
                          <Box>
                              <AlgorandWalletConnector 
                                  darkMode={true}
                                  //@ts-ignore
                                  sessionWallet={sessionWallet}
                                  connected={connected} 
                                  //@ts-ignore
                                  updateWallet={updateWallet}
                                  //@ts-ignore
                                  handleFetch={handleFetch}
                                  />
                          </Box>
                        ) }
                      </VStack>
                  </Box>
                  {claimedImage != null ? (
                  <Box>
                    <Text fontSize='xl'>Congrats! You Shuffled</Text>
                    <Image width={250} height={250} borderRadius='lg' src={claimedImage} alt='NFT Shuffled' />
                  </Box>
                   ) : null }
                </VStack>
              </Center>
              </>
            )}
      </Box>
    </>
  )
}
