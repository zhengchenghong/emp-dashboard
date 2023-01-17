/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSubscription } from '@apollo/client';
import CssBaseline from '@material-ui/core/CssBaseline';
import Navbar from '@app/components/Navbar';
import { MainSidebar, SecondarySidebar } from '@app/components/Sidebar';
import { TempGlobalStatus } from '@app/components/Temp';
import AppContext from '@app/AppContext';
import { useWindowSize } from '@app/utils/hooks/window';
import graphql from '@app/graphql';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { clearLocalStorage } from '@app/utils/functions';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    paddingTop: 49,
    position: 'relative'
  },
  pageWrapper: {
    minHeight: `calc(100vh - 91px)`
  }
}));

const EducatorLayout = (props) => {
  const classes = useStyles();
  const windowSize = useWindowSize();
  const [openLeft, setOpenLeft] = useState(true);
  const [openRight, setOpenRight] = useState(true);
  const [type, setType] = useState('');
  const [context, setContext] = useContext(AppContext);
  const { notify } = useNotifyContext();
  const [userProfile, setUserProfile] = useState();

  useEffect(() => {
    if (windowSize.width) {
      let width, height;
      height = windowSize.height - 95;

      if (!openLeft && !openRight) width = windowSize.width - 70;
      if (openLeft && !openRight) width = windowSize.width - 200;
      if (!openLeft && openRight) width = windowSize.width - 366;
      if (openLeft && openRight) width = windowSize.width - 490;

      setContext({ ...context, containerSize: { width, height } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize, openLeft, openRight]);

  const resSubGroupingAdd = useSubscription(graphql.subscriptions.groupingAdd);

  useEffect(() => {
    if (!resSubGroupingAdd.loading && !resSubGroupingAdd.error) {
      const { groupingAdd } = resSubGroupingAdd.data;
      setContext({ ...context, groupingAdd, newDoc: groupingAdd });
    }
  }, [
    resSubGroupingAdd.loading,
    resSubGroupingAdd.error,
    resSubGroupingAdd.data
  ]);

  const resSubDocumentDelete = useSubscription(
    graphql.subscriptions.documentDelete
  );

  useEffect(() => {
    if (!resSubDocumentDelete.loading && !resSubDocumentDelete.error) {
      const { documentDelete } = resSubDocumentDelete.data;
      setContext({ ...context, documentDelete });
    }
  }, [
    resSubDocumentDelete.loading,
    resSubDocumentDelete.error,
    resSubDocumentDelete.data
  ]);

  const resSubGroupingUpdate = useSubscription(
    graphql.subscriptions.groupingUpdate
  );

  useEffect(() => {
    if (!resSubGroupingUpdate.loading && !resSubGroupingUpdate.error) {
      const { groupingUpdate } = resSubGroupingUpdate.data;
      setContext({ ...context, groupingUpdate });
    }
  }, [
    resSubGroupingUpdate.loading,
    resSubGroupingUpdate.error,
    resSubGroupingUpdate.data
  ]);

  useEffect(() => {
    const storageProfile = window.localStorage.getItem('profile');
    console.log(storageProfile);
    if (!storageProfile) {
      notify('Invalid Cache!', { variant: 'error' });
      clearLocalStorage();
    } else {
      try {
        const profile = JSON.parse(storageProfile);
        console.log(profile);
        setUserProfile(profile);
      } catch (error) {
        notify('Invalid Cache!', { variant: 'error' });
        clearLocalStorage();
      }
    }
  }, []);

  const handleSidebar = (value) => {
    setOpenLeft(value);
  };

  const handleNBItemClicked = (value) => {
    setType(value);
    setOpenRight(!openRight);
  };
  console.log(userProfile?.schemaType);
  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar
        layout="dashboard"
        open={openLeft}
        onElClick={handleNBItemClicked}
      />
      <MainSidebar
        open={openLeft}
        onChange={handleSidebar}
        userInfo={{ email: userProfile?.name, role: userProfile?.schemaType }}
      />
      <main className={classes.content}>
        <div className={classes.pageWrapper}>{props.children}</div>
        <TempGlobalStatus />
      </main>
      <SecondarySidebar type={type} open={openRight} />
    </div>
  );
};

export default EducatorLayout;
