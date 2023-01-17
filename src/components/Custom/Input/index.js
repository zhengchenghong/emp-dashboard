import React, { useEffect, useState, forwardRef, useRef } from 'react';
import clsx from 'clsx';
import { Box, TextField, InputAdornment } from '@material-ui/core';
import useStyles from './style';
import { Search as SearchIcon } from '@material-ui/icons';

const CustomInput = ({
  label,
  type,
  style,
  resources,
  error,
  autoFocus,
  helperText,
  onChange,
  onKeyPress,
  station,
  rowCnt,
  showSearchIcon,
  ...rest
}) => {
  const classes = useStyles();
  const [defaultValue, setDefaultValue] = useState();
  const inputElement = useRef();

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.onfocus = () => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
      };
    }
  });

  useEffect(() => {
    setDefaultValue(resources);
  }, [resources]);

  const handleChange = (e) => {
    if (label === 'SMS') {
      if (!isNaN(e.target.value) && onChange) onChange(e.target.value);
    } else {
      if (onChange) onChange(e.target.value);
    }
  };

  const handleInputChange = (e) => {
    if (e.key === 'Enter') {
      if (onKeyPress) {
        onKeyPress(e);
      }
    }
    if (e.keyCode === 9) {
      e.preventDefault();
    }
  };

  return (
    <>
      {station ? (
        <>
          <Box className={classes.station}>
            {label}: {resources}
          </Box>
        </>
      ) : (
        <TextField
          // inputRef={inputElement}
          className={clsx(classes.root, {
            [style]: style
          })}
          value={resources}
          defaultValue={defaultValue}
          type={type}
          label={label}
          autoFocus={autoFocus}
          onChange={handleChange}
          // onKeyPress={(e) => {
          //   handleInputChange(e);
          // }}
          // onKeyDown={(e) => {
          //   handleInputChange(e);
          // }}
          size="small"
          // rows
          {...rest}
          error={error}
          helperText={error && helperText ? helperText : ''}
          inputProps={{
            autoComplete: 'off',
            style: rest.rows
              ? {
                  fontSize: 14,
                  lineHeight: '16px',
                  height: 16 * rest.rows
                }
              : {
                  fontSize: 14,
                  lineHeight: '16px'
                }
          }}
          InputProps={
            showSearchIcon && {
              endAdornment: <SearchIcon style={{ color: 'lightgray' }} />
            }
          }
          InputLabelProps={{
            style: { fontSize: 14 }
          }}
        />
      )}
    </>
  );
};

export default forwardRef(CustomInput);
