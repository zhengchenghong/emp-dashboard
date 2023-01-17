import React from 'react';
import {
  Authenticator,
  SignIn,
  Greetings,
  ForgotPassword
} from 'aws-amplify-react';
import config from '@app/Config';
import MySignIn from './Login';
import ForgotPasswordContainer from './ForgotPassword';
import { Link, Route, Switch } from 'react-router-dom';
import PrivacyPolicy from '../PrivacyPolicy';

const types = [
  'superAdmin',
  'sysAdmin',
  'stationAdmin',
  'districtAdmin',
  'schoolAdmin',
  'educator'
];

const AuthContainer = ({ children }) => {
  return (
    <div>
      <Switch>
        <Route path={'/privacy-policy'} component={PrivacyPolicy} />
        <Authenticator
          hide={[SignIn, ForgotPassword, Greetings]}
          // onStateChange={onStateChange}
          amplifyConfig={config.aws}
          federated={{
            googleClientId:
              '798060219259-tconre7aslsq0tamq8b9bt0fg9sansq3.apps.googleusercontent.com'
          }}
        >
          <MySignIn />
          <ForgotPasswordContainer />
          {children}
        </Authenticator>
      </Switch>
    </div>
  );
};

export default AuthContainer;
