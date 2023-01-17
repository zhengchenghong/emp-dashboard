/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { Box, Typography } from '@material-ui/core';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import graphql from '@app/graphql';
import AppContext from '@app/AppContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import useStyles from './style';
import { useUserContext } from '@app/providers/UserContext';
import { useSelectionContext } from '@app/providers/SelectionContext';
import StatesList from '@app/constants/states.json';
import { useFilterContext } from '@app/providers/FilterContext';
import { create, remove, update } from '@app/utils/ApolloCacheManager';
import ArchivesMain from './Main';
import ArchivesEdit from './Edit';
import MaterialEdit from './MaterialEdit';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';

const ArchivesContainer = ({ history }) => {
  const classes = useStyles();
  const [currentUser] = useUserContext();
  const [showEdit, setShowEdit] = useState(false);
  const [whenState, setWhenState] = useState(false);
  const [isOutSide, setIsOutSide] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [stationLoadedData, setStationLoadedData] = useState([]);
  const [schoolLoadedData, setSchoolLoadedData] = useState([]);
  const [districtLoadedData, setDistrictLoadedData] = useState([]);
  const [classLoadedData, setClassLoadedData] = useState([]);
  const [materialLoadedData, setMaterialLoadedData] = useState([]);
  const [schoolResources, setSchoolResources] = useState([]);
  const [districtResources, setDistrictResources] = useState([]);
  const [allDistrictResources, setAllDistrictResources] = useState([]);
  const [classResources, setClassResources] = useState([]);
  const [editPanelData, setEditPanelData] = useState();
  const [editTmpData, setEditTmpData] = useState();
  const [selectedDocId, setSelectedDocId] = useState();
  const [isForceSave, setIsForceSave] = useState(false);
  const [context, setContext] = useContext(AppContext);
  const [forceSaveDoc, setForceSaveDoc] = useState();
  const [forceSaveDocId, setForceSaveDocId] = useState();
  const [selectedTreeItem, setSelectedTreeItem] = useState();
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(['root']);
  const [parentTreeItem, setParentTreeItem] = useState();
  const [refresh, setRefresh] = useState(false);
  const [isRootSelected, setRootSelected] = useState(true);
  const { nextSelected, setNextSelected, showRoot, setShowRoot } =
    useSelectionContext();
  const { setStations } = useFilterContext();
  const [topologyTitle, setTopologyTitle] = useState('');
  const isSmallScreen = useSmallScreen();
  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();
  const [addNewClass, setAddNewClass] = useState(false);

  useEffect(() => {
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
  }, []);

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
      }
    } else {
      return graphql.queries.grouping;
    }
  };

  const [
    getSelectedItem,
    { loading: selectedLoading, data: selectedData, error: selectedError }
  ] = useLazyQuery(getGrouping(selectedTreeItem));

  const [
    getSchool,
    { loading: schoolLoading, data: schoolData, error: schoolError }
  ] = useLazyQuery(graphql.queries.SchoolGrouping);

  const [
    getClass,
    { loading: classLoading, data: classData, error: classError }
  ] = useLazyQuery(graphql.queries.ClassGrouping);

  const [
    getDistrict,
    { loading: districtLoading, data: districtData, error: districtError }
  ] = useLazyQuery(graphql.queries.DistrictGrouping);

  const [
    getAllDistrict,
    {
      loading: allDistrictLoading,
      data: allDistrictData,
      error: allDistrictError
    }
  ] = useLazyQuery(graphql.queries.DistrictGrouping);

  const [
    getMaterials,
    { loading: materialLoading, data: materialData, error: materialError }
  ] = useLazyQuery(graphql.queries.MaterialGrouping);

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    update: create
  });

  const [createBulkUsersGrouping] = useMutation(
    graphql.mutations.createBulkUsersGrouping
  );
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, selectedTreeItem?._id),
    onCompleted(data) {
      let tmp;
      if (selectedTreeItem?.schemaType === 'material') {
        tmp = loadedData.filter((el) => el._id !== selectedTreeItem?._id);
        setMaterialLoadedData(tmp);
        setLoadedData(tmp);
      } else if (selectedTreeItem?.schemaType === 'class') {
        tmp = classLoadedData.filter(
          (el) => el.topology?.class !== selectedTreeItem?._id
        );
        setClassLoadedData(tmp);
      } else {
        tmp = loadedData;
      }
    }
  });

  const userInfo = currentUser || null;

  const stationVariables = {
    id: userInfo?.parentId,
    schemaType: 'station',
    offset: null,
    name: null,
    sortBy: 'createdAt'
  };

  const allDistrictVariables = {
    id: null,
    schemaType: 'district',
    offset: null,
    name: null
  };

  const districtVariables = {
    id:
      userInfo && userInfo?.schemaType === 'stationAdmin'
        ? null
        : userInfo?.parentId,
    schemaType: 'district',
    parentId: selectedTreeItem?._id,
    offset: null,
    name: null
  };

  const schoolVariables = {
    id: null,
    schemaType: 'school',
    parentId: selectedTreeItem?._id,
    offset: null,
    name: null
  };

  const classVariables = {
    id: null,
    schemaType: 'archiveClass',
    // parentId: selectedTreeItem?._id
    topology: {
      district: selectedTreeItem?.topology?.district
    }
  };

  const materialVariables = {
    id: null,
    schemaType: 'archiveMaterial',
    parentId: selectedTreeItem?._id,
    sortBy: 'rank'
  };

  const getRefetchSchemaType = (schemaType) => {
    if (schemaType === 'class') return 'archiveClass';
    if (schemaType === 'material') return 'archiveMaterial';
    return schemaType;
  };

  const fetchSelected = async () => {
    await getSelectedItem({
      variables: {
        id: selectedTreeItem['_id'],
        schemaType: getRefetchSchemaType(selectedTreeItem['schemaType'])
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

  const fetchClass = async () => {
    if (selectedTreeItem?.schemaType === 'district') {
      await getClass({
        variables: classVariables,
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  };

  const fetchDistrict = async () => {
    await getDistrict({
      variables: districtVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchAllDistrict = async () => {
    await getAllDistrict({
      variables: allDistrictVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchMaterials = async () => {
    await getMaterials({
      variables: materialVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
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
    setOpenRight(false);
    if (selectedTreeItem && !whenState) {
      fetchSelected();
    }

    if (selectedTreeItem && selectedTreeItem.schemaType === 'station') {
      fetchDistrict();
    }

    if (selectedTreeItem && selectedTreeItem.schemaType === 'district') {
      fetchSchool();
      fetchClass();
    }

    // if (selectedTreeItem && selectedTreeItem.schemaType === 'school') {
    //   fetchClass();
    // }

    if (selectedTreeItem && selectedTreeItem.schemaType === 'class') {
      fetchMaterials();
    }

    if (
      selectedTreeItem?.childrenIdList?.length &&
      selectedTreeItem.schemaType === 'material'
    ) {
      fetchMaterials();
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    setOpenRight(false);
    if (userInfo?.schemaType === 'districtAdmin') {
      fetchDistrict();
    }
    fetchAllDistrict();
    fetchMaterials();
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
    if (showRoot) {
      setShowEdit(true);
      setParentTreeItem();
      setRootSelected(true);
      setEditPanelData();
      setSelected('root');
      setSelectedTreeItem();
      setWhenState(false);
      setShowEdit(true);
      setShowRoot(false);
    }
  }, [showRoot]);

  useEffect(() => {
    if (selectedTreeItem && selectedTreeItem._id === 'root') {
      setShowEdit(false);
    } else if (selectedTreeItem && selectedTreeItem._id !== 'root') {
      // fetchSelected();
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    if (!stationLoading && !stationError) {
      const { grouping } = stationData;
      const stationList = [];
      grouping.map((item) =>
        stationList.push({ label: item['name'], value: item['_id'] })
      );
      setStationLoadedData(grouping);
      setShowLoading(false);
      setStations(grouping);
    }
  }, [stationLoading, stationError, stationData]);

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      const { grouping } = schoolData;
      const schoolList = [];
      grouping.map((item) =>
        schoolList.push({ label: item['name'], value: item['_id'] })
      );
      if (schoolLoadedData) {
        let tmp = schoolLoadedData;
        grouping?.map((el) => {
          if (schoolLoadedData.find((item) => item._id === el._id)) {
            let itemIndex = schoolLoadedData.findIndex(
              (item) => item._id === el._id
            );
            tmp[itemIndex] = el;
          } else {
            tmp.push(el);
          }
          return el;
        });
        setSchoolLoadedData(tmp);
        if (selectedTreeItem?._id) {
          let newexpanded = expanded.includes(selectedTreeItem?._id)
            ? expanded
            : [...expanded, selectedTreeItem?._id];
          setExpanded(newexpanded);
        } else {
          setExpanded(['root']);
        }
      } else {
        setSchoolLoadedData(grouping);
      }
      setSchoolResources(schoolList);
    }
  }, [schoolLoading, schoolError, schoolData]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      const { grouping } = districtData;
      const districtList = [];
      grouping.map((item) =>
        districtList.push({ ...item, label: item['name'], value: item['_id'] })
      );
      if (districtLoadedData) {
        let tmp = [...districtLoadedData];
        grouping?.forEach((el) => {
          if (districtLoadedData.find((item) => item._id === el._id)) {
            let itemIndex = districtLoadedData.findIndex(
              (item) => item._id === el._id
            );
            tmp[itemIndex] = el;
          } else {
            tmp.push(el);
          }
        });
        setDistrictLoadedData(tmp);
        if (selectedTreeItem?._id) {
          let newexpanded = expanded.includes(selectedTreeItem?._id)
            ? expanded
            : [...expanded, selectedTreeItem?._id];
          setExpanded(newexpanded);
        } else {
          setExpanded(['root']);
        }
      } else {
        setDistrictLoadedData(grouping);
      }
      setDistrictResources(districtList);
    }
  }, [districtLoading, districtError, districtData]);

  useEffect(() => {
    if (!allDistrictLoading && !allDistrictError && allDistrictData) {
      const { grouping } = allDistrictData;
      setAllDistrictResources(grouping);
    }
  }, [allDistrictLoading, allDistrictError, allDistrictData]);

  useEffect(() => {
    if (!classLoading && !classError && classData) {
      const { grouping } = classData;
      const classList = [];
      grouping.map((item) =>
        classList.push({ ...item, label: item['name'], value: item['_id'] })
      );
      if (classLoadedData) {
        let tmp = classLoadedData;
        grouping?.forEach((el) => {
          if (classLoadedData.find((item) => item._id === el._id)) {
            let itemIndex = classLoadedData.findIndex(
              (item) => item._id === el._id
            );
            tmp[itemIndex] = el;
          } else {
            tmp.push(el);
          }
        });
        setClassLoadedData(tmp);
        if (selectedTreeItem?._id) {
          let newexpanded = expanded.includes(selectedTreeItem?._id)
            ? expanded
            : [...expanded, selectedTreeItem?._id];
          setExpanded(newexpanded);
        } else {
          setExpanded(['root']);
        }
      } else {
        setClassLoadedData(grouping);
      }
      setClassResources(classList);
    }
  }, [classLoading, classError, classData]);

  useEffect(() => {
    if (!materialLoading && !materialError && materialData) {
      const { grouping } = materialData;
      let sortedData = [...materialLoadedData.slice()];
      // materialLoadedData?.length
      //   ? [...materialLoadedData.slice(), ...grouping]
      //   : [...grouping];
      grouping?.forEach((mItem) => {
        let existOne = sortedData?.find((sItem) => sItem?._id === mItem?._id);
        if (!existOne) {
          sortedData.push(mItem);
        }
      });

      setMaterialLoadedData(sortedData.sort((a, b) => a.rank - b.rank));
      setLoadedData(sortedData.sort((a, b) => a.rank - b.rank));
    }
  }, [materialLoading, materialError, materialData]);

  useEffect(() => {
    if (!selectedLoading && !selectedError && selectedData) {
      const { grouping } = selectedData;
      if (!whenState && grouping?.length) {
        const selectedItem = grouping.find(
          (el) => el._id === selectedTreeItem?._id
        );
        setEditPanelData(selectedItem);
        setEditTmpData(selectedItem);
      }
    }
  }, [selectedLoading, selectedError, selectedData]);

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
          setContext({
            ...context,
            documentDelete: null
          });
        }
      }

      if (context.groupingUpdate) {
        const { _id, schemaType } = context.groupingUpdate;
        if (schemaType === 'material') {
          if (_id && editPanelData && editPanelData['_id'] === _id) {
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

  const checkIsOutSide = (value) => {
    const tmp = value.split('/').length;
    if (tmp > 2) {
      setIsOutSide(true);
    } else {
      setIsOutSide(false);
    }
  };

  const getParentItem = (value) => {
    let type = value?.schemaType;
    let item;
    if (type === 'class')
      item = schoolLoadedData?.find((e) => e._id === value?.parentId);
    if (type === 'school')
      item = districtLoadedData?.find((e) => e._id === value?.parentId);
    if (type === 'district')
      item = stationLoadedData?.find((e) => e._id === value?.parentId);
    return item;
  };

  const handleMainChange = (type, value) => {
    if (type === 'elSingleClick') {
      if (value) {
        console.log(value);
        setNextSelected(value);
        setRootSelected(false);
        if (selectedTreeItem && selectedTreeItem['_id'] === value['_id']) {
          return;
        }
        setEditTmpData(value);

        history.push({
          pathname: `/archives/${value?._id}`
        });

        if (!whenState) {
          setShowEdit(true);
          setEditPanelData(value);
          setSelectedDocId(value?._id);
          setEditTmpData();
          setSelected(value?._id);
          setSelectedTreeItem(value);
        }
        setParentTreeItem(getParentItem(value));
      }
    }

    if (type === 'root') {
      history.push({
        pathname: `/archives`
      });

      setNextSelected(value);

      if (!whenState) {
        setShowEdit(true);
        setParentTreeItem();
        setRootSelected(true);
        setEditPanelData();
        setSelected('root');
        setSelectedTreeItem();
        console.log('root selected');
      }
    }

    if (type === 'delete') {
      setShowEdit(false);
    }
    if (type === 'refresh') {
      setRefresh(true);
    }
    if (type === 'changeStation') {
      setShowEdit(false);
      setEditPanelData();
    }

    if (type === 'new') {
      setAddNewClass(true);
    }

    if (type === 'update') {
      setAddNewClass(false);
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
    if (type === 'refresh') {
      setRefresh(true);
    }
  };

  const handleGuardChange = async (value) => {
    setWhenState(false);
    setShowEdit(true);
    if (value) {
      setIsForceSave(true);
    } else {
      if (nextSelected == null) {
        setShowEdit(true);
        setParentTreeItem();
        setRootSelected(true);
        setEditPanelData();
        setSelected('root');
        setSelectedTreeItem();
        console.log('root selected');
      } else {
        setSelectedTreeItem(nextSelected);
        setSelected(nextSelected?._id);
      }
    }
  };

  return (
    <Box className={!isSmallScreen ? classes.root : classes.rootVertical}>
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
      <ArchivesMain
        setSelectedDocId={setSelectedDocId}
        setEditPanelData={setEditPanelData}
        setShowEdit={setShowEdit}
        showLoading={showLoading}
        selectedDocId={selectedDocId}
        resources={loadedData}
        showStateFilter={true}
        onChange={handleMainChange}
        selectedTreeItem={selectedTreeItem}
        setSelectedTreeItem={setSelectedTreeItem}
        createGrouping={createGrouping}
        updateGrouping={updateGrouping}
        stationLoadedData={stationLoadedData}
        districtLoadedData={districtLoadedData}
        schoolLoadedData={schoolLoadedData}
        classLoadedData={classLoadedData}
        materialLoadedData={materialLoadedData}
        selected={selected}
        setSelected={setSelected}
        expanded={expanded}
        setExpanded={setExpanded}
        setResources={setLoadedData}
        userInfo={userInfo}
        setStationLoadedData={setStationLoadedData}
        addNewClass={addNewClass}
      />
      {showEdit &&
        (selectedTreeItem?.schemaType !== 'material' ? (
          <ArchivesEdit
            createGrouping={createGrouping}
            forceSaveDoc={forceSaveDoc}
            forceSaveDocId={forceSaveDocId}
            forceSave={isForceSave}
            resources={editPanelData}
            loadedData={loadedData}
            setWhenState={setWhenState}
            whenState={whenState}
            schoolResources={schoolResources}
            districtResources={districtResources}
            classResources={classResources}
            classLoadedData={classLoadedData}
            stationLoadedData={stationLoadedData}
            districtLoadedData={districtLoadedData}
            schoolLoadedData={schoolLoadedData}
            setClassLoadedData={classLoadedData}
            setEditPanelData={setEditPanelData}
            setSchoolLoadedData={setSchoolLoadedData}
            setDistrictLoadedData={setDistrictLoadedData}
            setStationLoadedData={setStationLoadedData}
            allDistrictResources={allDistrictResources}
            onChange={handleEditChange}
            handleMainChange={handleMainChange}
            selectedTreeItem={selectedTreeItem}
            setSelectedTreeItem={setSelectedTreeItem}
            setRefresh={(value) => setRefresh(value)}
            createBulkUsersGrouping={createBulkUsersGrouping}
            updateGrouping={updateGrouping}
            deleteDocument={deleteDocument}
            selected={selected}
            setSelected={setSelected}
            expanded={expanded}
            setExpanded={setExpanded}
            parentTreeItem={parentTreeItem}
            isRoot={isRootSelected}
            StatesList={StatesList}
            addNewClass={addNewClass}
          />
        ) : (
          <MaterialEdit
            resources={editPanelData}
            setEditPanelData={setEditPanelData}
            setSelectedDocId={setSelectedDocId}
            setSelected={setSelected}
            loadedData={loadedData}
            setLoadedData={setLoadedData}
            whenState={whenState}
            setWhenState={setWhenState}
            setEditTmpData={setEditTmpData}
            classResources={classLoadedData}
            schoolLoadedData={schoolLoadedData}
            onMainChange={(value) => handleMainChange('elSingleClick', value)}
            selectedTreeItem={selectedTreeItem}
            setSelectedTreeItem={setSelectedTreeItem}
            handleMainChange={handleMainChange}
            parentTreeItem={parentTreeItem}
            setShowEdit={setShowEdit}
            setTopologyTitle={setTopologyTitle}
            deleteDocument={deleteDocument}
            onChange={handleEditChange}
          />
        ))}
    </Box>
  );
};

export default withRouter(ArchivesContainer);
