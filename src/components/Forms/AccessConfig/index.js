import React from 'react';
import { CustomInput } from '@app/components/Custom';
import { Grid } from '@material-ui/core';
import useStyles from './style';

const AccessConfigForm = ({ onInputChange, canvas }) => {
  const classes = useStyles();

  const handleInputChange = (type, value) => {
    onInputChange(type, value);
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      columns={12}
      spacing={2}
    >
      <Grid item xs={12} style={{ width: '100%' }}>
        <CustomInput
          rows={1}
          label="BASE URL"
          variant="outlined"
          size="small"
          type="text"
          name="baseUrl"
          style={classes.textfield}
          resources={canvas.baseUrl}
          onChange={(value) => handleInputChange('baseUrl', value)}
        />
      </Grid>
      <Grid item xs={12} style={{ width: '100%' }}>
        <CustomInput
          rows={1}
          label="CLIENT ID"
          variant="outlined"
          size="small"
          type="text"
          name="clientId"
          style={classes.textfield}
          resources={canvas.clientId}
          onChange={(value) => handleInputChange('clientId', value)}
        />
      </Grid>
      <Grid item xs={12} style={{ width: '100%' }}>
        <CustomInput
          rows={1}
          label="SECRET KEY"
          variant="outlined"
          size="small"
          type="text"
          name="secretkey"
          style={classes.textfield}
          resources={canvas.secretkey}
          onChange={(value) => handleInputChange('secretkey', value)}
        />
      </Grid>
      <Grid item xs={12} style={{ width: '100%' }}>
        <CustomInput
          rows={1}
          label="REDIRECT URI"
          variant="outlined"
          size="small"
          type="text"
          name="redirectUri"
          style={classes.textfield}
          resources={canvas.redirectUri}
          onChange={(value) => handleInputChange('redirectUri', value)}
        />
      </Grid>
    </Grid>
  );
};

export default AccessConfigForm;
