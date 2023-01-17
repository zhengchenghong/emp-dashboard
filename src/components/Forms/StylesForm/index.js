import React, { useState } from 'react';
import { DefaultCard } from '@app/components/Cards';
// import ColorPicker from 'material-ui-color-picker'
import useStyles from './style';
import ColorPicker from '@app/components/Custom/ColorPicker';
// import './index.scss'

const StylesForm = ({ resources, stylesData, onChange }) => {
  const classes = useStyles();

  const changeBGHandler = (value) => {
    onChange({ ...stylesData, bg: value });
  };

  const changeFGHandler = (value) => {
    onChange({ ...stylesData, fg: value });
  };

  return (
    <DefaultCard style={classes.root}>
      <div className="bits-checkbox">
        <div className={classes.labelItem}>
          <div className={classes.labelColorpicker}>
            <p className={classes.label}>Background Color</p>
            <ColorPicker
              color={stylesData?.bg ? stylesData?.bg : 'white'}
              onValueChange={changeBGHandler}
              wrapperStyle={{ display: 'inline-block' }}
            />
          </div>
          <div className={classes.labelColorpicker}>
            <p className={classes.label}>Foreground Color</p>
            <ColorPicker
              color={stylesData?.fg ? stylesData?.fg : 'black'}
              onValueChange={changeFGHandler}
              wrapperStyle={{ display: 'inline-block' }}
            />
          </div>
        </div>
      </div>
    </DefaultCard>
  );
};

export default StylesForm;
