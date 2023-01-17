/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { Box, Typography, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import graphql from '@app/graphql';
import ListStudent from './List';
import useStyles from './style';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { update, groupingList } from '@app/utils/ApolloCacheManager';
import { useUserContext } from '@app/providers/UserContext';

const FilterStudent = ({
  resources,
  setResources,
  docId,
  onChange,
  schoolLoadedData,
  classLoadedData,
  allDevices
}) => {
  const classes = useStyles();
  const [loadedData, setLoadedData] = useState([]);
  const { notify } = useNotifyContext();
  const [studentResources, setStudentResources] = useState([]);
  const [currentUser] = useUserContext();

  const studentVariables = {
    schemaType: 'student',
    parentId: resources?.topology.district
  };

  const {
    loading: studentLoading,
    error: studentError,
    data: studentData
  } = useQuery(graphql.queries.userGrouping, {
    variables: studentVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });

  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  useEffect(() => {
    if (!studentLoading && !studentError) {
      const school = schoolLoadedData?.find(
        (item) => item?._id === resources?.parentId
      );
      const { grouping } = studentData;
      setStudentResources(
        school
          ? grouping.filter((item) => item?.parentId === school?.parentId)
          : grouping
      );
    }
  }, [studentLoading, studentError, studentData]);

  const handleUserSelectOnFilter = (emailAddress) => {
    setLoadedData(
      // studentResources?.find((student) => student.name === emailAddress)
      studentResources?.filter((student) =>
        student.name?.toLowerCase().includes(emailAddress.toLowerCase())
      )
    );
  };

  const handleListChange = async (value) => {
    function GetSortOrder(prop) {
      return function (a, b) {
        if (a[prop] > b[prop]) {
          return 1;
        } else if (a[prop] < b[prop]) {
          return -1;
        }
        return 0;
      };
    }

    try {
      let childrenIdList;
      if (value.childrenIdList) {
        if (value.childrenIdList.includes(docId)) {
          childrenIdList = [...value.childrenIdList];
        } else {
          let tmp = classLoadedData.filter(
            (el) => value.childrenIdList.includes(el._id) || el._id === docId
          );
          tmp.sort(GetSortOrder('name'));
          childrenIdList = tmp.map((el) => {
            return el._id;
          });
        }
      } else {
        childrenIdList = [docId];
      }

      const assignList = resources.assigneeIdList
        ? resources.assigneeIdList.includes(value['_id'])
          ? [...resources.assigneeIdList]
          : [...resources.assigneeIdList, value['_id']]
        : [value['_id']];

      let statusVal = resources?.topology?.state;
      if (statusVal == null) {
        if (value.topology?.state != null && value.topology?.state !== '') {
          statusVal = value.topology?.state;
        } else {
          if (schoolLoadedData?.length > 0) {
            statusVal = schoolLoadedData[0]?.topology?.state;
          }
        }
      }

      let studentTopologyData = {
        state: statusVal,
        station: resources?.topology?.station,
        district: resources?.topology?.district,
        school: null,
        class: null
      };

      let resTopologyData = {
        state: statusVal,
        station: resources?.topology?.station,
        district: resources?.topology?.district,
        school: resources?.topology?.school,
        class: resources?._id
      };

      await updateGroupingList({
        variables: {
          id: value['_id'],
          schemaType: 'student',
          item: docId,
          fieldName: 'childrenIdList',
          type: 'add',
          trackingAuthorName: currentUser?.name
        }
      });

      await updateGroupingList({
        variables: {
          id: resources['_id'],
          schemaType: resources.schemaType,
          item: value['_id'],
          fieldName: 'assigneeIdList',
          type: 'add',
          trackingAuthorName: currentUser?.name
        }
      });
      if (value.intRef?._id) {
        let device = allDevices?.find((item) => item._id === value.intRef?._id);
        if (device) {
          if (!device?.childrenIdList?.includes(resources['_id'])) {
            let newClassIds =
              device?.childrenIdList == null ? [] : [...device?.childrenIdList];
            newClassIds.push(resources['_id']);
            await updateGroupingList({
              variables: {
                id: device?._id,
                schemaType: 'device',
                item: resources['_id'],
                fieldName: 'childrenIdList',
                type: 'add',
                trackingAuthorName: currentUser?.name
              }
            });
          }
        }
      }

      const notiOps = getNotificationOpt('student', 'success', 'create');
      notify(notiOps.message, notiOps.options);
      onChange('added', assignList, value);
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(notiOps.message, notiOps.options);
    }
  };

  return (
    <Box>
      <Typography className={classes.title} variant="h6">
        Search Student
      </Typography>
      <Autocomplete
        freeSolo
        id="free-solo-2-demo"
        disableClearable
        options={
          studentResources && studentResources.map((option) => option.name)
        }
        onChange={(event, newValue) => {
          handleUserSelectOnFilter(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Student email"
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

export default FilterStudent;
