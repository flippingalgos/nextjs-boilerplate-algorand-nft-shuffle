import { useMemo } from "react"
import { ApolloClient, InMemoryCache } from "@apollo/client"
import { createHttpLink } from "@apollo/client/link/http"
import { platform_settings as ps } from '../platform-conf'

let client: ApolloClient<any>;

const createApolloClient = (): ApolloClient<any> => {
  return new ApolloClient({
    uri: ps.graphQL,
    credentials: "include",
    ssrMode: typeof window === "undefined", // set to true for SSR
    link: createHttpLink({
      uri: ps.graphQL,
      headers: {
        //@ts-ignore
        'DG-Auth': ps.graphQLkey ?? undefined,
      },
    }),
    cache: new InMemoryCache()
  });

};
export const initializeApollo = (initialState = null) => {
  const apolloClient = client ?? createApolloClient();
  if (initialState) {
    const cache = apolloClient.extract();
    apolloClient.cache.restore({
      ...cache,
      ...initialState,
    });
  }
  if (typeof window === "undefined") return apolloClient;
  if (!client) client = apolloClient;
  return apolloClient;
};

export const useApollo = (initialState) => {
  return useMemo(() => initializeApollo(initialState), [initialState])
};

export const apolloClient = client ?? createApolloClient()