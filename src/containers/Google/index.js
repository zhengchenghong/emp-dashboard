/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { Box, Typography } from '@material-ui/core';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import graphql from '@app/graphql';
import AppContext from '@app/AppContext';
import { useUserContext } from '@app/providers/UserContext';
import { useStateContext } from '@app/providers/StateContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import GoogleClassMain from './Main';
import GoogleClassEdit from './Edit';
import TopologyEdit from '@app/containers/Topology/Edit';
import StatesList from '@app/constants/states.json';
import useStyles from './style';
import { useAssetContext } from '@app/providers/AssetContext';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { create, remove, update } from '@app/utils/ApolloCacheManager';
import { en } from '@app/language';

const GoogleClassContainer = ({ history, match }) => {
  const classes = useStyles();
  const [showEdit, setShowEdit] = useState(false);
  const [whenState, setWhenState] = useState(false);
  const [isOutSide, setIsOutSide] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [currentUser] = useUserContext();
  const [classLoadedData, setClassLoadedData] = useState([]);
  const [districtLoadedData, setDistrictLoadedData] = useState([]);
  const [schoolLoadedData, setSchoolLoadedData] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [createShow, setCreateShow] = useState(false);
  const { setGalleryData } = useGalleryContext();
  const [editPanelData, setEditPanelData] = useState();
  const [editTmpData, setEditTmpData] = useState();
  const [selectedDocId, setSelectedDocId] = useState();
  const [isForceSave, setIsForceSave] = useState(false);
  const [context, setContext] = useContext(AppContext);
  const [forceSaveDocId, setForceSaveDocId] = useState();
  const [forceSaveDoc, setForceSaveDoc] = useState();
  const [stateContext, setStateContext] = useStateContext();
  const [isFirst, setIsFirst] = useState(0);
  const [selectedTreeItem, setSelectedTreeItem] = useState();
  const [parentTreeItem, setParentTreeItem] = useState();
  const [attStatus, setAttStatus] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState([]);
  const { attachmentsUploaded, setAttachmentUploaded } = useAssetContext();

  const districtInitial = useRef(true);
  const schoolInitial = useRef(true);
  const classInitial = useRef(true);

  const { nextSelected, setNextSelected } = useSelectionContext();

  const [forceChangeItem, setForceChangeItem] = useState();
  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    update: create
  });

  const getGrouping = (selectedTreeItem) => {
    if (selectedTreeItem) {
      const schemaType = selectedTreeItem.schemaType;
      if (schemaType === 'station') {
        return graphql.queries.StationGrouping;
      } else if (schemaType === 'district') {
        return graphql.queries.DistrictGrouping;
      } else if (schemaType === 'school') {
        return graphql.queries.SchoolGrouping;
      } else if (schemaType === 'class') {
        return graphql.queries.ClassGrouping;
      } else if (schemaType === 'material') {
        return graphql.queries.MaterialGrouping;
      } else {
        return graphql.queries.grouping;
      }
    } else {
      return graphql.queries.grouping;
    }
  };

  const [
    getDistrict,
    { loading: districtLoading, data: districtData, error: districtError }
  ] = useLazyQuery(graphql.queries.DistrictGrouping);

  const [
    getSchool,
    { loading: schoolLoading, data: schoolData, error: schoolError }
  ] = useLazyQuery(graphql.queries.SchoolGrouping);

  const [
    getSelectedItem,
    { loading: selectedLoading, data: selectedData, error: selectedError }
  ] = useLazyQuery(getGrouping(selectedTreeItem));

  const [getData, { loading, data, error }] = useLazyQuery(
    graphql.queries.MaterialGrouping,
    {
      onCompleted(data) {
        setLoadedData(data.grouping);
      }
    }
  );

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, selectedTreeItem?._id)
  });
  const userInfo = currentUser || null;

  const variables = {
    id: null,
    schemaType: 'googleMaterial',
    offset: null,
    name: null
  };

  const classVariables = {
    schemaType: 'googleClass',
    authorId: userInfo?.schemaType === 'districtAdmin' ? null : userInfo?._id
  };

  const classWithoutAuthorVariables = {
    schemaType: 'googleClass'
  };

  const schoolVariables = {
    id: null,
    schemaType: 'school',
    offset: null,
    name: null
  };

  const districtVariables = {
    id: userInfo?.parentId,
    schemaType: 'district'
  };

  const fetchSelected = async () => {
    await getSelectedItem({
      variables: {
        id: selectedTreeItem['_id'],
        schemaType: selectedTreeItem['schemaType']
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchSchool = async () => {
    await getSchool({
      variables: schoolVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchDistrict = async () => {
    await getDistrict({
      variables: districtVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchMaterialData = async () => {
    await getData({
      variables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  useEffect(() => {
    if (!selectedLoading && !selectedError && selectedData) {
      const { grouping } = selectedData;
      setEditPanelData(grouping[0]);
    }
  }, [selectedLoading, selectedError, selectedData]);

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      const { grouping } = schoolData;
      const schoolList = [];
      grouping.map((item) =>
        schoolList.push({ label: item['name'], value: item['_id'] })
      );
      setSchoolLoadedData(grouping);
    }
  }, [schoolLoading, schoolError, schoolData]);

  const {
    loading: classLoading,
    error: classError,
    data: classData
  } = useQuery(graphql.queries.ClassGrouping, {
    variables:
      userInfo?.schemaType === 'sysAdmin'
        ? classWithoutAuthorVariables
        : classVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (selectedTreeItem) {
      fetchSelected();
    }
  }, [history.location.pathname, selectedTreeItem]);

  useEffect(() => {
    setGalleryData((data) => ({ ...data, title: 'Banner Gallery' }));
    fetchMaterialData();
  }, []);

  useEffect(() => {
    fetchDistrict();
    fetchSchool();
  }, []);

  useEffect(() => {
    if (refresh) {
      setContext({
        ...context,
        groupingAdd: null
      });
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (attachmentsUploaded) {
      if (whenState) {
        setIsForceSave(true);
      }
      setAttachmentUploaded(false);
    }
  }, [attachmentsUploaded]);

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      const { grouping } = schoolData;
      const schoolList = [];
      grouping.map((item) =>
        schoolList.push({ label: item['name'], value: item['_id'] })
      );
      setSchoolLoadedData(grouping);
    }
  }, [schoolLoading, schoolError, schoolData]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      const { grouping } = districtData;
      const districtList = [];
      grouping.map((item) =>
        districtList.push({ ...item, label: item['name'], value: item['_id'] })
      );
      setDistrictLoadedData(grouping);
    }
  }, [districtLoading, districtError, districtData]);

  useEffect(() => {
    if (!classLoading && !classError) {
      const { grouping } = classData;
      if (userInfo?.schemaType === 'districtAdmin') {
        const tmp = grouping?.filter(
          (el) => el.topology.district === userInfo?.parentId
        );
        setClassLoadedData(tmp);
      } else {
        setClassLoadedData(grouping);
      }
    }
  }, [classLoading, classError, classData]);

  useEffect(() => {
    if (!loading && !error && data) {
      if (!loadedData) {
        setShowEdit(false);
        setIsFirst(isFirst + 1);
        setAttStatus(true);
      }
    }
  }, [loading, error, data]);

  useEffect(() => {
    if (context) {
      if (context.groupingAdd) {
        const { schemaType } = context.groupingAdd;
        if (schemaType === 'material') {
          setContext({
            ...context,
            groupingAdd: null
          });
        }
      }
      if (context.documentDelete) {
        const { _id, schemaType } = context.documentDelete;
        if (schemaType === 'material') {
          if (editPanelData && _id === editPanelData['_id']) setShowEdit(false);
          const tmp = loadedData.filter((el) => el['_id'] !== _id);
          setLoadedData(tmp);
          if (tmp.length === 0) setShowEdit(false);
          setSelectedTreeItem();
          setStateContext({
            ...stateContext,
            material: null
          });
          setContext({
            ...context,
            documentDelete: null
          });
        }
      }

      if (context.groupingUpdate) {
        const { _id, schemaType } = context.groupingUpdate;
        if (schemaType === 'googleMaterial') {
          if (_id && editPanelData && editPanelData['_id'] === _id) {
            setStateContext({
              ...stateContext,
              material: context.groupingUpdate
            });
            setEditPanelData(context.groupingUpdate);
          }
          setContext({
            ...context,
            groupingUpdate: null
          });
        }
      }
    }
  }, [context]);

  useEffect(() => {
    districtInitial.current = false;
  }, [districtLoading]);

  useEffect(() => {
    schoolInitial.current = false;
  }, [schoolLoading]);

  useEffect(() => {
    classInitial.current = false;
  }, [classLoading]);

  const checkIsOutSide = (value) => {
    const tmp = value.split('/').length;
    if (tmp > 2) {
      setIsOutSide(true);
    } else {
      setIsOutSide(false);
    }
  };

  const getParentItem = (value) => {
    let item = loadedData?.find((e) => e._id === value?.parentId);
    if (!item) item = classLoadedData?.find((e) => e._id === value?.parentId);
    return item;
  };

  const handleMainChange = (type, value) => {
    if (type === 'elSingleClick') {
      if (value) {
        setNextSelected(value);
        if (selectedTreeItem && selectedTreeItem['_id'] === value['_id']) {
          return;
        }
        setEditTmpData(value);
        history.push({
          pathname: `/classes/google/${value['_id']}`
        });
        if (!whenState) {
          setShowEdit(true);
          setEditPanelData(value);
          setSelectedDocId(value['_id']);
          setEditTmpData();
          setSelected(value?._id);
          setSelectedTreeItem(value);
        }
        setParentTreeItem(getParentItem(value));
      }
    }

    if (type === 'delete') {
      setShowEdit(false);
    }

    if (type === 'refresh') {
      setRefresh(true);
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

    if (type === 'attachment') {
      setAttStatus(value);
    }
  };

  const handForceChange = (type, value) => {
    if (type === 'altText') {
      let tmp = {
        avatar: {
          altText: value
        }
      };
      setForceChangeItem({ ...forceChangeItem, tmp });
    } else if (type === 'avatar') {
      let baseUrl;
      let fileDir;
      let fileName;
      if (value) {
        const paths = value.split('/');
        fileDir = `${paths[paths.length - 2]}/`;
        baseUrl = value.split(`${fileDir}`)[0];
        fileName = paths[paths.length - 1];
      }
      let tmp = {
        avatar: {
          mimeType: 'image/png',
          baseUrl,
          fileDir,
          fileName,
          status: 'ready'
        }
      };
      setForceChangeItem({ ...forceChangeItem, tmp });
    } else {
      setForceChangeItem({ ...forceChangeItem, [type]: value });
    }
  };

  const handleGuardChange = async (value) => {
    setWhenState(false);
    setShowEdit(true);
    setAttStatus(true);
    // if (isOutSide) {
    //   setEditPanelData(editTmpData);
    //   setSelectedDocId(editTmpData?._id);
    //   setEditTmpData();
    // }

    if (value) {
      // setForceSaveDocId(editPanelData?._id);
      // setForceSaveDoc(editPanelData);
      setIsForceSave(true);
    } else {
      setSelectedTreeItem(nextSelected);
      setSelected(nextSelected?._id);
    }

    if (isCreate) {
      setCreateShow(true);
      setIsCreate(false);
    }
  };

  return (
    <Box className={classes.root}>
      <RouteLeavingGuard
        when={attStatus && whenState}
        navigate={(path) => {
          history.push(path);
        }}
        shouldBlockNavigation={(location) => {
          checkIsOutSide(location.pathname);
          return attStatus && whenState;
        }}
        onChange={handleGuardChange}
        show={modalShow}
        updateShow={setModalShow}
      >
        <Typography variant="subtitle1" className={classes.warning}>
          {en['There are unsaved changes on the panel.']}
          <br />
          {en['Will you discard yor current changes?']}
        </Typography>
      </RouteLeavingGuard>
      <GoogleClassMain
        setSelectedDocId={setSelectedDocId}
        setEditPanelData={setEditPanelData}
        setShowEdit={setShowEdit}
        selectedDocId={selectedDocId}
        variables={variables}
        resources={loadedData}
        selected={selected}
        setSelected={setSelected}
        setResources={setLoadedData}
        onChange={handleMainChange}
        selectedTreeItem={selectedTreeItem}
        setSelectedTreeItem={setSelectedTreeItem}
        createGrouping={createGrouping}
        updateGrouping={updateGrouping}
        classLoadedData={classLoadedData}
        isFirst={isFirst}
        setIsFirst={setIsFirst}
        updateShow={setModalShow}
        when={attStatus && whenState}
        setIsCreate={setIsCreate}
        createShow={createShow}
        setRefresh={(value) => setRefresh(value)}
        setCreateShow={setCreateShow}
        editPanelData={editPanelData}
      />
      {showEdit &&
        (selectedTreeItem?.schemaType === 'googleClass' ? (
          <TopologyEdit
            forceSaveDoc={forceSaveDoc}
            forceSaveDocId={forceSaveDocId}
            parentPage={'GoogleClass'}
            forceSave={isForceSave}
            variables={variables}
            resources={editPanelData}
            setWhenState={setWhenState}
            whenState={whenState}
            showEyeIcon={true}
            setEditPanelData={setEditPanelData}
            schoolLoadedData={schoolLoadedData}
            classLoadedData={classLoadedData}
            onChange={handleEditChange}
            handleMainChange={handleMainChange}
            selectedTreeItem={selectedTreeItem}
            setSelectedTreeItem={setSelectedTreeItem}
            updateGrouping={updateGrouping}
            deleteDocument={deleteDocument}
            setSelected={setSelected}
            parentTreeItem={parentTreeItem}
            onForceChange={handForceChange}
            forceChangeItem={forceChangeItem}
            setRefresh={(value) => setRefresh(value)}
            isMaterial={true}
            StatesList={StatesList}
            loadedData={loadedData} // For Google Class update Material info: google materials array
          />
        ) : (
          <GoogleClassEdit
            forceSaveDocId={forceSaveDocId}
            forceSaveDoc={forceSaveDoc}
            forceSave={isForceSave}
            variables={variables}
            resources={editPanelData}
            loadedData={loadedData}
            setLoadedData={setLoadedData}
            setWhenState={setWhenState}
            classResources={classLoadedData}
            districtLoadedData={districtLoadedData}
            schoolLoadedData={schoolLoadedData}
            onChange={handleEditChange}
            selectedTreeItem={selectedTreeItem}
            setSelectedTreeItem={setSelectedTreeItem}
            updateGrouping={updateGrouping}
            deleteDocument={deleteDocument}
            handleMainChange={handleMainChange}
            parentTreeItem={parentTreeItem}
            onForceChange={handForceChange}
            setRefresh={(value) => setRefresh(value)}
            forceChangeItem={forceChangeItem}
          />
        ))}
    </Box>
  );
};

export default withRouter(GoogleClassContainer);
