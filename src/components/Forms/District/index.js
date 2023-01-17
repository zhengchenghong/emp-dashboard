import React, { useContext, useState, useEffect } from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import { CustomSelectBox } from '@app/components/Custom';
import { useStateContext } from '@app/providers/StateContext';
import AppContext from '@app/AppContext';
import useStyles from './style';
import { en } from '@app/language';

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

const DistrictForm = ({
  disable,
  document,
  resources,
  onChange,
  size,
  customDefaultValue
}) => {
  const classes = useStyles();
  const [stateContext] = useStateContext();
  const [appContext] = useContext(AppContext);
  const [isNew, setIsNew] = useState(false);
  const handleChange = (selected) => {
    onChange(selected.value);
  };

  // useEffect(() => {
  //   setIsNew(false);
  //   if (appContext && appContext.newDoc) {
  //     if (appContext.newDoc['_id'] === document['_id']) {
  //       setIsNew(true);
  //     }
  //   }
  // }, [appContext, document]);

  return (
    <Box className={classes.root}>
      {disable ? (
        <Grid container direction="row" alignItems="baseline">
          <Typography gutterBottom variant="subtitle1">
            <b>{en['District']}: </b>
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
            (stateContext.district?.name ? (
              <Typography
                gutterBottom
                variant="subtitle1"
                component="h2"
                style={{ marginLeft: 5 }}
              >
                {isNew ? stateContext.district.name : <NoneSelected />}
              </Typography>
            ) : (
              <NoneSelected />
            ))}
        </Grid>
      ) : (
        <CustomSelectBox
          id="istricts"
          label={en['Districts']}
          variant="outlined"
          value={customDefaultValue || ''}
          resources={resources}
          style={classes.selectBox}
          disabled={disable}
          onChange={handleChange}
          size={size}
        />
      )}
    </Box>
  );
};

export default DistrictForm;
