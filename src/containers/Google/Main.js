/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { MainPanel } from '@app/components/Panels';
import { faChalkboardTeacher } from '@fortawesome/pro-solid-svg-icons';
import { Grid, Typography, TextField } from '@material-ui/core';
import axios from 'axios';
import CustomTreeView from '@app/components/TreeViewPanel';
import {
  CustomDialog,
  CustomInput,
  CustomRadioButtonsGroup
} from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import * as globalStyles from '@app/constants/globalStyles';
import { useMutation, useLazyQuery } from '@apollo/client';

import Autocomplete from '@material-ui/lab/Autocomplete';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { useUserContext } from '@app/providers/UserContext';
import config from '@app/Config';
import { getDisplayName, getUUID } from '@app/utils/functions';
import { useNotifyContext } from '@app/providers/NotifyContext';
import graphql from '@app/graphql';
import { en } from '@app/language';
import { groupingList } from '@app/utils/ApolloCacheManager';

const GoogleClassMain = ({
  variables,
  resources,
  setResources,
  onChange,
  selected,
  setSelected,
  selectedTreeItem,
  setSelectedTreeItem,
  createGrouping,
  updateGrouping,
  classLoadedData,
  onSearch,
  isFirst,
  setIsFirst,
  updateShow,
  when,
  setIsCreate,
  setRefresh,
  createShow,
  setCreateShow
}) => {
  const { parent } = variables;
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [openCreate, setOpenCreate] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [newElName, setNewElName] = useState('');
  const [buttonDisable, setButtonDisable] = useState(false);
  const [newSearchKey, setNewSearchKey] = useState('');
  const [subType, setSubType] = useState('folder');
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [expanded, setExpanded] = useState([]);
  const [searchResults, setSearchResults] = useState();
  const [showImportButton, setShowImportButton] = useState(false);
  const [openPublishConfirmation, setOpenPublishConfirmation] = useState(false);
  const [ingestGoogle] = useMutation(graphql.mutations.ingestGoogle);
  const [currentUser] = useUserContext();
  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  useEffect(() => {
    setCreateDialogSetting({
      error: false
    });
  }, []);

  useEffect(() => {
    if (currentUser.schemaType === 'schoolAdmin') {
      setShowImportButton(true);
    }
  }, [currentUser]);

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

  useEffect(() => {
    // console.log("expanded:", expanded);
    if (selectedTreeItem && isFirst === 1) {
      if (selectedTreeItem?.schemaType === 'class') {
        setExpanded(expanded);
      } else {
        setExpanded(selectedTreeItem?.parentIdList);
      }
      setIsFirst(isFirst + 1);
    }
  }, [selectedTreeItem]);

  const handleCreateDialogChange = async (type, value) => {
    try {
      if (type === 'input') {
        setNewElName(value);
        setCreateDialogSetting({
          error: false
          // helpText: 'Please input the lesson name'
        });
      }

      if (type === 'type') {
        console.log(value);
        setSubType(value);
      }

      if (type === 'btnClick') {
        if (!buttonDisable) {
          setButtonDisable(true);
          let result, updateResult;
          if (value) {
            if (!newElName) {
              const notiOps = getNotificationOpt('extra', 'error', 'name');
              notify(notiOps.message, notiOps.options);
              setButtonDisable(false);
              setCreateDialogSetting({
                error: false
                // helpText: 'Please input the lesson name'
              });
              return;
            }

            let topologyData = {};
            if (!selectedTreeItem?.topology?.class) {
              topologyData = {
                station: selectedTreeItem?.topology?.station,
                district: selectedTreeItem?.topology?.district,
                school: selectedTreeItem?.topology?.school,
                class: selectedTreeItem?._id
              };
            } else {
              topologyData = {
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
                  trackingAuthorName: currentUser?.name,
                  id: selectedTreeItem?._id,
                  schemaType: selectedTreeItem?.schemaType
                }
              });

              const itemIndex = resources.indexOf(selectedTreeItem);
              const newSelectedItem = { ...selectedTreeItem };
              newSelectedItem['name'] = newElName;

              const newResourcesList = [...resources];
              newResourcesList[itemIndex] = newSelectedItem;
              setResources(newResourcesList);
              onChange('update', false);
              // onChange('refresh', true);
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
              let parentIdList = [];
              if (selectedTreeItem) {
                parentIdList =
                  selectedTreeItem?.schemaType === 'googleClass'
                    ? [selectedTreeItem?._id]
                    : [
                        ...(selectedTreeItem?.parentIdList
                          ? selectedTreeItem?.parentIdList
                          : []),
                        selectedTreeItem?._id
                      ];
              }

              let avatar = {
                uId: getUUID(),
                type: selectedTreeItem?.avatar?.type,
                baseUrl: selectedTreeItem?.avatar?.baseUrl,
                mimeType: selectedTreeItem?.avatar?.mimeType,
                fileName: selectedTreeItem?.avatar?.fileName,
                fileDir: selectedTreeItem?.avatar?.fileDir
              };

              result =
                subType === 'folder'
                  ? await createGrouping({
                      variables: {
                        ...variables,
                        name: newElName,
                        trackingAuthorName: currentUser?.name,
                        parentId: selectedTreeItem?._id,
                        topology: topologyData,
                        version: 1,
                        childrenIdList: [],
                        parentIdList: parentIdList,
                        avatar: avatar,
                        desc: {
                          title: newElName
                        }
                      }
                    })
                  : await createGrouping({
                      variables: {
                        ...variables,
                        name: newElName,
                        trackingAuthorName: currentUser?.name,
                        parentId: selectedTreeItem?._id,
                        topology: topologyData,
                        version: 1,
                        childrenIdList: null,
                        parentIdList: parentIdList,
                        avatar: avatar,
                        desc: {
                          title: newElName
                        }
                      }
                    });
              let childrenIds = selectedTreeItem?.childrenIdList;
              if (childrenIds) {
                childrenIds = [
                  ...childrenIds,
                  result?.data?.createGrouping?._id
                ];
              } else {
                childrenIds = [result?.data?.createGrouping?._id];
              }

              if (childrenIds?.length) {
                await updateGroupingList({
                  variables: {
                    id: selectedTreeItem?._id,
                    schemaType: selectedTreeItem?.schemaType,
                    item: result?.data?.createGrouping?._id,
                    fieldName: 'childrenIdList',
                    type: 'add',
                    trackingAuthorName: currentUser?.name
                  }
                });
              }

              setOpenCreate(false);
              const notiOps = getNotificationOpt(
                'material',
                'success',
                'create'
              );
              notify(notiOps.message, notiOps.options);
            }
          } else {
            setOpenCreate(false);
          }
          setOpenRename(false);
          onChange('update', false);
          setNewElName('');
          if (selectedTreeItem?._id) {
            let newexpanded = expanded.includes(selectedTreeItem?._id)
              ? expanded
              : [...expanded, selectedTreeItem?._id];
            setExpanded(newexpanded);
          } else {
            setExpanded(['root']);
          }
          if (updateResult) {
            setSelected(updateResult?.data?.updateGrouping?._id);
            setSelectedTreeItem(updateResult?.data?.updateGrouping);
            handleElClicked('single', updateResult?.data?.updateGrouping);
          }
        }
        setButtonDisable(false);
      }
    } catch (error) {
      console.log(error.message);
      setCreateDialogSetting({
        error: true,
        helpText: en['This lesson already exists. Title must be unique.']
      });
      const notiOps = getNotificationOpt('extra', 'error', 'lesson');
      notify(notiOps.message, notiOps.options);
    }
  };
  const handleMainPanelChange = (value) => {
    if (value === 'create') {
      if (when) {
        updateShow(true);
        setIsCreate(true);
      } else {
        setOpenCreate(true);
      }
    }
    if (value === 'rename') {
      let id = selectedTreeItem && selectedTreeItem?._id;
      let schemaType = selectedTreeItem && selectedTreeItem?.schemaType;
      setNewElName(selectedTreeItem && getDisplayName(selectedTreeItem?.name));
      id !== 'root' && schemaType !== 'googleClass' && setOpenRename(true);
      setCreateDialogSetting({
        error: false,
        autoFocus: true
      });
    }
    if (value === 'search') setOpenSearch((prev) => !prev);
    if (value === 'undo') onSearch('');
    if (value === 'refresh') onChange('refresh', true);
    if (value === 'import') {
      setOpenPublishConfirmation(true);
    }
  };

  const handleElClicked = (type, value) => {
    if (type === 'single') onChange('elSingleClick', value);
  };

  const handleRequestSearch = (value) => {
    let results = [];
    results = resources.filter((e) => e.name === value);
    results = results.concat(
      resources.filter((e) => e.tagList?.includes(value))
    );
    results = results.concat(classLoadedData.filter((e) => e.name === value));
    results = results.concat(
      classLoadedData.filter((e) => e.tagList?.includes(value))
    );
    if (results.length > 0) {
      setSearchResults(results);
    } else {
      setSearchResults('No Results');
    }
    setNewSearchKey(value);
  };

  const handleCancelSearch = (value) => {
    if (!value) {
      setOpenSearch(false);
      setSearchResults(null);
      setNewSearchKey();
    }
  };

  const handleClassPublish = async (type, value) => {
    if (!value) {
      setOpenPublishConfirmation(false);
      return;
    }
    try {
      const response = await ingestGoogle({
        variables: {
          userId: currentUser['_id']
        }
      });
      console.log(currentUser['_id']);
      setRefresh(true);
      setOpenPublishConfirmation(false);
      const notiOps = getNotificationOpt('googleClass', 'success', 'import');
      notify(notiOps.message, notiOps.options);
    } catch (err) {
      console.log(err.response);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  let tagsData = JSON.parse(localStorage.getItem('tagsData')) || [];
  return (
    <MainPanel
      isMain={!parent}
      title={en['Google Class']}
      icon={faChalkboardTeacher}
      showAddBtn={false}
      showRefresh={false}
      canImport={showImportButton}
      totalDisable={
        selectedTreeItem
          ? selectedTreeItem.schemaType === 'material' &&
            (selectedTreeItem?.childrenIdList === null ||
              selectedTreeItem?.parentIdList?.length > 2)
            ? true
            : false
          : true
      }
      onChange={handleMainPanelChange}
      selectedTreeItem={selectedTreeItem}
    >
      {openSearch && (
        <div>
          <Autocomplete
            freeSolo
            id="free-solo-2-demo"
            disableClearable
            value={newSearchKey}
            onChange={(event, newValue) => handleRequestSearch(newValue)}
            onInputChange={(event, value) => handleCancelSearch(value)}
            options={tagsData.map((option) => option)}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="normal"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </div>
      )}
      <div className={classes.elementList}>
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
          classLoadedData={classLoadedData}
          searchResults={searchResults}
          openSearch={openSearch}
        />
      </div>
      <CustomDialog
        mainBtnName={en['Create']}
        open={openCreate}
        title={en['Create New']}
        buttonDisable={buttonDisable}
        onChange={handleCreateDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={10}>
          <CustomRadioButtonsGroup
            setSubType={setSubType}
            selectedTreeItem={selectedTreeItem}
            onChange={handleCreateDialogChange}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={10}>
          <CustomInput
            my={2}
            size="small"
            type="text"
            label={en['Title']}
            autoFocus={true}
            value={newElName}
            onChange={(value) => handleCreateDialogChange('input', value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateDialogChange('btnClick', event.target.value);
              }
            }}
            error={createDialogSetting.error}
            helperText={createDialogSetting.helpText}
            variant="outlined"
            width="300px"
          />
        </Grid>
      </CustomDialog>
      <CustomDialog
        mainBtnName={en['Rename']}
        open={openRename}
        title={`Rename ${selectedTreeItem?.schemaType}`}
        onChange={handleCreateDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={10}>
          <CustomInput
            my={2}
            size="small"
            type="text"
            autoFocus={true}
            label={`Enter the ${selectedTreeItem?.schemaType} name`}
            value={newElName}
            onChange={(value) => handleCreateDialogChange('input', value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateDialogChange('btnClick', event.target.value);
              }
            }}
            error={createDialogSetting.error}
            helperText={createDialogSetting.helpText}
            variant="outlined"
            width="300px"
          />
        </Grid>
      </CustomDialog>
      <CustomDialog
        mainBtnName={en['Import']}
        open={openPublishConfirmation}
        title={en['Import Class?']}
        onChange={handleClassPublish}
      >
        <Typography variant="h6">
          {en['This will import the class.']}
        </Typography>
      </CustomDialog>
    </MainPanel>
  );
};

export default GoogleClassMain;
