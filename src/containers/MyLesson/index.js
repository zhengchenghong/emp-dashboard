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
import MyMaterialMain from './Main';
import MyMaterialEdit from './Edit';
import useStyles from './style';
import { update } from '@app/utils/ApolloCacheManager';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { en } from '@app/language';
import { useGalleryContext } from '@app/providers/GalleryContext';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { useUserContext } from '@app/providers/UserContext';

const MyMaterialContainer = ({ history, match }) => {
  const classes = useStyles();
  const [showEdit, setShowEdit] = useState(false);
  const [whenState, setWhenState] = useState(false);
  const [isOutSide, setIsOutSide] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [editPanelData, setEditPanelData] = useState();
  const [editTmpData, setEditTmpData] = useState();
  const [selectedDocId, setSelectedDocId] = useState();
  const [isForceSave, setIsForceSave] = useState(false);
  const [forceSaveDocId, setForceSaveDocId] = useState();
  const [appContext, setAppContext] = useContext(AppContext);
  const [context, setContext] = useContext(AppContext);
  const [stateContext, setStateContext] = useStateContext();
  const [isFirst, setIsFirst] = useState(0);
  const { nextSelected, setNextSelected } = useSelectionContext();
  const [stationLoadedData, setStationLoadedData] = useState([]);
  const isSmallScreen = useSmallScreen();
  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();
  const [createNew, setCreateNew] = useState();
  const [isLoading, setLoading] = useState();
  const [currentUser] = useUserContext();

  useEffect(() => {
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
    fetchMyMaterials();
    if (
      currentUser?.schemaType === 'superAdmin' ||
      currentUser?.schemaType === 'sysAdmin'
    ) {
      getAllStations({
        variables: stationVariables
      });
    }
  }, []);

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    onCompleted(data) {
      setContext({
        ...context,
        groupingAdd: data.createGrouping
      });
    }
  });

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    onCompleted(data) {
      setContext({
        ...context,
        documentDelete: null
      });
    }
  });

  const variables = {
    id: null,
    schemaType: 'myMaterial',
    authorId:
      currentUser.schemaType === 'superAdmin' ? 'superAdmin' : currentUser?._id,
    offset: null,
    name: null,
    sortBy: 'rank'
  };

  const [getMyMaterials, { loading, error, data }] = useLazyQuery(
    graphql.queries.MaterialGrouping,
    {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'network-only'
    }
  );

  const fetchMyMaterials = async () => {
    await getMyMaterials({
      variables: variables
    });
  };

  const stationVariables = {
    schemaType: 'station',
    sortBy: 'createdAt'
  };

  const [
    getAllStations,
    { loading: stationLoading, error: stationError, data: stationData }
  ] = useLazyQuery(graphql.queries.StationGrouping, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (!stationLoading && !stationError && stationData) {
      const { grouping } = stationData;
      setStationLoadedData(grouping);
    }
  }, [stationLoading, stationError, stationData]);

  useEffect(() => {
    if (isLoading == null && loading === true) {
      setLoading(true);
    }
    if (isLoading != null && loading === false) {
      setLoading(false);
    }
    if (!loading && !error && data) {
      const { grouping } = data;
      setLoadedData(grouping);

      if (grouping?.length > 0) {
        setShowEdit(true);
        let selectedData;
        if (stateContext?.state) {
          selectedData = grouping.find(
            (item) => item['_id'] === stateContext?.state?._id
          );
        } else {
          selectedData = grouping[0];
        }
        setSelectedDocId(selectedData?._id);
        setEditPanelData(selectedData);
      }
      setIsFirst(isFirst + 1);
    }
  }, [loading, error, data]);

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

  const checkIsOutSide = (value) => {
    const tmp = value.split('/').length;
    if (tmp > 2) {
      setIsOutSide(true);
    } else {
      setIsOutSide(false);
    }
  };

  const handleMainChange = (type, value) => {
    if (value) {
      if (type === 'elSingleClick') {
        console.log('value::', value);
        setNextSelected(value);
        if (stateContext.state && stateContext.state['_id'] === value['_id']) {
          return;
        }
        setEditTmpData(value);

        history.push({
          pathname: `/mymaterials/dashboard/${value['_id']}`
        });
        if (!whenState) {
          setShowEdit(true);
          setStateContext({
            ...stateContext,
            state: value
          });
          setEditPanelData(value);
          setSelectedDocId(value['_id']);
          setEditTmpData();
        }
      }
    }

    if (type === 'delete') {
      setShowEdit(false);
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
      setStateContext({
        ...stateContext,
        state: nextSelected
      });
      setEditPanelData(nextSelected);
      setSelectedDocId(nextSelected['_id']);
    }
  };

  const handleGuardChange = (value) => {
    setWhenState(false);
    setShowEdit(true);

    if (value) {
      setIsForceSave(true);
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
        setSelectedDocId(nextSelected['_id']);
        setEditTmpData();
      }
    }
  };

  return (
    <Box className={!isSmallScreen ? classes.root : classes.rootVertical}>
      <LoadingSpinner loading={isLoading} />
      <RouteLeavingGuard
        when={whenState}
        navigate={(path) => {
          history.push(path);
        }}
        shouldBlockNavigation={(location) => {
          checkIsOutSide(location.pathname);
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
      <MyMaterialMain
        selectedDocId={selectedDocId}
        selectedItem={editPanelData}
        variables={variables}
        resources={loadedData}
        stationLoadedData={stationLoadedData}
        createGrouping={createGrouping}
        updateGrouping={updateGrouping}
        onChange={handleMainChange}
        createNew={createNew}
        setCreateNew={setCreateNew}
      />

      {showEdit && (
        <MyMaterialEdit
          forceSaveDocId={forceSaveDocId}
          forceSave={isForceSave}
          variables={variables}
          resources={editPanelData}
          updateGrouping={updateGrouping}
          deleteDocument={deleteDocument}
          onChange={handleEditChange}
          setWhenState={setWhenState}
          whenState={whenState}
          selectedDocId={selectedDocId}
          editPanelData={editPanelData}
          stationLoadedData={stationLoadedData}
          loadedData={loadedData}
          createGrouping={createGrouping}
          handleMainChange={handleMainChange}
          setCreateNew={setCreateNew}
        />
      )}
    </Box>
  );
};

export default withRouter(MyMaterialContainer);
