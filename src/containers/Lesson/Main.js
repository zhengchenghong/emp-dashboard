/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { MainPanel } from '@app/components/Panels';
import {
  faBookOpen,
  faChalkboardTeacher
} from '@fortawesome/free-solid-svg-icons';
import { Grid, Typography } from '@material-ui/core';
import DraggableTreeView from '@app/components/DraggableTreeView';
import {
  CustomDialog,
  CustomInput,
  CustomRadioButtonsGroup,
  CustomCheckBox
} from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import * as globalStyles from '@app/constants/globalStyles';
import { getAssetUrl, getDisplayName, getUUID } from '@app/utils/functions';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useFilterContext } from '@app/providers/FilterContext';
import { useSearchContext } from '@app/providers/SearchContext';
import { useLessonViewModeContext } from '@app/providers/LessonViewModeContext';
import { useMutation, useApolloClient, useLazyQuery } from '@apollo/client';
import graphql from '@app/graphql';
import { useUserContext } from '@app/providers/UserContext';
import CustomCard from '@app/components/Custom/Card';
import TreeListPanel from '@app/components/TreeListPanel';
import { en } from '@app/language';
import { groupingList } from '@app/utils/ApolloCacheManager';
import { CustomDragableTreeSelectBox } from '@app/components/Custom';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import userinfo from '@app/constants/Notifications/userinfo';

const MaterialMain = ({
  variables,
  resources,
  selected,
  setSelected,
  setResources,
  onChange,
  selectedTreeItem,
  setSelectedTreeItem,
  createGrouping,
  updateGrouping,
  deleteDocument,
  classLoadedData,
  setClassLoadedData,
  schoolLoadedData,
  onSearch,
  updateShow,
  when,
  setIsCreate,
  createShow,
  setCreateShow,
  stationLoadedData,
  viewMethod,
  history,
  cardViewList,
  setTopologyTitle,
  editPanelData,
  openNameSearch,
  setOpenNameSearch,
  canSearch,
  createNew,
  setCreateNew,
  setNewDoc,
  expandedIds,
  setExpandedIds
}) => {
  // const { parent } = variables;
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [openCreate, setOpenCreate] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [newElName, setNewElName] = useState('');
  const { filteredStationList, setFilterStateValue, filteredDistrictList } =
    useFilterContext();
  const [buttonDisable, setButtonDisable] = useState(false);
  const [subType, setSubType] = useState('folder');
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [expanded, setExpanded] = useState();
  const [searchResults, setSearchResults] = useState();
  const { openSearch: openLessonSearch } = useSearchContext();
  const client = useApolloClient();
  const [currentUser] = useUserContext();
  const [openDeleteAbort, setOpenDeleteAbort] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [isShared, setShared] = useState(false);
  const [sharedDisabled, setSharedDisabled] = useState(true);
  const [studentResources, setStudentResources] = useState([]);
  const { selectedClassItem, setSelectedClassItem } =
    useLessonViewModeContext();
  const isSmallScreen = useSmallScreen();
  const [copyAssetS3] = useMutation(graphql.mutations.copyAssetS3);

  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const [createRefGrouping] = useMutation(graphql.mutations.CreateRefGrouping);

  const studentVariables = {
    schemaType: 'student',
    offset: null
  };
  const [
    getStudentItems,
    { loading: studentLoading, error: studentError, data: studentData }
  ] = useLazyQuery(graphql.queries.userGrouping);

  const fetchStudents = async (variables) => {
    await getStudentItems({
      variables: variables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  useEffect(() => {
    if (!studentLoading && !studentError && studentData) {
      setStudentResources(studentData.grouping);
    }
  }, [studentLoading, studentError, studentData]);

  useEffect(() => {
    if (studentResources == null || studentResources?.length === 0) {
      fetchStudents(studentVariables);
    }
  }, []);

  const changePage = (item) => {
    setSelectedTreeItem(item);
    setSelected(item?._id);
  };

  const getTitle = async (item) => {
    let finalName = <></>;
    let station;

    if (
      filteredStationList?.find((st) => st.value === item?.topology?.station)
    ) {
      station = filteredStationList?.find(
        (st) => st.value === item?.topology?.station
      )?.label;
    } else {
      let { data: stationItem } = await client.query({
        query: graphql.queries.nameGrouping,
        variables: {
          id: item?.topology?.station,
          schemaType: 'station'
        }
      });
      station = getDisplayName(stationItem?.grouping[0]?.name);
    }

    let district;
    if (
      filteredDistrictList?.find((dt) => dt.value === item?.topology?.district)
    ) {
      district = filteredDistrictList?.find(
        (dt) => dt.value === item?.topology?.district
      )?.label;
    } else {
      let { data: districtItem } = await client.query({
        query: graphql.queries.nameGrouping,
        variables: {
          id: item?.topology?.district,
          schemaType: 'district'
        }
      });
      district = getDisplayName(districtItem?.grouping[0]?.name);
    }

    let school;
    if (schoolLoadedData?.find((sc) => sc._id === item?.topology?.school)) {
      school = schoolLoadedData?.find(
        (sc) => sc._id === item?.topology?.school
      )?.name;
    } else {
      let { data: schoolItem } = await client.query({
        query: graphql.queries.nameGrouping,
        variables: {
          id: item?.topology?.school,
          schemaType: 'school'
        }
      });
      school = getDisplayName(schoolItem?.grouping[0]?.name);
    }

    if (cardViewList) {
      if (
        currentUser?.schemaType === 'superAdmin' ||
        currentUser?.schemaType === 'sysAdmin'
      ) {
        setTopologyTitle(
          `${station} > ${district} > ${school} > ${selectedClassItem?.name}`
        );
      } else if (currentUser?.schemaType === 'stationAdmin') {
        setTopologyTitle(
          `${station} > ${district} > ${school} > ${selectedClassItem?.name}`
        );
      } else if (currentUser?.schemaType === 'districtAdmin') {
        setTopologyTitle(
          `${station} > ${district} > ${school} > ${selectedClassItem?.name}`
        );
      } else if (currentUser?.schemaType === 'educator') {
        setTopologyTitle(
          `${district} > ${school} > ${selectedClassItem?.name}`
        );
      } else if (currentUser?.schemaType === 'schoolAdmin') {
        setTopologyTitle(`${school} > ${selectedClassItem?.name}`);
      }
    }

    finalName = `${station} > ${district} > ${school} > `;
    if (!station?.length || !district?.length || !school?.length)
      setSelectedTreeItem(null);
    return finalName;
  };

  useEffect(() => {
    if (createNew) {
      handleMainPanelChange('create');
      setCreateNew(false);
    }
  }, [createNew]);

  useEffect(() => {
    const onLoad = async () => {
      setCheckbox(false);
      let title = await getTitle(selectedTreeItem);
      // setTitle(title);
      if (selectedTreeItem.childrenIdList === null) {
        setShared(true);
      } else {
        setShared(false);
      }
    };
    if (selectedTreeItem) {
      onLoad();
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    if (selectedTreeItem?.schemaType === 'material') {
      let updatedResources = resources?.map((item) => {
        if (item._id === selectedTreeItem?._id) {
          return selectedTreeItem;
        } else {
          return item;
        }
      });
      setResources(updatedResources);
    }
  }, [selectedTreeItem]);

  // useEffect(() => {
  //   setCreateDialogSetting({
  //     error: false
  //   });
  //   if (
  //     currentUser?.schemaType === 'superAdmin' ||
  //     currentUser?.schemaType === 'sysAdmin'
  //   ) {
  //     setFilterStateValue('all');
  //   }
  // }, []);

  useEffect(() => {
    if (createShow) {
      setOpenCreate(true);
    }
  }, [createShow]);
  useEffect(() => {
    if (!openCreate && setCreateShow) {
      setCreateShow(false);
    }
  }, [openCreate]);

  useEffect(() => {}, [subType]);

  useEffect(() => {
    setOpenSearch(openLessonSearch);
  }, [openLessonSearch]);

  const isParentAvatar = (fileDir, createdMaterial) => {
    if (!fileDir || createdMaterial == null) return null;
    let dirId = fileDir?.replace('/', '');
    let destTopology = createdMaterial?.topology;
    if (
      [
        destTopology?.station,
        destTopology?.district,
        destTopology?.school,
        destTopology?.class
      ].includes(dirId)
    ) {
      return true;
    }
    return false;
  };

  const handleCreateDialogChange = async (type, value, name, addType) => {
    try {
      if (type === 'input') {
        setNewElName(value);
        setCreateDialogSetting({
          error: false
        });
      }

      if (type === 'type') {
        setSubType(value);
        if (value === 'folder') {
          setSharedDisabled(true);
          setShared(false);
        } else {
          setSharedDisabled(false);
        }
      }
      if (type === 'cardView') {
        if (!buttonDisable) {
          setButtonDisable(true);
          let result;
          let updatedResult;
          if (value) {
            // if (isShared) {
            //   const result = await createRefGrouping({
            //     variables: {
            //       id: value?._id,
            //       schemaType: value?.schemaType,
            //       userName: currentUser?.name,
            //       userType: currentUser?.schemaType
            //     }
            //   });
            //   setOpenCreate(false);
            //   setButtonDisable(false);
            //   setNewElName('');
            //   const notiOps = getNotificationOpt(
            //     'material',
            //     'success',
            //     'createRef'
            //   );
            //   notify(notiOps.message, notiOps.options);
            //   return;
            // }
            if (!name) {
              // const notiOps = getNotificationOpt('extra', 'error', 'name');
              // notify(notiOps.message, notiOps.options);
              setButtonDisable(false);
              setCreateDialogSetting({
                error: true,
                helpText: 'Please input the title. It is required'
              });
              return;
            }

            let stateValue;

            if (
              value?.topology?.state == null ||
              value?.topology?.state === ''
            ) {
              let stationEL = stationLoadedData.filter(
                (el) => el._id === value?.topology?.station
              );
              if (stationEL.length > 0) {
                stateValue = stationEL[0]?.topology?.state;
              }
            } else {
              stateValue = value?.topology?.state;
            }

            let topologyData = {};
            if (!value?.topology?.class) {
              topologyData = {
                state: stateValue,
                station: value?.topology?.station,
                district: value?.topology?.district,
                school: value?.topology?.school,
                class: value?._id
              };
            } else {
              topologyData = {
                state: stateValue,
                station: value?.topology?.station,
                district: value?.topology?.district,
                school: value?.topology?.school,
                class: value?.topology?.class
              };
            }

            if (openRename) {
              await updateGrouping({
                variables: {
                  name: name,
                  version: value?.version,
                  trackingAuthorName: currentUser?.name,
                  id: value?._id,
                  schemaType: 'material',
                  updatedAt: value?.updatedAt
                }
              });

              const itemIndex = resources.findIndex(
                (resource) => resource._id === value?._id
              );
              const newSelectedItem = { ...value };
              newSelectedItem['name'] = name;

              const newResourcesList = [...resources];
              newResourcesList[itemIndex] = newSelectedItem;
              setResources(newResourcesList);
              setNewElName('');

              const notiOps = getNotificationOpt(
                'material',
                'success',
                'rename'
              );
              notify(notiOps.message, notiOps.options);
            } else {
              let parentIdList = [];

              if (value) {
                parentIdList =
                  value?.schemaType === 'class'
                    ? [value?._id]
                    : [
                        ...(value?.parentIdList ? value?.parentIdList : []),
                        value?._id
                      ];
              }

              let parentClasses = classLoadedData.filter((el) => {
                if (el._id === value.id) {
                  return true;
                } else {
                  return false;
                }
              });

              let parentClass =
                parentClasses && parentClasses.length > 0
                  ? parentClasses[0]
                  : value;

              // Timestamp in seconds
              const timestamp = new Date().valueOf() / 1000;

              let authorIdList = null;
              if (currentUser?._id) {
                authorIdList = [currentUser?._id];
              }

              let parentAvatar = parentClass?.avatar;
              if (parentAvatar) {
                parentAvatar = JSON.parse(JSON.stringify(parentAvatar));
                delete parentAvatar.__typename;
              }

              let variable = {
                ...variables,
                name: name,
                avatar: parentAvatar,
                trackingAuthorName: currentUser?.name,
                parentId: value?._id,
                groupId: parentClass?.groupId,
                topology: topologyData,
                version: 1,
                childrenIdList: addType === 'collection' ? [] : null,
                parentIdList: parentIdList,
                desc: {
                  title: name
                },
                rank: timestamp,
                authorIdList: authorIdList, //value?.authorIdList,
                categories: {
                  lang: value?.categories?.lang
                }
              };
              result = await createGrouping({ variables: variable });
              let res = await updateGroupingList({
                variables: {
                  id: value?._id,
                  schemaType: value?.schemaType,
                  item: result?.data?.createGrouping?._id,
                  fieldName: 'childrenIdList',
                  type: 'add',
                  trackingAuthorName: currentUser?.name
                }
              });

              updateLoadedData(
                result.data.createGrouping,
                res.data.updateGroupingList
              );
              setOpenCreate(false);
              onChange('created', true);
              const notiOps = getNotificationOpt(
                'material',
                'success',
                'create'
              );
              notify(notiOps.message, notiOps.options);
            }
            setOpenRename(false);
            setNewElName('');
            setExpanded(selectedTreeItem._id);
            handleElClicked(
              'single',
              updatedResult?.data?.updateGrouping
                ? updatedResult?.data?.updateGrouping
                : result?.data?.createGrouping
            );
            setNewDoc(result.data.createGrouping);
          } else {
            setOpenCreate(false);
            setOpenRename(false);
            setNewElName('');
          }
        }
        setButtonDisable(false);
      }

      if (type === 'btnClick') {
        if (!buttonDisable) {
          console.log('subType:', subType);
          setButtonDisable(true);
          let result;
          let updatedResult;
          if (value) {
            if (!newElName) {
              setButtonDisable(false);
              setCreateDialogSetting({
                error: true,
                helpText: 'Please input the title. It is required'
              });
              return;
            }

            let stateValue;

            if (
              selectedTreeItem?.topology?.state == null ||
              selectedTreeItem?.topology?.state === ''
            ) {
              let stationEL = stationLoadedData.filter(
                (el) => el._id === selectedTreeItem?.topology?.station
              );
              if (stationEL.length > 0) {
                stateValue = stationEL[0]?.topology?.state;
              }
            } else {
              stateValue = selectedTreeItem?.topology?.state;
            }

            let topologyData = {};
            if (!selectedTreeItem?.topology?.class) {
              topologyData = {
                state: stateValue,
                station: selectedTreeItem?.topology?.station,
                district: selectedTreeItem?.topology?.district,
                school: selectedTreeItem?.topology?.school,
                class: selectedTreeItem?._id
              };
            } else {
              topologyData = {
                state: stateValue,
                station: selectedTreeItem?.topology?.station,
                district: selectedTreeItem?.topology?.district,
                school: selectedTreeItem?.topology?.school,
                class: selectedTreeItem?.topology?.class
              };
            }

            if (openRename) {
              await updateGrouping({
                variables: {
                  name: newElName,
                  version: selectedTreeItem?.version,
                  id: selectedTreeItem?._id,
                  schemaType: selectedTreeItem?.schemaType,
                  trackingAuthorName: currentUser?.name,
                  updatedAt: selectedTreeItem?.updatedAt
                }
              });
              const itemIndex =
                selectedTreeItem?.schemaType === 'material'
                  ? resources.findIndex(
                      (resource) => resource._id === selectedTreeItem?._id
                    )
                  : classLoadedData.findIndex(
                      (el) => el._id === selectedTreeItem?._id
                    );
              const newSelectedItem = { ...selectedTreeItem };
              newSelectedItem['name'] = newElName;

              const newResourcesList =
                selectedTreeItem?.schemaType === 'class'
                  ? [...classLoadedData]
                  : [...resources];
              newResourcesList[itemIndex] = newSelectedItem;
              if (selectedTreeItem?.schemaType === 'material')
                setResources(newResourcesList);
              else setClassLoadedData(newResourcesList);
              setNewElName('');

              const notiOps = getNotificationOpt(
                'material',
                'success',
                'rename'
              );
              notify(notiOps.message, notiOps.options);
            } else {
              let parentIdList = [];
              console.log('selectedTreeItem:', selectedTreeItem);
              if (selectedTreeItem) {
                parentIdList =
                  selectedTreeItem?.schemaType === 'class'
                    ? [selectedTreeItem?._id]
                    : [
                        ...(selectedTreeItem?.parentIdList
                          ? selectedTreeItem?.parentIdList
                          : []),
                        selectedTreeItem?._id
                      ];
              }

              let parentClass1 = classLoadedData.find(
                (el) => el._id === selectedTreeItem.topology?.class
              );

              let parentClass = parentClass1 ? parentClass1 : selectedTreeItem;

              // Timestamp in seconds
              const timestamp = new Date().valueOf() / 1000;

              let authorIdList = null;
              if (currentUser?._id) {
                authorIdList = [currentUser?._id];
              }

              let parentAvatar = parentClass?.avatar;
              if (parentAvatar) {
                parentAvatar = JSON.parse(JSON.stringify(parentAvatar));
                delete parentAvatar.__typename;
              }

              result = await createGrouping({
                variables: {
                  ...variables,
                  name: newElName,
                  avatar: parentAvatar,
                  trackingAuthorName: currentUser?.name,
                  parentId: selectedTreeItem?._id,
                  groupId: parentClass?.groupId,
                  topology: topologyData,
                  version: 1,
                  childrenIdList: subType === 'folder' ? [] : null,
                  shared: isShared && subType !== 'folder',
                  parentIdList: parentIdList,
                  desc: {
                    title: newElName
                  },
                  rank: timestamp,
                  authorIdList: authorIdList, //selectedTreeItem?.authorIdList,
                  categories: {
                    lang: selectedTreeItem?.categories?.lang
                  }
                }
              });
              if (parentClass?.avatar?.fileDir) {
                let avatarData = null;
                if (
                  isParentAvatar(
                    parentClass?.avatar?.fileDir,
                    result?.data?.createGrouping
                  )
                ) {
                  const destKey = `${parentClass?.topology?.station}/${result?.data?.createGrouping?._id}/${parentClass?.avatar?.fileName}`;
                  let parentAvatarUrl =
                    parentClass?.avatar?.baseUrl +
                    parentClass?.avatar?.fileDir +
                    parentClass?.avatar?.fileName;
                  const assetBucketName =
                    getAssetUrl(parentAvatarUrl).split('/')[3];
                  try {
                    await copyAssetS3({
                      variables: {
                        sourceUrl: parentAvatarUrl,
                        destBucket: assetBucketName,
                        destKey: destKey
                      }
                    });

                    const fileDir = result?.data?.createGrouping?._id + '/';
                    avatarData = {
                      ...parentAvatar,
                      uId: getUUID(),
                      fileDir: fileDir
                    };
                  } catch (err) {
                    console.log(err.message);
                  }
                }
                if (avatarData) {
                  await updateGrouping({
                    variables: {
                      id: result.data.createGrouping._id,
                      schemaType: result.data.createGrouping?.schemaType,
                      version: result.data.createGrouping.version,
                      trackingAuthorName: currentUser?.name,
                      avatar: avatarData
                    }
                  });
                }
              }

              let res = await updateGroupingList({
                variables: {
                  id: selectedTreeItem?._id,
                  schemaType: selectedTreeItem?.schemaType,
                  item: result?.data?.createGrouping?._id,
                  fieldName: 'childrenIdList',
                  type: 'add',
                  trackingAuthorName: currentUser?.name
                }
              });

              if (isShared && subType !== 'folder') {
                let resDoc = result?.data?.createGrouping;
                var unpublishDate = new Date();
                unpublishDate.setMonth(unpublishDate.getMonth() + 6);

                const copyStr = JSON.stringify(resDoc?.lifecycle);
                let newLifeCycle = JSON.parse(copyStr);
                if (newLifeCycle) {
                  delete newLifeCycle['__typename'];
                }
                result = await updateGrouping({
                  variables: {
                    id: resDoc?._id,
                    schemaType: resDoc?.schemaType,
                    version: resDoc?.version,
                    trackingAuthorName: currentUser?.name,
                    status: 'published',
                    lifecycle: {
                      ...newLifeCycle,
                      unpublishedOn: unpublishDate.toISOString()
                    },
                    data: {
                      ...resDoc?.data,
                      processDate: {
                        ...resDoc?.data?.processDate,
                        publishedDate: new Date()
                      }
                    }
                  }
                });
              }

              updateLoadedData(
                result.data.createGrouping || result.data.updateGrouping,
                res.data.updateGroupingList
              );
              setOpenCreate(false);
              onChange('created', true);
              const notiOps = getNotificationOpt(
                'material',
                'success',
                'create'
              );
              notify(notiOps.message, notiOps.options);
            }
            setOpenRename(false);
            setNewElName('');
            setExpanded(selectedTreeItem._id);
            handleElClicked(
              'single',
              updatedResult?.data?.updateGrouping
                ? updatedResult?.data?.updateGrouping
                : result?.data?.createGrouping
            );
            setNewDoc(result.data.createGrouping);
          } else {
            setOpenCreate(false);
            setOpenRename(false);
            setNewElName('');
          }
        }
        setButtonDisable(false);
      }
    } catch (error) {
      console.log(error.message);
      setNewElName('');
      setButtonDisable(false);
      if (error.message === en['data_changed']) {
        const notiOps = getNotificationOpt('material', 'error', 'update');
        notify(error.message, notiOps.options);
        return;
      }
      setCreateDialogSetting({
        error: true,
        helpText:
          'This ' +
          (subType === 'folder' ? 'collection' : 'lesson') +
          ' already exists. Title must be unique.'
      });
    }
  };
  const handleMainPanelChange = (value) => {
    if (value === 'create') {
      if (when) {
        updateShow(true);
        setIsCreate(true);
      } else {
        setOpenCreate(true);
        setCreateDialogSetting({
          error: false,
          helpText: 'Please input title. It is required',
          autoFocus: true
        });
      }
    }
    if (value === 'rename') {
      let id = selectedTreeItem && selectedTreeItem?._id;
      let schemaType = selectedTreeItem && selectedTreeItem?.schemaType;
      setNewElName(selectedTreeItem && getDisplayName(selectedTreeItem?.name));
      id !== 'root' && setOpenRename(true);
      setCreateDialogSetting({
        error: false,
        autoFocus: true
      });
    }
    if (value === 'search') setOpenSearch((prev) => !prev);
    if (value === 'undo') onSearch('');
    if (value === 'refresh') onChange('refresh', true);
    if (value === 'back') {
      onChange('back', true);
    }
  };

  const handleElClicked = (type, value) => {
    if (type === 'single') {
      // Save the lesson id that selected
      if (value?.schemaType === 'class') {
        localStorage.setItem('previousClass', JSON.stringify(value));
      } else {
        localStorage.setItem('previousLesson', JSON.stringify(value));
        let tmp = classLoadedData?.find(
          (el) => el._id === value?.topology?.class
        );
        localStorage.setItem('previousClass', JSON.stringify(tmp));
      }
      onChange('elSingleClick', value);
    }

    if (type === 'cardClick') {
      setSelectedClassItem(value);
      onChange('elCardClick', value);
    }

    if (type === 'root') onChange('root');
    setNewDoc(null);
  };

  const updateLoadedData = (createdDoc, updatedDoc) => {
    if (
      updatedDoc?.schemaType === 'material' ||
      updatedDoc?.schemaType === 'class'
    ) {
      let tmp = [...resources];
      let itemIndex = resources.findIndex(
        (item) => item._id === updatedDoc._id
      );
      if (itemIndex >= 0) {
        tmp[itemIndex] = updatedDoc;
      }
      tmp.push(createdDoc);
      setResources(tmp);
    }
  };

  const handleDeleteDialogChange = async (type, value) => {
    try {
      if (type === 'btnClick') {
        if (!checkbox && value) {
          const notiOps = getNotificationOpt(
            selectedTreeItem?.schemaType,
            'warning',
            'delete'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
        let parentId = selectedTreeItem?.parentId;
        if (checkbox && value) {
          if (selectedTreeItem?.schemaType === 'class') {
            await deleteDocument({
              variables: {
                id: selectedTreeItem?._id,
                schemaType: selectedTreeItem?.schemaType
              }
            });

            if (
              selectedTreeItem?.schemaType === 'class' ||
              selectedTreeItem.schemaType === 'googleClass'
            ) {
              const parentDoc = schoolLoadedData?.find(
                (item) => item['_id'] === selectedTreeItem?.parentId
              );
              if (parentDoc)
                await updateGroupingList({
                  variables: {
                    id: parentDoc?._id,
                    schemaType: parentDoc?.schemaType,
                    item: selectedTreeItem?._id,
                    fieldName: 'childrenIdList',
                    type: 'remove',
                    trackingAuthorName: currentUser?.name
                  }
                });

              if (studentResources) {
                const myStudents = studentResources?.filter((el) =>
                  el.childrenIdList?.includes(selectedTreeItem._id)
                );
                if (myStudents) {
                  try {
                    for (let el of myStudents) {
                      await updateGroupingList({
                        variables: {
                          id: el._id,
                          schemaType: el.schemaType,
                          item: selectedTreeItem?._id,
                          fieldName: 'childrenIdList',
                          type: 'remove',
                          trackingAuthorName: currentUser?.name
                        }
                      });
                    }
                  } catch (err) {
                    console.log(err.message);
                  }
                }
              }
            }
            const notiOps = getNotificationOpt(
              selectedTreeItem?.schemaType,
              'success',
              'delete'
            );
            notify(notiOps.message, notiOps.options);
            if (
              viewMethod === 'Card View' &&
              selectedTreeItem?.schemaType === 'class'
            ) {
              setSelectedTreeItem(selectedTreeItem?.parentId);
            }
          } else {
            if (selectedTreeItem?.childrenIdList?.length > 0) {
              let childrens = resources?.filter((el) =>
                selectedTreeItem?.childrenIdList?.includes(el._id)
              );
              if (childrens.length > 0) {
                setOpenDeleteAbort(true);
                return;
              }
            }
            await deleteDocument({
              variables: {
                id: selectedTreeItem?._id,
                schemaType: selectedTreeItem?.schemaType
              }
            });
            const parentDoc = resources?.find((el) => el._id === parentId)
              ? resources?.find((el) => el._id === parentId)
              : classLoadedData?.filter((el) => el._id === parentId);
            if (parentDoc)
              await updateGroupingList({
                variables: {
                  id: parentDoc._id,
                  schemaType: parentDoc.schemaType,
                  item: selectedTreeItem?._id,
                  fieldName: 'childrenIdList',
                  type: 'remove',
                  trackingAuthorName: currentUser?.name
                }
              });

            const notiOps = getNotificationOpt('material', 'success', 'delete');
            notify(notiOps.message, notiOps.options);

            if (
              viewMethod === 'Card View' &&
              selectedTreeItem?.schemaType === 'class'
            ) {
              let parentItem = resources.find(
                (el) => el._id === selectedTreeItem?.parentId
              );
              if (!parentItem) {
                parentItem = classLoadedData.find(
                  (el) => el._id === selectedTreeItem.parentId
                );
              }
              setSelectedTreeItem(
                parentItem ? parentItem : selectedTreeItem.parentId
              );
            }
          }
        }
        setCheckbox(false);
        setOpenDelete(false);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('material', 'error', 'delete');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleUpdateChange = async (type, value) => {
    if (type === 'edit') {
      onChange('elSingleClick', value);
    }

    if (type === 'delete') {
      setOpenDelete(true);
    }

    if (type === 'btnClick') {
      setSelectedClassItem(value);
      onChange('cardViewList', value);
    }
  };

  const drawTable = (loadTableData) => {
    return (
      loadTableData.length > 0 &&
      loadTableData.map((row, index) => {
        return (
          <CustomCard
            resource={row}
            docId={row._id}
            name={row.desc ? row.desc.title : ''}
            title={row.desc ? row.desc.title : null}
            avatar_link={
              row?.avatar && row?.avatar?.baseUrl && row?.avatar?.fileDir
                ? row?.avatar?.baseUrl +
                  row?.avatar?.fileDir +
                  row?.avatar?.fileName
                : null
            }
            shortDescription={row.desc ? row.desc.short : null}
            longDescription={row.desc ? row.desc.long : null}
            onClick={handleElClicked}
            onUpdate={handleUpdateChange}
          />
        );
      })
    );
  };

  const drawCards = () => {
    let loadedData = classLoadedData;
    return (
      <Grid style={{ padding: isSmallScreen ? 0 : 20 }}>
        <Grid container justifyContent="center" className={classes.root}>
          {drawTable(loadedData)}
        </Grid>
      </Grid>
    );
  };

  const mainContentView = () => {
    return (
      <>
        {viewMethod !== 'Card View' ? (
          <div className={classes.elementList}>
            <DraggableTreeView
              resources={resources}
              setMaterials={setResources}
              setSelectedTreeItem={setSelectedTreeItem}
              onClick={handleElClicked}
              onChange={handleMainPanelChange}
              setSelected={setSelected}
              selected={selected}
              selectedTreeItem={selectedTreeItem}
              setExpanded={setExpanded}
              expanded={expanded}
              classLoadedData={classLoadedData}
              searchResults={searchResults}
              openSearch={openSearch}
              updateGrouping={updateGrouping}
              expandedIds={expandedIds}
              setExpandedIds={setExpandedIds}
            />
          </div>
        ) : cardViewList ? (
          <div className={classes.elementList}>
            <TreeListPanel
              loadedData={resources}
              selectedTreeItem={selectedTreeItem}
              selectedClassItem={selectedClassItem}
              setSubType={setSubType}
              setNewElName={setNewElName}
              onClick={handleElClicked}
              onChange={handleCreateDialogChange}
              expandedIds={expandedIds}
              setExpandedIds={setExpandedIds}
            />
          </div>
        ) : (
          drawCards()
        )}
      </>
    );
  };

  const showSearchGlass = () => {
    if (
      userinfo?.schemaType === 'superAdmin' ||
      userinfo?.schemaType === 'sysAdmin'
    ) {
      return !cardViewList || viewMethod === 'List View';
    } else {
      return true;
    }
  };

  const renderView = () => {
    return (
      <>
        <MainPanel
          title={
            viewMethod === 'List View'
              ? en['Lessons']
              : !cardViewList
              ? en['My Classes']
              : en['Lessons']
          }
          icon={
            viewMethod === 'List View'
              ? faBookOpen
              : selectedTreeItem?.schemaType !== 'class' &&
                selectedTreeItem?.schemaType !== 'material'
              ? faChalkboardTeacher
              : faBookOpen
          }
          showSearch={showSearchGlass()}
          canSearch={canSearch}
          showAddBtn={!cardViewList || viewMethod === 'List View'}
          showRefresh={!cardViewList || viewMethod === 'List View'}
          canAdd={!cardViewList || viewMethod === 'List View'}
          totalDisable={
            selectedTreeItem
              ? selectedTreeItem.schemaType === 'material' &&
                (selectedTreeItem?.childrenIdList === null ||
                  selectedTreeItem?.parentIdList?.length > 2)
                ? true
                : false
              : true
          }
          disableAddBtn={
            selectedTreeItem?.schemaType === 'class' ||
            selectedTreeItem?.schemaType === 'material'
              ? false
              : true
          }
          onChange={handleMainPanelChange}
          selectedTreeItem={selectedTreeItem}
          viewMethod={viewMethod}
          cardViewList={cardViewList}
          isLessons={true}
          isMobile={isSmallScreen}
          openNameSearch={openNameSearch}
          setOpenNameSearch={setOpenNameSearch}
        >
          <>{mainContentView()}</>
        </MainPanel>
      </>
    );
  };

  return (
    <>
      {isSmallScreen ? (
        <CustomDragableTreeSelectBox
          selectedTreeItem={selectedTreeItem}
          classLoadedData={classLoadedData}
          materials={resources}
          showFilters={
            currentUser?.schemaType === 'superAdmin' ||
            currentUser?.schemaType === 'sysAdmin'
          }
        >
          {renderView()}
        </CustomDragableTreeSelectBox>
      ) : (
        renderView()
      )}
      <CustomDialog
        mainBtnName={en['Create']}
        open={openCreate}
        title={en[`Create New ${subType}`]}
        buttonDisable={buttonDisable}
        onChange={handleCreateDialogChange}
        contentOverFlowY={'hidden'}
      >
        <Grid item xs={12} sm={12} md={12} lg={10}>
          <CustomRadioButtonsGroup
            setSubType={setSubType}
            selectedTreeItem={selectedTreeItem}
            onChange={handleCreateDialogChange}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <CustomInput
            my={2}
            size="small"
            type="text"
            label={en['Enter the title *']}
            focus={true}
            autoFocus={true}
            value={newElName}
            onChange={(value) => handleCreateDialogChange('input', value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateDialogChange('btnClick', event.target.value);
              }
            }}
            fullWidth
            error={createDialogSetting.error}
            helperText={createDialogSetting.helpText}
            variant="outlined"
            width="300px"
          />
        </Grid>
        {/* {selectedTreeItem?.schemaType !== 'class' && ( */}
        <CustomCheckBox
          color="primary"
          value={isShared}
          label={en['Shared']}
          onChange={(value) => {
            // if (selectedTreeItem?.childrenIdList === null)
            console.log(value);
            setShared(!value);
          }}
          disabled={sharedDisabled}
        />
        {/* )} */}
      </CustomDialog>
      <CustomDialog
        mainBtnName={en['Rename']}
        open={openRename}
        buttonDisable={buttonDisable}
        customClass={
          !selectedTreeItem ? classes.dialogWidth : classes.customDialogContent
        }
        title={`${en['Rename']} ${selectedTreeItem?.schemaType}`}
        onChange={handleCreateDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <CustomInput
            my={2}
            size="small"
            type="text"
            autoFocus={true}
            label={`Enter the ${selectedTreeItem?.schemaType} name *`}
            value={newElName}
            onChange={(value) => handleCreateDialogChange('input', value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateDialogChange('btnClick', event.target.value);
              }
            }}
            error={createDialogSetting.error}
            helperText={createDialogSetting.helpText}
            fullWidth
            variant="outlined"
            width="300px"
          />
        </Grid>
      </CustomDialog>
      <CustomDialog
        open={openDelete}
        title={
          en['Do you want to delete this'] +
          ' ' +
          selectedTreeItem?.schemaType +
          '?'
        }
        mainBtnName={en['Remove']}
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">
          {selectedTreeItem?.schemaType === 'class'
            ? en['remove class']
            : en['remove lesson alert']}
        </Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={
            selectedTreeItem?.schemaType === 'class'
              ? en['I agree to delete the class.']
              : en['I agree with this action.']
          }
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
      <CustomDialog
        open={openDeleteAbort}
        title={en["Can't delete the data."]}
        secondaryBtnName={en['Ok']}
        onChange={() => {
          setOpenDeleteAbort(false);
          setOpenDelete(false);
        }}
      >
        <Typography variant="h6">{en['delete notify']}</Typography>
      </CustomDialog>
    </>
  );
};

export default MaterialMain;
