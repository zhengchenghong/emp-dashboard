import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, InputBase, IconButton } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import { en } from '@app/language';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 200
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

const UserSearch = ({ type, onChange }) => {
  const classes = useStyles();
  const [searchKey, setSearchKey] = useState();
  const handleClick = () => {
    onChange(searchKey);
  };

  return (
    <Box className={classes.root}>
      <InputBase
        className={classes.input}
        onChange={(e) => setSearchKey(e.target.value)}
        placeholder={en['Search'] + ` ${type}`}
        inputProps={{ 'aria-label': 'search users' }}
      />
      <IconButton
        onClick={handleClick}
        className={classes.iconButton}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
    </Box>
  );
};

export default UserSearch;
