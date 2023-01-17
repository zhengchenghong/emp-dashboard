import React from 'react';
import { Box, Button } from '@material-ui/core';
import useStyles from './style';

const CustomButton = ({ name }) => {
  const classes = useStyles();

  return (
    <Box component={Button} className={classes.root}>
      {name}
    </Box>
  );
};
export default CustomButton;
