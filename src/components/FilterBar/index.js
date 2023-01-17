/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@material-ui/core';
import graphql from '@app/graphql';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useUserContext } from '@app/providers/UserContext';
import useStyles from './style';
import SystemNotifcation from '../SystemNotification';
import { useHistory } from 'react-router-dom';
import { useLessonViewModeContext } from '@app/providers/LessonViewModeContext';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { Cookies } from 'react-cookie';
import { en } from '@app/language';
import { useMenuContext } from '@app/providers/MenuContext';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import FiltersView from '../FiltersView';

const CustomFilterBar = ({ showOnlyFilters }) => {
  const classes = useStyles();
  const pathName = window.location.pathname;
  const [currentUser] = useUserContext();
  const [systemMessages, setSystemMessages] = useState([]);
  const isSmallScreen = useSmallScreen();
  const [isShowingSystemNotification, setShowingSystemNotification] = useState(
    true //!localStorage.getItem('hideSystemNotification')
  );
  const [messageWidth, setMessageWidth] = useState('100%');
  const [, , , , isLeftMenuOpen, setIsLeftMenuOpen] = useMenuContext();

  const history = useHistory();
  const { lessonViewMode, setLessonViewMode } = useLessonViewModeContext();

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode === lessonViewMode || newViewMode == null) return;
    const cookies = new Cookies();
    cookies.set('viewMode', newViewMode);

    setLessonViewMode(newViewMode);
  };

  const userInfo = currentUser || null;
  const [fetchTimer, setFetchTimer] = useState();

  const [
    getSystemMessages,
    {
      loading: systemNotificationsLoading,
      data: systemNotificationsData,
      error: systemNotificationsError
    }
  ] = useLazyQuery(graphql.queries.grouping, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const fetchSystemMessages = async () => {
    await getSystemMessages({
      variables: {
        schemaType: 'sysMessage'
      }
    });
  };

  useEffect(async () => {
    fetchSystemMessages();
    fetchMessagesEvery10mins();
  }, []);

  useEffect(() => {
    if (
      !systemNotificationsLoading &&
      !systemNotificationsError &&
      systemNotificationsData
    ) {
      let currentDate = new Date();
      setSystemMessages(
        systemNotificationsData?.grouping?.filter(
          (item) =>
            (currentDate > new Date(item.schedule?.startAt) &&
              currentDate < new Date(item.schedule?.endAt)) ||
            (currentDate > new Date(item.schedule?.startAt) &&
              item.schedule?.endAt == null) ||
            (item.schedule?.startAt == null && item.schedule?.endAt == null)
        )
      );
    }
  }, [
    systemNotificationsLoading,
    systemNotificationsData,
    systemNotificationsError
  ]);

  useEffect(() => {
    setMessageWidth(
      isSmallScreen
        ? '100%'
        : userInfo?.schemaType !== 'superAdmin' &&
          userInfo?.schemaType !== 'sysAdmin' &&
          (history?.location?.pathname.includes('/materials') ||
            history?.location?.pathname.includes('/topology'))
        ? history?.location?.pathname.includes('/materials')
          ? 'calc(100% - 160px)'
          : userInfo?.schemaType === 'stationAdmin'
          ? 'calc(100% - 124px)'
          : '100%'
        : history?.location?.pathname.includes('/topology')
        ? 'calc(100% - 373px)'
        : history?.location?.pathname.includes('/materials')
        ? 'calc(100% - 553px)'
        : '100%'
    );
  }, [history?.location?.pathname, isLeftMenuOpen, isSmallScreen]);

  const fetchMessagesEvery10mins = () => {
    if (fetchTimer) clearInterval(fetchTimer);
    const interval = setInterval(function () {
      fetchSystemMessages();
      console.log('refetch multiassets');
    }, 600000);
    setFetchTimer(interval);
    console.log('timer triggered');
  };

  const handleClickCloseButton = () => {
    setShowingSystemNotification(false);
    localStorage.setItem('hideSystemNotification', true);
  };

  return (
    <Box
      className={classes.root}
      style={
        showOnlyFilters && {
          justifyContent: 'center',
          paddingRight: 3,
          paddingLeft: 3
        }
      }
    >
      <FiltersView />
      {!showOnlyFilters && (
        <div
          style={{
            height: '48px',
            width: messageWidth,
            // width: 'inherit',
            marginRight: 0,
            border: '1px solid #dddddd',
            borderRadius: '3px',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {isShowingSystemNotification && (
            <div
              style={{
                width: '100%'
              }}
            >
              <SystemNotifcation // systemNotificationsData
                list={systemMessages}
                onClose={handleClickCloseButton}
              />
            </div>
          )}
        </div>
      )}
      {pathName.includes('/materials') && !isSmallScreen && (
        <Grid style={{ display: 'flex', marginLeft: 5 }}>
          <ToggleButtonGroup
            value={lessonViewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view-mode"
            style={{
              paddingBottom: '1px',
              height: 40,
              width: 'max-content'
            }}
          >
            <ToggleButton
              value="List View"
              aria-label="left aligned"
              classes={{ label: classes.toggleButton }}
            >
              List View
            </ToggleButton>
            <ToggleButton
              value="Card View"
              aria-label="centered"
              classes={{ label: classes.toggleButton }}
            >
              Card View
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      )}
    </Box>
  );
};

export default CustomFilterBar;
