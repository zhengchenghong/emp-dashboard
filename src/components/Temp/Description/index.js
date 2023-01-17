import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Grid, Typography } from '@material-ui/core';
import { CustomInput } from '@app/components/Custom';
import { Edit, Save } from '@material-ui/icons';
import { useFormChangeValidator } from '@app/utils/hooks/form';
import { DefaultCard, DescriptionCard } from '@app/components/Cards';
import {
  TitleText,
  ShortText,
  LongText,
  EditHelperText,
  SaveHelperText
} from '@app/components/Text';
import * as globalStyles from '@app/constants/globalStyles';

const DescriptionForm = ({ disable, resources, onChange, helperText }) => {
  const classes = globalStyles.DescCardStyle();
  const [loadedData, setLoadedData] = useState({
    title: '',
    short: '',
    long: ''
  });

  const {
    isChanged,
    // changedValue,
    setInitialValue,
    setLastValue
  } = useFormChangeValidator(resources, loadedData);

  const titleRef = useRef();
  const shortRef = useRef();
  const longRef = useRef();

  useEffect(() => {
    setLoadedData(
      resources
        ? {
            ...loadedData,
            ...resources
          }
        : {}
    );

    // form validation => myo
    setInitialValue(
      resources
        ? {
            ...loadedData,
            ...resources
          }
        : {}
    );
  }, [resources]);

  // console.log('Is form changed?', isChanged ? 'Yes' : 'No');
  // console.log('Changed form values:', changedValue);

  const handleInputChange = (type, value) => {
    setLoadedData({
      ...loadedData,
      [type]: value
    });

    setLastValue({
      ...loadedData,
      [type]: value
    });

    onChange({
      ...loadedData,
      [type]: value
    });
  };

  useEffect(() => {
    onChange({
      data: loadedData,
      isChanged
    });
  }, [isChanged, loadedData]);

  const handleKeyDown = (e, change) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      if (e.target.name === 'title') {
        shortRef.current.focus();
      }
      if (e.target.name === 'short') {
        longRef.current.focus();
      }
      if (e.target.name === 'long') {
        titleRef.current.focus();
      }
      e.preventDefault();
    }
  };

  return (
    <React.Fragment>
      {disable ? (
        <React.Fragment>
          <DescriptionCard title={loadedData.title}>
            <TitleText heading="" value={loadedData.title} />
            <ShortText heading="" value={loadedData.short} />
            <LongText heading="" value={loadedData.long} />
          </DescriptionCard>
          {helperText && <EditHelperText />}
        </React.Fragment>
      ) : (
        <Grid>
          <DefaultCard
            style={clsx({
              [classes.root]: !disable,
              [classes.preview]: disable
            })}
            px={1}
          >
            <CustomInput
              multiline
              rows={1}
              label="Title"
              variant="outlined"
              size="small"
              type="text"
              name="title"
              disabled={disable}
              inputRef={titleRef}
              style={classes.inputArea}
              resources={loadedData.title || ''}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('title', value)}
            />
            <CustomInput
              multiline
              rows={2}
              label="Short Description"
              variant="outlined"
              size="small"
              type="text"
              name="short"
              disabled={disable}
              inputRef={shortRef}
              style={classes.inputArea}
              resources={loadedData.short || ''}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('short', value)}
            />
            <CustomInput
              multiline
              rows={4}
              label="Long Description"
              variant="outlined"
              size="small"
              type="text"
              name="long"
              disabled={disable}
              inputRef={longRef}
              style={classes.inputArea}
              resources={loadedData.long || ''}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('long', value)}
            />
          </DefaultCard>
          {helperText && <SaveHelperText />}
        </Grid>
      )}
    </React.Fragment>
  );
};

export default DescriptionForm;
