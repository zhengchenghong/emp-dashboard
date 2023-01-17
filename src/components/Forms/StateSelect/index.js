/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { CustomSelectBox } from '@app/components/Custom';
import USStates from '@app/constants/states.json';
import * as globalStyles from '@app/constants/globalStyles';
import './style.css';

const StateSelect = ({
  type,
  resources,
  stateValue,
  onStateChange,
  disable,
  onSaveChanges,
  listData
}) => {
  const classes = globalStyles.DescCardStyle();
  const [state, setState] = useState('');

  useEffect(() => {
    if (state !== stateValue) {
      setState(stateValue || '');
    }
  }, [resources, stateValue]);

  const handleStateChange = (item) => {
    setState(item?.value);
    onStateChange(item?.value);
  };

  return (
    <CustomSelectBox
      size="small"
      style={clsx({
        [classes.selectBox]: true
      })}
      label={type ?? 'State'}
      variant="filled"
      resources={listData ?? USStates}
      onChange={handleStateChange}
      value={state}
      disabled={disable}
      noPadding={true}
      onSaveChanges={onSaveChanges}
    />
  );
};

export default StateSelect;
