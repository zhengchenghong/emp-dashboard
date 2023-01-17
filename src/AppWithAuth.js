import React from 'react';
import App from '@app/App';
import AuthContainer from '@app/containers/AuthContainer';
import { UserContextProvider } from '@app/providers/UserContext';
import { SessionContextProvider } from '@app/providers/SessionContext';
import { NotifyContextProvider } from './providers/NotifyContext';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';

const AppWithAuth = () => {
  const notistackRef = React.createRef();
  const onClickDismiss = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <BrowserRouter>
      <SnackbarProvider
        ref={notistackRef}
        maxSnack={5}
        hideIconVariant
        action={(key) => (
          <IconButton onClick={onClickDismiss(key)}>
            <CloseIcon />
          </IconButton>
        )}
      >
        <NotifyContextProvider>
          <UserContextProvider>
            <SessionContextProvider>
              <AuthContainer>
                <App />
              </AuthContainer>
            </SessionContextProvider>
          </UserContextProvider>
        </NotifyContextProvider>
      </SnackbarProvider>
    </BrowserRouter>
  );
};

export default AppWithAuth;
