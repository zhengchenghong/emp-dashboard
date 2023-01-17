import React, { useState } from 'react';
import { Box, Divider } from '@material-ui/core';
import { getCurrentUTCTime } from '@app/utils/date-manager';
import useStyles from './style';
import { getVersionString } from '@app/utils/functions';
import { useSmallScreen } from '@app/utils/hooks';
import { useHistory } from 'react-router-dom';

const GlobalStatus = ({ width, open }) => {
  const classes = useStyles();
  const [version, setVersion] = useState('');
  const isSmallScreen = useSmallScreen();
  const history = useHistory();

  if (!version) {
    getVersionString().then((data) => {
      setVersion(data);
    });
  }

  return (
    <Box
      className={classes.root}
      // style={{
      //   width: isSmallScreen
      //     ? '100%'
      //     : open
      //       ? 'calc(100% - 180px)'
      //       : 'calc(100% - 40px)',
      //   zIndex: 1000,
      //   right: 0
      // }}
    >
      <Divider />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pl={3}
        pr={3}
        height={40}
      >
        <p className={classes.p} style={{ fontSize: isSmallScreen ? 12 : 13 }}>
          © Copyright 2022 Signal Infrastructure Group PBC. All rights reserved.
        </p>
        <p
          className={classes.privacyPolicy}
          onClick={() => history.push('/privacy-policy')}
        >
          Privacy Policy
        </p>
        <p className={classes.p} style={{ fontSize: isSmallScreen ? 12 : 13 }}>
          {/* {getCurrentUTCTime().substr(0, 10)} Version: {versionData.version}{' '}
          Branch: {versionData.branch} */}
          {version}
        </p>
      </Box>
    </Box>
  );
};

export default GlobalStatus;
