import { isAuthenticated } from '@app/utils/auth';
import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { getVersionString, emptyCache } from '@app/utils/functions';
import { Auth } from 'aws-amplify';

const PrivateRoute = ({ component: Component, layout: Layout, ...rest }) => {
  const [isAuth, setLoggedIn] = useState(-1);
  const [isLastVersion, setLastVersion] = useState(true);
  useEffect(() => {
    (async () => {
      setLoggedIn(isAuthenticated() ? 1 : 0);
      const current = localStorage.getItem('existVersion');
      const prevVersion = await getVersionString();
      setLastVersion(current === prevVersion);
    })();
  });

  useEffect(() => {
    if (isAuth && !isLastVersion) {
      // emptyCache();
      // Auth.signOut();
    }
  }, [isAuth, isLastVersion]);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuth === 0 ? (
          <Redirect to="/"></Redirect>
        ) : (
          isAuth === 1 && (
            <Layout>
              <Component {...props} />
            </Layout>
          )
        )
      }
    />
  );
};

export default PrivateRoute;
