import { isAuthenticated } from '@app/utils/auth';
import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

/**
 * Restricted Route is the route which allows user only
 * when he is not authenticated.
 * As like Login Page.
 * In this case , they are login and forgot password page.
 * After authentication he should not able to go login page again.
 *  */
const RestrictedRoute = ({ component: Component, layout: Layout, ...rest }) => {
  const [isAuth, setLoggedIn] = useState(-1);
  const [userProfile, setUserProfile] = useState();

  useEffect(() => {
    (async () => {
      const storageProfile = window.localStorage.getItem('profile');
      if (!storageProfile) {
      } else {
        try {
          const profile = JSON.parse(storageProfile);
          setUserProfile(profile);
        } catch (error) {}
      }
      setLoggedIn((await isAuthenticated()) ? 1 : 0);
    })();
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => {
        return isAuth === 1 ? (
          userProfile?.schemaType === 'educator' ? (
            <Redirect to="/materials/dashboard"></Redirect>
          ) : (
            <Redirect to="/dashboard"></Redirect>
          )
        ) : isAuth === 0 ? (
          <Layout>
            <Component {...props} />
          </Layout>
        ) : (
          <></>
        );
      }}
    />
  );
};

export default RestrictedRoute;
