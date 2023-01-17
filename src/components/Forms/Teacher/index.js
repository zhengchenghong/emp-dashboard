import React from 'react';
import { Grid, Box, TextField, Typography, Divider } from '@material-ui/core';
import { DefaultCard } from '@app/components/Cards';
import useStyles from './style';

const TeacherForm = () => {
  const classes = useStyles();
  return (
    <DefaultCard style={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Teacher Detail
      </Typography>
      <Divider />
      <Grid container>
        <Grid item xs={12}>
          <Box
            className={classes.inputArea}
            component={TextField}
            label="First Name"
            type="text"
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            className={classes.inputArea}
            component={TextField}
            label="Last Name"
            type="text"
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            className={classes.inputArea}
            component={TextField}
            label="Address"
            type="address"
            variant="outlined"
            size="small"
          />
        </Grid>
        {/* <Grid item xs={12}>
          <Box
            className={classes.inputArea}
            component={TextField}
            label="Phone Number"
            type="tel"
            variant="outlined"
            size="small"
          />
        </Grid> */}
        <Grid item xs={12}>
          <Box
            className={classes.inputArea}
            component={TextField}
            label="Sms Number"
            type="tel"
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>
    </DefaultCard>
  );
};

export default TeacherForm;
