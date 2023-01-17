/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { Box, Typography } from '@material-ui/core';
import LoadingSpinner from '@app/components/LoadingSpinner';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import AppContext from '@app/AppContext';
import { useStateContext } from '@app/providers/StateContext';
import graphql from '@app/graphql';
import DeviceMain from './Main';
import DeviceEdit from './Edit';
import useStyles from './style';
import { update } from '@app/utils/ApolloCacheManager';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { en } from '@app/language';
import { useGalleryContext } from '@app/providers/GalleryContext';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { useUserContext } from '@app/providers/UserContext';

const DeviceContainer = ({ history, match }) => {
  const classes = useStyles();
  const [currentUser] = useUserContext();
  const [showEdit, setShowEdit] = useState(false);
  const [whenState, setWhenState] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [editPanelData, setEditPanelData] = useState();
  const [appContext, setAppContext] = useContext(AppContext);
  const [stateContext, setStateContext] = useStateContext();
  const { nextSelected, setNextSelected } = useSelectionContext();
  const isSmallScreen = useSmallScreen();
  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();
  const [isLoading, setLoading] = useState();

  const [stationLoadedData, setStationLoadedData] = useState([]);

  useEffect(() => {
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
    refetchAllStations();
  }, []);

  const userInfo = currentUser || null;

  const stationVariables = {
    id: userInfo?.topology?.station,
    schemaType: 'station',
    offset: null,
    limit: null,
    sortBy: 'createdAt'
  };

  const [
    getAllStationsReload,
    {
      loading: stationReloadLoading,
      error: stationReloadError,
      data: stationReloadData
    }
  ] = useLazyQuery(graphql.queries.StationGrouping, {
    fetchPolicy: 'network-only'
  });

  const refetchAllStations = async () => {
    await getAllStationsReload({
      variables: stationVariables
    });
  };

  useEffect(() => {
    if (isLoading == null && stationReloadLoading === true) {
      setLoading(true);
    }
    if (isLoading != null && stationReloadLoading === false) {
      setLoading(false);
    }
    if (!stationReloadLoading && !stationReloadError && stationReloadData) {
      const { grouping } = stationReloadData;
      const stationList = [];
      grouping.map((item) =>
        stationList.push({ label: item['name'], value: item['_id'], ...item })
      );
      setStationLoadedData(stationList);
    }
  }, [stationReloadLoading, stationReloadError, stationReloadData]);

  useEffect(() => {
    if (appContext) {
      if (appContext.groupingAdd) {
        const { collectionName, type } = appContext.groupingAdd;
        if (collectionName === 'Topologies' && type === 'state') {
          setLoadedData([...loadedData, appContext.groupingAdd]);
          setAppContext({
            ...appContext,
            groupingAdd: null
          });
        }
      }
      if (appContext.documentDelete) {
        const { _id, collectionName } = appContext.documentDelete;
        if (collectionName === 'Topologies') {
          if (_id === editPanelData['_id']) setShowEdit(false);
          const tmp = loadedData.filter((el) => el['_id'] !== _id);
          setLoadedData(tmp);
          if (tmp.length === 0) setShowEdit(false);
          setAppContext({
            ...appContext,
            documentDelete: null
          });
        }
      }

      if (appContext.groupingUpdate) {
        const { _id, collectionName, type } = appContext.groupingUpdate;
        if (collectionName === 'Topologies' && type === 'state') {
          if (_id && editPanelData && editPanelData['_id'] === _id) {
            setEditPanelData(appContext.groupingUpdate);
          }
          setAppContext({
            ...appContext,
            groupingUpdate: null
          });
        }
      }
    }
  }, [appContext]);

  const handleMainChange = (type, value) => {
    if (value) {
      if (type === 'elSingleClick') {
        console.log('value::', value);
        setNextSelected(value);
        if (stateContext.state && stateContext.state['_id'] === value['_id']) {
          return;
        }

        history.push({
          pathname: `/devices/${value['_id']}`
        });
        if (!whenState) {
          setShowEdit(true);
          setStateContext({
            ...stateContext,
            state: value
          });
          setEditPanelData(value);
        }
      }
    }

    if (type === 'delete') {
      setShowEdit(false);
    }
  };

  const handleGuardChange = (value) => {
    setWhenState(false);
    setShowEdit(true);

    if (value) {
    } else {
      if (nextSelected == null) {
        setEditPanelData(stateContext.state);
        console.log('root selected');
      } else {
        setStateContext({
          ...stateContext,
          state: nextSelected
        });
        setEditPanelData(nextSelected);
      }
    }
  };

  useEffect(() => {
    if (editPanelData) {
      setShowEdit(true);
    }
  }, [editPanelData]);

  return (
    <Box className={!isSmallScreen ? classes.root : classes.rootVertical}>
      <LoadingSpinner loading={isLoading} />
      <RouteLeavingGuard
        when={whenState}
        navigate={(path) => {
          history.push(path);
        }}
        shouldBlockNavigation={(location) => {
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
      <DeviceMain
        selectedTreeItem={editPanelData}
        setSelectedTreeItem={setEditPanelData}
        stationLoadedData={stationLoadedData}
        onChange={handleMainChange}
      />

      {showEdit && editPanelData && (
        <DeviceEdit
          resources={editPanelData}
          stationLoadedData={stationLoadedData}
        />
      )}
    </Box>
  );
};

export default withRouter(DeviceContainer);
