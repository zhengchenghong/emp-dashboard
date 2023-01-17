/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Grid, Typography } from '@material-ui/core';
import { CustomInput } from '@app/components/Custom';
import { DefaultCard } from '@app/components/Cards';
import { SaveHelperText } from '@app/components/Text';
import * as globalStyles from '@app/constants/globalStyles';
import { useSelectionContext } from '@app/providers/SelectionContext';

const SingleContactForm = ({
  disable,
  resources,
  onChange,
  helperText,
  title,
  onSaveContents
}) => {
  const classes = globalStyles.DescCardStyle();
  const { isLastTab, setIsLastTab, selectFirstOnInfo, setSelectFirstOnInfo } =
    useSelectionContext();
  const [loadedData, setLoadedData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();

  useEffect(() => {
    if (selectFirstOnInfo) {
      firstNameRef.current?.focus();
      setSelectFirstOnInfo(false);
    }
  }, [selectFirstOnInfo]);

  useEffect(() => {
    setLoadedData({
      ...loadedData,
      ...resources
    });
  }, [resources]);

  const handleInputChange = (type, value) => {
    setLoadedData({
      ...loadedData,
      [type]: value
    });
    onChange({
      ...loadedData,
      [type]: value
    });
  };

  const handleKeyDown = (e, change) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      if (onSaveContents) onSaveContents(loadedData);
      firstNameRef.current.blur();
      lastNameRef.current.blur();
      emailRef.current.blur();
      phoneRef.current.blur();
    }

    if (e.keyCode === 9 && e.target.name === 'phone') {
      setIsLastTab(true);
      e.preventDefault();
    }
  };

  const getTitle = () => {
    if (title) {
      return title;
    } else {
      return 'Educator';
    }
  };

  return (
    <React.Fragment>
      {disable ? (
        <React.Fragment></React.Fragment>
      ) : (
        <Grid
          container
          spacing={4}
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          // style={{
          //   padding: 20
          // }}
        >
          <Grid item xs={12}>
            <Typography variant="body2">{getTitle()} Contact Info:</Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={12}
            lg={12}
            style={{ paddingTop: 0, width: '100%' }}
          >
            <CustomInput
              rows={1}
              label="First Name"
              variant="outlined"
              size="small"
              type="text"
              name="firstName"
              disabled={disable}
              inputRef={firstNameRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.classInput]: true
              })}
              resources={loadedData.firstName}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('firstName', value)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={12}
            lg={12}
            style={{ paddingTop: 0, width: '100%' }}
          >
            <CustomInput
              rows={1}
              label="Last Name"
              variant="outlined"
              size="small"
              type="text"
              name="lasttName"
              disabled={disable}
              inputRef={lastNameRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.classInput]: true
              })}
              resources={loadedData.lastName}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('lastName', value)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={12}
            lg={12}
            style={{ paddingTop: 0, width: '100%' }}
          >
            <CustomInput
              rows={1}
              label="Email"
              variant="outlined"
              size="small"
              type="text"
              name="email"
              disabled={disable}
              inputRef={emailRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.classInput]: true
              })}
              resources={loadedData.email}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('email', value)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={12}
            lg={12}
            style={{ paddingTop: 0, width: '100%' }}
          >
            <CustomInput
              rows={1}
              label="Phone Number"
              variant="outlined"
              size="small"
              type="text"
              name="phone"
              disabled={disable}
              inputRef={phoneRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.classInput]: true
              })}
              resources={loadedData.phone}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('phone', value)}
            />
          </Grid>
          {helperText && <SaveHelperText />}
        </Grid>
        // </DefaultCard>
      )}
    </React.Fragment>
  );
};

export default SingleContactForm;
