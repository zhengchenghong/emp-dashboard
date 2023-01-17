import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import useStyles from './style';

const popover = {
  position: 'absolute',
  zIndex: '2'
};
const cover = {
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px'
};

const ColorPicker = ({ color, disabled, wrapperStyle, onValueChange }) => {
  const classes = useStyles();
  const [openPicker, setOpenPicker] = useState(false);
  const triggerStyle = { backgroundColor: color };

  const onTrigger = () => {
    setOpenPicker((pre) => !pre);
  };

  return (
    <div style={wrapperStyle}>
      <div
        className={classes.colorTrigger}
        style={triggerStyle}
        onClick={onTrigger}
      />
      {openPicker ? (
        <div style={popover}>
          <div style={cover} onClick={onTrigger} />
          <SketchPicker
            color={color}
            onChangeComplete={(color) => onValueChange(color.hex)}
          />
        </div>
      ) : null}
    </div>
  );
};
export default ColorPicker;
