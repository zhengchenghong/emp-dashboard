import React, { useState, useContext, useEffect, createContext } from 'react';
import { Auth, Hub, Logger } from 'aws-amplify';
import { AUTH_USER_TOKEN_KEY, USER_TYPES } from '@app/utils/constants';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from './NotifyContext';

const SessionContext = createContext(null);
const useSessionContext = () => {
  return useContext(SessionContext);
};

const SessionContextProvider = ({ ...props }) => {
  const [authStatus, setAuthStatus] = useState('');
  const { notify } = useNotifyContext();
  const logger = new Logger('My-Logger');

  const listener = async (data) => {
    switch (data.payload.event) {
      case 'signIn':
        logger.info('user signed in');
        setAuthStatus('signIn');
        const user = await Auth.currentUserInfo();
        const user1 = await Auth.currentAuthenticatedUser({
          bypassCache: true
        });
        window.localStorage.setItem(
          AUTH_USER_TOKEN_KEY,
          user1.signInUserSession?.getIdToken()?.getJwtToken()
        );
        if (user?.attributes) {
          if (!USER_TYPES.includes(user?.attributes['custom:userrole'])) {
            const notiOps = getNotificationOpt(
              'user',
              'warning',
              'unAuthenticated'
            );
            notify(notiOps.message, notiOps.options);
            console.log('user attributes:', user?.attributes);
            setTimeout(() => {
              Auth.signOut();
            }, 3000);
          }
        } else {
          window.location.href = '/';
        }
        break;
      case 'signUp':
        logger.info('user signed up');
        setAuthStatus('signUp');
        break;
      case 'signOut':
        logger.info('user signed out');
        setAuthStatus('signOut');
        break;
      case 'signIn_failure':
        logger.error('user sign in failed');
        setAuthStatus('signIn_failure');

        if (data.payload?.data?.name === 'UserNotFoundException') {
          // data.payload.data.message
          const notiOps1 = getNotificationOpt(
            'user',
            'error',
            'unAuthenticated'
          );
          notify(data.payload.data.message, notiOps1.options);
        } else {
          if (
            data?.payload?.message === 'The OAuth response flow failed' &&
            data?.payload?.data?.name === 'Error' &&
            data?.payload?.data?.message.includes('Already')
          ) {
            setAuthStatus('re-signIn');
            Auth.federatedSignIn({ provider: 'Google' });
          } else {
            const notiOps = getNotificationOpt(
              'user',
              'warning',
              'unAuthenticated'
            );
            notify(
              'User does not exist or invalid credentials.',
              notiOps.options
            );
          }
        }

        break;
      case 'tokenRefresh':
        logger.info('token refresh succeeded');
        const session = await Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        localStorage.setItem(AUTH_USER_TOKEN_KEY, token);
        setAuthStatus('tokenRefresh');
        break;
      case 'tokenRefresh_failure':
        logger.error('token refresh failed');
        setAuthStatus('tokenRefresh_failure');
        break;
      case 'configured':
        logger.info('the Auth module is configured');
        setAuthStatus('configured');
        break;
      default:
    }
  };

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then((userData) => userData)
      .catch(() => console.log('Not signed in'));
  }

  useEffect(() => {
    Hub.listen('auth', listener);
  }, []);

  const value = { authStatus };

  return <SessionContext.Provider value={value} {...props} />;
};

export { useSessionContext, SessionContextProvider };
