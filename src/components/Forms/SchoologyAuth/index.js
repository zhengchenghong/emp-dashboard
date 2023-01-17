import React from 'react';
import { CustomInput } from '@app/components/Custom';
import { Grid } from '@material-ui/core';
import useStyles from './style';

const SchoologyAuth = ({ onInputChange, schoology }) => {
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
          label="Consumer Key"
          variant="outlined"
          size="small"
          type="text"
          name="key"
          style={classes.textfield}
          resources={schoology?.key}
          onChange={(value) => handleInputChange('key', value)}
        />
      </Grid>
      <Grid item xs={12} style={{ width: '100%' }}>
        <CustomInput
          rows={1}
          label="Consumer secret"
          variant="outlined"
          size="small"
          type="text"
          name="secret"
          style={classes.textfield}
          resources={schoology?.secret}
          onChange={(value) => handleInputChange('secret', value)}
        />
      </Grid>
    </Grid>
  );
};

export default SchoologyAuth;
