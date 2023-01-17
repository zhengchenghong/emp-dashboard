import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { Auth } from 'aws-amplify';
import Button from '@material-ui/core/Button';
import { getNotificationOpt } from '@app/constants/Notifications';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useInput } from '@app/utils/hooks/form';
import { DefaultCard } from '@app/components/Cards';
import useStyles from './style';
import { Box, Typography } from '@material-ui/core';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { en } from '@app/language';

const SendVerification = ({ handle, handleUpdateAuthState }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { notify } = useNotifyContext();

  const { value: email, bind: bindEmail } = useInput('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      console.log(e);
      if (validateEmail(email)) {
        const data = await Auth.forgotPassword(email);
        handle(email);
      } else {
        setLoading(false);
        const notiOps = getNotificationOpt('extra', 'error', 'email');
        notify(notiOps.message, notiOps.options);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(error.message, notiOps.options);
    }
  };

  const validateEmail = () => {
    return new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(email);
  };

  return (
    <Box className={classes.root}>
      <DefaultCard>
        <Box className={classes.form}>
          <Typography className={classes.title} variant="h6">
            {en['Reset your password']}
          </Typography>
          <TextField
            error={!validateEmail() && email.length > 0}
            className={classes.textfield}
            label={en['Email']}
            {...bindEmail}
            type="email"
            helperText={
              validateEmail() || !email.length > 0
                ? ''
                : en['Please enter your email address']
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <div
            style={{
              display: 'grid',
              gridAutoFlow: 'column',
              gridColumnGap: '15px'
            }}
          >
            <Button
              variant="contained"
              className={classes.actionButton}
              size="large"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading && (
                <CircularProgress size={20} className={classes.mr20} />
              )}
              {en['Send code']}
            </Button>
            <Button
              variant="contained"
              className={classes.actionButton}
              size="large"
              onClick={() => handleUpdateAuthState('signIn')}
              disabled={loading}
            >
              {en['Cancel']}
            </Button>
          </div>
        </Box>
      </DefaultCard>
    </Box>
  );
};

export default SendVerification;
