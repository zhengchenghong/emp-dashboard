import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import Button from '@material-ui/core/Button';
import { getNotificationOpt } from '@app/constants/Notifications';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  Box,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Tooltip,
  Typography,
  withStyles
} from '@material-ui/core';
import useStyles from './style';
import { useInput } from '@app/utils/hooks/form';
import { DefaultCard } from '@app/components/Cards';
import {
  Check,
  Visibility,
  VisibilityOff,
  ErrorOutline
} from '@material-ui/icons';
import Config from '@app/Config';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { en } from '@app/language';

var specialCaseFormat = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
var numbersFormat = /\d/;
var upperCaseFormat = /[A-Z]/;

const SubmitPassword = ({ email }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { notify } = useNotifyContext();

  const { value: password, bind: bindPassword } = useInput('');
  const { value: confirm, bind: bindConfirm } = useInput('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      const validateResult = validatePassword();
      if (!validateResult.success) {
        notify(validateResult.msg, { variant: 'error' });
        setLoading(false);
        return;
      }

      const currentUser = await Auth.signIn(
        email,
        Config.aws.aws_user_pools_id
      );

      await Auth.changePassword(
        currentUser,
        Config.aws.aws_user_pools_id,
        password
      );

      const notiOps = getNotificationOpt('user', 'success', 'passwordChange');
      notify(notiOps.message, notiOps.options);
      await Auth.signOut();
    } catch (error) {
      console.log(error);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(error.message, notiOps.options);
      setLoading(false);
    }
  };

  const validatePassword = () => {
    if (password.length < 8) {
      return {
        success: false,
        msg: 'Password is greater than 8 characters.'
      };
    }
    if (!upperCaseFormat.test(password)) {
      return {
        success: false,
        msg: 'Password must have at least 1 uppercase character.'
      };
    }
    if (!numbersFormat.test(password)) {
      return {
        success: false,
        msg: 'Password must have numbers.'
      };
    }
    if (!specialCaseFormat.test(password)) {
      return {
        success: false,
        msg: 'Password must have symbol characters.'
      };
    }
    if (password !== confirm) {
      return {
        success: false,
        msg: 'The passwords do not match.'
      };
    }
    return {
      success: true,
      msg: 'Password reset correctly!'
    };
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirm = () => {
    setShowConfirm(!showConfirm);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 300,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9'
    }
  }))(Tooltip);

  return (
    <Box className={classes.root}>
      <DefaultCard>
        <Box className={classes.form}>
          <Typography className={classes.title} variant="h6">
            {en['Submit New Password']}
          </Typography>
          <FormControl className={classes.textfield}>
            <InputLabel htmlFor="standard-adornment-password">
              {en['Password']}
            </InputLabel>
            <Input
              error={
                (password?.length > 0 && password?.length < 8) ||
                (password?.length > 0 && !upperCaseFormat.test(password)) ||
                (password?.length > 0 && !numbersFormat.test(password)) ||
                (password?.length > 0 && !specialCaseFormat.test(password))
              }
              id="standard-adornment-password"
              type={showPassword ? 'text' : 'password'}
              {...bindPassword}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <Box className={classes.colorRed}>
              {password && password.length < 8
                ? en['Password must be greater than 8 characters.']
                : password && !upperCaseFormat.test(password)
                ? en['Password must have at least 1 uppercase character.']
                : password && !specialCaseFormat.test(password)
                ? en['Password must have symbol characters.']
                : password && !numbersFormat.test(password)
                ? en['Password must have numbers.']
                : ''}
            </Box>
          </FormControl>
          <FormControl className={classes.textfield}>
            <InputLabel htmlFor="standard-adornment-password">
              {en['Confirm']}
            </InputLabel>
            <Input
              error={confirm.length > 0 && password !== confirm}
              id="standard-adornment-password"
              type={showConfirm ? 'text' : 'password'}
              {...bindConfirm}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirm}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showConfirm ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              onKeyDown={(e) => handleKeyPress(e)}
            />
            <Box className={classes.colorRed}>
              {confirm && password !== confirm
                ? en['The passwords do not match.']
                : ''}
            </Box>
          </FormControl>
          <HtmlTooltip
            title={
              <React.Fragment>
                <Box className={classes.passwordhint}>
                  <Box>
                    <Box>
                      <b> {en['Password Must:']}</b>
                    </Box>
                    <Grid
                      container
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      {password.length >= 8 ? (
                        <Check
                          className={classes.colorGreen}
                          fontSize="small"
                        />
                      ) : (
                        <ErrorOutline
                          className={classes.colorUnable}
                          fontSize="small"
                        />
                      )}

                      <Box
                        className={
                          password.length >= 8 ? '' : classes.colorUnable
                        }
                      >
                        &nbsp;&nbsp;&nbsp;{en['More than 8 characters']}
                      </Box>
                    </Grid>
                    <Grid
                      container
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      {password?.length > 0 &&
                      upperCaseFormat.test(password) ? (
                        <Check
                          className={classes.colorGreen}
                          fontSize="small"
                        />
                      ) : (
                        <ErrorOutline
                          className={classes.colorUnable}
                          fontSize="small"
                        />
                      )}

                      <Box
                        className={
                          password.length > 0 && upperCaseFormat.test(password)
                            ? ''
                            : classes.colorUnable
                        }
                      >
                        &nbsp;&nbsp;&nbsp;
                        {en['Must have at least 1 uppercase character']}
                      </Box>
                    </Grid>
                    <Grid
                      container
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      {password?.length > 0 &&
                      specialCaseFormat.test(password) ? (
                        <Check
                          className={classes.colorGreen}
                          fontSize="small"
                        />
                      ) : (
                        <ErrorOutline
                          className={classes.colorUnable}
                          fontSize="small"
                        />
                      )}

                      <Box
                        className={
                          password.length > 0 &&
                          specialCaseFormat.test(password)
                            ? ''
                            : classes.colorUnable
                        }
                      >
                        &nbsp;&nbsp;&nbsp;{en['Must have special characters']}
                      </Box>
                    </Grid>
                    <Grid
                      container
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      {password?.length > 0 && numbersFormat.test(password) ? (
                        <Check
                          className={classes.colorGreen}
                          fontSize="small"
                        />
                      ) : (
                        <ErrorOutline
                          className={classes.colorUnable}
                          fontSize="small"
                        />
                      )}

                      <Box
                        className={
                          password.length > 0 && numbersFormat.test(password)
                            ? ''
                            : classes.colorUnable
                        }
                      >
                        &nbsp;&nbsp;&nbsp;{en['Must have Numbers']}
                      </Box>
                    </Grid>
                    {confirm && password === confirm ? (
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                      >
                        <Check
                          className={classes.colorGreen}
                          fontSize="small"
                        />
                        <Box component="span">
                          &nbsp;&nbsp;&nbsp;{en['Be confirmed']}
                        </Box>
                      </Grid>
                    ) : (
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                      >
                        <ErrorOutline
                          className={classes.colorUnable}
                          fontSize="small"
                        />
                        <Box component="span" className={classes.colorUnable}>
                          &nbsp;&nbsp;&nbsp;{en['Be confirmed']}
                        </Box>
                      </Grid>
                    )}
                  </Box>
                </Box>
              </React.Fragment>
            }
            placement="right"
            arrow
          >
            <Button
              variant="contained"
              className={classes.actionButton}
              size="large"
              onClick={handleSubmit}
              disabled={
                !confirm ||
                password !== confirm ||
                password?.length < 8 ||
                !specialCaseFormat.test(password) ||
                loading
              }
            >
              {loading && (
                <CircularProgress size={20} className={classes.mr20} />
              )}
              {en['Submit']}
            </Button>
          </HtmlTooltip>
        </Box>
      </DefaultCard>
    </Box>
  );
};

export default SubmitPassword;
