import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import '../styles/globals.css'
import { NavigtionProvider } from "../src/contexts/navigation.context"
import { ApolloProvider } from "@apollo/client"
import client from "../lib/apolloclient"
import { Provider } from 'chakra-ui-carousel'
import "@fontsource/share"

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "dark",
  },
  components: {},
  fonts: {
    heading: `'Share', sans-serif`,
  },
  fontSizes: {},
  breakpoints: {
    sm: "320px",
    md: "768px",
    lg: "960px",
    xl: "1200px",
  },
  styles: {
    global: (props) => ({
      'html, body': {
        background: props.colorMode === 'dark' ? 'gray.800' : 'blue.400',
      },
      a: {
        color: props.colorMode === 'dark' ? 'gray.300' : 'gray.100',
      },
      '@keyframes coinFlip': {
        '0%, 100%': { transform: 'rotateY(0deg)' },
        '50%': { transform: 'rotateY(180deg)' },
      },
    }),
  },
});

function App({Component, pageProps},{ children }:  {
  children: React.ReactNode
}) {
  return (
    <ChakraProvider theme={theme}>
      <ApolloProvider client={client}>
        <Provider>
            {children}
            <NavigtionProvider>
              <Component {...pageProps} />
            </NavigtionProvider>
        </Provider>
      </ApolloProvider>
    </ChakraProvider>
  )
}

export default App
