import React, { useState, useEffect, useRef } from 'react';
import { Box, InputBase, IconButton } from '@material-ui/core';
import { Close, Search as SearchIcon } from '@material-ui/icons';
import { useStylesSearch } from './style';
const UserSearch = ({
  type,
  onChange,
  useStyles,
  isResetSearch,
  setResetSearch,
  fromTable,
  defaultValue,
  autoFocus,
  width
}) => {
  if (!useStyles) useStyles = useStylesSearch;
  const classes = useStyles();
  const [searchKey, setSearchKey] = useState(defaultValue);
  const handleClick = () => {
    onChange(searchKey);
  };
  const [showClearSearch, setShowClearSearch] = useState();

  useEffect(() => {
    if (isResetSearch) {
      setSearchKey('');
      setShowClearSearch(false);
    }
    if (setResetSearch) setResetSearch(false);
  }, [isResetSearch]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearchKey(e.target.value);
      onChange(e.target.value);
    }
  };

  useEffect(() => {
    if (defaultValue != null && defaultValue !== '') {
      setShowClearSearch(true);
    }
  }, []);

  useEffect(() => {
    // setShowClearSearch(false);
  }, [type]);

  const handleClearSearch = () => {
    setSearchKey('');
    onChange('');
    setShowClearSearch(false);
  };

  return (
    <Box className={classes.root} style={{ width: width }}>
      <IconButton
        onClick={handleClick}
        className={classes.iconButton}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
      <InputBase
        value={searchKey}
        className={classes.input}
        onChange={(e) => {
          setSearchKey(e.target.value);
          setShowClearSearch(e.target.value !== '');
        }}
        autoFocus={autoFocus}
        onKeyDown={(e) => handleKeyPress(e)}
        placeholder={`Search ${type}`}
        inputProps={{ 'aria-label': 'search users' }}
      />
      {showClearSearch && (
        <IconButton
          onClick={handleClearSearch}
          className={fromTable ? classes.closeButton : classes.iconButton}
          aria-label="close"
        >
          <Close style={{ fontSize: '1rem' }} />
        </IconButton>
      )}
    </Box>
  );
};

export default UserSearch;
