import React, { useEffect, useState } from 'react';
import {
  Switch,
  withRouter,
  Redirect,
  useHistory,
  Route
} from 'react-router-dom';
import { DashboardLayout } from '@app/layouts';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import GoogleClassContainer from '@app/containers/Google';
import MaterialContainer from '@app/containers/Lesson';
import MyMaterialContainer from '@app/containers/MyLesson';
import GalleryContainer from '@app/containers/Gallery';
import UserContainer from '@app/containers/User';
import TutorialContainer from '@app/containers/Tutorial';
import TopologyContainer from '@app/containers/Topology';
import LibraryContainer from '@app/containers/Library';
import MessageContainer from '@app/containers/SystemMessage';
import DeviceContainer from '@app/containers/Devices';
import ArchivesContainer from '@app/containers/Archives';
import ResourcesContainer from '@app/containers/Resources';
import ClearContainer from '@app/containers/Clear';
import PrivacyPolicy from '@app/containers/PrivacyPolicy';
import { Auth } from 'aws-amplify';
import { useIdleTimer } from 'react-idle-timer';
import { useUserContext } from '@app/providers/UserContext';
import { clearLocalStorage } from '@app/utils/functions';

const AppRoutes = () => {
  const idleTimeout = 1000 * 60 * 30;
  const [currentUser] = useUserContext();
  const handleOnIdle = async (e) => {
    clearLocalStorage();
    window.sessionStorage.setItem('last_path', window.location.pathname);
    window.sessionStorage.setItem('user_name', currentUser?.name);
    try {
      if ((await Auth.currentSession()).isValid()) {
        await Auth.signOut();
      }
    } catch (e) {}
    window.location.reload();
  };

  const handleOnAction = async (e) => {
    const lastActionTime = localStorage.getItem('lastActionTime');
    localStorage.setItem('lastActionTime', new Date().getTime());

    if (
      lastActionTime &&
      new Date().getTime() - parseInt(lastActionTime) > idleTimeout
    ) {
      clearLocalStorage();
      window.sessionStorage.setItem('last_path', window.location.pathname);
      window.sessionStorage.setItem('user_name', currentUser?.name);
      try {
        if ((await Auth.currentSession()).isValid()) {
          await Auth.signOut();
        }
      } catch (e) {}

      window.location.reload();
    }
  };

  const handleSwitchChange = (event) => {};

  useIdleTimer({
    timeout: idleTimeout,
    onIdle: handleOnIdle,
    onAction: handleOnAction,
    debounce: 500
  });

  useEffect(() => {
    return () => {};
  }, []);

  const [locationKeys, setLocationKeys] = useState([]);
  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      if (history.action === 'PUSH') {
        setLocationKeys([location.key]);
      }

      if (history.action === 'POP') {
        if (locationKeys[1] === location.key) {
          setLocationKeys(([_, ...keys]) => keys);
          // Handle forward event
        } else {
          setLocationKeys((keys) => [location.key, ...keys]);
          window.sessionStorage.setItem('last_path', window.location.pathname);
          window.sessionStorage.setItem('user_name', currentUser?.name);
          window.location.reload();
        }
      }
    });
  }, [locationKeys]);

  return (
    <Switch onChange={handleSwitchChange}>
      <PublicRoute path="/dashboard" layout={DashboardLayout} />
      <Route path={'/privacy-policy'} component={PrivacyPolicy} />
      <PrivateRoute
        path="/classes/google/:classId?"
        component={GoogleClassContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/libraries/:libraryId?"
        component={LibraryContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/materials/:materialId?"
        component={MaterialContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/mymaterials"
        component={MyMaterialContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/galleries"
        component={GalleryContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/tutorials"
        component={TutorialContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/users/:userId?"
        component={UserContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/devices"
        component={DeviceContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/topology"
        component={TopologyContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/message"
        component={MessageContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/archives"
        component={ArchivesContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/resources"
        component={ResourcesContainer}
        layout={DashboardLayout}
      />
      <PrivateRoute
        path="/clear"
        component={ClearContainer}
        layout={DashboardLayout}
      />
      <Redirect from="/emp-studentapp" to="/emp-studentapp/index.html" />
      <Redirect from="*" to="/topology" />
    </Switch>
  );
};

export default withRouter(AppRoutes);
