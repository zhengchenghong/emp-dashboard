import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { useInput } from '@app/utils/hooks/form';
import graphql from '@app/graphql';
import UserList from './List';
import useStyles from './style';

const SearchUserForm = ({ schemaType, onChange }) => {
  const classes = useStyles();
  const [loadedData, setLoadedData] = useState([]);
  const { value: filterKey, bind: bindFilterKey } = useInput('');

  const validateEmail = () => {
    return new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(
      filterKey
    );
  };

  const { loading, error, data } = useQuery(graphql.queries.userGrouping, {
    variables: {
      // nameRegExp: filterKey,
      name: validateEmail() ? filterKey : 'TEMP_STRING',
      schemaType: schemaType,
    }
  });

  useEffect(() => {
    if (!loading && !error) {
      const { grouping } = data;
      setLoadedData(grouping);
    }
  }, [loading, error, data]);

  return (
    <Box className={classes.root}>
      <TextField
        className={classes.textfield}
        label="Input the filter key"
        {...bindFilterKey}
        type="text"
        variant="outlined"
        size="small"
        error={!validateEmail() && filterKey.length > 0}
        helperText={
          validateEmail() || !filterKey.length > 0
            ? ''
            : 'Input validation error, please input the email'
        }
      />
      <UserList
        // canShow={filterKey.length > 3}
        // loading={filterKey.length > 3 ? loading : false}
        canShow={validateEmail() && filterKey.length > 0}
        loading={filterKey.length > 0 ? loading : false}
        resources={loadedData}
        onChange={(value) => onChange(value)}
      />
    </Box>
  );
};

export default SearchUserForm;
