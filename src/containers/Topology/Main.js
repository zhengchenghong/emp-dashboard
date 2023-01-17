/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { MainPanel } from '@app/components/Panels';
import { faSitemap } from '@fortawesome/pro-solid-svg-icons';
import { CircularProgress, Grid, Box, Typography } from '@material-ui/core';
import CustomTreeView from '@app/components/TreeViewPanel';
import SearchBar from 'material-ui-search-bar';
import graphql from '@app/graphql';
import { useMutation } from '@apollo/client';
import {
  CustomCheckBox,
  CustomDialog,
  CustomInput,
  CustomSelectBox
} from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import { getAssetUrl, getDisplayName, getUUID } from '@app/utils/functions';
import * as globalStyles from '@app/constants/globalStyles';
import StatesList from '@app/constants/states.json';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useFilterContext } from '@app/providers/FilterContext';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { useUserContext } from '@app/providers/UserContext';
import { en } from '@app/language';
import { groupingList } from '@app/utils/ApolloCacheManager';
import { useSmallScreen } from '@app/utils/hooks';
import { CustomTreeSelectBox } from '@app/components/Custom';
import transmissions from '@app/constants/transmissions.json';
import { AvatarUploadForm } from '@app/components/Forms';

const TopologyMain = ({
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
  whenState,
  setWhenState,
  selectedDocId,
  createNew,
  setCreateNew,
  setNewTopologyId,
  isRoot,
  archivedClasses,
  onRefetchSelected
}) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [selectedState, setSelectedState] = useState();
  const {
    filterStateValue,
    setFilterStateValue,
    filteredStationId,
    filteredDistrictId,
    filteredDistrictList,
    currentSelectedType,
    setFilteredDistrictId
  } = useFilterContext();
  const [openCreate, setOpenCreate] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [stateError, setStateError] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [newElName, setNewElName] = useState('');
  const [newSearchKey, setNewSearchKey] = useState('');
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [archiveChecked, setArchiveChecked] = useState();
  const [pickedArchivedClass, setPickedArchiveClass] = useState();
  const [openArchivedClassesList, setOpenArchivedClassesList] = useState();
  const [searchResults, setSearchResults] = useState();
  const [openRename, setOpenRename] = useState(false);
  const [openSave, setOpenSave] = useState(false);

  const [isCreateFocus, setCreateFocus] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [copyAssetS3] = useMutation(graphql.mutations.copyAssetS3);
  const [openTransmission, setOpenTransmission] = useState(false);
  const [selectedTransmission, setSelectedTransmission] = useState(
    transmissions[0].value
  );

  const { setNewTopologyCreated } = useSelectionContext();
  const [createdDoc, setCreatedDoc] = useState();
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);

  const [currentUser] = useUserContext();
  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const [restoreArchive] = useMutation(graphql.mutations.restoreArchive);

  const stateListFromTopology = stationLoadedData
    ?.map((item) => item?.topology?.state)
    ?.filter((item) => item !== null && item?.length > 0);
  const filteredStateList = StatesList.filter((item) =>
    stateListFromTopology?.includes(item?.value)
  );
  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    if (createNew) {
      handleMainPanelChange('create');
      setCreateNew(false);
    }
  }, [createNew]);

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

  const handleSaveChange = (value, type) => {
    setOpenSave(false);
    if (type) {
      onChange('SaveStation');
    } else if (!type && value === 'btnClick') {
      setWhenState(false);
      handleMainPanelChange('create', true);
    }
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
          if (archiveChecked && archivedClasses?.length) {
            let variables = {
              _id: pickedArchivedClass,
              schemaType: 'archiveClass',
              name: newElName
            };
            let data = await restoreArchive({
              variables: variables
            });
            onRefetchSelected(true);
            setArchiveChecked();
            setPickedArchiveClass();
            setOpenCreate(false);
          } else {
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
                  setStateError(true);
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
                  let parentIdList = selectedTreeItem?.parentIdList
                    ? [...selectedTreeItem?.parentIdList, selectedTreeItem?._id]
                    : [selectedTreeItem?._id];

                  let topologyData = {
                    state: !selectedTreeItem
                      ? selectedState
                      : selectedTreeItem?.topology?.state &&
                        selectedTreeItem?.topology?.state !== ''
                      ? selectedTreeItem?.topology?.state
                      : getTopologyState(),
                    station: selectedTreeItem?.topology?.station,
                    district: selectedTreeItem?.topology?.district,
                    school: selectedTreeItem?.topology?.school,
                    class: selectedTreeItem?.topology?.class,
                    [selectedTreeItem?.schemaType]: selectedTreeItem?._id
                  };
                  // Timestamp in seconds
                  const timestamp = new Date().valueOf() / 1000;
                  const schemaType = getSchemaType(
                    selectedTreeItem?.schemaType
                  );

                  let variables = {
                    schemaType,
                    name: newElName,
                    trackingAuthorName: currentUser?.name,
                    parentId: selectedTreeItem?._id,
                    version: 1,
                    childrenIdList: [],
                    desc: {
                      title: newElName,
                      short: '',
                      long: ''
                    },
                    parentIdList: parentIdList,
                    topology: topologyData,
                    status: schemaType === 'class' ? 'created' : 'published',
                    rank: timestamp,
                    updatedAt: selectedTreeItem?.updatedAt
                  };

                  if (schemaType === 'station') {
                    delete variables.parentId;
                    delete variables.parentIdList;
                  }

                  if (['class, school'].includes(schemaType)) {
                  }

                  if (variables.schemaType === 'station') {
                    variables = {
                      ...variables,
                      transmission: selectedTransmission
                    };
                  }

                  let result = await createGrouping({ variables });
                  resultData = result?.data?.createGrouping;
                  if (selectedTreeItem == null) {
                    setCreatedDoc(resultData);
                    setAvatarUpload(true);
                  }
                  setOpenCreate(false);
                  setNewTopologyCreated(true);
                  const notiOps = getNotificationOpt(
                    getSchemaType(selectedTreeItem?.schemaType),
                    'success',
                    'create'
                  );
                  notify(notiOps.message, notiOps.options);

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
                    [getSchemaType(selectedTreeItem?.schemaType)]:
                      result.data.createGrouping._id
                  };
                  setNewTopologyId &&
                    setNewTopologyId(result.data.createGrouping._id);
                  let res = await updateGrouping({
                    variables: {
                      id: result.data.createGrouping._id,
                      schemaType: getSchemaType(selectedTreeItem?.schemaType),
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
                          id: selectedTreeItem['_id'],
                          schemaType: selectedTreeItem?.schemaType,
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
          }

          setButtonDisable(false);
        } else {
          setOpenCreate(false);
          setOpenRename(false);
          setNewElName('');
          setPickedArchiveClass();
          setArchiveChecked();
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

  const getSchemaType = (value) => {
    if (value === 'station') return 'district';
    if (value === 'district') return 'school';
    if (value === 'school') return 'class';
    return 'station';
  };

  const getSchemaTitle = (value) => {
    if (value === 'station') return 'District';
    if (value === 'district') return 'School';
    if (value === 'school') return 'Class';
    return 'Station';
  };

  const handleMainPanelChange = (value, canCreate) => {
    if (value === 'create') {
      if (whenState && !canCreate) {
        setOpenSave(true);
        return;
      }
      setStateError(false);
      setSelectedState();
      setCreateDialogSetting({
        error: false,
        helpText: en['Please input the name. It is required'],
        autoFocus: true
      });
      setAvatarAttached(false);
      setAvatarUpload(false);
      setOpenCreate(true);
    }
    if (value === 'rename') {
      let id = selectedTreeItem && selectedTreeItem?._id;
      setNewElName(selectedTreeItem && getDisplayName(selectedTreeItem?.name));
      id !== 'root' && setOpenRename(true);
    }
    if (value === 'refresh') onChange('refresh', true);
  };

  const handleElClicked = (type, value) => {
    if (type === 'single') {
      onChange('elSingleClick', value);
      if (
        value &&
        value._id !== filteredDistrictId &&
        currentSelectedType === 'district'
      ) {
        setFilteredDistrictId('all');
      }
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

  const handleStateChange = (data) => {
    console.log('change');
    setFilterStateValue(data?.value);
  };

  const handleStationState = (data) => {
    if (stateError) {
      setStateError(false);
    }

    setSelectedState(data?.value);
  };

  const handleClose = (data) => {
    setOpenState(false);
    setCreateFocus(true);
  };

  const handleStationTransmission = (data) => {
    setSelectedTransmission(data?.value);
  };

  const handleCloseTransmission = (data) => {
    setOpenTransmission(false);
    setCreateFocus(true);
  };

  const getFilteredStation = () => {
    let sortedStations = stationLoadedData
      ?.slice()
      ?.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (filteredStationId === 'all') {
      return sortedStations?.filter((item) => {
        if (!filterStateValue || filterStateValue === 'all') return true;
        if (filterStateValue === item?.topology?.state) return true;
        return false;
      });
    } else {
      return sortedStations?.filter((item) => {
        if (filteredStationId === item._id) return true;
        return false;
      });
    }
  };

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

  const getSortedArray = (objArray, sortKey) => {
    return objArray
      ?.slice()
      ?.sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1));
  };

  useEffect(() => {
    if (isSmallScreen) return;
    const stations = getFilteredStation()?.map((item) => item._id);
    if (selectedTreeItem && !stations?.includes(selectedTreeItem?._id)) {
      if (
        !filteredDistrictList
          ?.map((item) => item.value)
          .includes(selectedTreeItem._id)
      ) {
        onChange('changeStation');
        setSelected();
      }
    }
  }, [filterStateValue]);

  useEffect(() => {
    if (isSmallScreen) return;
    if (filteredStationId && filteredStationId !== 'all') {
      const value = stationLoadedData?.find((item) => {
        if (filteredStationId === item._id) return true;
        return false;
      });
      onChange('elSingleClick', value);
      setSelected(value?._id);
    } else {
      onChange('changeStation');
      setSelected();
    }
  }, [filteredStationId]);

  useEffect(() => {
    if (isSmallScreen) return;
    if (filteredDistrictId && filteredDistrictId !== 'all') {
      const value = districtLoadedData?.find((item) => {
        if (filteredDistrictId === item._id) return true;
        return false;
      });
      if (value) {
        onChange('elSingleClick', value);
        setSelected(value._id);
      }
    } else {
      if (currentSelectedType !== 'district') {
        onChange('changeStation');
        setSelected();
      }
    }
  }, [filteredDistrictId]);

  useEffect(() => {
    if (districtLoadedData?.length > 0) {
      if (
        currentSelectedType === 'district' &&
        selectedTreeItem._id === filteredStationId
      ) {
        const value = districtLoadedData?.find(
          (item) => filteredDistrictId === item._id
        );
        if (value) {
          onChange('elSingleClick', value);
          setSelected(value._id);
        }
      }
    }
  }, [districtLoadedData]);

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      console.log('avatar attached');
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      console.log('avatar dettached');
    } else {
      // handleFormChange('avatarUpload', value);
    }
  };

  return (
    <>
      {isSmallScreen ? (
        <CustomTreeSelectBox
          selectedDocId={selectedDocId}
          selectedTreeItem={selectedTreeItem}
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
            searchResults={getSortedArray(searchResults, 'name')}
            openSearch={openSearch}
            isTopology
            userInfo={userInfo}
          />
        </CustomTreeSelectBox>
      ) : (
        <MainPanel
          title={en['Topologies']}
          icon={faSitemap}
          showFilter={true}
          showAddBtn
          showRefresh
          canAdd
          disableAddBtn={
            isRoot
              ? false
              : selectedTreeItem
              ? selectedTreeItem?.schemaType === 'class'
                ? true
                : false
              : true
          }
          totalDisable={
            isRoot
              ? false
              : typeof selectedTreeItem === 'undefined' &&
                userInfo?.schemaType === 'districtAdmin'
              ? true
              : false
          }
          filteredStateList={filteredStateList}
          handleStateChange={handleStateChange}
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
                searchResults={getSortedArray(searchResults, 'name')}
                openSearch={openSearch}
                isTopology
                userInfo={userInfo}
              />
            )}
          </div>
        </MainPanel>
      )}
      <CustomDialog
        mainBtnName={en['Create']}
        open={openCreate}
        buttonDisable={buttonDisable}
        customClass={
          !selectedTreeItem ? classes.dialogWidth : classes.customDialogContent
        }
        title={`${en['Create a new']} ${getSchemaTitle(
          selectedTreeItem && selectedTreeItem?.schemaType
        )}`}
        onChange={handleCreateDialogChange}
        reduceContentHeight
        isCreateFocus={isCreateFocus}
        setCreateFocus={setCreateFocus}
      >
        {selectedTreeItem?.schemaType === 'school' &&
          archivedClasses?.length > 0 &&
          archiveChecked && (
            <CustomSelectBox
              type={'archivedClasses'}
              variant="outlined"
              addMarginTop={false}
              style={classes.archiveSelectFilter}
              customStyle={{ width: '100%' }}
              value={pickedArchivedClass}
              label={'Select class...'}
              resources={archivedClasses
                ?.slice()
                ?.sort((a, b) => (a?.name > b?.name ? 1 : -1))}
              onChange={(value) => {
                setNewElName(value.name);
                setPickedArchiveClass(value?._id);
              }}
              onClose={() => {
                setOpenArchivedClassesList(false);
              }}
              size="small"
              noPadding={true}
              openState={openArchivedClassesList}
              setOpenState={setOpenArchivedClassesList}
            />
          )}
        <CustomInput
          my={2}
          size="small"
          type="text"
          autoFocus={true}
          label={
            archiveChecked
              ? 'New Class Name'
              : `Enter the ${getSchemaTitle(
                  selectedTreeItem && selectedTreeItem?.schemaType
                )} name *`
          }
          value={newElName}
          onChange={(value) => handleCreateDialogChange('input', value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Tab') {
              if (selectedTreeItem) {
                handleCreateDialogChange('btnClick', event.target.value);
              } else {
                setOpenState(true);
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
        {!selectedTreeItem && (
          <>
            <div style={{ marginTop: 20 }}>
              <CustomSelectBox
                size="small"
                label={en['select a state']}
                variant="outlined"
                helperText={stateError ? en['Please select a state'] : ''}
                error={stateError}
                resources={StatesList}
                customStyle={{ width: 350, marginLeft: -4 }}
                onClose={handleClose}
                onChange={handleStationState}
                value={selectedState}
                openState={openState}
                setOpenState={setOpenState}
              />
            </div>
            <AvatarUploadForm
              disable={false}
              resources={null}
              docId={createdDoc?._id}
              stationId={createdDoc?._id}
              acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
              onChange={(value) => handleOnAvatarChange(value)}
              extraStyle={{
                display: 'flex',
                alignItems: 'center',
                objectFit: 'contain',
                marginTop: 20,
                border: '1px solid lightgray',
                borderRadius: '4px',
                marginRight: '3px'
              }}
              hideArrow={true}
              extraClass={classes.dropzone}
              type={resources.schemaType}
              title={en['Drag and Drop a Station Logo Here']}
              isUpload={isAvatarUpload}
              doc={createdDoc}
              setUpload={setAvatarUpload}
            />
            <div style={{ marginTop: 20 }}>
              <CustomSelectBox
                size="small"
                label={'Select a target device type'}
                variant="outlined"
                resources={transmissions}
                customStyle={{ width: 350, marginLeft: -4 }}
                onClose={handleCloseTransmission}
                onChange={handleStationTransmission}
                value={selectedTransmission}
                openState={openTransmission}
                setOpenState={setOpenTransmission}
              />
            </div>
          </>
        )}
        {selectedTreeItem?.schemaType === 'school' && (
          <div>
            <CustomCheckBox
              color="primary"
              value={archiveChecked}
              label={'From Archive'}
              onChange={(value) => {
                console.log('Archived Classes ===>', archivedClasses);
                setArchiveChecked(!value);
              }}
              // willChange={(value) => willChangeConfigAppInfo(!value)}

              disabled={!archivedClasses?.length}
            />
          </div>
        )}
      </CustomDialog>

      <CustomDialog
        dismissBtnName="Dismiss"
        mainBtnName="Save"
        secondaryBtnName="Discard"
        open={openSave}
        onChange={handleSaveChange}
      >
        <main>
          <Typography variant="subtitle1" className={classes.warning}>
            {en['There are unsaved changes on the panel.']}
            <br />
            {en['Will you discard your current changes?']}
          </Typography>
        </main>
      </CustomDialog>

      <CustomDialog
        mainBtnName={en['Rename']}
        open={openRename}
        buttonDisable={buttonDisable}
        customClass={
          !selectedTreeItem ? classes.dialogWidth : classes.customDialogContent
        }
        title={`${['Rename']} ${selectedTreeItem?.schemaType}`}
        onChange={handleCreateDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <CustomInput
            my={2}
            size="small"
            type="text"
            label={`Enter the ${selectedTreeItem?.schemaType} name *`}
            autoFocus={true}
            value={newElName}
            onChange={(value) => handleCreateDialogChange('input', value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateDialogChange('btnClick', event.target.value);
              }
            }}
            error={createDialogSetting.error}
            fullWidth
            helperText=""
            variant="outlined"
            width="300px"
          />
        </Grid>
      </CustomDialog>
    </>
  );
};

export default TopologyMain;
