import React, { useState, useEffect, useRef } from 'react';
import { Grid } from '@material-ui/core';
import { CustomInput } from '@app/components/Custom';
import { DescriptionCard } from '@app/components/Cards';
import { EditHelperText } from '@app/components/Text';
import * as globalStyles from '@app/constants/globalStyles';
import { en } from '@app/language';

const HelpTextForm = ({ disable, resources, onChange, helperText, type }) => {
  const classes = globalStyles.DescCardStyle();
  const [helpText, setHelpText] = useState(() => resources || '');

  const helpTextRef = useRef();
  useEffect(() => {
    setHelpText(() => resources || '');
  }, [resources]);

  const handleInputChange = (type, value) => {
    setHelpText(value);
    onChange(type, value);
  };

  const handleKeyDown = (e, change) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      helpTextRef.current.focus();
      e.preventDefault();
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
        <Grid container>
          <Grid item xs={12}>
            <CustomInput
              multiline
              rows={1}
              label={en['Help Text']}
              variant="outlined"
              size="small"
              type="text"
              name="helpText"
              disabled={disable}
              inputRef={helpTextRef}
              style={classes.inputArea_noBtmMargin}
              resources={helpText}
              onKeyDown={handleKeyDown}
              onChange={(value) => handleInputChange('long', value)}
            />
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
};

export default HelpTextForm;
