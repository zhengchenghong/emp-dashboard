import React from 'react';
import { Box, Typography, Divider, IconButton } from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import { useAssetContext } from '@app/providers/AssetContext';
import TableForm from './Table';
import useStyles from './style';
import { en } from '@app/language';

const UserPreviewForm = ({ onChange }) => {
  const classes = useStyles();

  const { userTableHeader, userTableLoadData } = useAssetContext();

  return (
    <React.Fragment>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" className={classes.previewTitle}>
          {en['Preview uploaded CSV file']}( {en['total rows']}:{' '}
          {userTableLoadData?.length} )
        </Typography>
        <IconButton onClick={() => onChange('clear')}>
          <ClearIcon />
        </IconButton>
      </Box>
      <Divider className={classes.separator} />
      <TableForm
        header={userTableHeader}
        resources={userTableLoadData}
        showMode="preview"
      />
    </React.Fragment>
  );
};

export default UserPreviewForm;
