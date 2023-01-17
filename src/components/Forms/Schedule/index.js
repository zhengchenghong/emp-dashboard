import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField } from '@material-ui/core';
import { CustomInput, CustomSelectBox } from '@app/components/Custom';
import { CustomDateTimePicker } from '@app/components/Custom';
import moment from 'moment';
import { useNotifyContext } from '@app/providers/NotifyContext';
import useStyles from './style';
import { useSmallScreen } from '@app/utils/hooks';
import useMediumScreen from '@app/utils/hooks/useMediumScreen';

const MessageStatus = [
  { label: 'Start now', value: 'active' },
  { label: 'Start in 24 hours', value: 'inactive' },
  { label: 'Expired', value: 'expired' },
  { label: 'Clear', value: 'clear' }
];

const convertUTCDateToLocalDate = (date) => {
  if (date == null) return null;
  var newDate = new Date(date);
  newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return newDate.toISOString().slice(0, 16);
};

const ScheduleForm = ({ resources, onChange, messageStatus }) => {
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const classes1 = useStyles();
  const { notify } = useNotifyContext();
  const [loadedData, setLoadedData] = useState({
    startAt: resources?.startAt,
    endAt: resources?.endAt
  });
  const [status, setStatus] = useState('');
  const [mStatus, setMStatus] = useState(messageStatus);

  useEffect(() => {
    var currentTimeStamp = new Date();
    var currentTime = convertUTCDateToLocalDate(currentTimeStamp);
    // var startTime = convertUTCDateToLocalDate(loadedData?.startAt);
    // var endTime = convertUTCDateToLocalDate(loadedData?.endAt);
    if (loadedData?.startAt == null && loadedData?.endAt == null) {
      setStatus('clear');
      setMStatus('Always Available');
    } else {
      if (loadedData?.status === 'active') {
        setMStatus('Always Available');
      }
      if (loadedData?.status === 'expired') {
        setMStatus('Expired');
      }
      if (loadedData?.status === 'inactive') {
        setMStatus('Inactive');
      }
      if (loadedData?.status === 'clear') {
        setMStatus('Always Available');
      }
      setStatus(loadedData?.status);
    }
  }, [loadedData]);

  // useEffect(() => {
  //   var currentTimeStamp = new Date();
  //   var currentTime = convertUTCDateToLocalDate(currentTimeStamp);
  //   // var startTime = convertUTCDateToLocalDate(loadedData?.startAt);
  //   // var endTime = convertUTCDateToLocalDate(loadedData?.endAt);
  //   if (loadedData?.startAt == null) {
  //     if (loadedData?.endAt == null) {
  //       setStatus('clear');
  //       setMStatus('Always Available');
  //     } else {
  //       if (loadedData?.endAt < currentTime) {
  //         setStatus('expired');
  //         setMStatus('Expired');
  //       } else {
  //         setStatus('active');
  //         setMStatus('Always Available');
  //       }
  //     }
  //   } else {
  //     if (loadedData?.startAt <= currentTime) {
  //       if (loadedData?.endAt == null) {
  //         setStatus('active');
  //         setMStatus('Always Available');
  //       } else if (loadedData?.endAt <= currentTime) {
  //         setStatus('expired');
  //         setMStatus('Expired');
  //       } else {
  //         setStatus('active');
  //         setMStatus('Available');
  //       }
  //     } else {
  //       setStatus('inactive');
  //       setMStatus('Inactive');
  //     }
  //   }
  // }, [loadedData]);

  useEffect(() => {
    setLoadedData({
      ...loadedData,
      ...resources
    });
    // setStatus(resources.status);
  }, [resources]);

  const handleInputChange = (type, value) => {
    var currentTimeStamp = new Date();
    // var currentTime = convertUTCDateToLocalDate(currentTimeStamp);
    let tmp = loadedData;
    if (type === 'startAt') {
      let startAt = new Date(value).getTime();
      let endAt = new Date(loadedData.endAt).getTime();
      if (loadedData.endAt) {
        if (endAt < startAt + 5 * 60000) {
          notify('EndAt must not be before StartAt', {
            autoHideDuration: 5000,
            variant: 'error'
          });
          // return;
        }
        setStatus(null);
        setMStatus('');
      }
    }
    if (type === 'endAt') {
      let startAt = new Date(loadedData.startAt).getTime();
      let endAt = new Date(value).getTime();
      if (loadedData.startAt) {
        if (endAt < startAt + 5 * 60000) {
          notify('EndAt must not be before StartAt', {
            autoHideDuration: 5000,
            variant: 'error'
          });
          // return;
        }
      }
      // if (endAt < currentTimeStamp) {
      //   setMStatus('Inactive');
      // } else {
      //   setMStatus('Always Available');
      // }
      setStatus(null);
      setMStatus('');
    }
    if (type === 'status') {
      if (value === 'active') {
        var startAtTimeStamp = new Date();
        var endAt = null;
        var startAt = convertUTCDateToLocalDate(startAtTimeStamp);
        endAt = convertUTCDateToLocalDate(endAt);
        tmp = { ...tmp, startAt: startAt, endAt: endAt };
        setMStatus('Always Available');
      } else if (value === 'inactive') {
        let startAtTimeStamp = new Date(
          new Date().getTime() + 24 * 3600 * 1000
        );
        let startAt = convertUTCDateToLocalDate(startAtTimeStamp);
        let endAt = null;
        tmp = { ...tmp, startAt: startAt, endAt: endAt };
        setMStatus('Inactive');
      } else if (value === 'expired') {
        let startAtTimeStamp = new Date(
          new Date().getTime() - 24 * 3600 * 1000
        );
        let endAtTimeStamp = new Date(new Date().getTime() - 60 * 1000);
        let startAt = convertUTCDateToLocalDate(startAtTimeStamp);
        let endAt = convertUTCDateToLocalDate(endAtTimeStamp);
        tmp = { ...tmp, startAt: startAt, endAt: endAt };
        setMStatus('Expired');
      } else if (value === 'clear') {
        tmp = { ...tmp, startAt: null, endAt: null };
        setMStatus('Always Available');
      }
      setStatus(value);
    }

    setLoadedData({
      ...tmp,
      [type]: value === 'clear' ? null : value
    });
    onChange({
      ...tmp,
      [type]: value === 'clear' ? null : value
    });
  };

  return (
    <React.Fragment>
      <Grid
        spacing={4}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={6}
          xl={6}
          style={isSmallScreen || isMediumScreen ? {} : { paddingRight: 6 }}
        >
          <CustomSelectBox
            variant="outlined"
            label="Select a schedule option:"
            style={classes1.selectFilter}
            noPadding={true}
            value={status}
            resources={MessageStatus}
            onChange={(event) => handleInputChange('status', event.value)}
            size="small"
            type="resetTime"
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={6}
          xl={6}
          style={
            isSmallScreen || isMediumScreen
              ? { paddingLeft: 12, paddingTop: 0 }
              : { paddingLeft: 6 }
          }
        >
          <Typography variant="h6" style={{ fontSize: '0.8rem' }}>
            Status
          </Typography>
          <Typography variant="h6" style={{ fontSize: '1rem' }}>
            {mStatus ? mStatus : ''}
          </Typography>
        </Grid>
      </Grid>
      <Grid
        spacing={4}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={6}
          xl={6}
          style={
            isSmallScreen || isMediumScreen
              ? { paddingBottom: 0, paddingTop: 6 }
              : { paddingRight: 6 }
          }
        >
          <TextField
            id="time"
            label="&nbsp;&nbsp;Start At"
            type="datetime-local"
            value={loadedData.startAt ? loadedData.startAt : ''}
            className={classes1.scheduleTextField}
            InputProps={{ disableUnderline: true }}
            InputLabelProps={{
              shrink: true
            }}
            inputProps={{
              step: 300, // 5 min,
              max: loadedData.endAt
            }}
            onChange={(event) =>
              handleInputChange('startAt', event.target.value)
            }
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={6}
          xl={6}
          style={
            isSmallScreen || isMediumScreen
              ? { paddingTop: 6 }
              : { paddingLeft: 6 }
          }
        >
          <TextField
            id="time"
            label="&nbsp;&nbsp;End At"
            type="datetime-local"
            value={loadedData.endAt ? loadedData.endAt : ''}
            className={classes1.scheduleTextField}
            InputProps={{ disableUnderline: true }}
            InputLabelProps={{
              shrink: true
            }}
            inputProps={{
              step: 300, // 5 min,
              min: loadedData.startAt
            }}
            onChange={(event) => handleInputChange('endAt', event.target.value)}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default ScheduleForm;
