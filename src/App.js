import React, { useEffect, useState } from 'react';
import config from '@app/Config';
import { offsetLimitPagination } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink
} from '@apollo/client';
import { ThemeProvider } from '@material-ui/core';
import AppRoutes from '@app/router';
import theme from '@app/styles/theme';
import { BrowserRouter } from 'react-router-dom';
import AppContext from '@app/AppContext';
import { SelectionContextProvider } from '@app/providers/SelectionContext';
import { StateContextProvider } from '@app/providers/StateContext';
import { GalleryContextProvider } from '@app/providers/GalleryContext';
import { SearchContextProvider } from '@app/providers/SearchContext';
import { PageCountContextProvider } from '@app/providers/PageCountContext';
import { LessonViewModeContextProvider } from '@app/providers/LessonViewModeContext';
import { ErrorContextProvider } from '@app/providers/ErrorContext';
import { MenuContextProvider } from '@app/providers/MenuContext';
import { FilterContextProvider } from '@app/providers/FilterContext';
import { PaginationContextProvider } from '@app/providers/Pagination';
import { AssetProvider } from '@app/providers/AssetContext';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MomentUtils from '@date-io/moment';
import { Auth } from 'aws-amplify';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { TreeListContextProvider } from '@app/providers/TreeListContext';

// App constants
import { AUTH_USER_TOKEN_KEY } from '@app/utils/constants';
import { useSessionContext } from './providers/SessionContext';
import { clearLocalStorage } from './utils/functions';

const App = ({ authState }) => {
  const [context, setContext] = useState();
  const { notify } = useNotifyContext();
  const { authStatus } = useSessionContext();

  useEffect(() => {
    // get the URL parameters which will include the auth token
    const params = window.location.search;
    if (window.opener) {
      // send them to the opening window
      window.opener.postMessage(params);
      // close the popup
      window.close();
    }
  }, []);
  console.log('authStatus:', authState);
  if (authState !== 'signedIn') {
    return null;
  }

  const awsGraphqlFetch = (uri, options) => {
    const token = localStorage.getItem(AUTH_USER_TOKEN_KEY);
    options.headers['Authorization'] = token ? `Bearer ${token}` : '';
    options.minTimeout = 15000;
    let request = fetch(uri, options);
    request
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .catch((error) => {
        console.log('error', error);
      });
    return request;
  };

  const httpLink = new HttpLink({
    uri: config.apolloLinks.http,
    fetch: awsGraphqlFetch
  });

  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward, response }) => {
      console.log(graphQLErrors);
      if (graphQLErrors)
        graphQLErrors.forEach((err) => {
          const { message, locations, path } = err;
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
          switch (err?.extensions?.code) {
            case 'UNAUTHENTICATED':
              const notiOps = getNotificationOpt('backend', 'error', 'unAuth');
              notify(notiOps.message, notiOps.options);
              setTimeout(function () {
                window.location.reload();
              }, 2000);
              console.log('Authentication Failed --- ', err?.message);
              return forward(operation);

            default:
              if (!err?.message.includes('Name exists')) {
                const notiDefault = getNotificationOpt(
                  'backend',
                  'error',
                  'network'
                );
                notify(err?.message, notiDefault.options);
              }

              return;
          }
        });

      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
        if (
          authStatus === 'tokenRefresh_failure' ||
          authStatus === 'signIn_failure' ||
          authStatus === 'signOut' ||
          authStatus === 'wrongSignIn'
        ) {
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        } else {
          console.log('#119');
          Auth.currentSession().then(
            (session) => {
              const isValid = session.isValid();
              if (!isValid) {
                const notiDefault = getNotificationOpt(
                  'backend',
                  'error',
                  'unAuth'
                );
                notify(notiDefault.message, notiDefault.options);
                setTimeout(function () {
                  clearLocalStorage();
                  window.location.reload();
                }, 2000);
              } else {
                const oldToken = localStorage.getItem(AUTH_USER_TOKEN_KEY);
                if (oldToken !== session.getIdToken().getJwtToken()) {
                  // const notiDefault = getNotificationOpt(
                  //   'backend',
                  //   'error',
                  //   'unAuth'
                  // );
                  // notify(notiDefault.message, notiDefault.options);
                  // setTimeout(function () {
                  // clearLocalStorage();
                  // window.location.reload();
                  // }, 2000);
                } else {
                  const notiDefault = getNotificationOpt(
                    'backend',
                    'error',
                    'network'
                  );
                  notify(notiDefault.message, notiDefault.options);
                }
              }
            },
            (err) => {
              setTimeout(function () {
                clearLocalStorage();
                window.location.reload();
              }, 2000);
              console.log(err);
            }
          );
        }
      }
    }
  );

  const cache = new InMemoryCache({
    dataIdFromObject: (object) => object.key || null,
    typePolicies: {
      Query: {
        fields: {
          feed: offsetLimitPagination()
        }
      }
    }
  });

  const client = new ApolloClient({
    link: errorLink.concat(httpLink),
    cache: cache,
    resolvers: {}
  });

  return (
    <ApolloProvider client={client}>
      <AppContext.Provider value={[context, setContext]}>
        <MenuContextProvider>
          <PageCountContextProvider>
            <LessonViewModeContextProvider>
              <SelectionContextProvider>
                <StateContextProvider>
                  <SearchContextProvider>
                    <GalleryContextProvider>
                      <ErrorContextProvider>
                        <ThemeProvider theme={theme}>
                          <MuiPickersUtilsProvider utils={MomentUtils}>
                            <AssetProvider>
                              <TreeListContextProvider>
                                <FilterContextProvider>
                                  <PaginationContextProvider>
                                    <BrowserRouter>
                                      <AppRoutes />
                                    </BrowserRouter>
                                  </PaginationContextProvider>
                                </FilterContextProvider>
                              </TreeListContextProvider>
                            </AssetProvider>
                          </MuiPickersUtilsProvider>
                        </ThemeProvider>
                      </ErrorContextProvider>
                    </GalleryContextProvider>
                  </SearchContextProvider>
                </StateContextProvider>
              </SelectionContextProvider>
            </LessonViewModeContextProvider>
          </PageCountContextProvider>
        </MenuContextProvider>
      </AppContext.Provider>
    </ApolloProvider>
  );
};

export default App;
