import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import useStyles from './style';
import theme from '@app/styles/theme';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { colourStyles } from './style';

const animatedComponents = makeAnimated();
const MultiTagsForm = ({
  disable,
  resources,
  onChange,
  disableGray,
  hint,
  isGallery,
  title,
  ...rest
}) => {
  const classes = useStyles();

  const [option, setOption] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [selectedValue, setSelectedValue] = useState();

  useEffect(() => {
    let item = [];
    resources?.map((el) => {
      item = [
        ...item,
        {
          value: el,
          label: el
        }
      ];
    });
    setSelectedOption(item);
  }, [resources]);

  const onSelect = (selectedList, selectedItem) => {
    let item = [];
    selectedList?.map((el) => {
      item = [...item, el.value];
    });
    onChange(item);
  };

  const onRemove = (selectedList, removedItem) => {
    setOption([]);
  };

  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      let item = {
        value: selectedValue,
        label: selectedValue
      };

      setOption([...selectedOption, item]);
    }
  };

  return (
    <Box className={disableGray ? classes.disableRoot : classes.root} {...rest}>
      {/* <Typography className={classes.title}>{title}</Typography> */}
      {disable ? (
        <Select
          placeholder={hint}
          closeMenuOnSelect={false}
          components={
            (animatedComponents,
            { DropdownIndicator: () => null, IndicatorSeparator: () => null })
          }
          value={selectedOption}
          isMulti
          options={option}
          styles={colourStyles}
          id="demo-simple-select-label"
          isDisabled={disable}
        />
      ) : (
        <div
          style={{
            width: '100%',
            border: isGallery ? '1px solid #00000044' : '0px solid #ffffff',
            borderRadius: isGallery ? '4px' : 0
          }}
        >
          <Select
            placeholder={hint}
            closeMenuOnSelect={false}
            components={
              (animatedComponents,
              { DropdownIndicator: () => null, IndicatorSeparator: () => null })
            }
            // defaultValue={selectedValue}
            value={selectedOption}
            isMulti
            options={option}
            styles={colourStyles}
            id="demo-simple-select-label"
            isDisabled={disable}
            onInputChange={handleChange}
            onChange={onSelect}
            onRemove={onRemove}
            onKeyDown={onKeyDown}
            // isClearable
          />
        </div>
      )}
    </Box>
  );
};

export default MultiTagsForm;
