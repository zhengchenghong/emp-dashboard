/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useLazyQuery,
  useApolloClient
} from '@apollo/client';
import { Box, Typography } from '@material-ui/core';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import graphql from '@app/graphql';
import AppContext from '@app/AppContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import TopologyMain from './Main';
import TopologyEdit from './Edit';
import useStyles from './style';
import { useUserContext } from '@app/providers/UserContext';
import { useSelectionContext } from '@app/providers/SelectionContext';
import StatesList from '@app/constants/states.json';
import { useFilterContext } from '@app/providers/FilterContext';
import { create, update, updateAll } from '@app/utils/ApolloCacheManager';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import useMediumScreen from '@app/utils/hooks/useMediumScreen';

const TopologyContainer = ({ history }) => {
  const classes = useStyles();
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const [currentUser] = useUserContext();
  const [showEdit, setShowEdit] = useState(false);
  const [whenState, setWhenState] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [stationLoadedData, setStationLoadedData] = useState([]);
  const [schoolLoadedData, setSchoolLoadedData] = useState([]);
  const [districtLoadedData, setDistrictLoadedData] = useState([]);
  const [classLoadedData, setClassLoadedData] = useState([]);
  const [allDistrictResources, setAllDistrictResources] = useState([]);
  const [allSchoolResources, setAllSchoolResources] = useState([]);
  const [allClassResources, setAllClassResources] = useState([]);
  const [archivedClasses, setArchivedClasses] = useState();
  const [classResources, setClassResources] = useState([]);
  const { setOpenRight } = useGalleryContext();
  const [editPanelData, setEditPanelData] = useState();
  const [selectedDocId, setSelectedDocId] = useState();
  const [isForceSave, setIsForceSave] = useState(false);
  const [context, setContext] = useContext(AppContext);
  const [selectedTreeItem, setSelectedTreeItem] = useState();
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(['root']);
  const [parentTreeItem, setParentTreeItem] = useState();
  const [refresh, setRefresh] = useState(false);
  const [isRootSelected, setRootSelected] = useState(false);
  const { nextSelected, setNextSelected, showRoot, setShowRoot } =
    useSelectionContext();
  const { setStations } = useFilterContext();
  const client = useApolloClient();
  const [createNew, setCreateNew] = useState();
  const [newTopologyId, setNewTopologyId] = useState();

  const [schoolTerms, setSchoolTerms] = useState();

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
    getArchivedClass,
    {
      loading: archivedClassLoading,
      data: archivedClassData,
      error: archivedClassError
    }
  ] = useLazyQuery(graphql.queries.ClassGrouping);

  const [
    getSchoolTerms,
    {
      loading: schoolTermsLoading,
      data: schoolTermsData,
      error: schoolTermsError
    }
  ] = useLazyQuery(graphql.queries.SchoolTermGrouping);

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
    getGoogleClass,
    {
      loading: googleClassLoading,
      data: googleClassData,
      error: googleClassError
    }
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

  const userInfo = currentUser || null;

  const stationVariables = {
    id: userInfo?.parentId,
    schemaType: 'station',
    offset: null,
    limit: null,
    sortBy: 'createdAt'
  };

  const allDistrictVariables = {
    id: null,
    schemaType: 'district',
    stationId:
      userInfo?.schemaType === 'stationAdmin' ? userInfo?.parentId : null,
    districtId:
      userInfo?.schemaType === 'districtAdmin' ? userInfo?.parentId : null,
    offset: null,
    limit: null
  };

  const districtVariables = {
    id:
      userInfo && userInfo?.schemaType === 'stationAdmin'
        ? null
        : userInfo?.parentId,
    schemaType: 'district',
    parentId: selectedTreeItem?._id,
    offset: null,
    limit: null
  };

  const allSchoolVariables = {
    id: null,
    schemaType: 'school',
    stationId:
      userInfo?.schemaType === 'stationAdmin' ? userInfo?.parentId : null,
    districtId:
      userInfo?.schemaType === 'districtAdmin' ? userInfo?.parentId : null,
    schoolId:
      userInfo?.schemaType === 'schoolAdmin' ? userInfo?.parentId : null,
    offset: null,
    limit: null
  };

  const schoolVariables = {
    id: userInfo?.schemaType === 'schoolAdmin' ? userInfo?.parentId : null,
    schemaType: 'school',
    parentId: selectedTreeItem?._id || null,
    offset: null,
    limit: null
  };

  const classVariables =
    selectedTreeItem?.schemaType === 'school'
      ? {
          id: null,
          schemaType: 'class',
          parentId: selectedTreeItem?._id
        }
      : {
          id: null,
          schemaType: 'class',
          topology: {
            district: selectedTreeItem?._id
          }
        };

  const googleClassVariables = {
    id: null,
    schemaType: 'class',
    source: {
      classSource: {
        name: 'Google Classroom'
      }
    }
  };

  const {
    loading: allDistrictReloadLoading,
    data: allDistrictReloadData,
    error: allDistrictReloadError,
    refetch: getAllDistrictReload
  } = useQuery(graphql.queries.DistrictGrouping, {
    variables: {
      id: null,
      schemaType: 'district',
      stationId:
        userInfo?.schemaType === 'stationAdmin' ? userInfo?.parentId : null,
      districtId:
        userInfo?.schemaType === 'districtAdmin' ? userInfo?.parentId : null,
      offset: null,
      limit: null
    },
    fetchPolicy: 'network-only'
  });

  // const [
  //   getAllDistrictReload,
  //   {
  //     loading: allDistrictReloadLoading,
  //     data: allDistrictReloadData,
  //     error: allDistrictReloadError
  //   }
  // ] = useLazyQuery(graphql.queries.DistrictGrouping, {
  //   fetchPolicy: 'network-only'
  // });

  const {
    loading: classReloadLoading,
    data: classReloadData,
    error: classReloadError,
    refetch: getClassReload
  } = useQuery(graphql.queries.ClassGrouping, {
    variables: {
      id: null,
      schemaType: 'class',
      stationId:
        userInfo?.schemaType === 'stationAdmin' ? userInfo?.parentId : null,
      districtId:
        userInfo?.schemaType === 'districtAdmin' ? userInfo?.parentId : null,
      parentId:
        userInfo?.schemaType === 'schoolAdmin' ? userInfo?.parentId : null
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const [
    getAllStationsReload,
    {
      loading: stationReloadLoading,
      error: stationReloadError,
      data: stationReloadData
    }
  ] = useLazyQuery(graphql.queries.StationGrouping, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const [
    getAllSchool,
    { loading: allSchoolLoading, data: allSchoolData, error: allSchoolError }
  ] = useLazyQuery(graphql.queries.SchoolGrouping);

  // const [
  //   getAllSchoolReload,
  //   {
  //     loading: allSchoolReloadLoading,
  //     data: allSchoolReloadData,
  //     error: allSchoolReloadError
  //   }
  // ] = useLazyQuery(graphql.queries.SchoolGrouping, {
  //   fetchPolicy: 'no-cache'
  // });

  const {
    loading: allSchoolReloadLoading,
    data: allSchoolReloadData,
    error: allSchoolReloadError,
    refetch: getAllSchoolReload
  } = useQuery(graphql.queries.SchoolGrouping, {
    variables: allSchoolVariables,
    fetchPolicy: 'network-only'
  });

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
    update(cache, { data: { deleteDocument } }) {
      cache.modify({
        fields: {
          grouping(allGrouping = []) {
            const updatedGrouping = allGrouping.filter(
              (el) => el._id !== selectedTreeItem?._id
            );
            return updatedGrouping;
          }
        }
      });
    },
    onCompleted(data) {
      let tmp;
      switch (selectedTreeItem?.schemaType) {
        case 'station':
          tmp = stationLoadedData.filter(
            (el) => el._id !== selectedTreeItem?._id
          );
          setStationLoadedData(tmp);
          break;
        case 'district':
          tmp = districtLoadedData.filter(
            (el) => el._id !== selectedTreeItem?._id
          );
          setDistrictLoadedData(tmp);
          break;
        case 'school':
          tmp = schoolLoadedData?.filter(
            (el) => el._id !== selectedTreeItem?._id
          );
          setSchoolLoadedData(tmp);
          break;
        case 'class':
          tmp = classLoadedData.filter(
            (el) => el._id !== selectedTreeItem?._id
          );
          setClassLoadedData(tmp);
          break;
        default:
          break;
      }
    }
  });

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

  const fetchAllSchool = async () => {
    await getAllSchool({
      variables: allSchoolVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchClass = async () => {
    await getClass({
      variables: classVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

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

  const fetchGoogleClass = async () => {
    await getGoogleClass({
      variables: googleClassVariables,
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

  const fetchAllDistrict = async () => {
    if (
      userInfo?.schemaType !== 'schoolAdmin' &&
      userInfo?.schemaType !== 'educator'
    ) {
      await getAllDistrict({
        variables: allDistrictVariables,
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  };

  const refetchAllStations = async () => {
    await getAllStationsReload({
      variables: stationVariables
    });
  };

  const refetchAllDistrict = async () => {
    if (
      userInfo?.schemaType !== 'schoolAdmin' &&
      userInfo?.schemaType !== 'educator'
    ) {
      await getAllDistrictReload();
    }
  };

  const refetchAllSchool = async () => {
    await getAllSchoolReload();
  };

  const refetchAllClass = async () => {
    await getClassReload();
  };

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
    if (selectedTreeItem) {
      setOpenRight(false);
      if (selectedTreeItem && selectedTreeItem.schemaType === 'station') {
        fetchDistrict();
      }

      if (selectedTreeItem && selectedTreeItem.schemaType === 'district') {
        fetchSchool();
        fetchClass();
      }

      if (selectedTreeItem && selectedTreeItem.schemaType === 'school') {
        fetchClass();
      }

      if (selectedTreeItem && selectedTreeItem.schemaType === 'class') {
        fetchSchoolTerms();
      }
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    const last_path = window.sessionStorage.getItem('last_path');
    if (last_path) {
      if (
        currentUser?.schemaType === 'educator' &&
        (last_path?.includes('topology') ||
          last_path?.includes('users') ||
          last_path?.includes('message') ||
          last_path?.includes('galleries') ||
          last_path?.includes('archives') ||
          last_path?.includes('libraries') ||
          last_path?.includes('devices')) //
      ) {
        history.push('/materials/dashboard');
      } else if (
        currentUser?.schemaType === 'schoolAdmin' &&
        (last_path?.includes('users') ||
          last_path?.includes('message') ||
          last_path?.includes('galleries') ||
          last_path?.includes('libraries') ||
          last_path?.includes('classes/google'))
      ) {
        history.push('/topology');
      } else if (
        currentUser?.schemaType === 'stationAdmin' &&
        (last_path?.includes('users') ||
          last_path?.includes('galleries') ||
          last_path?.includes('libraries') ||
          last_path?.includes('message')) //
      ) {
        history.push('/topology');
      } else if (
        currentUser?.schemaType === 'districtAdmin' &&
        (last_path?.includes('users') ||
          last_path?.includes('galleries') ||
          last_path?.includes('message') ||
          last_path?.includes('libraries')) //
      ) {
        history.push('/topology');
      } else {
        history.push(last_path);
      }
      window.sessionStorage.removeItem('last_path');
      window.sessionStorage.removeItem('user_name');
    } else {
      if (last_path && currentUser?.name) {
        history.push(last_path);
      }
      window.sessionStorage.removeItem('last_path');
      window.sessionStorage.removeItem('user_name');
    }
    if (stationLoadedData === null || stationLoadedData?.length === 0) {
      refetchAllStations();
    }
    setOpenRight(false);
    if (userInfo?.schemaType === 'districtAdmin') {
      fetchDistrict();
    } else if (userInfo?.schemaType === 'schoolAdmin') {
      fetchSchool();
    }
    if (allDistrictResources == null || allDistrictResources?.length === 0) {
      fetchAllDistrict();
    }
    if (allSchoolResources == null || allSchoolResources?.length === 0) {
      fetchAllSchool();
    }
    if (allClassResources == null || allClassResources?.length === 0) {
      refetchAllClass();
    }
  }, [window.location.pathname]);

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
      setShowRoot(false);
    }
  }, [showRoot]);

  useEffect(() => {
    if (selectedTreeItem && selectedTreeItem._id === 'root') {
      setShowEdit(false);
    } else if (selectedTreeItem && selectedTreeItem._id !== 'root') {
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    if (!stationReloadLoading && !stationReloadError && stationReloadData) {
      const { grouping } = stationReloadData;
      const stationList = [];
      grouping.map((item) =>
        stationList.push({ label: item['name'], value: item['_id'] })
      );
      setStationLoadedData(grouping);
      setShowLoading(false);
      setStations(grouping);
    }
  }, [stationReloadLoading, stationReloadError, stationReloadData]);

  useEffect(() => {
    if (currentUser?.schemaType === 'stationAdmin' && stationLoadedData) {
      if (isSmallScreen || isMediumScreen) {
        if (!editPanelData) {
          handleMainChange('elSingleClick', stationLoadedData[0]);
        }
        if (!selectedDocId) {
          setSelectedDocId(stationLoadedData[0]?._id);
        }
      }
    }
    if (stationLoadedData && editPanelData?.schemaType === 'station') {
      let updatedData = stationLoadedData.find(
        (item) => item._id === editPanelData._id
      );
      setEditPanelData(updatedData);
      if (selectedTreeItem?._id === updatedData?._id) {
        setSelectedTreeItem(updatedData);
      }
    }
  }, [stationLoadedData]);

  useEffect(() => {
    if (districtLoadedData && editPanelData?.schemaType === 'district') {
      let updatedData = districtLoadedData.find(
        (item) => item._id === editPanelData._id
      );
      setEditPanelData(updatedData);
      if (selectedTreeItem?._id === updatedData?._id) {
        setSelectedTreeItem(updatedData);
      }
    }
  }, [districtLoadedData]);

  useEffect(() => {
    if (allSchoolResources && editPanelData?.schemaType === 'school') {
      let updatedData = allSchoolResources.find(
        (item) => item._id === editPanelData._id
      );
      setEditPanelData(updatedData);
      if (selectedTreeItem?._id === updatedData?._id) {
        setSelectedTreeItem(updatedData);
      }
    }
    let tmp = schoolLoadedData?.slice();
    allSchoolResources?.map((el) => {
      if (schoolLoadedData?.find((item) => item._id === el._id)) {
        let itemIndex = schoolLoadedData?.findIndex(
          (item) => item._id === el._id
        );
        tmp[itemIndex] = el;
      } else {
        tmp.push(el);
      }
      return el;
    });
    setSchoolLoadedData(tmp);
  }, [allSchoolResources]);

  useEffect(() => {
    if (schoolLoadedData && editPanelData?.schemaType === 'school') {
      let updatedData = schoolLoadedData?.find(
        (item) => item._id === editPanelData._id
      );
      setEditPanelData(updatedData);
      if (selectedTreeItem?._id === updatedData?._id) {
        setSelectedTreeItem(updatedData);
      }
    }
  }, [schoolLoadedData]);

  useEffect(() => {
    if (classLoadedData && editPanelData?.schemaType === 'class') {
      let updatedData = classLoadedData.find(
        (item) => item._id === editPanelData._id
      );
      setEditPanelData(updatedData);
      if (selectedTreeItem?._id === updatedData?._id) {
        setSelectedTreeItem(updatedData);
      }
    }
  }, [classLoadedData]);

  useEffect(() => {
    if (classResources && editPanelData?.schemaType === 'class') {
      let updatedData = classResources.find(
        (item) => item._id === editPanelData._id
      );
      setEditPanelData(updatedData);
      if (selectedTreeItem?._id === updatedData?._id) {
        setSelectedTreeItem(updatedData);
      }
    }
  }, [classResources]);

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      const { grouping } = schoolData;
      const schoolList = [];
      grouping.map((item) =>
        schoolList.push({ label: item['name'], value: item['_id'] })
      );

      if (schoolLoadedData) {
        let tmp = schoolLoadedData?.slice();
        grouping?.map((el) => {
          if (schoolLoadedData?.find((item) => item._id === el._id)) {
            let itemIndex = schoolLoadedData?.findIndex(
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
    }
  }, [schoolLoading, schoolError, schoolData]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      const { grouping } = districtData;
      const districtList = [];
      grouping.map((item) =>
        districtList.push({ ...item, label: item['name'], value: item['_id'] })
      );
      console.log('grouping:', districtLoadedData);
      console.log('grouping:', grouping);
      if (districtLoadedData?.length) {
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
    }
  }, [districtLoading, districtError, districtData]);

  useEffect(() => {
    if (!allDistrictLoading && !allDistrictError && allDistrictData) {
      const { grouping } = allDistrictData;
      setAllDistrictResources(grouping);
    }
  }, [allDistrictLoading, allDistrictError, allDistrictData]);

  const getArchivedClasses = async () => {
    if (selectedTreeItem?.schemaType === 'school') {
      let classVariables = {
        id: null,
        schemaType: 'archiveClass',
        parentId: selectedTreeItem?._id,
        topology: {
          district: selectedTreeItem?.topology?.district
        }
      };
      await getArchivedClass({
        variables: classVariables,
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  };

  useEffect(() => {
    getArchivedClasses();
  }, [selectedTreeItem]);

  useEffect(() => {
    if (!archivedClassLoading && archivedClassData) {
      setArchivedClasses(archivedClassData?.grouping);
    } else {
      setArchivedClasses();
    }
  }, [archivedClassData, archivedClassLoading]);

  useEffect(() => {
    if (
      !allDistrictReloadLoading &&
      !allDistrictReloadError &&
      allDistrictReloadData
    ) {
      const { grouping } = allDistrictReloadData;
      setAllDistrictResources(grouping);
      updateAll(client.cache, grouping);
    }
  }, [allDistrictReloadLoading, allDistrictReloadError, allDistrictReloadData]);

  useEffect(() => {
    if (!allSchoolLoading && !allSchoolError && allSchoolData) {
      const { grouping } = allSchoolData;
      setAllSchoolResources(grouping);
      if (currentUser?.schemaType === 'schoolAdmin') {
        setSchoolLoadedData(grouping);
      }
      updateAll(client.cache, grouping);
    }
  }, [allSchoolLoading, allSchoolError, allSchoolData]);

  useEffect(() => {
    if (
      !allSchoolReloadLoading &&
      !allSchoolReloadError &&
      allSchoolReloadData
    ) {
      const { grouping } = allSchoolReloadData;
      setAllSchoolResources(grouping);
      updateAll(client.cache, grouping);
    }
  }, [allSchoolReloadLoading, allSchoolReloadError, allSchoolReloadData]);

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
    if (!classReloadLoading && !classReloadError && classReloadData) {
      const { grouping } = classReloadData;
      setAllClassResources(grouping);
      updateAll(client.cache, grouping);
    }
  }, [classReloadLoading, classReloadError, classReloadData]);

  const checkMoreTopologies = () => {
    if (expanded?.length) {
      let expandedStationIds = stationLoadedData
        .filter((item) => expanded.includes(item._id))
        .map((el) => {
          return el._id;
        });
      let expandedDistrictIds = allDistrictResources
        .filter((item) => expanded.includes(item._id))
        .map((el) => {
          return el._id;
        });
      let expandedSchoolIds = allSchoolResources
        .filter((item) => expanded.includes(item._id))
        .map((el) => {
          return el._id;
        });
      let shouldShowDistricts = allDistrictResources.filter((item) =>
        expandedStationIds.includes(item.parentId)
      );
      let shouldShowSchools = allSchoolResources.filter((item) =>
        expandedDistrictIds.includes(item.parentId)
      );
      let shouldShowClasses = allClassResources.filter((item) =>
        expandedSchoolIds.includes(item.parentId)
      );
      if (
        ['stationAdmin', 'superAdmin', 'sysAdmin'].includes(
          userInfo?.schemaType
        )
      ) {
        setDistrictLoadedData(shouldShowDistricts);
        setSchoolLoadedData(shouldShowSchools);
        setClassLoadedData(shouldShowClasses);
      }

      if (userInfo.schemaType === 'districtAdmin') {
        setSchoolLoadedData(shouldShowSchools);
        setClassLoadedData(shouldShowClasses);
      }

      if (userInfo.schemaType === 'schoolAdmin') {
        setClassLoadedData(shouldShowClasses);
      }
    }
  };

  useEffect(() => {
    checkMoreTopologies();
  }, [
    stationLoadedData,
    allDistrictResources,
    allSchoolResources,
    allClassResources
  ]);

  useEffect(() => {
    if (!googleClassLoading && !googleClassError && googleClassData) {
      const { grouping } = googleClassData;
      const classList = [];
      grouping.map((item) => classList.push(item));
    }
  }, [googleClassLoading, googleClassError, googleClassData]);

  useEffect(() => {
    if (!selectedLoading && !selectedError && selectedData) {
      const { grouping } = selectedData;

      if (!whenState) {
        const selectedItem = grouping.find(
          (el) => el._id === selectedTreeItem?._id
        );
        if (selectedItem) {
          setEditPanelData(selectedItem);
        }
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

  useEffect(() => {
    if (
      currentUser?.schemaType === 'superAdmin' ||
      currentUser?.schemaType === 'sysAdmin'
    ) {
      if (isSmallScreen || isMediumScreen) {
        if (!editPanelData) {
          handleMainChange('root', null);
        }
        if (!selectedDocId) {
          setSelectedDocId('root');
        }
      }
    }
  }, [isSmallScreen, isMediumScreen]);

  const handleMainChange = async (type, value) => {
    if (type === 'elSingleClick') {
      if (value) {
        console.log(value);
        setNextSelected(value);
        setRootSelected(false);
        let updatedValue = null;
        if (value?.schemaType === 'station') {
          updatedValue = stationLoadedData?.find(
            (item) => item._id === value?._id
          );
        } else if (value?.schemaType === 'district') {
          updatedValue = districtLoadedData?.find(
            (item) => item._id === value?._id
          );
        } else if (value?.schemaType === 'school') {
          updatedValue = schoolLoadedData?.find(
            (item) => item._id === value?._id
          );
        } else if (value?.schemaType === 'class') {
          updatedValue = classLoadedData?.find(
            (item) => item._id === value?._id
          );
        }
        if (updatedValue == null) {
          updatedValue = value;
        }
        if (selectedTreeItem && selectedTreeItem['_id'] === value['_id']) {
          setSelectedTreeItem(value);
          return;
        }

        history.push({
          pathname: `/topology/${value?._id}`
        });

        if (!whenState) {
          setShowEdit(true);
          setEditPanelData(updatedValue);
          setSelectedDocId(value?._id);
          setSelected(value?._id);
          setSelectedTreeItem(updatedValue);
        }
        setParentTreeItem(getParentItem(updatedValue));
      } else {
        setSelectedTreeItem();
        setEditPanelData();
        setParentTreeItem();
        setSelected('root');
      }
    }

    if (type === 'root') {
      history.push({
        pathname: `/topology`
      });

      setNextSelected(value);

      if (!whenState) {
        setShowEdit(true);
        setParentTreeItem();
        setRootSelected(true);
        setEditPanelData();
        setSelected('root');
        setSelectedTreeItem();
      }
    }

    if (type === 'delete') {
      setShowEdit(false);
    }
    if (type === 'refresh') {
      if (userInfo.schemaType === 'educator') {
        await refetchAllClass();
      } else if (userInfo.schemaType === 'districtAdmin') {
        await refetchAllDistrict();
        await refetchAllSchool();
        await refetchAllClass();
      } else if (userInfo.schemaType === 'schoolAdmin') {
        await refetchAllSchool();
        await refetchAllClass();
      } else {
        await refetchAllStations();
        await refetchAllDistrict();
        await refetchAllSchool();
        await refetchAllClass();
      }
    }
    if (type === 'changeStation' && !isMediumScreen && !isSmallScreen) {
      setShowEdit(false);
      setEditPanelData();
    }

    if (type === 'classUpdate') {
      setWhenState(false);
      fetchSelected();
    }

    if (type === 'SaveStation') {
      setWhenState(false);
      setIsForceSave(true);
    }
  };

  // useEffect(() => {
  //   if (selectedTreeItem?.schemaType === 'class') {
  //     fetchSelected();
  //   }
  // }, [selectedTreeItem]);

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
      // setRefresh(true);
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

  const reFetchSelectedItem = () => {
    fetchSelected();
    fetchClass();
  };

  return (
    <Box className={!isSmallScreen ? classes.root : classes.rootVertical}>
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
      <TopologyMain
        setEditPanelData={setEditPanelData}
        setShowEdit={setShowEdit}
        whenState={whenState}
        setWhenState={setWhenState}
        showLoading={showLoading}
        selectedDocId={selectedDocId}
        resources={loadedData}
        showStateFilter={true}
        onChange={handleMainChange}
        setNewTopologyId={setNewTopologyId}
        selectedTreeItem={selectedTreeItem}
        setSelectedTreeItem={setSelectedTreeItem}
        createGrouping={createGrouping}
        updateGrouping={updateGrouping}
        stationLoadedData={stationLoadedData}
        districtLoadedData={districtLoadedData}
        schoolLoadedData={schoolLoadedData}
        classLoadedData={classLoadedData}
        selected={selected}
        setSelected={setSelected}
        expanded={expanded}
        setExpanded={setExpanded}
        setResources={setLoadedData}
        userInfo={userInfo}
        setStationLoadedData={setStationLoadedData}
        createNew={createNew}
        setCreateNew={setCreateNew}
        isRoot={isRootSelected}
        archivedClasses={archivedClasses}
        onRefetchSelected={reFetchSelectedItem}
      />

      {showEdit && (
        <TopologyEdit
          forceSave={isForceSave}
          resources={editPanelData}
          loadedData={loadedData}
          setWhenState={setWhenState}
          whenState={whenState}
          allSchoolResources={allSchoolResources}
          classLoadedData={classLoadedData}
          stationLoadedData={stationLoadedData}
          districtLoadedData={districtLoadedData}
          schoolLoadedData={schoolLoadedData}
          setEditPanelData={setEditPanelData}
          allDistrictResources={allDistrictResources}
          onChange={handleEditChange}
          handleMainChange={handleMainChange}
          selectedTreeItem={selectedTreeItem}
          setSelectedTreeItem={setSelectedTreeItem}
          setRefresh={(value) => setRefresh(value)}
          createBulkUsersGrouping={createBulkUsersGrouping}
          updateGrouping={updateGrouping}
          deleteDocument={deleteDocument}
          setNewTopologyId={setNewTopologyId}
          newTopologyId={newTopologyId}
          setSelected={setSelected}
          parentTreeItem={parentTreeItem}
          isRoot={isRootSelected}
          StatesList={StatesList}
          userInfo={userInfo}
          createNew={createNew}
          setCreateNew={setCreateNew}
          schoolTerms={schoolTerms}
        />
      )}
    </Box>
  );
};

export default withRouter(TopologyContainer);
