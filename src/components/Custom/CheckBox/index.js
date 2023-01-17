import React, { useState, useEffect } from 'react';
import { FormControlLabel, Checkbox } from '@material-ui/core';

const CustomCheckBox = ({
  value,
  label,
  color,
  onChange,
  disabled,
  willChange,
  allowChange
}) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (value) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [value]);
  const handleChange = () => {
    if (willChange && !allowChange) {
      willChange(checked);
    } else {
      setChecked(!checked);
      onChange(checked);
    }
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          color={color}
          checked={checked}
          onChange={handleChange}
          name="antoine"
          disabled={disabled}
        />
      }
      label={label}
    />
  );
};

export default CustomCheckBox;
