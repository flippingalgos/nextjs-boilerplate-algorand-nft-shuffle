/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import Head from 'next/head'
import {
    Box,
    Button,
    Center,
    Heading,
    Container,
    Text,
    VStack,
    Stack,
    HStack,
    Image,
    useColorModeValue
  } from "@chakra-ui/react"
import Navigation from '../components/Navigation'
import Loader from '../components/Loader'
import { useNavigation } from "../src/contexts/navigation.context"
import Link from 'next/link'
import favicon from "../public/favicon.ico"

const Error404 = () => {
  const { loading } = useNavigation()
  const bgColorMode = useColorModeValue('yellow.400', 'yellow.200')
  const colorHeaderText = useColorModeValue('black', '#67d3ff')
  
  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>404 - Flipping Algos</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
           {!loading ? (
              <>
                <Box mt='2'>
                  <Center>
                    <VStack>
                      <Text fontFamily="Share" fontSize='xl'>Loading...</Text>
                    <Loader />
                    </VStack>
                  </Center>
                </Box>
              </>
            ) : (
              <>
              <Center h="100%">
                <VStack spacing={20}>
                    <Heading pt={10} color={colorHeaderText} size="4xl">Not what you came for?</Heading>
                    <Box as='button' color={'black'} bg={bgColorMode} borderWidth='1px' borderRadius='lg' m={1} pt={1} pb={1} pl={3} pr={3}>
                            <Link href={'/'} passHref><Text fontSize='md'>Go Home</Text></Link>
                    </Box>
                </VStack>
              </Center>
             </>
          )}
      </Box>
    </>
  )
}

export default Error404