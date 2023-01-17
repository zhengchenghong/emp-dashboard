import React, { useState, useEffect, useRef } from 'react';
import { InputBase } from '@material-ui/core';
import { CustomInput } from '@app/components/Custom';
import { DescriptionCard } from '@app/components/Cards';
import { EditHelperText } from '@app/components/Text';
import * as globalStyles from '@app/constants/globalStyles';
import { en } from '@app/language';

const AltTextForm = ({
  imgWidth,
  imgHeight,
  disable,
  resources,
  onChange,
  helperText,
  type,
  cardViewList,
  onSaveContents,
  isAvatarAttached
}) => {
  const classes = globalStyles.DescCardStyle();
  const [altText, setAltText] = useState(() => resources || '');
  const [altTextWidth, setAltTextWidth] = useState(0);

  const altTextRef = useRef();
  useEffect(() => {
    setAltText(() => resources || '');
  }, [resources]);

  useEffect(() => {
    setTimeout(function () {
      if (isAvatarAttached) {
        altTextRef.current?.focus();
      }
    }, 100);
  }, [isAvatarAttached]);

  useEffect(() => {
    const atw = ((imgWidth ?? 0) * 114) / (imgHeight ?? 10000);
    setAltTextWidth(atw);
  }, [imgWidth, imgHeight]);

  const handleInputChange = (type, value) => {
    console.log('value:', value);
    setAltText(value);
    onChange(value);
  };

  const handleKeyDown = (e, change) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      // altTextRef.current.focus();
      // e.preventDefault();
      if (onSaveContents) onSaveContents(altText);
      altTextRef.current.blur();
    }
  };

  return (
    <React.Fragment>
      {disable ? (
        <React.Fragment>
          <DescriptionCard title=""></DescriptionCard>
          {helperText && <EditHelperText />}
        </React.Fragment>
      ) : (
        <div>
          {cardViewList ? (
            <InputBase
              inputRef={altTextRef}
              className={classes.inputArea_noBtmMargin_noColor}
              defaultValue={altText}
              value={altText}
              placeholder={
                type === 'class' || type === 'material'
                  ? en['Banner Alt Text']
                  : en['Alt Text']
              }
              onKeyDown={handleKeyDown}
              onChange={(e) => handleInputChange('altText', e.target.value)}
              style={{
                background: 'rgba(52, 52, 52, 0.8)',
                width: altTextWidth,
                bottom: 10,
                marginLeft: 0,
                position: 'absolute',
                fontSize: 14,
                fontWeight: 100,
                color: 'white'
              }}
              inputProps={{
                'aria-label': 'naked',
                style: { textAlign: 'center', color: 'white' }
              }}
            />
          ) : (
            <CustomInput
              rows={1}
              label={
                type === 'class' || type === 'material'
                  ? en['Banner Alt Text']
                  : en['Alt Text']
              }
              variant={!cardViewList ? 'outlined' : 'standard'}
              size="small"
              type="text"
              name="altText"
              disabled={disable}
              inputRef={altTextRef}
              className={classes.inputArea_noBtmMargin}
              resources={altText}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('altText', value)}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default AltTextForm;
