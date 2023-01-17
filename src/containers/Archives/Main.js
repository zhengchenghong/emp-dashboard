/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { MainPanel } from '@app/components/Panels';
import { faSitemap } from '@fortawesome/pro-solid-svg-icons';
import { CircularProgress, Box } from '@material-ui/core';
import CustomTreeView from '@app/components/TreeViewPanel';
import SearchBar from 'material-ui-search-bar';
import { CustomDialog, CustomInput } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import * as globalStyles from '@app/constants/globalStyles';
import StatesList from '@app/constants/states.json';
import { getAssetUrl, getUUID } from '@app/utils/functions';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { useSmallScreen } from '@app/utils/hooks';
import { CustomTreeSelectBox } from '@app/components/Custom';
import { en } from '@app/language';
import graphql from '@app/graphql';
import { useMutation } from '@apollo/client';
import { useUserContext } from '@app/providers/UserContext';
import { groupingList } from '@app/utils/ApolloCacheManager';

const ArchivesMain = ({
  resources,
  onChange,
  showLoading,
  selectedTreeItem,
  setSelectedTreeItem,
  createGrouping,
  updateGrouping,
  stationLoadedData,
  districtLoadedData,
  schoolLoadedData,
  classLoadedData,
  selected,
  setSelected,
  expanded,
  setExpanded,
  userInfo,
  showStateFilter,
  materialLoadedData,
  addNewClass,
  setNewTopologyId
}) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const isSmallScreen = useSmallScreen();
  const [selectedState, setSelectedState] = useState();
  const [openCreate, setOpenCreate] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [newElName, setNewElName] = useState('');

  const [openSearch, setOpenSearch] = useState(false);
  const [newSearchKey, setNewSearchKey] = useState('');
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [searchResults, setSearchResults] = useState();

  const [copyAssetS3] = useMutation(graphql.mutations.copyAssetS3);
  const { setNewTopologyCreated } = useSelectionContext();
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [createdDoc, setCreatedDoc] = useState();
  const [currentUser] = useUserContext();
  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const [openRename, setOpenRename] = useState(false);
  const [isCreateFocus, setCreateFocus] = useState(false);

  const stateListFromTopology = stationLoadedData
    ?.map((item) => item?.topology?.state)
    ?.filter((item) => item !== null && item?.length > 0);
  const filteredStateList = StatesList.filter((item) =>
    stateListFromTopology.includes(item?.value)
  );

  const getTopologyState = () => {
    if (
      selectedTreeItem &&
      selectedTreeItem.schemaType !== 'station' &&
      selectedTreeItem?.topology
    ) {
      if (
        selectedTreeItem?.topology?.state == null ||
        selectedTreeItem?.topology?.state === ''
      ) {
        let tpStation = stationLoadedData.filter(
          (el) => el._id === selectedTreeItem?.topology?.station
        );
        if (tpStation.length > 0) {
          return tpStation[0]?.topology?.state;
        }
      }
    }
    return '';
  };

  const getSchemaTitle = (value) => {
    if (value === 'station') return 'District';
    if (value === 'district') return 'School';
    if (value === 'school') return 'Class';
    return 'Station';
  };

  useEffect(() => {
    setCreateDialogSetting({
      error: false,
      helpText: en['Please input the name. It is required.'],
      autoFocus: true
    });
    // setFilterStateValue('all');
  }, []);

  useEffect(() => {
    if (addNewClass) {
      handleMainPanelChange('create');
    }
  }, [addNewClass]);

  const getSchemaType = (value) => {
    if (value === 'station') return 'district';
    if (value === 'district') return 'school';
    if (value === 'school') return 'class';
    return 'station';
  };

  const handleMainPanelChange = (value) => {
    if (value === 'create') {
      setSelectedState();
      setNewElName(selectedTreeItem?.name);
      setCreateDialogSetting({
        error: false,
        helpText: en['Please input the name. It is required'],
        autoFocus: true
      });
      setOpenCreate(true);
    }
    if (value === 'rename') {
    }
    if (value === 'refresh') onChange('refresh', true);
  };

  const handleElClicked = (type, value) => {
    if (type === 'single') {
      onChange('elSingleClick', value);
      // if (
      //   value &&
      //   value._id !== filteredDistrictId &&
      //   currentSelectedType === 'district'
      // ) {
      //   setFilteredDistrictId('all');
      // }
    }
    if (type === 'root') onChange('root', value);
  };

  const handleRequestSearch = (value) => {
    onChange('delete', false);
    let results = [];
    results = resources.filter((e) => e.name === value);
    results = results.concat(
      resources.filter((e) => e.tagList?.includes(value))
    );
    if (results.length > 0) {
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  };

  const handleCancelSearch = (event) => {
    setOpenSearch(false);
    setSearchResults(null);
    setNewSearchKey();
    let newexpanded = [
      ...selectedTreeItem?.parentIdList,
      selectedTreeItem?._id
    ];
    setExpanded(newexpanded);
    setSelected(selectedTreeItem?._id);
    handleElClicked('single', selectedTreeItem);
  };

  // const handleStateChange = (data) => {
  //   console.log('change');
  //   setFilterStateValue(data?.value);
  // };

  const getFilteredStation = () => {
    return stationLoadedData
      ?.slice()
      ?.sort((a, b) => (a.name > b.name ? 1 : -1));
    // if (filteredStationId === 'all') {
    //   return stationLoadedData.filter((item) => {
    //     if (!filterStateValue || filterStateValue === 'all') return true;
    //     if (filterStateValue === item?.topology?.state) return true;
    //     return false;
    //   });
    // } else {
    //   return stationLoadedData.filter((item) => {
    //     if (filteredStationId === item._id) return true;
    //     return false;
    //   });
    // }
  };

  // useEffect(() => {
  //   const stations = getFilteredStation().map((item) => item._id);
  //   if (selectedTreeItem && !stations.includes(selectedTreeItem?._id)) {
  //     if (
  //       !filteredDistrictList
  //         .map((item) => item.value)
  //         .includes(selectedTreeItem._id)
  //     ) {
  //       onChange('changeStation');
  //       setSelected();
  //     }
  //   }
  // }, [filterStateValue]);

  // useEffect(() => {
  //   if (filteredStationId && filteredStationId !== 'all') {
  //     const value = stationLoadedData.find((item) => {
  //       if (filteredStationId === item._id) return true;
  //       return false;
  //     });
  //     onChange('elSingleClick', value);
  //     setSelected(value?._id);
  //   } else {
  //     onChange('changeStation');
  //     setSelected();
  //   }
  // }, [filteredStationId]);

  // useEffect(() => {
  //   if (filteredDistrictId && filteredDistrictId !== 'all') {
  //     const value = districtLoadedData.find((item) => {
  //       if (filteredDistrictId === item._id) return true;
  //       return false;
  //     });
  //     if (value) {
  //       onChange('elSingleClick', value);
  //       setSelected(value._id);
  //     }
  //   } else {
  //     if (currentSelectedType !== 'district') {
  //       onChange('changeStation');
  //       setSelected();
  //     }
  //   }
  // }, [filteredDistrictId]);

  // useEffect(() => {
  //   if (districtLoadedData?.length > 0) {
  //     if (
  //       currentSelectedType === 'district' &&
  //       selectedTreeItem._id === filteredStationId
  //     ) {
  //       const value = districtLoadedData.find(
  //         (item) => filteredDistrictId === item._id
  //       );
  //       if (value) {
  //         onChange('elSingleClick', value);
  //         setSelected(value._id);
  //       }
  //     }
  //   }
  //   console.log(districtLoadedData);
  // }, [districtLoadedData]);

  const getSortedDistrictLoadedData = () => {
    return districtLoadedData
      ?.slice()
      ?.sort((a, b) => (a.name > b.name ? 1 : -1));
  };

  const getSortedSchoolLoadedData = () => {
    return schoolLoadedData
      ?.slice()
      ?.sort((a, b) => (a.name > b.name ? 1 : -1));
  };

  const getSortedClassLoadedData = () => {
    return classLoadedData?.slice()?.sort((a, b) => (a.name > b.name ? 1 : -1));
  };

  const handleCreateDialogChange = async (type, value) => {
    try {
      if (type === 'input') {
        setNewElName(value);
        setCreateDialogSetting({
          error: false,
          helpText: en['Please input the name. It is required'],
          autoFocus: true
        });
      }

      if (type === 'btnClick') {
        if (value) {
          if (!buttonDisable) {
            let resultData;
            if (value) {
              if (!newElName) {
                setButtonDisable(false);
                setCreateDialogSetting({
                  error: true,
                  helpText: en['Please input the name. It is required'],
                  autoFocus: true
                });
                return;
              }

              if (!selectedTreeItem && !selectedState) {
                setButtonDisable(false);
                return;
              }

              if (!selectedTreeItem && !isAvatarAttached) {
                const notiOps = getNotificationOpt(
                  getSchemaType(selectedTreeItem?.schemaType),
                  'error',
                  'avatar'
                );
                notify(en['Station Logo is required!'], notiOps.options);
                return;
              }

              // checking dublicate station end;
              setButtonDisable(true);
              if (openRename) {
                let result = await updateGrouping({
                  variables: {
                    name: newElName,
                    version: selectedTreeItem?.version,
                    trackingAuthorName: currentUser?.name,
                    id: selectedTreeItem?._id,
                    schemaType: selectedTreeItem?.schemaType,
                    updatedAt: selectedTreeItem?.updatedAt
                  }
                });
                resultData = result?.data?.updateGrouping;
                onChange('update', false);
                setNewElName('');

                setSelected(result?.data?.updateGrouping?._id);
                setSelectedTreeItem(result?.data?.updateGrouping);
                handleElClicked('single', result?.data?.updateGrouping);

                const notiOps = getNotificationOpt(
                  'material',
                  'success',
                  'rename'
                );
                notify(notiOps.message, notiOps.options);
              } else {
                let parentIdList = selectedTreeItem?.parentIdList;

                let topologyData = {
                  station: selectedTreeItem?.topology?.station,
                  district: selectedTreeItem?.topology?.district,
                  school: selectedTreeItem?.topology?.school,
                  class: selectedTreeItem?.topology?.class
                };
                // Timestamp in seconds
                const timestamp = new Date().valueOf() / 1000;
                const schemaType = 'class';

                let variables = {
                  schemaType,
                  name: newElName,
                  trackingAuthorName: currentUser?.name,
                  parentId: selectedTreeItem?.parentId,
                  version: 1,
                  childrenIdList: selectedTreeItem?.childrenIdList,
                  desc: {
                    title: newElName,
                    short: '',
                    long: ''
                  },
                  parentIdList: parentIdList,
                  topology: topologyData,
                  status: 'created',
                  rank: timestamp,
                  updatedAt: selectedTreeItem?.updatedAt
                };

                let result = await createGrouping({ variables });
                resultData = result?.data?.createGrouping;
                if (selectedTreeItem == null) {
                  setCreatedDoc(resultData);
                  setAvatarUpload(true);
                }

                setOpenCreate(false);
                setNewTopologyCreated(true);
                const notiOps = getNotificationOpt(
                  'class',
                  'success',
                  'create'
                );
                notify(notiOps.message, notiOps.options);
                onChange('update', false);
                let avatarData = null;

                if (selectedTreeItem?.avatar?.fileName) {
                  const { createGrouping } = result?.data;
                  if (
                    createGrouping?.parentIdList?.includes(
                      selectedTreeItem?.avatar?.fileDir?.replace('/', '')
                    )
                  ) {
                    const destkey = `${createGrouping?.topology?.station}/${createGrouping?._id}/${selectedTreeItem?.avatar?.fileName}`;
                    const parentAvatar =
                      selectedTreeItem?.avatar?.baseUrl +
                      selectedTreeItem?.avatar?.fileDir +
                      selectedTreeItem?.avatar?.fileName;
                    const assetBucketName =
                      getAssetUrl(parentAvatar).split('/')[3];
                    try {
                      await copyAssetS3({
                        variables: {
                          sourceUrl: parentAvatar,
                          destBucket: assetBucketName,
                          destKey: destkey
                        }
                      });

                      const fileDir = createGrouping?._id + '/';
                      avatarData = {
                        uId: getUUID(),
                        type: selectedTreeItem?.avatar?.type,
                        baseUrl: selectedTreeItem?.avatar?.baseUrl,
                        mimeType: selectedTreeItem?.avatar?.mimeType,
                        fileName: selectedTreeItem?.avatar?.fileName,
                        fileDir: fileDir
                      };
                    } catch (err) {
                      console.log(err.message);
                    }
                  } else {
                    avatarData = {
                      uId: selectedTreeItem?.avatar?.uId,
                      type: selectedTreeItem?.avatar?.type,
                      baseUrl: selectedTreeItem?.avatar?.baseUrl,
                      mimeType: selectedTreeItem?.avatar?.mimeType,
                      fileName: selectedTreeItem?.avatar?.fileName,
                      fileDir: selectedTreeItem?.avatar?.fileDir
                    };
                  }
                }

                topologyData = {
                  ...topologyData,
                  class: result.data.createGrouping._id
                };
                setNewTopologyId &&
                  setNewTopologyId(result.data.createGrouping._id);
                let res = await updateGrouping({
                  variables: {
                    id: result.data.createGrouping._id,
                    schemaType: 'class',
                    version: result.data.createGrouping.version,
                    trackingAuthorName: currentUser?.name,
                    desc: {
                      title: newElName,
                      short: '',
                      long: ''
                    },
                    topology: topologyData,
                    status: 'published',
                    avatar: avatarData
                  }
                });
                resultData = res?.data?.updateGrouping;
                try {
                  if (selectedTreeItem) {
                    await updateGroupingList({
                      variables: {
                        id: selectedTreeItem?.parentId,
                        schemaType: 'school',
                        item: result.data.createGrouping._id,
                        fieldName: 'childrenIdList',
                        type: 'add',
                        trackingAuthorName: currentUser?.name
                      }
                    });
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }
            setOpenRename(false);
            onChange('update', false);
            setNewElName('');
            if (selectedTreeItem?._id) {
              let newexpanded = expanded?.includes(selectedTreeItem?._id)
                ? expanded
                : [...expanded, selectedTreeItem?._id];
              setExpanded(newexpanded);
            } else {
              setExpanded(['root']);
            }
            handleElClicked('single', resultData);
          }
          setButtonDisable(false);
        } else {
          setOpenCreate(false);
          setOpenRename(false);
          setNewElName('');
          onChange('update', false);
        }
      }
    } catch (error) {
      console.log(error.message);
      setNewElName('');
      setButtonDisable(false);
      if (error.message?.includes('Name exists')) {
        setCreateDialogSetting({
          error: true,
          helpText: en['Name exists already. Name must be unique.'],
          autoFocus: true
        });
      }
    }
  };

  return (
    <>
      {isSmallScreen ? (
        <CustomTreeSelectBox
          selectedTreeItem={selectedTreeItem}
          hideFilters={true}
        >
          <CustomTreeView
            resources={resources}
            selectedTreeItem={selectedTreeItem}
            setSelectedTreeItem={setSelectedTreeItem}
            onClick={handleElClicked}
            onChange={handleMainPanelChange}
            setSelected={setSelected}
            selected={selected}
            setExpanded={setExpanded}
            expanded={expanded}
            rootTitle={en['Stations']}
            stationLoadedData={getFilteredStation()}
            districtLoadedData={getSortedDistrictLoadedData()}
            schoolLoadedData={getSortedSchoolLoadedData()}
            classLoadedData={getSortedClassLoadedData()}
            materialLoadedData={materialLoadedData}
            searchResults={searchResults}
            openSearch={openSearch}
            isTopology
            isArchive
            userInfo={userInfo}
          />
        </CustomTreeSelectBox>
      ) : (
        <MainPanel
          title={en['Archives']}
          icon={faSitemap}
          showFilter={true}
          showAddBtn={false}
          showRefresh
          disableAddBtn={
            selectedTreeItem
              ? selectedTreeItem?.schemaType === 'class'
                ? true
                : false
              : true
          }
          totalDisable={
            typeof selectedTreeItem === 'undefined' &&
            userInfo?.schemaType === 'districtAdmin'
              ? true
              : false
          }
          filteredStateList={filteredStateList}
          // handleStateChange={handleStateChange}
          showStateFilter={showStateFilter}
          onChange={handleMainPanelChange}
          selectedTreeItem={selectedTreeItem}
        >
          {openSearch && (
            <div>
              <SearchBar
                value={newSearchKey}
                onChange={(newValue) => setNewSearchKey(newValue)}
                onCancelSearch={() => handleCancelSearch()}
                onRequestSearch={(value) => handleRequestSearch(value)}
              />
            </div>
          )}

          <div className={classes.elementList}>
            {(!stationLoadedData || stationLoadedData.length === 0) &&
            showLoading ? (
              <Box display="flex" justifyContent="center">
                <CircularProgress size={30} my={5} />
              </Box>
            ) : (
              <CustomTreeView
                resources={resources}
                selectedTreeItem={selectedTreeItem}
                setSelectedTreeItem={setSelectedTreeItem}
                onClick={handleElClicked}
                onChange={handleMainPanelChange}
                setSelected={setSelected}
                selected={selected}
                setExpanded={setExpanded}
                expanded={expanded}
                rootTitle={en['Stations']}
                stationLoadedData={getFilteredStation()}
                districtLoadedData={getSortedDistrictLoadedData()}
                schoolLoadedData={getSortedSchoolLoadedData()}
                classLoadedData={getSortedClassLoadedData()}
                materialLoadedData={materialLoadedData}
                searchResults={searchResults}
                openSearch={openSearch}
                isTopology
                isArchive
                userInfo={userInfo}
              />
            )}
          </div>
        </MainPanel>
      )}
      <CustomDialog
        mainBtnName={en['Create']}
        open={openCreate}
        buttonDisable={false}
        customClass={
          !selectedTreeItem ? classes.dialogWidth : classes.customDialogContent
        }
        title={`${en['Create a new']} ${'Class'}`}
        onChange={handleCreateDialogChange}
        reduceContentHeight
        isCreateFocus={isCreateFocus}
        setCreateFocus={setCreateFocus}
      >
        <CustomInput
          my={2}
          size="small"
          type="text"
          autoFocus={true}
          label={`Enter the Class name *`}
          value={newElName}
          onChange={(value) => handleCreateDialogChange('input', value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Tab') {
              if (selectedTreeItem) {
                handleCreateDialogChange('btnClick', event.target.value);
              } else {
                // setOpenState(true);
                event.preventDefault();
              }
            }
          }}
          fullWidth
          error={createDialogSetting.error}
          helperText={createDialogSetting.helpText}
          variant="outlined"
          width="300px"
        />
      </CustomDialog>
    </>
  );
};

export default ArchivesMain;
