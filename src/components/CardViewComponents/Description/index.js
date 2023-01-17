import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Grid, Typography } from '@material-ui/core';
import { CustomInput, CustomSelectBox } from '@app/components/Custom';
import { Edit, Save } from '@material-ui/icons';
import { DefaultCard, DescriptionCard } from '@app/components/Cards';
import {
  TitleText,
  ShortText,
  LongText,
  EditHelperText,
  SaveHelperText
} from '@app/components/Text';
import * as globalStyles from '@app/constants/globalStyles';
import { useMediaQuery } from 'react-responsive';
import { useMediumScreen } from '@app/utils/hooks';

const CardViewDescriptionForm = ({
  disable,
  resources,
  onChange,
  helperText,
  disableGray,
  type
}) => {
  const classes = globalStyles.DescCardStyle();
  const [loadedData, setLoadedData] = useState({
    title: '',
    short: '',
    long: ''
  });
  const [state, setState] = useState('');

  const titleRef = useRef();
  const shortRef = useRef();
  const longRef = useRef();
  const isMediumScreen = useMediumScreen();

  useEffect(() => {
    setLoadedData({
      ...loadedData,
      ...resources
    });
  }, [resources]);

  const handleInputChange = (type, value) => {
    setLoadedData({
      ...loadedData,
      [type]: value
    });
    onChange({
      ...loadedData,
      [type]: value
    });
  };

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
            <TitleText
              heading="title"
              value={loadedData.title ? loadedData.title : ''}
            />
            <ShortText
              heading="short"
              value={loadedData.short ? loadedData.short : ''}
            />
            <LongText
              heading="long"
              value={loadedData.long ? loadedData.long : ''}
            />
          </DescriptionCard>
          {helperText && <EditHelperText />}
        </React.Fragment>
      ) : disableGray ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <CustomInput
              multiline
              rows={1}
              label={type !== 'station' ? 'Title' : 'Display Name'}
              variant="outlined"
              size="small"
              type="text"
              name="title"
              disabled={disable}
              inputRef={titleRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput]: false
              })}
              resources={loadedData.title}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('title', value)}
            />
            <CustomInput
              multiline
              rows={5}
              label={type !== 'station' ? 'Short Description' : 'Description'}
              variant="outlined"
              size="small"
              type="text"
              name="short"
              disabled={disable}
              inputRef={shortRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput1]: true
                // [classes.shortDesc]: true
              })}
              resources={loadedData.short}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('short', value)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            style={isMediumScreen ? { paddingTop: 8 } : {}}
          >
            <CustomInput
              multiline
              rows={8}
              label={type !== 'station' ? 'Long Description' : 'Help Text'}
              variant="outlined"
              size="small"
              type="text"
              name="long"
              disabled={disable}
              inputRef={longRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput]: false
              })}
              resources={loadedData.long}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('long', value)}
            />
          </Grid>
          {helperText && <SaveHelperText />}
        </Grid>
      ) : type !== 'station' ? (
        <Grid>
          <DefaultCard
            style={clsx({
              [classes.root]: !disable,
              [classes.preview]: disable,
              [classes.descSpacing]: true
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
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput]: true
              })}
              resources={loadedData.title}
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
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput]: true
              })}
              resources={loadedData.short}
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
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput]: true
              })}
              resources={loadedData.long}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('long', value)}
            />
          </DefaultCard>
          {helperText && <SaveHelperText />}
        </Grid>
      ) : (
        <Grid container spacing={1} className={classes.descSpacing1}>
          <CustomInput
            multiline
            rows={1}
            label="Display Name"
            variant="outlined"
            size="small"
            type="text"
            name="title"
            disabled={disable}
            inputRef={titleRef}
            style={clsx({
              [classes.inputArea]: true,
              [classes.descInput]: true
            })}
            resources={loadedData.title}
            onKeyDown={handleKeyDown}
            onChange={(value) => handleInputChange('title', value)}
          />
          <CustomInput
            multiline
            rows={10}
            label="Description"
            variant="outlined"
            size="small"
            type="text"
            name="short"
            disabled={disable}
            inputRef={shortRef}
            style={clsx({
              [classes.inputArea]: true,
              [classes.descInput]: true
            })}
            resources={loadedData.short}
            onKeyDown={handleKeyDown}
            onChange={(value) => handleInputChange('short', value)}
          />
          <CustomInput
            multiline
            rows={1}
            label="Help Text"
            variant="outlined"
            size="small"
            type="text"
            name="long"
            disabled={disable}
            inputRef={longRef}
            style={clsx({
              [classes.inputArea]: true,
              [classes.descInput]: true
            })}
            resources={loadedData.long}
            onKeyDown={handleKeyDown}
            onChange={(value) => handleInputChange('long', value)}
          />
          {helperText && <SaveHelperText />}
        </Grid>
      )}
    </React.Fragment>
  );
};

export default CardViewDescriptionForm;
