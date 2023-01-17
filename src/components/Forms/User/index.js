import React, { useState, useEffect } from 'react';
import { DefaultCard } from '@app/components/Cards';
import { CustomInput, CustomTextArea } from '@app/components/Custom';
import useStyles from './style';
import { Button } from '@material-ui/core';
import { CustomSelectBox } from '@app/components/Custom';
import USStateData from '@app/constants/states.json';

const UserForm = ({
  resources,
  data,
  setData,
  initialData,
  children,
  setWhenState
}) => {
  const classes = useStyles();

  useEffect(() => {
    if (resources.data) {
      const {
        first_name,
        last_name,
        email,
        address,
        // phone_number,
        state
      } = resources.data;
      setData({ first_name, last_name, email, address, state });
    } else {
      setData(initialData);
    }
  }, [resources]);

  const handleInputChange = (type, value) => {
    setData((oldState) => ({ ...oldState, [type]: value }));
    setWhenState('update', true);
  };

  const { first_name, last_name, email, address, state } = data;
  return (
    <>
      <DefaultCard style={classes.root} px={1}>
        <CustomInput
          label="First Name"
          variant="outlined"
          size="small"
          type="text"
          style={classes.inputArea}
          resources={first_name}
          onChange={(value) => handleInputChange('first_name', value)}
        />
        <CustomInput
          label="Last Name"
          variant="outlined"
          size="small"
          type="text"
          style={classes.inputArea}
          resources={last_name}
          onChange={(value) => handleInputChange('last_name', value)}
        />
        <CustomInput
          label="Email"
          variant="outlined"
          size="small"
          type="email"
          style={classes.inputArea}
          resources={email}
          onChange={(value) => handleInputChange('email', value)}
        />
        {/* <CustomInput
          label="Phone Number"
          variant="outlined"
          size="small"
          type="number"
          style={classes.inputArea}
          resources={phone_number}
          onChange={(value) => handleInputChange('phone_number', value)}
        /> */}
        <CustomTextArea
          min={2}
          max={4}
          label="Address"
          style={classes.textArea}
          resources={address}
          onChange={(value) => handleInputChange('address', value)}
        />
        <CustomSelectBox
          id="us-states"
          style={classes.selectBox}
          label="state"
          value={state}
          defaultValue={state}
          variant="outlined"
          resources={USStateData}
          onChange={(selected) => handleInputChange('state', selected.value)}
        />
        {children}
      </DefaultCard>
    </>
  );
};

export default UserForm;
