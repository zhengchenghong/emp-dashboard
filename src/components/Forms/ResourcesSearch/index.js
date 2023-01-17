import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import {
  CustomSelectBox,
  CustomInput,
  ResourceSelect
} from '@app/components/Custom';
import { useSmallScreen, useMediumScreen } from '@app/utils/hooks';
import { useSelectionContext } from '@app/providers/SelectionContext';

const MessageStatus = [
  { label: 'Set the start to now', value: 'active' },
  { label: 'Set the start to the future', value: 'inactive' },
  { label: 'Set the end to past', value: 'expired' }
];

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '80%',
    marginTop: 2,
    flexWrap: 'wrap'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 'auto',
    width: '20%'
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  },
  mobileInput: {
    // minHeight: 50,
    background: theme.palette.common.white,
    flex: 'auto',
    width: '48%'
  }
}));

const ResourcesSearchForm = ({
  resources,
  sourceType,
  onChange,
  reset,
  setReset
}) => {
  const classes = useStyles();
  const categoryRef = useRef();
  const [searchKey, setSearchKey] = useState();
  const [status, setStatus] = useState('');
  const [contentType, setContentType] = useState(sourceType);
  const [category, setCategory] = useState();
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const { setFocusFirstAction, selectFirstOnInfo, setSelectFirstOnInfo } =
    useSelectionContext();
  const [openGrade, setOpenGrade] = useState(false);
  const [openSource, setOpenSource] = useState(false);

  const handleChanges = (type, value) => {
    if (type === 'grade') {
      setStatus(value);
      onChange('grade', value);
    }
    if (type === 'contentType') {
      setContentType(value);
      onChange('contentType', value);
    }
    if (type === 'tagList') {
      setCategory(value);
      onChange('tagList', value);
    }
    if (type === 'searchTag') {
      setSearchKey(value);
      onChange('searchTag', value);
    }

    if (type === 'key') {
      if (value.key === 'Enter') {
        onChange('key', 'Enter');
      }
    }
  };
  useEffect(() => {
    if (selectFirstOnInfo) {
      categoryRef.current?.focus();
      setSelectFirstOnInfo(false);
    }
  }, [selectFirstOnInfo]);

  useEffect(() => {
    if (reset) {
      setCategory('');
      setSearchKey('');
      setStatus();
      setContentType('All Resources');
      setReset(false);
    }
  }, [reset]);

  return (
    <Box
      className={classes.root}
      style={{ width: isSmallScreen ? '100%' : '80%' }}
    >
      <CustomInput
        label={isMediumScreen ? 'Search' : 'What you are searching for?'}
        type="text"
        variant="outlined"
        size="small"
        showSearchIcon
        resources={searchKey}
        style={isSmallScreen ? classes.mobileInput : classes.input}
        onChange={(value) => handleChanges('searchTag', value)}
        // onKeyDown={(value) => handleChanges('key', value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleChanges('key', event);
          } else if (event.key === 'Tab') {
            event.preventDefault();
            setOpenGrade(true);
          }
        }}
      />
      <div className={isSmallScreen ? classes.mobileInput : classes.input}>
        <CustomSelectBox
          variant="outlined"
          type="resGrades"
          label="Grade Level"
          value={status}
          resources={resources}
          onChange={(event) => handleChanges('grade', event)}
          onClose={() => {
            setOpenGrade(false);
          }}
          size="small"
          style={{ width: '100%' }}
          openState={openGrade}
          setOpenState={setOpenGrade}
        />
      </div>
      <CustomInput
        inputRef={categoryRef}
        label="Category?"
        type="text"
        variant="outlined"
        size="small"
        resources={category}
        style={isSmallScreen ? classes.mobileInput : classes.input}
        onChange={(value) => handleChanges('tagList', value)}
        // onKeyDown={(value) => handleChanges('key', value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleChanges('key', event);
          } else if (event.key === 'Tab') {
            event.preventDefault();
            setOpenSource(true);
          }
        }}
      />
      <div className={isSmallScreen ? classes.mobileInput : classes.input}>
        <ResourceSelect
          id="istricts"
          type="resSource"
          label="Source"
          variant="outlined"
          value={contentType}
          resources={[
            'All Resources',
            'PBS LearningMedia',
            'OER Commons',
            'Shared Lessons'
          ]}
          onChange={(event) => handleChanges('contentType', event)}
          onClose={() => {
            setOpenSource(false);
          }}
          size="small"
          style={{ width: '100%' }}
          openState={openSource}
          setOpenState={setOpenSource}
        />
      </div>
    </Box>
  );
};

export default ResourcesSearchForm;
