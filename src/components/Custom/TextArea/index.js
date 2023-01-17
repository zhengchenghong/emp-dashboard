import React from 'react';
import clsx from 'clsx';
import { Box, TextareaAutosize } from '@material-ui/core';
import useStyles from './style';

const CustomTextArea = ({ min, max, label, style, resources, onChange }) => {
  const classes = useStyles();

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Box
      className={clsx(classes.root, {
        [style]: style
      })}
      component={TextareaAutosize}
      placeholder={label}
      value={resources}
      onChange={handleChange}
      rowsMin={min}
      rowsMax={max}
    />
  );
};

export default CustomTextArea;
