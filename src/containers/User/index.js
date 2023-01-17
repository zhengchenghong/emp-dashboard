/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Typography } from '@material-ui/core';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import { useGalleryContext } from '@app/providers/GalleryContext';
import graphql from '@app/graphql';
import { useStateContext } from '@app/providers/StateContext';
import AppContext from '@app/AppContext';
import UserMain from './Main';
import UserEdit from './Edit';
import useStyles from './style';
import { UsersResource } from './data';
import { en } from '@app/language';
import { useFilterContext } from '@app/providers/FilterContext';
import { useMediaQuery } from 'react-responsive';

const UserContainer = ({ history, match }) => {
  const classes = useStyles();
  const [showEdit, setShowEdit] = useState(true);
  const [whenState, setWhenState] = useState(false);
  const [callUserSave, setCallUserSave] = useState(false);
  const [selectedData, setSelectedData] = useState();
  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();
  const [editPanelData, setEditPanelData] = useState(() => UsersResource[0]);
  const [editTmpData, setEditTmpData] = useState();
  const [selectedDocId, setSelectedDocId] = useState(
    () => UsersResource[0]['_id']
  );
  const [isForceSave, setIsForceSave] = useState(false);
  const [forceSaveDocId, setForceSaveDocId] = useState();
  const [stateContext, setStateContext] = useStateContext();
  const [classLoadedData, setClassLoadedData] = useState([]);
  const [stationLoadedData, setStationLoadedData] = useState([]);
  const [districtLoadedData, setDistrictLoadedData] = useState([]);
  const [schoolLoadedData, setSchoolLoadedData] = useState([]);
  const [context, setContext] = useContext(AppContext);
  const [refresh, setRefresh] = useState(false);
  const { setStations } = useFilterContext();
  const isMobile = useMediaQuery({ query: `(max-width: 688px)` });

  useEffect(() => {
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
  }, []);

  const stationVariables = {
    id: null,
    schemaType: 'station',
    offset: null,
    limit: null
  };

  const classVariables = {
    id: null,
    schemaType: 'class',
    offset: null,
    limit: null
  };

  const districtVariables = {
    id: null,
    schemaType: 'district',
    offset: null,
    limit: null
  };

  const schoolVariables = {
    id: null,
    schemaType: 'school',
    offset: null,
    limit: null
  };

  const {
    loading: stationLoading,
    error: stationError,
    data: stationData
  } = useQuery(graphql.queries.StationGrouping, {
    variables: stationVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (!stationLoading && !stationError) {
      const { grouping } = stationData;
      setStations(grouping);
      let forSelectListValue = [];
      if (grouping?.length > 0) {
        forSelectListValue = grouping.map((item) => {
          return {
            ...item,
            label: item['name'],
            value: item['_id']
          };
        });
      }
      setStationLoadedData(forSelectListValue);
    }
  }, [stationLoading, stationError, stationData]);

  const {
    loading: classLoading,
    error: classError,
    data: classData
  } = useQuery(graphql.queries.ClassGrouping, {
    variables: classVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (!classLoading && !classError) {
      const { grouping } = classData;
      const classList = grouping.map((item) => ({
        label: item['name'],
        value: item['_id'],
        assigneeIdList: item['assigneeIdList'],
        schemaType: item['schemaType'],
        version: item['version'],
        status: item['status'],
        topology: item['topology'],
        authorIdList: item['authorIdList']
      }));
      setClassLoadedData(classList);
    }
  }, [classLoading, classError, classData]);

  const {
    loading: districtLoading,
    error: districtError,
    data: districtData
  } = useQuery(graphql.queries.DistrictGrouping, {
    variables: districtVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (!districtLoading && !districtError) {
      const { grouping } = districtData;

      const districtList = grouping.map((item) => ({
        label: item['name'],
        value: item['_id'],
        childrenIdList: item['childrenIdList'],
        topology: item['topology']
      }));
      setDistrictLoadedData(districtList);
      setStateContext({
        ...stateContext,
        district: grouping
      });
    }
  }, [districtLoading, districtError, districtData]);

  const {
    loading: schoolLoading,
    error: schoolError,
    data: schoolData
  } = useQuery(graphql.queries.SchoolGrouping, {
    variables: schoolVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (!schoolLoading && !schoolError) {
      const { grouping } = schoolData;

      const schoolList = grouping.map((item) => ({
        label: item['name'],
        value: item['_id'],
        childrenIdList: item['childrenIdList'],
        topology: item['topology']
      }));
      setSchoolLoadedData(schoolList);
    }
  }, [schoolLoading, schoolError, schoolData]);

  const handleMainChange = (type, value) => {
    if (type === 'elSingleClick') {
      setEditTmpData(value);
      setStateContext({
        ...stateContext,
        user: value
      });
      history.push({
        pathname: `/users`
      });

      if (!whenState) {
        setShowEdit(true);
        setEditPanelData(value);
        setSelectedDocId(value['_id']);
        setEditTmpData();
      }
    }
    if (type === 'delete') {
      setShowEdit(false);
      setEditPanelData();
      setStateContext({
        ...stateContext,
        user: null
      });
    }
  };

  const handleEditChange = (type, value) => {
    if (type === 'update') {
      setWhenState(value);
    }
    if (type === 'delete') {
      setShowEdit(false);
    }
    if (type === 'forceSave') {
      setIsForceSave(value);
    }
  };

  useEffect(() => {
    if (refresh) {
      setContext({
        ...context,
        groupingAdd: null
      });
      setRefresh(false);
    }
  }, [refresh]);

  const handleGuardChange = (value) => {
    setEditPanelData(editTmpData);
    setSelectedDocId(editTmpData['_id']);
    setEditTmpData();
    if (value) {
      setForceSaveDocId(selectedData['_id']);
      setIsForceSave(true);
      setCallUserSave(true);
    }
    setWhenState(false);
    setShowEdit(true);
  };

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    onCompleted(data) {
      setContext({
        ...context,
        groupingAdd: data.createGrouping
      });
    }
  });

  return (
    <Box className={!isMobile ? classes.root : classes.rootVertical}>
      <RouteLeavingGuard
        when={whenState}
        navigate={(path) => {
          history.push(path);
        }}
        shouldBlockNavigation={() => {
          return whenState;
        }}
        onChange={handleGuardChange}
      >
        <Typography variant="subtitle1" className={classes.warning}>
          {en['There are unsaved changes on the panel.']}
          <br />
          {en['Will you discard your current changes?']}
        </Typography>
      </RouteLeavingGuard>
      <UserMain
        selectedDocId={selectedDocId}
        resources={UsersResource}
        onChange={handleMainChange}
      />

      {showEdit && (
        <UserEdit
          history={history}
          handleMainChange={handleMainChange}
          forceSaveDocId={forceSaveDocId}
          forceSave={isForceSave}
          resources={editPanelData}
          onChange={handleEditChange}
          setCallUserSave={setCallUserSave}
          callUserSave={callUserSave}
          setSelectedData={setSelectedData}
          selectedDocId={selectedDocId}
          selectedData={selectedData}
          stationLoadedData={stationLoadedData}
          districtLoadedData={districtLoadedData}
          setWhenState={setWhenState}
          setRefresh={(value) => setRefresh(value)}
          userTypeData={
            editPanelData['schemaType'] === 'stationAdmin'
              ? stationLoadedData
              : editPanelData['schemaType'] === 'schoolAdmin'
              ? schoolLoadedData
              : districtLoadedData
          }
          schoolLoadedData={schoolLoadedData}
          classLoadedData={classLoadedData}
        />
      )}
    </Box>
  );
};

export default withRouter(UserContainer);
