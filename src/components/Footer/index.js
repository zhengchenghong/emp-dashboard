import React from 'react';
import { Box, Divider } from '@material-ui/core';
import useStyles from './style';

const Footer = ({ type, width }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {type === 'dashboard' && (
        <React.Fragment>
          <Divider />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pl={3}
            pr={3}
            height={40}
          >
            <p className={classes.p}>© SIG MLC, LLC.</p>
            <p className={classes.p}>
              <b>Public Media Group</b>
            </p>
          </Box>
        </React.Fragment>
      )}
      {type === 'app' && <>app footer</>}
    </Box>
  );
};

export default Footer;
