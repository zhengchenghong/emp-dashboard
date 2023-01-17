/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { Box, Typography } from '@material-ui/core';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import graphql from '@app/graphql';
import AppContext from '@app/AppContext';
import { useUserContext } from '@app/providers/UserContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import MaterialMain from './Main';
import MaterialEdit from './Edit';
import TopologyEdit from '../Topology/Edit';
import useStyles from './style';
import { usePaginationContext } from '@app/providers/Pagination';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { useFilterContext } from '@app/providers/FilterContext';
import StatesList from '@app/constants/states.json';
import UserSearch from '@app/components/Forms/UserList/Search';
import { useAssetContext } from '@app/providers/AssetContext';
import { useSearchContext } from '@app/providers/SearchContext';
import {
  create,
  remove,
  update,
  upsertMMA,
  deleteMMA,
  updateAll
} from '@app/utils/ApolloCacheManager';
import { useLessonViewModeContext } from '@app/providers/LessonViewModeContext';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';

const MaterialContainer = ({ history }) => {
  const classes = useStyles();
  const [showEdit, setShowEdit] = useState(false);
  const [whenState, setWhenState] = useState(false);
  const [openNameSearch, setOpenNameSearch] = useState(false);
  const [searchKey, setSearchKey] = useState();
  const [stationMaterials, setStationMaterials] = useState([]);
  const [loadedData, setLoadedData] = useState([]);
  const [currentUser] = useUserContext();
  const [classLoadedData, setClassLoadedData] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [schoolLoadedData, setSchoolLoadedData] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [createShow, setCreateShow] = useState(false);
  const { setOpenRight } = useGalleryContext();
  const [editPanelData, setEditPanelData] = useState();
  const [selectedDocId, setSelectedDocId] = useState();
  const [isForceSave, setIsForceSave] = useState(false);
  const [context, setContext] = useContext(AppContext);
  const [isFirst, setIsFirst] = useState(0);
  const [selectedTreeItem, setSelectedTreeItem] = useState();
  const [selected, setSelected] = useState([]);
  const [parentTreeItem, setParentTreeItem] = useState();
  const [attStatus, setAttStatus] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [forceChangeItem, setForceChangeItem] = useState();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(2500);
  const { nextSelected, setNextSelected } = useSelectionContext();
  const [stationLoadedData, setStationLoadedData] = useState([]);
  const { attachmentsUploaded, setAttachmentUploaded } = useAssetContext();
  const [, , , , , setPageNumber] = usePaginationContext();
  const [cardViewList, setCardViewList] = useState(false);
  const [topologyTitle, setTopologyTitle] = useState('');
  const { setOpenLessonSearch, setSearchClassId, setOpenLessonNameSearch } =
    useSearchContext();
  const { selectedClassItem, setSelectedClassItem, lessonViewMode } =
    useLessonViewModeContext();
  const [isFirstLoad, setFirstLoad] = useState(true);
  const [refreshforCard, setRefreshforCard] = useState(false);
  const { setStations } = useFilterContext();
  const client = useApolloClient();
  const isSmallScreen = useSmallScreen();
  const [createNew, setCreateNew] = useState();
  const [newDoc, setNewDoc] = useState();
  const [expandedIds, setExpandedIds] = useState([]);

  const [refetchIds, setRefetchIds] = useState([]);

  const [publishedDocs, setPublishedDocs] = useState([]);
  const [filterStation, setFilterStation] = useState();
  const [canSearch, setCanSearch] = useState();

  const [schoolTerms, setSchoolTerms] = useState();

  const userInfo = currentUser || null;

  const [variables, setVariables] = useState({
    id: null,
    schemaType: 'material',
    stationId:
      userInfo?.schemaType === 'stationAdmin' ? userInfo?.parentId : null,
    districtId:
      userInfo?.schemaType === 'districtAdmin'
        ? userInfo?.parentId
        : userInfo?.schemaType === 'educator'
        ? userInfo?.topology?.district
        : null,
    schoolId:
      userInfo?.schemaType === 'schoolAdmin' ? userInfo?.parentId : null,
    offset: null,
    limit: null,
    name: null,
    sortBy: 'rank'
  });

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    update: create
  });

  const stationVariables = {
    id: null,
    schemaType: 'station',
    offset: null,
    name: null,
    sortBy: 'createdAt'
  };

  const [
    getAllStations,
    { loading: stationLoading, error: stationError, data: stationData }
  ] = useLazyQuery(graphql.queries.StationGrouping, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const [classVariables, setClassVariables] = usePaginationContext();
  const [classWithoutAuthorVariables] = usePaginationContext();

  useEffect(() => {
    if (!stationLoading && !stationError && stationData) {
      const { grouping } = stationData;
      setStations(grouping);
      setStationLoadedData(grouping);
    }
  }, [stationLoading, stationError, stationData]);

  useEffect(() => {
    if (lessonViewMode === 'Card View') {
      if (selectedTreeItem && selectedClassItem) {
        setCardViewList(true);
        setShowEdit(true);
      } else {
        setShowEdit(false);
        setCardViewList(false);
      }
    } else if (lessonViewMode === 'List View') {
      setCardViewList(false);
    }
    setPageNumber(1);
  }, [lessonViewMode]);

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
        return graphql.queries.MaterialGrouping;
      }
    }
    return graphql.queries.MaterialGrouping;
  };

  const getClassVariables = () => {
    let variable =
      userInfo?.schemaType === 'sysAdmin' ||
      userInfo?.schemaType === 'superAdmin'
        ? classWithoutAuthorVariables
        : classVariables;

    // if (
    //   isFirstLoad &&
    //   (userInfo?.schemaType === 'sysAdmin' ||
    //     userInfo?.schemaType === 'superAdmin')
    // ) {
    //   setClassWithoutAuthorVariables({
    //     ...classWithoutAuthorVariables,
    //     stationId: null,
    //     topology: null,
    //     state: null
    //   });
    //   variable = {
    //     ...variable,
    //     topology: null,
    //     state: null,
    //     stationId: null
    //   };
    //   setFirstLoad(false);
    // }
    variable = {
      ...variable,
      sortBy: 'createdAt'
    };
    return variable;
  };

  const [
    getClass,
    { loading: classLoading, data: classData, error: classError }
  ] = useLazyQuery(graphql.queries.ClassGrouping, {
    fetchPolicy: 'cache-and-network'
  });

  const [
    getAllClass,
    { loading: allClassLoading, data: allClassData, error: allClassError }
  ] = useLazyQuery(graphql.queries.ClassGrouping, {
    fetchPolicy: 'cache-and-network'
  });

  const [
    getSelectedItem,
    { loading: selectedLoading, data: selectedData, error: selectedError }
  ] = useLazyQuery(getGrouping(selectedTreeItem));

  const [
    getSelectedTreeItem,
    {
      loading: selectedTreeLoading,
      data: selectedTreeData,
      error: selectedTreeError
    }
  ] = useLazyQuery(getGrouping(selectedTreeItem));

  const [getMaterials, { loading, error, data }] = useLazyQuery(
    graphql.queries.MaterialGrouping,
    {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    }
  );

  const [
    getSearchMaterials,
    { loading: searchLoading, error: searchError, data: searchData }
  ] = useLazyQuery(graphql.queries.MaterialGrouping, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const schoolVariables = {
    id: selectedTreeItem?.parentId,
    schemaType: 'school',
    // parentId: selectedTreeItem?.parentId,
    offset: null,
    limit: null
  };

  const [
    getSchool,
    { loading: schoolLoading, data: schoolData, error: schoolError }
  ] = useLazyQuery(graphql.queries.SchoolGrouping);

  const fetchSchool = async () => {
    await getSchool({
      variables: schoolVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      const { grouping } = schoolData;
      setSchoolLoadedData(grouping);
    }
  }, [schoolLoading, schoolError, schoolData]);

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });

  const [upsertMMAGrouping] = useMutation(graphql.mutations.upsertMMA, {
    update: upsertMMA
  });

  const [deleteMMAGrouping] = useMutation(graphql.mutations.deleteMMA, {
    update: deleteMMA
  });

  const [createBulkUsersGrouping] = useMutation(
    graphql.mutations.createBulkUsersGrouping
  );

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, selectedTreeItem?._id),
    onCompleted(data) {
      let tmp;
      if (selectedTreeItem?.schemaType === 'material') {
        tmp = loadedData.filter((el) => el._id !== selectedTreeItem?._id);
      } else if (selectedTreeItem?.schemaType === 'class') {
        tmp = loadedData.filter(
          (el) => el.topology?.class !== selectedTreeItem?._id
        );
      } else {
        tmp = loadedData;
      }
      setLoadedData(tmp);
    }
  });

  const [
    getSchoolTerms,
    {
      loading: schoolTermsLoading,
      data: schoolTermsData,
      error: schoolTermsError
    }
  ] = useLazyQuery(graphql.queries.SchoolTermGrouping);

  const fetchSchoolTerms = async () => {
    if (selectedTreeItem?.schemaType === 'class') {
      await getSchoolTerms({
        variables: {
          schoolId: selectedTreeItem?.topology?.school,
          schemaType: 'schoolTerm'
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  };

  const fetchSelected = async () => {
    if (selectedTreeItem == null) return;
    let schemaType = selectedTreeItem?.schemaType;
    if (selectedTreeItem?.intRef?.schemaType) {
      if (selectedTreeItem?.intRef?.schemaType === 'sharedResource') {
        schemaType = 'sharedResource';
      } else {
        schemaType = 'sharedLesson';
      }
    }
    await getSelectedItem({
      variables: {
        id: selectedTreeItem?.intRef?._id
          ? selectedTreeItem?.intRef?._id
          : selectedTreeItem?._id,
        schemaType: schemaType
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });

    if (selectedTreeItem?.intRef?._id) {
      await getSelectedTreeItem({
        variables: {
          id: selectedTreeItem?._id,
          schemaType: selectedTreeItem?.schemaType
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  };

  const fetchClasses = async () => {
    await getClass({
      variables: getClassVariables()
    });
  };

  const fetchAllClasses = async () => {
    await getAllClass({
      variables: {
        ...getClassVariables(),
        offset: null,
        limit: null
      }
    });
  };

  const fetchMaterials = async () => {
    if (selectedTreeItem) {
      await getMaterials({
        variables: {
          schemaType: 'material',
          parentId: refreshforCard
            ? selectedClassItem?._id
            : selectedTreeItem?._id,
          sortBy: 'rank'
        }
      });
      setRefreshforCard(false);
    }
  };

  const refreshMaterials = async (parent_id) => {
    getMaterials({
      variables: {
        schemaType: 'material',
        parentId: parent_id,
        sortBy: 'rank'
      }
    });
  };

  useEffect(() => {
    let prevClassVariable = localStorage.getItem('classVariables');
    if (prevClassVariable) {
      prevClassVariable = JSON.parse(prevClassVariable);
      setOffset(prevClassVariable.offset);
      setClassVariables(prevClassVariable);
    }

    if (lessonViewMode === 'Card View') {
      if (selectedTreeItem && selectedClassItem) {
        setCardViewList(true);
      } else {
        handleMainChange('back', true);
        setTopologyTitle();
        setShowEdit(false);
      }
    }
    if (
      currentUser?.schemaType === 'superAdmin' ||
      currentUser?.schemaType === 'sysAdmin'
    ) {
      getAllStations({
        variables: stationVariables
      });
    }
    fetchAllClasses();
  }, []);

  useEffect(() => {
    if (!selectedLoading && !selectedError && selectedData) {
      const { grouping } = selectedData;
      let selectedItem = grouping[0];
      setEditPanelData(selectedItem);
    }
  }, [selectedLoading, selectedError, selectedData]);

  useEffect(() => {
    if (!selectedTreeLoading && !selectedTreeError && selectedTreeData) {
      const { grouping } = selectedTreeData;
      let selectedItem = grouping[0];
      if (selectedItem?._id === selectedTreeItem?._id) {
        if (selectedTreeItem && selectedItem) {
          if (
            selectedTreeItem?.avatar?.fileName !==
              selectedItem?.avatar?.fileName ||
            selectedTreeItem?.schedule?.startAt !==
              selectedItem?.schedule?.startAt ||
            selectedTreeItem?.schedule?.endAt !== selectedItem?.schedule?.endAt
          ) {
            setSelectedTreeItem(selectedItem);
          }
        }
      }
    }
  }, [selectedTreeLoading, selectedTreeError, selectedTreeData]);

  useEffect(() => {
    if (classData && classData?.grouping?.length) {
      let selectedLesson = localStorage.getItem('previousLesson');
      let selectedClass = localStorage.getItem('previousClass');
      if (selectedClass && selectedClass !== 'undefined') {
        selectedClass = JSON.parse(selectedClass);
        setSelectedClassItem(selectedClass);
      }
      if (selectedLesson) {
        try {
          selectedLesson = JSON.parse(selectedLesson);
          if (selectedTreeItem?.schemaType !== 'class') {
            if (lessonViewMode !== 'Card View') {
              handleMainChange('elSingleClick', selectedLesson);
            } else {
              handleMainChange('elCardClick', selectedLesson);
            }
          }
        } catch (e) {}
      }
    }
  }, [classData]);

  useEffect(() => {
    fetchClasses();
    if (
      userInfo?.schemaType === 'sysAdmin' ||
      userInfo?.schemaType === 'superAdmin'
    ) {
      setFilterStation(classWithoutAuthorVariables?.stationId);
    } else {
      setFilterStation();
    }
  }, [classWithoutAuthorVariables, classVariables]);

  useEffect(() => {
    if (selectedTreeItem?._id) {
      fetchSelected();
      if (!searchKey?.length) {
        fetchMaterials();
        fetchSchool();
      }
    }
    setOpenRight(false);
    if (lessonViewMode === 'Card View') {
      if (selectedTreeItem && selectedClassItem) {
        setCardViewList(true);
      } else {
        handleMainChange('back', true);
        setTopologyTitle();
        setShowEdit(false);
      }
    }
    if (selectedTreeItem?.schemaType === 'class') {
      fetchSchoolTerms();
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    if (schoolTermsData && !schoolTermsError && !schoolTermsLoading) {
      if (selectedTreeItem?.schemaType === 'class') {
        setSchoolTerms(
          schoolTermsData?.grouping.filter(
            (item) =>
              item.topology?.school === selectedTreeItem?.topology?.school
          )
        );
      }
    } else {
      setSchoolTerms();
    }
  }, [schoolTermsData, schoolTermsLoading, schoolTermsError]);

  useEffect(() => {
    if (refresh) {
      setContext({
        ...context,
        groupingAdd: null
      });
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(async () => {
    if (!classLoading && !classError && classData) {
      loadClasses(classData);
    }
  }, [classLoading, classError, classData, offset, limit]);

  const loadClasses = (loadedData) => {
    const { grouping } = loadedData;
    updateAll(client.cache, grouping);
    let sortedData;
    if (userInfo?.schemaType === 'districtAdmin') {
      const tmp = grouping?.filter(
        (el) => el.topology.district === userInfo?.parentId
      );
      sortedData = [...tmp];
    } else if (userInfo?.schemaType === 'stationAdmin') {
      const tmp = grouping?.filter(
        (el) => el.topology.station === userInfo?.parentId
      );
      sortedData = [...tmp];
    } else if (userInfo?.schemaType === 'schoolAdmin') {
      const tmp = grouping?.filter((el) => el.parentId === userInfo?.parentId);
      sortedData = [...tmp];
    } else if (userInfo?.schemaType === 'educator') {
      const tmp = grouping?.filter((el) =>
        el.authorIdList?.includes(userInfo._id)
      );
      sortedData = [...tmp];
    } else {
      sortedData = [...grouping];
    }
    setClassLoadedData(sortedData);
    if (editPanelData == null) {
      let selectedLesson = localStorage.getItem('previousLesson');
      let selectedClass = localStorage.getItem('previousClass');
      if (selectedClass && selectedClass !== 'undefined') {
        selectedClass = JSON.parse(selectedClass);
      }
      if (sortedData?.find((item) => item?._id === selectedClass?._id)) {
        setSelectedClassItem(selectedClass);
        if (selectedLesson && selectedLesson?.schemaType !== 'class') {
          try {
            selectedLesson = JSON.parse(selectedLesson);
            if (lessonViewMode !== 'Card View') {
              handleMainChange('elSingleClick', selectedLesson);
            } else {
              setRefreshforCard(true);
              handleMainChange('elCardClick', selectedLesson);
            }
          } catch (e) {}
        } else {
          handleMainChange('elSingleClick', sortedData[0] ?? null);
        }
      } else {
        setSelectedClassItem(null);
        setSelectedTreeItem(null);
      }
    }
  };

  useEffect(async () => {
    if (!allClassLoading && !allClassError && allClassData) {
      const { grouping } = allClassData;
      updateAll(client.cache, grouping);
      setAllClasses(grouping);
    }
  }, [allClassLoading, allClassError, allClassData]);

  useEffect(() => {
    if (!loading && !error && data) {
      const { grouping } = data;
      let tmp = [...loadedData];
      grouping?.forEach((el) => {
        if (loadedData?.find((item) => item._id === el._id)) {
          let itemIndex = loadedData.findIndex((item) => item._id === el._id);
          tmp[itemIndex] = el;
        } else {
          tmp.push(el);
        }
      });
      if (loadedData?.find((item) => item._id === editPanelData?._id)) {
        let itemIndex = loadedData.findIndex(
          (item) => item._id === editPanelData?._id
        );
        tmp[itemIndex] = editPanelData;
      }
      let parent_id;
      if (grouping?.length) {
        parent_id = grouping[0].parentId;
        tmp = tmp?.filter((item) => item.parentId !== parent_id);
        tmp.push(...grouping);
      }
      if (openNameSearch && searchKey?.length) {
        tmp = tmp?.filter((item) =>
          item.name?.toLowerCase()?.includes(searchKey.toLowerCase())
        );
      }
      setLoadedData(tmp.sort((a, b) => a.rank - b.rank));

      if (refetchIds?.length) {
        refreshMaterials(refetchIds[0]);
        let moreFetchIds = refetchIds?.filter((item) => item !== refetchIds[0]);
        if (moreFetchIds == null) moreFetchIds = [];
        setRefetchIds(moreFetchIds);
      }
    }
  }, [loading, error, data]);

  useEffect(() => {
    if (!searchLoading && !searchError && searchData) {
      const { grouping } = searchData;
      setStationMaterials(grouping);
    }
  }, [searchLoading, searchError, searchData]);

  useEffect(() => {
    if (attachmentsUploaded) {
      // if (whenState) {
      //   setIsForceSave(true);
      // }
      setAttachmentUploaded(false);
    }
  }, [attachmentsUploaded]);

  const getParentItem = (value) => {
    let item = loadedData?.find((e) => e._id === value?.parentId);
    if (!item) item = classLoadedData?.find((e) => e._id === value?.parentId);
    return item;
  };

  const handleMainChange = async (type, value) => {
    if (type === 'elSingleClick') {
      if (value) {
        if (value?.schemaType === 'class') setSelectedClassItem(value);
        setNextSelected(value);
        if (selectedTreeItem && selectedTreeItem['_id'] === value['_id']) {
          return;
        }
        setOpenLessonSearch(false);
        history.push({
          pathname: `/materials/dashboard/${value['_id']}`
        });
        if (!whenState) {
          setShowEdit(true);
          if (value?.intRef?._id) {
            fetchSelected();
          } else {
            setEditPanelData(value);
          }
          setSelectedDocId(value['_id']);
          setSelectedTreeItem(value);
          setSelected(value?._id);
        }
        setParentTreeItem(getParentItem(value));
      }
    }

    if (type === 'elCardClick') {
      if (value) {
        setNextSelected(value);
        if (selectedTreeItem && selectedTreeItem['_id'] === value['_id']) {
          return;
        }
        history.push({
          pathname: `/materials/dashboard/${value['_id']}`
        });
        if (!whenState) {
          setShowEdit(true);
          if (value?.intRef?._id) {
            fetchSelected();
          } else {
            setEditPanelData(value);
          }
          setSelectedDocId(value['_id']);
          setSelectedTreeItem(value);
          setSelected(value?._id);
        }
        setParentTreeItem(getParentItem(value));
      }
    }

    if (type === 'cardViewList') {
      if (value) {
        setSelectedTreeItem(value);
        setCardViewList(true);
      }
    }

    if (type === 'delete') {
      setShowEdit(false);
    }

    if (type === 'refresh') {
      await fetchClasses();
      if (expandedIds?.length) {
        await refreshMaterials(expandedIds[0]);
        setRefetchIds(expandedIds?.filter((item) => item !== expandedIds[0]));
      }
    }

    if (type === 'back') {
      if (lessonViewMode === 'Card View') {
        setShowEdit(false);
      }
      setCardViewList(false);
      setPageNumber(1);
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

    if (type === 'publish') {
      setRefresh(true);
    }

    if (type === 'created') {
      setWhenState(false);
    }

    if (type === 'moveResource') {
      setSearchClassId(value);
      history.push({ pathname: '/resources' });
    }

    if (type === 'unpublish') {
      let tmp = loadedData.slice();
      let unpublishedObj = loadedData.find((item) => item._id === value._id);
      if (unpublishedObj) {
        let index = loadedData.findIndex((item) => item._id === value._id);
        const copyStr = JSON.stringify(value);
        let copyObj = JSON.parse(copyStr);
        copyObj.status = 'unpublished';
        tmp[index] = copyObj;
        setLoadedData(tmp);
      }
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

    if (value) {
      setIsForceSave(true);
    } else {
      setSelectedTreeItem(nextSelected);
    }

    if (isCreate) {
      setCreateShow(true);
      setIsCreate(false);
    }
  };

  const handleChangePage = (newPage) => {
    setOffset(newPage * limit);
  };

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    setLimit(newRowsPerPage);
    setOffset(0);
  };

  useEffect(() => {
    if (publishedDocs && publishedDocs.length > 0) {
      let tmp = [...loadedData];
      publishedDocs?.forEach((el) => {
        if (loadedData?.find((item) => item._id === el._id)) {
          let itemIndex = loadedData.findIndex((item) => item._id === el._id);
          tmp[itemIndex] = el;
        } else {
          tmp.push(el);
        }
      });
      if (loadedData?.find((item) => item._id === editPanelData?._id)) {
        let itemIndex = loadedData.findIndex(
          (item) => item._id === editPanelData?._id
        );
        tmp[itemIndex] = editPanelData;
      }
      setLoadedData(tmp.sort((a, b) => a.rank - b.rank));
    }
  }, [publishedDocs]);

  useEffect(() => {
    if (loadedData?.length) {
      let updatedDoc = loadedData?.find(
        (item) => item._id === selectedTreeItem?._id
      );
      if (updatedDoc) setSelectedTreeItem(updatedDoc);
    }
  }, [loadedData]);

  useEffect(() => {
    if (userInfo) {
      if (
        userInfo.schemaType === 'sysAdmin' ||
        userInfo.schemaType === 'superAdmin'
      ) {
        setCanSearch(filterStation != null);
      } else {
        setCanSearch(true);
      }
    } else {
      setCanSearch(true);
    }
  }, [filterStation, userInfo]);

  useEffect(() => {
    if (searchKey?.length) {
      let searchedLessons =
        stationMaterials?.filter((item) =>
          item?.name?.toLowerCase()?.includes(searchKey.toLowerCase())
        ) || [];
      let parentClasses = [];
      // let childMaterials = [];
      // let parentMaterials = [];
      let allMaterials = [];
      allMaterials = [...searchedLessons];
      searchedLessons?.forEach((sItem) => {
        let parentClass = allClasses?.find(
          (cItem) => cItem?._id === sItem?.topology?.class
        );
        if (
          parentClass &&
          !parentClasses?.find((item) => item?._id === parentClass?._id)
        ) {
          parentClasses.push(parentClass);
        }

        let childrenLessons = stationMaterials?.filter((item) =>
          item?.parentIdList?.includes(sItem?._id)
        );
        childrenLessons?.forEach((cItem) => {
          if (!allMaterials?.find((item) => item?._id === cItem?._id)) {
            allMaterials?.push(cItem);
          }
        });

        if (sItem?.parentId !== sItem?.topology?.class) {
          let parentCollection1 = stationMaterials?.find(
            (item) => item?._id === sItem?.parentId
          );
          if (
            parentCollection1 &&
            !allMaterials?.find((item) => item?._id === parentCollection1?._id)
          ) {
            allMaterials.push(parentCollection1);
            if (
              parentCollection1?.parentId !== parentCollection1?.topology?.class
            ) {
              let parentCollection2 = stationMaterials?.find(
                (item) => item?._id === parentCollection1?.parentId
              );
              if (
                parentCollection2 &&
                !allMaterials?.find(
                  (item) => item?._id === parentCollection2?._id
                )
              ) {
                allMaterials.push(parentCollection2);
              }
            }
          }
        }
      });

      setLoadedData(allMaterials);
      setClassLoadedData(parentClasses);

      let expandIds = [];
      parentClasses?.forEach((item) => {
        expandIds.push(item?._id);
      });
      allMaterials?.forEach((item) => {
        expandIds.push(item?._id);
      });

      setExpandedIds(expandIds);
    }
  }, [stationMaterials, searchKey]);

  useEffect(() => {
    handleSearchChange();
    setOpenNameSearch(false);
  }, [classWithoutAuthorVariables, classVariables]);

  const handleSearchChange = async (searchKey) => {
    setSearchKey(searchKey);
    let variable =
      userInfo?.schemaType === 'sysAdmin' ||
      userInfo?.schemaType === 'superAdmin'
        ? classWithoutAuthorVariables
        : classVariables;
    console.log(variable);

    let variables = {
      schemaType: 'material',
      sortBy: 'rank'
    };

    if (
      userInfo?.schemaType === 'sysAdmin' ||
      userInfo?.schemaType === 'superAdmin'
    ) {
      variables = {
        ...variables,
        stationId: variable?.stationId,
        districtId: variable?.districtId
      };
    }
    if (userInfo?.schemaType === 'stationAdmin') {
      variables = {
        ...variables,
        stationId: userInfo?.parentId
      };
    }
    if (
      userInfo?.schemaType === 'districtAdmin' ||
      userInfo?.schemaType === 'educator'
    ) {
      variables = {
        ...variables,
        districtId: userInfo?.parentId
      };
    }
    if (userInfo?.schemaType === 'schoolAdmin') {
      variables = {
        ...variables,
        schoolId: userInfo?.parentId
      };
    }
    if (searchKey?.length) {
      await getSearchMaterials({ variables });
    } else {
      setExpandedIds([]);
      if (classData?.grouping) {
        loadClasses(classData);
      }
      fetchClasses();
    }
  };

  useEffect(() => {
    if (!openNameSearch) {
      handleSearchChange();
    }
    setOpenLessonNameSearch(openNameSearch);
  }, [openNameSearch]);

  return (
    <Box>
      {!isSmallScreen && (
        <>
          {openNameSearch ? (
            <div className={classes.lessonSearch}>
              <UserSearch
                type={'Lessons'}
                onChange={(value) => handleSearchChange(value)}
                autoFocus={true}
              />
            </div>
          ) : (
            <Typography
              className={classes.topologyTitle}
              style={!isSmallScreen && { maxWidth: 'calc(100% - 220px)' }}
            >
              {currentUser.schemaType !== 'educator' ? topologyTitle : ''}
            </Typography>
          )}
        </>
      )}

      <Box className={!isSmallScreen ? classes.root : classes.rootVertical}>
        <RouteLeavingGuard
          when={attStatus && whenState}
          navigate={(path) => {
            history.push(path);
          }}
          shouldBlockNavigation={(location) => {
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

        {(lessonViewMode === 'List View' ||
          (lessonViewMode === 'Card View' && !showEdit) ||
          cardViewList) && (
          <MaterialMain
            userInfo={userInfo}
            setSelectedDocId={setSelectedDocId}
            selectedDocId={selectedDocId}
            variables={variables}
            resources={loadedData}
            openNameSearch={openNameSearch}
            setOpenNameSearch={setOpenNameSearch}
            selected={selected}
            setSelected={setSelected}
            setResources={setLoadedData}
            onChange={handleMainChange}
            selectedTreeItem={selectedTreeItem}
            setSelectedTreeItem={setSelectedTreeItem}
            createGrouping={createGrouping}
            updateGrouping={updateGrouping}
            deleteDocument={deleteDocument}
            classLoadedData={classLoadedData}
            setClassLoadedData={setClassLoadedData}
            schoolLoadedData={schoolLoadedData}
            isFirst={isFirst}
            setIsFirst={setIsFirst}
            updateShow={setModalShow}
            when={attStatus && whenState}
            stationLoadedData={stationLoadedData}
            setIsCreate={setIsCreate}
            createShow={createShow}
            setCreateShow={setCreateShow}
            editPanelData={editPanelData}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            setVariables={setVariables}
            viewMethod={lessonViewMode}
            history={history}
            cardViewList={cardViewList}
            setTopologyTitle={setTopologyTitle}
            createNew={createNew}
            setCreateNew={setCreateNew}
            setNewDoc={setNewDoc}
            expandedIds={expandedIds}
            setExpandedIds={setExpandedIds}
            canSearch={canSearch}
          />
        )}
        {showEdit &&
          selectedTreeItem &&
          (selectedTreeItem?.schemaType === 'class' ? (
            <TopologyEdit
              parentPage={'Lessons'}
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
              setTopologyTitle={setTopologyTitle}
              parentTreeItem={parentTreeItem}
              onForceChange={handForceChange}
              forceChangeItem={forceChangeItem}
              createBulkUsersGrouping={createBulkUsersGrouping}
              isMaterial={true}
              setRefresh={(value) => setRefresh(value)}
              StatesList={StatesList}
              viewMethod={lessonViewMode}
              setShowEdit={setShowEdit}
              materials={loadedData}
              setCreateNew={setCreateNew}
              cardViewList={cardViewList}
              schoolTerms={schoolTerms}
            />
          ) : (
            <MaterialEdit
              forceSave={isForceSave}
              variables={variables}
              resources={editPanelData}
              setEditPanelData={setEditPanelData}
              setSelectedDocId={setSelectedDocId}
              setSelected={setSelected}
              loadedData={loadedData}
              setLoadedData={setLoadedData}
              whenState={whenState}
              setWhenState={setWhenState}
              classResources={classLoadedData}
              setTopologyTitle={setTopologyTitle}
              schoolLoadedData={schoolLoadedData}
              onChange={handleEditChange}
              onMainChange={(value) => handleMainChange('elSingleClick', value)}
              selectedTreeItem={selectedTreeItem}
              setSelectedTreeItem={setSelectedTreeItem}
              updateGrouping={updateGrouping}
              upsertMMAGrouping={upsertMMAGrouping}
              deleteMMAGrouping={deleteMMAGrouping}
              deleteDocument={deleteDocument}
              handleMainChange={handleMainChange}
              parentTreeItem={parentTreeItem}
              onForceChange={handForceChange}
              forceChangeItem={forceChangeItem}
              viewMethod={lessonViewMode}
              setShowEdit={setShowEdit}
              cardViewList={cardViewList}
              setCreateNew={setCreateNew}
              setPublishedDocs={setPublishedDocs}
              newDoc={newDoc}
              setNewDoc={setNewDoc}
              allClasses={allClasses}
            />
          ))}
      </Box>
    </Box>
  );
};

export default withRouter(MaterialContainer);
