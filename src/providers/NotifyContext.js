import React, { useContext, useState, useEffect, createContext } from 'react';
import { useSnackbar } from 'notistack';
const NotifyContext = createContext();
export function useNotifyContext() {
  return useContext(NotifyContext);
}
export function NotifyContextProvider({ children }) {

  const { enqueueSnackbar } = useSnackbar();

  const notify = (msg, option) => {
    const currentTime = new Date().valueOf() / 1000;
    const timeout = localStorage.getItem('currentTime') ?
      parseInt(localStorage.getItem('currentTime')) : currentTime;
    const timeSpent = currentTime - timeout;
    const message = localStorage.getItem('notifyMSG');
    if (message !== msg) {
      localStorage.setItem('notifyMSG', msg);
      localStorage.setItem('currentTime', currentTime);
      enqueueSnackbar(msg, option);
    } else {
      if (timeSpent > 10) {
        localStorage.setItem('notifyMSG', msg);
        localStorage.setItem('currentTime', currentTime);
        enqueueSnackbar(msg, option);
      }
    }
  };

  const value = {
    notify
  };
  return (
    <NotifyContext.Provider value={value}>{children}</NotifyContext.Provider>
  );
}
