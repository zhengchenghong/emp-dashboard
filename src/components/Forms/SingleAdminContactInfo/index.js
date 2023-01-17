import React, { useState, useEffect, useRef } from 'react';
import { DefaultCard } from '@app/components/Cards';
import {
  CustomInput,
  CustomSelectBox,
  CustomNumberInput,
  CustomTextArea
} from '@app/components/Custom';
import useStyles from './style';
import { Box, Button, Grid, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';

const RolesResource = [
  { label: 'Station Administrator', value: 'stationAdmin' },
  { label: 'General', value: 'general' }
];

const SingleAdminContactInfoForm = ({
  resources,
  data,
  setData,
  initialData,
  setWhenState,
  style
}) => {
  const classes = useStyles();
  useEffect(() => {
    if (resources.data) {
      const {
        role,
        first_name,
        last_name,
        email,
        address,
        phone_number,
        sms,
        state
      } = resources.data;
      setData({
        role,
        first_name,
        last_name,
        email,
        address,
        phone_number,
        state,
        sms
      });
    } else {
      setData(initialData);
    }
  }, [resources]);

  const handleChange = (type, value) => {
    setData((oldState) => ({ ...oldState, [type]: value }));
    setWhenState('update', true);
  };

  const {
    first_name,
    last_name,
    email,
    address,
    phone_number,
    state,
    role,
    sms
  } = data;

  return (
    <>
      <DefaultCard style={classes.root} px={1}>
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Grid item xs={12} md={12} lg={6}>
            <CustomSelectBox
              label="Role"
              id="class-types"
              // value={type}
              variant="outlined"
              resources={RolesResource}
              style={classes.selectBox}
              defaultValue={role}
              onChange={(selected) => handleChange('role', selected.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <CustomInput
              label="Email Address"
              variant="outlined"
              size="small"
              type="text"
              name="email"
              value={email}
              style={classes.inputArea}
              onChange={(value) => handleChange('email', value)}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <CustomInput
              label="First Name"
              variant="outlined"
              size="small"
              type="text"
              name="firstname"
              value={first_name}
              style={classes.inputArea}
              onChange={(value) => handleChange('first_name', value)}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <CustomInput
              label="Last Name"
              variant="outlined"
              size="small"
              type="text"
              name="lastname"
              value={last_name}
              style={classes.inputArea}
              onChange={(value) => handleChange('last_name', value)}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <CustomInput
              label="SMS"
              variant="outlined"
              size="small"
              type="text"
              name="sms"
              value={sms}
              style={classes.inputArea}
              onChange={(value) => handleChange('sms', value)}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <CustomNumberInput
              label="Phone Number"
              variant="outlined"
              size="small"
              name="phonenumber"
              value={phone_number}
              style={classes.inputArea}
              onChange={(value) => handleChange('phone_number', value)}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <CustomTextArea
              min={2}
              max={4}
              style={classes.textArea}
              resources={address}
              onChange={(value) => handleChange('address', value)}
            />
          </Grid>
        </Grid>
      </DefaultCard>
    </>
  );
};

export default SingleAdminContactInfoForm;
