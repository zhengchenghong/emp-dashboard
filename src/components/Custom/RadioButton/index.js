/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import useStyles from './style';

const CustomRadioButtonsGroup = ({
  setSubType,
  selectedTreeItem,
  onChange
}) => {
  const classes = useStyles();
  const [value, setValue] = useState('document');
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (
      selectedTreeItem?.schemaType === 'material' &&
      selectedTreeItem?.parentIdList?.length >= 2
    ) {
      setValue('document');
      onChange('type', 'document');
      setSubType('document');
    } else {
      onChange('type', value);
      setSubType(value);
    }
    if (!selectedTreeItem?.childrenIdList) setDisabled(true);
  }, [selectedTreeItem]);

  const handleChange = (event) => {
    console.log('sawqe');
    setValue(event.target.value);
    onChange('type', event.target.value);
    setSubType(event.target.value);
  };

  return (
    <FormControl className={classes.root}>
      <RadioGroup
        row
        aria-label="materialtype"
        name="materialtype"
        className={classes.fullWidth}
        value={value}
        onChange={handleChange}
      >
        <FormControlLabel
          value="document"
          control={<Radio />}
          label="Lesson"
          disabled={disabled}
        />
        <FormControlLabel
          value="folder"
          control={<Radio />}
          label="Collection"
          disabled={
            selectedTreeItem?.schemaType === 'material' &&
            selectedTreeItem?.parentIdList?.length >= 2
          }
        />
        {/* {selectedTreeItem?.schemaType === 'material' &&
        selectedTreeItem?.parentIdList?.length >= 2 ? (
          <FormControlLabel
            value="folder"
            control={<Radio />}
            label="Collection"
            disabled={disabled}
          />
        ) : (
          <FormControlLabel
            value="folder"
            control={<Radio />}
            label="Collection"
            disabled={disabled}
          />
        )} */}
      </RadioGroup>
    </FormControl>
  );
};

export default CustomRadioButtonsGroup;
