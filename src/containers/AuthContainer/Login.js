import React from 'react';
import { Auth } from 'aws-amplify';
import { SignIn } from 'aws-amplify-react';
import GoogleLogin from 'react-google-login';
import { Img } from 'react-image';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  Typography,
  CircularProgress,
  FormControlLabel,
  MuiThemeProvider,
  FormHelperText,
  ButtonBase,
  IconButton,
  InputAdornment
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { useLazyQuery } from '@apollo/client';
import { DefaultCard } from '@app/components/Cards';
import config from '@app/Config';
import theme from '@app/styles/theme';
import useStyles from './style';
import { withStyles } from '@material-ui/core/styles';
import { Cookies } from 'react-cookie';
import { withSnackbar } from 'notistack';
import { isPrivateMode } from '@app/utils/isPrivateMode';
// App constants
import { AUTH_USER_TOKEN_KEY } from '@app/utils/constants';
import { UserContext } from '@app/providers/UserContext';
import {
  convertStringToBase64Encode,
  convertBase64EncodetoString
} from '@app/utils/remember_me';
import { getVersionString } from '@app/utils/functions';
import { en } from '@app/language';
import SvgIcon from '@material-ui/core/SvgIcon';

function GoogleIcon(props) {
  return (
    <SvgIcon
      className="google"
      fontSize="inherit"
      style={{ width: 25, height: 25 }}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Google"
        role="img"
        viewBox="0 0 512 512"
      >
        <rect width="512" height="512" rx="15%" fill="#fff" />
        <path
          fill="#4285f4"
          d="M386 400c45-42 65-112 53-179H260v74h102c-4 24-18 44-38 57z"
        />
        <path
          fill="#34a853"
          d="M90 341a192 192 0 0 0 296 59l-62-48c-53 35-141 22-171-60z"
        />
        <path
          fill="#fbbc02"
          d="M153 292c-8-25-8-48 0-73l-63-49c-23 46-30 111 0 171z"
        />
        <path
          fill="#ea4335"
          d="M153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55z"
        />
      </svg>
    </SvgIcon>
  );
}

const types = [
  'superAdmin',
  'sysAdmin',
  'stationAdmin',
  'districtAdmin',
  'schoolAdmin',
  'educator'
];
class MySignIn extends SignIn {
  static contextType = UserContext;
  constructor(props) {
    super(props);
    this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
    this.responseGoogle = this.responseGoogle.bind(this);
  }

  state = {
    showPassword: false,
    loading: false,
    formData: {
      username: '',
      password: ''
    },
    rememberPassword: false,
    isIncognitoMode: false
  };

  checkIncognitoMode() {
    isPrivateMode().then((isYes) => {
      this.setState({
        isIncognitoMode: isYes
      });
    });
  }

  componentDidMount() {
    // window.localStorage.setItem('profile', JSON.stringify({ user: null }));
    if (window.location.pathname !== '/') {
      window.location.pathname = '/';
    }
    const cookies = new Cookies();
    let cookieEmail, cookiePassword;
    const loginInfo = cookies.get('login_info');
    if (loginInfo) {
      cookieEmail = convertBase64EncodetoString(loginInfo?.split('::')[0]);
      cookiePassword = convertBase64EncodetoString(loginInfo?.split('::')[1]);
    }
    const remember_me = cookies.get('remember_me');
    if (remember_me === 'true') {
      this.setState((state) => ({
        ...state,
        formData: { username: cookieEmail, password: cookiePassword },
        showPassword: false,
        rememberPassword: remember_me === 'true'
      }));
    } else {
      this.setState((state) => ({
        ...state,
        formData: { username: '', password: '' },
        showPassword: false,
        rememberPassword: remember_me === 'true'
      }));
    }

    this.checkIncognitoMode();
  }

  componentDidUpdate(prevProps, prevState) {
    const { isIncognitoMode } = this.state;
    const { isIncognitoMode: prevIncognito } = prevState;
    if (isIncognitoMode !== prevIncognito && isIncognitoMode) {
      this.setState((state) => ({
        ...state,
        formData: { username: '', password: '' },
        showPassword: false,
        rememberPassword: false
      }));
    }
  }

  updateAuthState = (authState) => {
    this.changeState(authState);
  };

  handleClickShowPassword = () => {
    this.setState((state) => ({ ...state, showPassword: !state.showPassword }));
  };

  handleInputChange = (e) => {
    const { formData } = this.state;
    const { value, name } = e.target;
    if (name === 'username' && value.length === 0) {
      this.setState((state) => ({
        ...state,
        formData: { [name]: value, password: '' }
      }));
    } else {
      this.setState((state) => ({
        ...state,
        formData: { ...formData, [name]: value }
      }));

      if (name === 'username') {
        let password = this.getCredential(value);
        setTimeout(() => {
          let remember_me = true;
          if (!password || password === '') {
            remember_me = false;
          }
          this.setState({
            formData: {
              ...this.state.formData,
              password
            },
            showPassword: false,
            rememberPassword: remember_me
          });
        }, 10);
      }
    }
  };

  putCredential = (username, password) => {
    const cookies = new Cookies();
    let credentials = cookies.get('credentials') || {};

    credentials = {
      ...credentials,
      [username]: password
    };

    cookies.set('credentials', JSON.stringify(credentials), { path: '/' });
  };

  removeCredential = (username) => {
    const cookies = new Cookies();
    let credentials = cookies.get('credentials') || {};
    delete credentials[username];

    cookies.set('credentials', JSON.stringify(credentials), { path: '/' });
  };

  getCredential = (username) => {
    const cookies = new Cookies();
    let credentials = cookies.get('credentials') || {};
    return credentials[username] || '';
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSubmit(e);
    }
  };

  handleSubmit = async (e) => {
    const cookies = new Cookies();
    const { isIncognitoMode } = this.state;
    const remember_me = cookies.get('remember_me');
    try {
      e.preventDefault();
      this.setState((state) => ({ loading: true }));
      const { formData, rememberPassword } = this.state;

      if (rememberPassword) {
        if (!isIncognitoMode) {
          convertStringToBase64Encode(formData.username, formData.password);
          this.putCredential(formData.username, formData.password);
        }
      } else {
        if (remember_me === 'false') {
          cookies.remove('email');
          cookies.remove('password');
          cookies.set('remember_me', 'false', { path: '/' });
          this.removeCredential(formData.username);
        }
      }

      const user = await Auth.signIn(formData.username, formData.password);

      if (user) {
        if (!types.includes(user.attributes['custom:userrole'])) {
          // this.props.enqueueSnackbar('User not exist', {
          //   variant: 'error'
          // });
          this.setState((state) => ({ loading: false }));
          // await Auth.signOut();
          // window.location.reload();
          return;
        } else {
          this.storedIdTokenToLocalStorage(
            user.signInUserSession.idToken.getJwtToken()
          );
          this.context[0] = '';
          this.context[2] = true;
          this.startUpdateIdTokenUsingRefreshToken();
          this.storeVersionData();
          localStorage.setItem('lastActionTime', new Date().getTime());
        }
      }

      if (rememberPassword && !isIncognitoMode) {
        this.setState((state) => ({
          ...state,
          loading: false,
          showPassword: false
        }));
      } else {
        this.setState((state) => ({
          ...state,
          loading: false,
          formData: { username: '', password: '' },
          showPassword: false
        }));
      }
    } catch (error) {
      if (error.name === 'InvalidParameterException') {
        this.props.enqueueSnackbar('Please enter your password', {
          variant: 'error'
        });
      } else if (error.name === 'TypeError') {
        this.props.enqueueSnackbar('Please enter both email and password.', {
          variant: 'error'
        });
      } else {
        // console.log('Failed ===>');
        // this.props.enqueueSnackbar(error.message, { variant: 'error' });
      }
      this.setState((state) => ({ loading: false }));
    }
  };

  signInWithGoogle = async (response) => {
    this.setState((state) => ({ loading: true }));
    let res = await Auth.federatedSignIn({ provider: 'Google' });
    this.setState((state) => ({ loading: false }));
  };

  responseGoogle(response) {}

  handleChechbox = (e) => {
    const isChecked = e.target.type === 'checkbox' && !e.target.checked;
    this.setState((state) => ({
      ...state,
      rememberPassword: !isChecked
    }));
  };

  storeVersionData = async () => {
    getVersionString().then((data) => {
      localStorage.setItem('existVersion', data);
    });
  };

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  startUpdateIdTokenUsingRefreshToken = () => {
    const timer = setInterval(async () => {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const { refreshToken } = cognitoUser.getSignInUserSession();
      cognitoUser.refreshSession(refreshToken, (err, session) => {
        if (err) clearTimeout(timer);
        else {
          this.storedIdTokenToLocalStorage(session.idToken.getJwtToken());
        }
      });
    }, 2 * 1000 * 60);
  };

  storedIdTokenToLocalStorage = (token) => {
    window.localStorage.setItem(AUTH_USER_TOKEN_KEY, token);
  };

  showComponent() {
    const { showPassword, loading, rememberPassword } = this.state;
    const { classes } = this.props;

    return (
      <div className="Auth-wrapper">
        <MuiThemeProvider theme={theme}>
          <Box className={classes.root}>
            <DefaultCard>
              <form className={classes.form} autoComplete="off">
                <div style={{ width: '100%', marginBottom: 15 }}>
                  <img
                    src={config.auth.topLogo}
                    alt="Logo"
                    className={classes.topLogo}
                  />
                </div>

                <Typography className={classes.title} variant="h6">
                  {en['Login to your account']}
                </Typography>
                <TextField
                  onChange={this.handleInputChange}
                  className={classes.textfield}
                  id="username"
                  label={en['Username/Email']}
                  data-prop={'username'}
                  autoComplete="username"
                  type="email"
                  defaultValue={this.state?.formData?.username}
                  value={this.state?.formData?.username}
                  inputProps={{
                    key: 'username',
                    name: 'username'
                  }}
                />
                <TextField
                  onChange={this.handleInputChange}
                  className={classes.textfield}
                  id="password"
                  label={en['Password']}
                  data-prop={'password'}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  defaultValue={this.state?.formData?.password}
                  value={this.state?.formData?.password}
                  inputProps={{
                    key: 'password',
                    name: 'password'
                  }}
                  onKeyDown={(e) => this.handleKeyPress(e)}
                  // {...bindPassword}
                  InputProps={{
                    // <-- This is where the toggle button is added.
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.handleClickShowPassword}
                          onMouseDown={this.handleMouseDownPassword}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Grid container display="flex" justifyContent="space-between">
                  <FormControlLabel
                    label={en['Remember me']}
                    control={
                      <Checkbox
                        checked={rememberPassword}
                        onChange={(event) => this.handleChechbox(event)}
                        name="antoine"
                        style={{
                          color: '#607d8b'
                        }}
                      />
                    }
                  />

                  <FormHelperText>
                    {en['Forgot your password?']}{' '}
                    <ButtonBase
                      onClick={() => this.updateAuthState('forgotPassword')}
                      className="inlineTextButton"
                    >
                      {en['Reset']}
                    </ButtonBase>
                  </FormHelperText>
                </Grid>
                <Button
                  variant="contained"
                  size="large"
                  className={classes.loginButton}
                  onClick={this.handleSubmit}
                >
                  {loading && (
                    <CircularProgress size={20} className={classes.mr20} />
                  )}
                  {en['Login to Your Account']}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  className={classes.googleLogin}
                  startIcon={<GoogleIcon />}
                  onClick={this.signInWithGoogle}
                >
                  {en['Login with Google']}
                </Button>
                <a
                  href="mailto:support@pmep.org"
                  className={classes.linktextleft}
                >
                  {en['Trouble Logging in? Contact Support.']}
                </a>
              </form>
              <Box className={classes.poweredbyContainer}>
                <Grid item>
                  <a href="/privacy-policy" className={classes.privacyPolicy}>
                    Privacy Policy
                  </a>
                </Grid>
                <Grid item className={classes.poweredBy}>
                  {en['Powered By']} &nbsp;
                  <Img
                    src={config.auth.bottomLogo}
                    alt="Bottom Logo"
                    className={classes.bottomlogo}
                  ></Img>
                </Grid>
              </Box>
            </DefaultCard>
          </Box>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withSnackbar(
  withStyles(useStyles, { withTheme: true })(MySignIn)
);
