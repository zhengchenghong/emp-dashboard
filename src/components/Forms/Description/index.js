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
import { en } from '@app/language';
import { useSelectionContext } from '@app/providers/SelectionContext';

const DescriptionForm = ({
  isDevice,
  disable,
  resources,
  onChange,
  helperText,
  disableGray,
  type,
  hideName,
  hideDescription,
  hideHelpText,
  onSaveContents,
  resourceType,
  setOpenGrades
}) => {
  const classes = globalStyles.DescCardStyle();
  const { isLastTab, setIsLastTab } = useSelectionContext();
  const [loadedData, setLoadedData] = useState({
    title: '',
    short: '',
    long: ''
  });
  const [state, setState] = useState('');

  const titleRef = useRef();
  const shortRef = useRef();
  const longRef = useRef();

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
      if (e.target.rows === 1 || e.target.rows == null) {
        if (onSaveContents) onSaveContents(loadedData);
        longRef.current?.blur();
        titleRef.current?.blur();
        shortRef.current?.blur();
      }
    }

    if (
      e.keyCode === 9 &&
      !hideHelpText &&
      e.target.name === 'long' &&
      !resourceType
    ) {
      e.preventDefault();
      if (!hideName) {
        setIsLastTab(true);
      } else {
        if (setOpenGrades) setOpenGrades(true);
      }
    }
  };

  return (
    <React.Fragment>
      {isDevice ? (
        <Grid className={classes.descSpacing1}>
          {!hideName && (
            <CustomInput
              rows={1}
              label={en['Display Name']}
              variant="outlined"
              size="small"
              type="text"
              name="title"
              disabled={disable}
              inputRef={titleRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput1]: true
              })}
              resources={loadedData.title}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('title', value)}
            />
          )}
          {!hideDescription && (
            <CustomInput
              multiline
              rows={2}
              label={en['Number']}
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
          )}
          {!hideHelpText && (
            <CustomInput
              multiline
              rows={4}
              label={en['WiFi Password']}
              variant="outlined"
              size="small"
              type="text"
              name="long"
              disabled={disable}
              inputRef={longRef}
              style={clsx({
                [classes.inputArea]: true
                // [classes.descInput1]: true
              })}
              resources={loadedData.long}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('long', value)}
            />
          )}
          {helperText && <SaveHelperText />}
        </Grid>
      ) : disable ? (
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
        <Grid className={classes.descSpacing1}>
          {!hideName && (
            <CustomInput
              rows={1}
              label={type !== 'station' ? en['Title'] : en['Display Name']}
              variant="outlined"
              size="small"
              type="text"
              name="title"
              disabled={disable}
              inputRef={titleRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput1]: true
              })}
              resources={loadedData.title}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('title', value)}
            />
          )}
          {!hideDescription && (
            <CustomInput
              multiline
              rows={2}
              label={
                type !== 'station' ? en['Short Description'] : en['Description']
              }
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
          )}
          {!hideHelpText && (
            <CustomInput
              multiline
              rows={4}
              label={
                type !== 'station' ? en['Long Description'] : en['Help Text']
              }
              variant="outlined"
              size="small"
              type="text"
              name="long"
              disabled={disable}
              inputRef={longRef}
              style={clsx({
                [classes.inputArea]: true
                // [classes.descInput1]: true
              })}
              resources={loadedData.long}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('long', value)}
            />
          )}
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
            {!hideName && (
              <CustomInput
                rows={1}
                label={en['Title']}
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
            )}
            {!hideDescription && (
              <CustomInput
                multiline
                rows={2}
                label={en['Short Description']}
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
            )}
            {!hideHelpText && (
              <CustomInput
                multiline
                rows={4}
                label={en['Long Description']}
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
            )}
          </DefaultCard>
          {helperText && <SaveHelperText />}
        </Grid>
      ) : (
        <Grid
          container
          spacing={1}
          style={{ marginTop: '-12px' }}
          className={classes.descSpacing1}
        >
          {!hideName && (
            <CustomInput
              rows={1}
              label={en['Display Name']}
              variant="outlined"
              size="small"
              type="text"
              name="title"
              disabled={disable}
              inputRef={titleRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput1]: true
              })}
              resources={loadedData.title}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('title', value)}
            />
          )}
          {!hideDescription && (
            <CustomInput
              multiline
              rows={10}
              label={en['Description']}
              variant="outlined"
              size="small"
              type="text"
              name="short"
              disabled={disable}
              inputRef={shortRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput1]: true
              })}
              resources={loadedData.short}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('short', value)}
            />
          )}
          {!hideHelpText && (
            <CustomInput
              rows={1}
              label={en['Help Text']}
              variant="outlined"
              size="small"
              type="text"
              name="long"
              disabled={disable}
              inputRef={longRef}
              style={clsx({
                [classes.inputArea]: true,
                [classes.descInput1]: true
              })}
              resources={loadedData.long}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('long', value)}
            />
          )}
          {helperText && <SaveHelperText />}
        </Grid>
      )}
    </React.Fragment>
  );
};

export default DescriptionForm;
