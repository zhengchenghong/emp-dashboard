import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { useSelectionContext } from '@app/providers/SelectionContext';
import useStyles from './styles';

const ResourceSelect = ({
  id,
  index,
  label,
  variant,
  style,
  customStyle,
  defaultValue,
  helperText,
  resources,
  error,
  onChange,
  size,
  addMarginTop,
  labelClass,
  disabled,
  noPadding,
  isMainList,
  value,
  limitWidth,
  type,
  onSaveChanges,
  onClose,
  openState,
  setOpenState,
  ...rest
}) => {
  const classes = useStyles();
  const selectRef = useRef();
  const { selectFirstOnInfo, setSelectFirstOnInfo, setFocusFirstAction } =
    useSelectionContext();

  useEffect(() => {
    if (selectFirstOnInfo) {
      selectRef.current?.focus();
      setSelectFirstOnInfo(false);
    }
  }, [selectFirstOnInfo]);

  const handleChange = (event) => {
    const selData = resources.find((el) =>
      typeof el === 'string'
        ? el === event.target.value
        : el.hasOwnProperty('value')
        ? el.value === event.target.value
        : el._id === event.target.value
    );
    onChange(selData, index, id);
    if (setOpenState) setOpenState(false);
  };

  const handleKeyDown = (e, value) => {
    if (e.key === 'Tab') {
      if (type === 'resetTime') {
        setFocusFirstAction(true);
        e.preventDefault();
      }
    }
  };

  const handleKeyDownOnMenu = (e, value) => {
    if (e.key === 'Enter') {
      onSaveChanges && onSaveChanges(value);
      if (type === 'lang' || type === 'resGrades') {
        setSelectFirstOnInfo(true);
      }
      if (type === 'resSource') {
        setFocusFirstAction(true);
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleOpen = () => {
    if (setOpenState) setOpenState(true);
  };

  return (
    <FormControl
      variant={variant}
      className={clsx(classes.root, {
        [classes.fullWidth]: style,
        [classes.noPadding]: noPadding
      })}
      size={size}
      error={error}
      focused={false}
      autoComplete="off"
      onKeyDown={(e) => {
        handleKeyDown(e);
      }}
    >
      <InputLabel
        id={`label-${id}`}
        className={labelClass ? labelClass : classes.label}
        style={{ marginTop: 5 }}
      >
        {label}
      </InputLabel>
      <Select
        ref={selectRef}
        open={openState}
        id={id}
        labelId={`label-${id}`}
        className={clsx(style, classes.stateSelect)}
        onChange={handleChange}
        style={customStyle}
        error={error}
        // onKeyDown={(e) => console.log(e.key)}
        // onKeyPress={handleKeyDown}
        {...rest}
        MenuProps={{
          classes: limitWidth
            ? { list: classes.limitedMenuList }
            : { list: classes.menuList }
        }}
        onClose={handleClose}
        onOpen={handleOpen}
        disabled={disabled}
        defaultValue={defaultValue}
        value={value}
        inputProps={
          isMainList
            ? {
                form: {
                  autocomplete: 'off'
                },
                classes: { root: classes.selectInput },
                autoFocus: false
              }
            : {
                form: {
                  autocomplete: 'off'
                },
                autoFocus: false
              }
        }
      >
        <MenuItem
          key={'All Resources'}
          onKeyDown={(e) => handleKeyDownOnMenu(e, 'All Resources')}
          value={'All Resources'}
          className={classes.menuItem}
        >
          {'All Resources'}
        </MenuItem>
        <MenuItem
          key={'PBS LearningMedia'}
          onKeyDown={(e) => handleKeyDownOnMenu(e, 'PBS LearningMedia')}
          value={'PBS LearningMedia'}
          className={classes.menuItem}
        >
          {<p>&nbsp;&nbsp;&nbsp;&nbsp;PBS LearningMedia</p>}
        </MenuItem>
        <MenuItem
          key={'OER Commons'}
          onKeyDown={(e) => handleKeyDownOnMenu(e, 'OER Commons')}
          value={'OER Commons'}
          className={classes.menuItem}
        >
          {<p>&nbsp;&nbsp;&nbsp;&nbsp;OER Commons</p>}
        </MenuItem>
        <div
          style={{
            height: 1,
            marginLeft: 12,
            marginRight: 12,
            background: 'lightGray'
          }}
        />
        <MenuItem
          key={'Shared Lessons'}
          onKeyDown={(e) => handleKeyDownOnMenu(e, 'Shared Lessons')}
          value={'Shared Lessons'}
          className={classes.menuItem}
        >
          {'Shared Lessons'}
        </MenuItem>
      </Select>
      {}
    </FormControl>
  );
};

export default ResourceSelect;
