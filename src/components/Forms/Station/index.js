/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import { CustomSelectBox } from '@app/components/Custom';
import { useStateContext } from '@app/providers/StateContext';
import AppContext from '@app/AppContext';
import useStyles from './style';

const NoneSelected = () => (
  <Typography
    gutterBottom
    variant="subtitle1"
    component="h2"
    style={{ marginLeft: 5 }}
  >
    Null
  </Typography>
);

const StationForm = ({
  disable,
  document,
  resources,
  onChange,
  size,
  customDefaultValue
}) => {
  const classes = useStyles();
  const [stateContext] = useStateContext();
  const [isNew, setIsNew] = useState(false);
  const [appContext] = useContext(AppContext);

  useEffect(() => {
    setIsNew(false);
    if (appContext && appContext.newDoc) {
      if (appContext?.newDoc?._id === document?._id) {
        setIsNew(true);
      }
    }
  }, [appContext, document]);

  const handleChange = (data) => {
    onChange(data.value);
  };

  return (
    <Box className={classes.root}>
      {disable ? (
        <Grid container direction="row" alignItems="baseline">
          <Typography gutterBottom variant="subtitle1">
            <b>Station: </b>
          </Typography>
          <Typography
            gutterBottom
            variant="subtitle1"
            component="h2"
            style={{ marginLeft: 5 }}
          >
            {customDefaultValue &&
              resources.find((item) => item.value === customDefaultValue)
                ?.label}
          </Typography>
          {!customDefaultValue &&
            (stateContext.station?.name ? (
              <Typography
                gutterBottom
                variant="subtitle1"
                component="h2"
                style={{ marginLeft: 5 }}
              >
                {isNew ? stateContext.station.name : <NoneSelected />}
              </Typography>
            ) : (
              <NoneSelected />
            ))}
        </Grid>
      ) : (
        <CustomSelectBox
          id="united-states"
          label="Station"
          variant="outlined"
          style={classes.selectBox}
          value={customDefaultValue || ''}
          resources={resources}
          disabled={disable}
          onChange={handleChange}
          size={size}
        />
      )}
    </Box>
  );
};

export default StationForm;
