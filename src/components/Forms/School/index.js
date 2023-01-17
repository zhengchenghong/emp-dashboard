import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import { useStateContext } from '@app/providers/StateContext';
import { CustomSelectBox } from '@app/components/Custom';
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

const SchoolForm = ({
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
            <b>Schools: </b>
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
            (stateContext.school?.name ? (
              <Typography
                gutterBottom
                variant="subtitle1"
                component="h2"
                style={{ marginLeft: 5 }}
              >
                {isNew ? stateContext.school.name : <NoneSelected />}
              </Typography>
            ) : (
              <NoneSelected />
            ))}
        </Grid>
      ) : (
        <CustomSelectBox
          id="schools"
          label="Schools"
          variant="outlined"
          value={customDefaultValue || ''}
          resources={resources}
          style={classes.selectBox}
          onChange={handleChange}
          disabled={disable}
          size={size}
        />
      )}
    </Box>
  );
};

export default SchoolForm;
