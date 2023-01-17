import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Typography,
  Grid,
  TextField
} from '@material-ui/core';
import useStyles from './style';
import { DefaultCard } from '@app/components/Cards';
import moment from 'moment';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { getNotificationOpt } from '@app/constants/Notifications';

const firstSet = [0, 1, 2];
const secondSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const thirdSet = [0, 1, 2, 3, 4, 5];
const fourthSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const initialTime = {
  first: 0,
  second: 0,
  third: 0,
  fourth: 0
};

const NumberSelect = ({ state, setState, dataSet, disabled }) => {
  const classes = useStyles();
  return (
    <FormControl variant="outlined" style={{ margin: 2 }}>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
        value={state}
        classes={{ icon: classes.icon, select: classes.select }}
        onChange={(event) => setState(event.target.value)}
        renderValue={(value) => (
          <Typography style={{ fontSize: '1.25rem' }}>{value}</Typography>
        )}
        disabled={disabled}
      >
        {dataSet?.map((item) => (
          <MenuItem value={item} key={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const ConfigForm = ({
  selectedTime,
  savingConfig,
  type,
  scheduleData,
  lifecycleData,
  title,
  onChange
}) => {
  const classes = useStyles();
  const [time, setTime] = useState(initialTime);
  const [updateTime, setUpdateTime] = useState();
  const { notify } = useNotifyContext();
  const [loadedData, setLoadedData] = useState({
    status: scheduleData?.status,
    startAt: scheduleData?.startAt,
    endAt: scheduleData?.endAt
  });

  const [lifecycle, setLifecycle] = useState({
    archiveOn: lifecycleData?.archiveOn,
    deleteOn: lifecycleData?.deleteOn,
    publishedOn: lifecycleData?.publishedOn,
    unpublishedOn: lifecycleData?.unpublishedOn
  });

  useEffect(() => {
    setLifecycle({
      archiveOn: lifecycleData?.archiveOn,
      deleteOn: lifecycleData?.deleteOn,
      publishedOn: lifecycleData?.publishedOn,
      unpublishedOn: lifecycleData?.unpublishedOn
    });
  }, [lifecycleData]);

  useEffect(() => {
    setLoadedData({
      ...scheduleData
    });
  }, [scheduleData]);

  useEffect(() => {
    const hours = Math.floor(parseInt(selectedTime) / 60);
    const minutes = selectedTime ? parseInt(selectedTime) % 60 : 0;

    console.log(hours);
    console.log(minutes);
    if (hours.toString().length === 2) {
      setTime((time) => ({
        ...time,
        first: parseInt(hours.toString()[0]),
        second: parseInt(hours.toString()[1])
      }));
    } else {
      setTime((time) => ({
        ...time,
        first: 0,
        second: isNaN(hours) ? 0 : hours
      }));
    }

    if (minutes.toString().length === 2) {
      setTime((time) => ({
        ...time,
        third: parseInt(minutes.toString()[0]),
        fourth: parseInt(minutes.toString()[1])
      }));
    } else {
      setTime((time) => ({ ...time, third: 0, fourth: minutes }));
    }
  }, [selectedTime]);

  useEffect(() => {
    if (updateTime) {
      console.log(time);
      const hours = parseInt(`${time.first}${time.second}`) * 60;
      const minutes = parseInt(`${time.third}${time.fourth}`);
      const newTime = hours + minutes;
      console.log(hours);
      console.log(minutes);
      onChange(newTime);
    }
  }, [updateTime]);

  const handleTimeChange = (value, key) => {
    if (key === 'first' && value === 2) {
      if (time?.second > 3) {
        setTime((time) => ({ ...time, [key]: value, second: 3 }));
      } else {
        setTime((time) => ({ ...time, [key]: value }));
      }
    } else {
      setTime((time) => ({ ...time, [key]: value }));
    }
    setUpdateTime(time);
  };

  const handleInputChange = (type, value) => {
    if (type === 'startAt') {
      let startDate = moment(value, 'YYYY-MM-DDTHH:mm');
      let endDate = moment(loadedData?.endAt, 'YYYY-MM-DDTHH:mm');
      if (startDate && endDate) {
        if (startDate > endDate) {
          const notiOps = getNotificationOpt('material', 'warning', 'schedule');
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
    }
    if (type === 'endAt') {
      let startDate = moment(loadedData?.startAt, 'YYYY-MM-DDTHH:mm');
      let endDate = moment(value, 'YYYY-MM-DDTHH:mm');
      if (startDate && endDate) {
        if (startDate > endDate) {
          const notiOps = getNotificationOpt('material', 'warning', 'schedule');
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
    }
    if (type === 'publishedOn') {
      let published = moment(value, 'YYYY-MM-DDTHH:mm');
      let unpublished = moment(lifecycle?.unpublishedOn, 'YYYY-MM-DDTHH:mm');
      if (published && unpublished) {
        if (published > unpublished) {
          const notiOps = getNotificationOpt('material', 'warning', 'schedule');
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
    }
    if (type === 'unpublishedOn') {
      let published = moment(lifecycle?.publishedOn, 'YYYY-MM-DDTHH:mm');
      let unpublished = moment(value, 'YYYY-MM-DDTHH:mm');
      if (published && unpublished) {
        if (published > unpublished) {
          const notiOps = getNotificationOpt('material', 'warning', 'schedule');
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
    }

    if (['startAt', 'endAt'].includes(type)) {
      let tmp = loadedData;
      setLoadedData({
        ...tmp,
        [type]: value
      });
      if (onChange) {
        onChange('schedule', {
          ...tmp,
          [type]: new Date(value).toISOString()
        });
      }
    } else {
      let tmp = lifecycle;
      setLifecycle({
        ...tmp,
        [type]: value
      });
      if (onChange) {
        onChange('lifecycle', {
          ...tmp,
          [type]: value
        });
      }
    }
  };

  const isMaterial = () => {
    if (type === 'material' || type === 'myMaterial') {
      return true;
    } else if (type === 'sharedLesson' || type === 'sharedResource') {
      return true;
    } else {
      return false;
    }
  };

  const checkConfig = () => {
    let types = [
      'school',
      'material',
      'myMaterial',
      'sharedResource',
      'sharedLesson'
    ];
    if (types.includes(type)) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    console.log(time);
  }, [time]);

  return (
    <div
      className={classes.scheduleContainer}
      style={{
        marginLeft: type === 'school' ? 20 : 0
      }}
    >
      {type === 'school' && (
        <>
          <DefaultCard style={classes.schedule}>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <TextField
                id="time"
                label="&nbsp;&nbsp;ArchiveOn"
                type="datetime-local"
                value={lifecycle?.archiveOn ? lifecycle?.archiveOn : ''}
                className={classes.scheduleTextField}
                InputProps={{ disableUnderline: true }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300 // 5 min
                }}
                onChange={(event) =>
                  handleInputChange('archiveOn', event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 20 }}>
              <TextField
                id="time"
                label="&nbsp;&nbsp;DeleteOn"
                type="datetime-local"
                value={lifecycle?.deleteOn ? lifecycle?.deleteOn : ''}
                className={classes.scheduleTextField}
                InputProps={{ disableUnderline: true }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300 // 5 min
                }}
                onChange={(event) =>
                  handleInputChange('deleteOn', event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 20 }}>
              <TextField
                id="time"
                label="&nbsp;&nbsp;Published On"
                type="datetime-local"
                value={lifecycle?.publishedOn ? lifecycle?.publishedOn : ''}
                className={classes.scheduleTextField}
                InputProps={{ disableUnderline: true }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300 // 5 min
                }}
                onChange={(event) =>
                  handleInputChange('publishedOn', event.target.value)
                }
                disabled
              />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 20 }}>
              <TextField
                id="time"
                label="&nbsp;&nbsp;Unpublished On"
                type="datetime-local"
                value={lifecycle?.unpublishedOn ? lifecycle?.unpublishedOn : ''}
                className={classes.scheduleTextField}
                InputProps={{ disableUnderline: true }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300 // 5 min
                }}
                onChange={(event) =>
                  handleInputChange('unpublishedOn', event.target.value)
                }
                // disabled={!lifecycle?.publishedOn}
              />
            </Grid>
          </DefaultCard>
        </>
      )}
      {type === 'class' && (
        <DefaultCard style={classes.schedule}>
          <Grid item xs={12} style={{ paddingTop: 20 }}>
            <TextField
              id="time"
              label="&nbsp;&nbsp;Published On"
              type="datetime-local"
              value={lifecycle?.publishedOn ? lifecycle?.publishedOn : ''}
              className={classes.scheduleTextField}
              InputProps={{ disableUnderline: true }}
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                step: 300 // 5 min
              }}
              onChange={(event) =>
                handleInputChange('publishedOn', event.target.value)
              }
              disabled
            />
          </Grid>
          <Grid item xs={12} style={{ paddingTop: 20 }}>
            <TextField
              id="time"
              label="&nbsp;&nbsp;Unpublished On"
              type="datetime-local"
              value={lifecycle?.unpublishedOn ? lifecycle?.unpublishedOn : ''}
              className={classes.scheduleTextField}
              InputProps={{ disableUnderline: true }}
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                step: 300 // 5 min
              }}
              onChange={(event) =>
                handleInputChange('unpublishedOn', event.target.value)
              }
              // disabled={!lifecycle?.publishedOn}
            />
          </Grid>
        </DefaultCard>
      )}
      {isMaterial() && (
        <DefaultCard style={classes.schedule}>
          <Grid item xs={12} style={{ display: 'flex', flexDirection: 'row' }}>
            <Grid item xs={12} style={{ paddingTop: 20 }}>
              <TextField
                id="time"
                label="&nbsp;&nbsp;Published On"
                type="datetime-local"
                value={lifecycle?.publishedOn ? lifecycle?.publishedOn : ''}
                className={classes.scheduleTextField}
                InputProps={{ disableUnderline: true }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300 // 5 min
                }}
                onChange={(event) =>
                  handleInputChange('publishedOn', event.target.value)
                }
                disabled
              />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 20, marginLeft: 12 }}>
              <TextField
                id="time"
                label="&nbsp;&nbsp;Unpublished On"
                type="datetime-local"
                value={lifecycle?.unpublishedOn ? lifecycle?.unpublishedOn : ''}
                className={classes.scheduleTextField}
                InputProps={{ disableUnderline: true }}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  step: 300, // 5 min
                  min: lifecycle?.publishedOn
                }}
                onChange={(event) =>
                  handleInputChange('unpublishedOn', event.target.value)
                }
                // disabled={!lifecycle?.publishedOn}
              />
            </Grid>
          </Grid>
        </DefaultCard>
      )}
      {checkConfig() && (
        <div className={classes.configScheduleItemContainer}>
          <Typography style={{ marginRight: 20 }}>{title}</Typography>
          <div style={{ display: 'flex' }}>
            <div>
              <NumberSelect
                state={time?.first}
                dataSet={firstSet}
                setState={(value) => handleTimeChange(value, 'first')}
                disabled={savingConfig}
              />
              <Typography style={{ marginTop: 10, textAlign: 'center' }}>
                H
              </Typography>
            </div>
            <div>
              <NumberSelect
                state={time?.second}
                dataSet={time?.first === 2 ? [0, 1, 2, 3] : secondSet}
                setState={(value) => handleTimeChange(value, 'second')}
                disabled={savingConfig}
              />
              <Typography style={{ marginTop: 10, textAlign: 'center' }}>
                H
              </Typography>
            </div>
            <div>
              <Typography
                style={{ marginTop: 10, bold: 900, alignSelf: 'center' }}
              >
                {' '}
                :{' '}
              </Typography>
              <Typography
                style={{ marginTop: 20, bold: 900, alignSelf: 'center' }}
              >
                {' '}
                :{' '}
              </Typography>
            </div>
            <div>
              <NumberSelect
                state={time?.third}
                dataSet={thirdSet}
                setState={(value) => handleTimeChange(value, 'third')}
                disabled={savingConfig}
              />
              <Typography style={{ marginTop: 10, textAlign: 'center' }}>
                M
              </Typography>
            </div>
            <div>
              <NumberSelect
                state={time?.fourth}
                dataSet={fourthSet}
                setState={(value) => handleTimeChange(value, 'fourth')}
                disabled={savingConfig}
              />
              <Typography style={{ marginTop: 10, textAlign: 'center' }}>
                M
              </Typography>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigForm;
