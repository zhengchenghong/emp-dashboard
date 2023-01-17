/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Typography, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getNotificationOpt } from '@app/constants/Notifications';
import graphql from '@app/graphql';
import ListStudent from './List';
import useStyles from './style';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';

const FilterEducator = ({
  resources,
  setResources,
  docId,
  onChange,
  loadedMaterials,
  schoolLoadedData
}) => {
  const classes = useStyles();
  const [loadedData, setLoadedData] = useState([]);
  const { notify } = useNotifyContext();
  const [email, setEmail] = useState('');
  const [educatorResources, setEducatorResources] = useState([]);
  const [currentUser] = useUserContext();

  const validateEmail = (value) => {
    return new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g).test(
      value
    );
  };

  const educatorVariables = {
    id: null,
    schemaType: 'educator',
    offset: null,
    name: null
  };

  const {
    loading: educatorLoading,
    error: educatorError,
    data: educatorData
  } = useQuery(graphql.queries.userGrouping, {
    variables: educatorVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update(cache, { data: { updateGrouping } }) {
      cache.modify({
        fields: {
          grouping(allGrouping = []) {
            const updatedGrouping = allGrouping.map((group) => {
              if (group._id === updateGrouping._id) {
                return updateGrouping;
              }
              return group;
            });
            return updatedGrouping;
          }
        }
      });
    }
  });

  useEffect(() => {
    if (!educatorLoading && !educatorError) {
      const school = schoolLoadedData?.find(
        (item) => item?._id === resources?.parentId
      );
      const { grouping } = educatorData;
      setEducatorResources(
        school
          ? grouping.filter((item) => item?.parentId === school?.parentId)
          : grouping
      );
    }
  }, [educatorLoading, educatorError, educatorData]);

  const handleUserSelectOnFilter = (emailAddress) => {
    setLoadedData(
      educatorResources?.filter((student) =>
        student.name?.toLowerCase().includes(emailAddress.toLowerCase())
      )
    );
  };

  const handleListChange = async (value) => {
    try {
      const childrenIdList = value.childrenIdList
        ? value.childrenIdList.includes(docId)
          ? [...value.childrenIdList]
          : [...value.childrenIdList, docId]
        : [docId];

      const authorList = resources.authorIdList
        ? resources.authorIdList.includes(value['_id'])
          ? [...resources.authorIdList]
          : [...resources.authorIdList, value['_id']]
        : [value['_id']];

      let topologyData = {
        state: resources?.topology?.state,
        station: resources?.topology?.station,
        district: resources?.topology?.district,
        school: null,
        class: null
      };

      await updateGrouping({
        variables: {
          id: value['_id'],
          schemaType: 'educator',
          version: value.version,
          contact: value.contact,
          childrenIdList,
          topology: topologyData
        }
      });
      console.log('res:', resources);
      console.log('topologyData:', topologyData);
      await updateGrouping({
        variables: {
          id: resources['_id'],
          schemaType: resources.schemaType,
          version: resources.version,
          authorIdList: authorList
        }
      });

      const notiOps = getNotificationOpt('educator', 'success', 'create');
      notify(notiOps.message, notiOps.options);
      onChange('added');
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(notiOps.message, notiOps.options);
    }
  };
  return (
    <Box>
      <Typography className={classes.title} variant="h6">
        Search Educator
      </Typography>
      <Autocomplete
        freeSolo
        id="free-solo-2-demo"
        disableClearable
        options={
          educatorResources && educatorResources.map((option) => option.name)
        }
        onChange={(event, newValue) => {
          handleUserSelectOnFilter(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          handleUserSelectOnFilter(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Educator email"
            margin="normal"
            variant="outlined"
            autoFocus={true}
            type="email"
            InputProps={{ ...params.InputProps, type: 'search' }}
          />
        )}
      />
      {loadedData?.length > 0 && (
        <ListStudent
          canShow={loadedData?.length > 0}
          loading={false}
          resources={loadedData}
          onChange={handleListChange}
        />
      )}
    </Box>
  );
};

export default FilterEducator;
