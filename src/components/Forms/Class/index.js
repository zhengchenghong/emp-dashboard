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

const ClassForm = ({
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

  useEffect(() => {
    setIsNew(false);
    if (appContext.newDoc) {
      if (appContext.newDoc['_id'] === document['_id']) {
        setIsNew(true);
      }
    }
  }, [appContext, document]);

  return (
    <Box className={classes.root}>
      {disable ? (
        <Grid container direction="row" alignItems="baseline">
          <Typography gutterBottom variant="subtitle1">
            <b>Classes: </b>
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
            (stateContext.class?.name ? (
              <Typography
                gutterBottom
                variant="subtitle1"
                component="h2"
                style={{ marginLeft: 5 }}
              >
                {isNew ? stateContext.class.name : <NoneSelected />}
              </Typography>
            ) : (
              <NoneSelected />
            ))}
        </Grid>
      ) : (
        <CustomSelectBox
          id="istricts"
          label="Class"
          variant="outlined"
          value={customDefaultValue || stateContext.class?._id}
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

export default ClassForm;
