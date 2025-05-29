import Link from 'next/link'
import * as React from 'react'
import {
    Box,
    Flex,
    HStack,
    IconButton,
    Button,
    Menu,
    MenuItem,
    MenuButton,
    MenuList,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    useMediaQuery,
    useColorMode,
    Stack,
    Text,
  } from '@chakra-ui/react';
  import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon, InfoIcon } from '@chakra-ui/icons'
  import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
  import { RequestPopup } from '../src/RequestPopup'
  import Logo from "../src/img/logo.svg"
  import { useNavigation } from "../src/contexts/navigation.context"
  import TokenDropdown from "./TokenDropdown"

  type NavigationProps = {
    tokenList?: any;
    algoBalance?: any;
  }

  export default function Navigation(props: NavigationProps) {
      
    const { defaultWallet, sessionWallet, connected, tokenList, algoBalance, updateWallet, handleFetch, popupProps, currency, setCurrency } = useNavigation()
    const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
    const { colorMode, toggleColorMode } = useColorMode()
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
      <>
        <Box bg={'#000000'} px={{ base: 1, md: 4}}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon color="#2AD3FF" /> : <HamburgerIcon color="#2AD3FF" />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={{ base: 4, md: 8}} alignItems={'center'}>
            <Box w={(isLargerThan768)? '85px' : '68px'}><Link href="/" as="/"><a><Logo alt="Billy Big Beak" /></a></Link></Box>
            {/* <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              <Text color="#2AD3FF" fontSize='sm' fontWeight={'600'}><Link href="/" as="/">Home</Link></Text>
            </HStack> */}
          </HStack>
          <Flex alignItems={'left'}>
            <Stack direction={'row'} spacing={{ base: 2, md: 7}}>
                {/* <Box>
                  {connected && tokenList && isLargerThan768? (
                   <TokenDropdown hasTokenNextPage={hasTokenNextPage} fetchTokenNextPage={fetchTokenNextPage} text={(currency.unitname !== undefined)? currency.unitname : 'ALGO'} onChange={(value) => setCurrency(value)} options={tokenList} algoBalance={algoBalance} />
                  ) : null}
                </Box> */}
                <Button mt={1} p={1} onClick={toggleColorMode}>
                    {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                </Button>
                {isLargerThan768 ? (
                <>
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}>
                    {isLargerThan768 ? ( <Button color="#2AD3FF">{(connected)? 'Connected' : 'Connect'}</Button> ) : ( <InfoIcon boxSize={6}/> )}
                  </MenuButton>
                  <MenuList bg={'#2AD3FF'}>
                    <div>
                      <AlgorandWalletConnector 
                          darkMode={true}
                          //@ts-ignore
                          sessionWallet={sessionWallet}
                          connected={connected} 
                          //@ts-ignore
                          updateWallet={updateWallet}
                          //@ts-ignore
                          handleFetch={handleFetch} />
                    </div>
                    {/* <MenuDivider />       
                    {connected ? (<Link href={'/'} as={'/'} passHref><MenuItem>Menu Item</MenuItem></Link>) : ''} */}
                  </MenuList>
                </Menu>
                </>
                ) : null} 
            </Stack>
            </Flex>
        </Flex>
    
        {isOpen ? (
          <Box pl={1} pr={1} pb={2} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={{ base: 2, md: 4}}>
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
             {/*  {connected && tokenList && !isLargerThan768? (
              <Box>
                <TokenDropdown hasTokenNextPage={hasTokenNextPage} fetchTokenNextPage={fetchTokenNextPage} text={(currency.unitname !== undefined)? currency.unitname : 'ALGO'} onChange={(value) => setCurrency(value)} options={tokenList} algoBalance={algoBalance} />
              </Box>
              ) : null} */}
              <Link href="/" as="/">Home</Link>
            </Stack>
          </Box>
        ) : null}
      </Box>
      {
        //@ts-ignore
      }
      <RequestPopup 
      //@ts-ignore 
      {...popupProps}/>
      </>
    )
}
