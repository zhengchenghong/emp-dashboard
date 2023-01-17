import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { useSelectionContext } from '@app/providers/SelectionContext';
import useStyles from './styles';
import { getFormattedDate } from '@app/utils/date-manager';

const CustomSelectBox = ({
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
  onChange = () => {},
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
  maxWidth,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      style={{ maxWidth: maxWidth ? maxWidth : 660 }}
    >
      <InputLabel
        id={`label-${id}`}
        className={labelClass ? labelClass : classes.label}
        style={{ marginTop: 2 }}
      >
        {label}
      </InputLabel>
      <Select
        ref={selectRef}
        open={openState}
        focus={openState ? 'true' : 'false'}
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
        {resources?.map((el, index) => (
          <MenuItem
            key={
              typeof el === 'string'
                ? el
                : el.hasOwnProperty('value')
                ? el.value
                : el._id
            }
            onKeyDown={(e) =>
              handleKeyDownOnMenu(
                e,
                el.hasOwnProperty('value') ? el.value : el._id
              )
            }
            value={
              typeof el === 'string'
                ? el
                : el.hasOwnProperty('value')
                ? el.value
                : el._id
            }
            className={classes.menuItem}
            style={{
              minHeight: 32,
              fontWeight: el.name?.includes('+ New') ? 600 : 500
            }}
          >
            <div
              style={
                el.schemaType === 'schoolTerm'
                  ? { maxWidth: 400, overflow: 'hidden' }
                  : { overflow: 'hidden' }
              }
            >
              {typeof el === 'string'
                ? el
                : el.hasOwnProperty('label')
                ? el.label
                : el.name}
            </div>
            {el.schemaType === 'schoolTerm' &&
              (el.schedule?.startAt || el.schedule?.endAt) && (
                <div>
                  {`${
                    el.schedule?.startAt
                      ? getFormattedDate(el.schedule?.startAt, 'MM-DD-YYYY')
                      : ''
                  }  -  ${
                    el.schedule?.endAt
                      ? getFormattedDate(el.schedule?.endAt, 'MM-DD-YYYY')
                      : ''
                  }`}
                </div>
              )}
          </MenuItem>
        ))}
      </Select>
      {}
    </FormControl>
  );
};

export default CustomSelectBox;
