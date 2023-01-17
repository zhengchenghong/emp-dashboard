import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';
import NumberFormat from 'react-number-format';

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value
          }
        });
      }}
      isNumericString
      format="+1 (###) ###-####"
      mask="_"
      allowEmptyFormatting
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const CustomNumberInput = ({
  id,
  label,
  variant,
  style,
  onChange,
  size,
  value
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      variant={variant}
      label={label}
      value={value}
      onChange={handleChange}
      name="phonenumber"
      className={style}
      id={id}
      InputProps={{
        inputComponent: NumberFormatCustom
      }}
      size={size}
    />
  );
};

export default CustomNumberInput;
