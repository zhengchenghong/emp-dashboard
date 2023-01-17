import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, IconButton } from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import TableForm from './Table';
import useStyles from './style';

const UserPreviewForm = ({ resources, onChange }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" className={classes.previewTitle}>
          {resources?.name}
        </Typography>
        <IconButton onClick={() => onChange('clear')}>
          <ClearIcon />
        </IconButton>
      </Box>
      <Divider className={classes.separator} />
    </React.Fragment>
  );
};

export default UserPreviewForm;
