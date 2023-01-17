import React from 'react';
import { Auth } from 'aws-amplify';
import Button from '@material-ui/core/Button';
import { getNotificationOpt } from '@app/constants/Notifications';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Box, TextField, Typography } from '@material-ui/core';
import useStyles from './style';
import { DefaultCard } from '@app/components/Cards';
import { useInput } from '@app/utils/hooks/form';
import Config from '@app/Config';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { en } from '@app/language';

const VerificationCode = ({
  email,
  handle,
  handleUpdateAuthState,
  sentCode,
  sentCount,
  handleUpdatePage
}) => {
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const { notify } = useNotifyContext();

  React.useEffect(() => {
    if (sentCode === true) {
      const notiOps = getNotificationOpt('user', 'success', 'sentCode');
      notify(notiOps.message, notiOps.options);

      if (sentCount > 2) {
        handleUpdatePage();
      }
    }
  }, [sentCode, sentCount]);

  const { value: vcode, bind: bindVCode } = useInput('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      console.log('$44');
      Auth.forgotPasswordSubmit(email, vcode, Config.aws.aws_user_pools_id)
        .then((data) => {
          handle(Config.aws.aws_user_pools_id);
        })
        .catch((error) => {
          notify(error.message, { variant: 'error' });
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(error.message, notiOps.options);
      setLoading(false);
    }
  };

  return (
    <Box className={classes.root}>
      <DefaultCard>
        <Box className={classes.form}>
          <Typography className={classes.title} variant="h6">
            {en['Enter Verification Code']}
          </Typography>
          <TextField
            className={classes.textfield}
            label={en['Verification Code']}
            type="text"
            {...bindVCode}
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
              {en['Submit']}
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

export default VerificationCode;
