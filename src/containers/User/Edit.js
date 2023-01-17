/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { UserUploadForm, UserListForm } from '@app/components/Forms';
import { EditPanel } from '@app/components/Panels';
import { getUUID } from '@app/utils/functions';
import JSONEditor from '@app/components/JSONEditor';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import graphql from '@app/graphql';
import * as globalStyles from '@app/constants/globalStyles';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { uploadFileToS3 } from '@app/utils/aws_s3_bucket';
import { getFileExtension } from '@app/utils/file-manager';
import { getCurrentUTCTime } from '@app/utils/date-manager';
import { useFilterContext } from '@app/providers/FilterContext';
import UserSearch from '@app/components/Forms/UserList/Search';
import { UsersResource } from './data';
import useStylesSearch from './searchStyle';
import { en } from '@app/language';
import { useUserContext } from '@app/providers/UserContext';
import { groupingList } from '@app/utils/ApolloCacheManager';

const isValidEmail = (email) => {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const UserEdit = ({
  callUserSave,
  resources,
  selectedDocId,
  onChange,
  userTypeData,
  stationLoadedData,
  districtLoadedData,
  classLoadedData,
  setRefresh,
  schoolLoadedData,
  selectedData,
  setCallUserSave,
  setSelectedData,
  handleMainChange
}) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedRow, setSelectedRow] = useState();
  const [structuredData, setStructuredData] = useState();
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [uploadDialogTitle, setUploadDialogTitle] = useState('');
  const [loadedStudentFile, setLoadedStudentFile] = useState();
  const [loadedTeacherFile, setLoadedTeacherFile] = useState();
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [hasTypeField, setHasTypeField] = useState(false);
  const [updateValue, setUpdateValue] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [canFilter, setCanFilter] = useState(true);
  const [filterValue, setFilterValue] = useState();
  const [checkbox, setCheckbox] = useState(false);
  const [isTabReset, setIsTabReset] = useState(false);
  const [tabStatus, setTabStatus] = useState({});
  const [detailData, setDetailData] = useState({});
  const [currentTab, setCurrentTab] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [isResetSearch, setResetSearch] = useState();
  const {
    setFilterStateValue,
    setFilteredStationList,
    setFilteredStationId,
    filteredDistrictId,
    setFilteredDistrictId,
    filteredDistrictList,
    setFilteredDistrictList
  } = useFilterContext();
  const [currentUser] = useUserContext();

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);

  const [createBulkUsersGrouping] = useMutation(
    graphql.mutations.createBulkUsersGrouping
  );

  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument);

  const assignClassToStudent = async (classItem, value) => {
    await updateGroupingList({
      variables: {
        id: classItem?.value,
        schemaType: classItem?.schemaType,
        item: value,
        fieldName: 'assigneeIdList',
        type: 'add',
        trackingAuthorName: currentUser?.name
      }
    });
  };

  useEffect(() => {
    if (selectedDocId === 1) {
      setCanFilter(false);
      setHasTypeField(false);
    } else {
      setHasTypeField(true);
      setCanFilter(true);
    }
    setFilterValue('all');
    setFilterStateValue('all');
    setFilteredDistrictId('all');
    setFilteredStationId('all');

    if (selectedDocId === 5 || selectedDocId === 6) {
      setCanUpload(true);
    } else {
      setCanUpload(false);
    }
    setSelectedRow();
    setStructuredData();
    setResetSearch(true);
    setSearchValue('');
  }, [selectedDocId]);

  useEffect(() => {
    if (resources) {
      setCheckbox(false);
      setUpdateValue(false);
      setShowUserDialog(false);
      setTitle(resources.name);
      handleTabStatus(currentTab);

      setDetailData({
        ...detailData,
        state: resources.data?.state || '',
        body: resources.data?.body || null
      });
    }
  }, [resources]);

  useEffect(() => {
    if (callUserSave) {
      handleEditPanelChange('userSave');
    }
  }, [callUserSave]);

  const handleFormChange = (type, value) => {
    if (type === 'textEditor') {
      setDetailData({
        ...detailData,
        body: value
      });
    }

    if (type === 'userUpload') {
      if (value === 'clear') {
        return;
      }
      if (selectedDocId === 6) setLoadedStudentFile(value);
      if (selectedDocId === 5) setLoadedTeacherFile(value);
    }

    if (type === 'studentEdit') {
      if (!value) {
        setSelectedData();
        onChange('update', false);
        return;
      }
      setSelectedData(value);
    }
    onChange('update', true);
  };

  const handleShowPanel = async (value) => {
    setIsTabReset(false);
    setCurrentTab(value);
    handleTabStatus(value);
  };

  const handleTabStatus = async (value) => {
    if (value === 0) {
      setTabStatus({
        desc: true,
        htmlEditor: false,
        categories: false,
        asset: false
      });
    } else if (value === 1) {
      setTabStatus({
        desc: false,
        htmlEditor: true,
        categories: false,
        asset: false
      });
    } else if (value === 2) {
      setTabStatus({
        desc: false,
        htmlEditor: false,
        categories: true,
        asset: false
      });
    } else if (value === 3) {
      setTabStatus({
        desc: false,
        htmlEditor: false,
        categories: false,
        asset: true
      });
    }
  };

  const handleFilter = (value) => {
    setFilterValue(value);
  };

  const uploadFile = async (file) => {
    const docId = userTypeData[0]['value'];
    const type = selectedDocId === 6 ? 'student' : 'educator';
    try {
      const fileExt = getFileExtension(file.name);
      const fileName = getCurrentUTCTime();
      /********* Origin Code Using the SignedUrl
      const { signedUrl } = await generateSignedUrl(
        docId,
        `${fileName}.${fileExt}`
      );

      await axios({
        method: 'put',
        url: `${signedUrl}`,
        data: file,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      let assetUrl = getAssetUrl(signedUrl);
      *********/
      const awsDirectory = docId;
      const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
      let assetUrl = await uploadFileToS3(file, uploadKey, 0);

      await createBulkUsersGrouping({
        variables: {
          parentDocId: docId,
          type: type,
          assetUrl: assetUrl
        }
      });

      const notiOps = getNotificationOpt(type, 'success', 'upload');
      notify(notiOps.message, notiOps.options);
      onChange('clear');
      setUpdateValue(true);
    } catch (error) {
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'upload');
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const handleRefresh = (value) => {
    setRefresh(value);
  };

  const handleUploadDialogChange = (type, value) => {
    if (type === 'btnClick') {
      if (!value) {
        setLoadedStudentFile();
        setLoadedTeacherFile();
        setOpenUpload(false);
        return;
      }

      if (selectedDocId === 6) {
        uploadFile(loadedStudentFile);
      }
      if (selectedDocId === 5) {
        uploadFile(loadedTeacherFile);
      }
      setOpenUpload(false);
    }
  };

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'add') {
        setShowUserDialog(true);
        return;
      }

      if (type === 'clearFilter') {
        setFilterValue('all');
        setFilterStateValue('all');
        setFilteredDistrictId('all');
        setFilteredStationId('all');
      }

      if (type === 'userSave') {
        if (!selectedData?.name) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'emailRequired'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        if (!isValidEmail(selectedData?.name)) {
          const notiOps = getNotificationOpt('userlist', 'error', 'email');
          notify(notiOps.message, notiOps.options);
          return;
        }

        let newStatus = '';
        if (
          selectedData?.childrenIdList &&
          selectedData?.schemaType === 'student'
        ) {
          selectedData?.childrenIdList.forEach((item) => {
            const selectedClass = classLoadedData?.find(
              (el) => el?.value === item
            );
            if (selectedClass?.status === 'published') {
              newStatus = 'published';
            }
          });
        }

        let mimeType = 'image/png';
        if (
          selectedData?.avatar &&
          selectedData?.avatar.toLowerCase().endsWith('png')
        ) {
          mimeType = 'image/png';
        } else {
          mimeType = 'image/jpeg';
        }

        let baseUrl;
        let fileDir;
        let fileName;
        if (selectedData.avatar) {
          if (selectedData?.schemaType !== 'student') {
            fileDir = 'users/';
            baseUrl = selectedData.avatar.split(fileDir)[0];
            fileName = selectedData.avatar.split(fileDir)[1];
          } else {
            const basePath = selectedData.avatar.split('/users/')[0];
            const paths = basePath.split('/');
            const stationId = paths[paths.length - 1];
            fileDir = stationId + '/users/';
            baseUrl = selectedData.avatar.split(fileDir)[0];
            fileName = selectedData.avatar.split(fileDir)[1];
          }
        }

        await updateGrouping({
          variables: {
            id: selectedData?.id,
            name: selectedData?.name,
            schemaType: selectedData?.schemaType,
            version: selectedData.version,
            trackingAuthorName: currentUser?.name,
            status: selectedData?.status ? selectedData?.status : newStatus,
            avatar: selectedData.avatar
              ? {
                  uId: getUUID(),
                  baseUrl,
                  fileDir,
                  fileName,
                  mimeType,
                  status: 'ready'
                }
              : null,
            parentId: selectedData?.parentId,
            contact: {
              firstName: selectedData?.firstName,
              lastName: selectedData?.lastName,
              email: selectedData?.name
              // phone: selectedData?.phone
            },
            updatedAt: selectedData?.updatedAt
          }
        });

        if (
          selectedData?.childrenIdList &&
          selectedData?.schemaType === 'student'
        ) {
          selectedData?.childrenIdList.forEach((item) => {
            const selectedClass = classLoadedData?.find(
              (el) => el?.value === item
            );
            if (
              selectedClass &&
              !selectedClass?.assigneeIdList?.find(
                (el) => el === selectedData?.id
              )
            ) {
              assignClassToStudent(selectedClass, selectedData?.id);
            }
          });
        }

        setCallUserSave(false);
        onChange('forceSave', false);
        const notiOps = getNotificationOpt('userlist', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }

      if (type === 'upload') {
        setOpenUpload(true);
        setUploadDialogTitle(
          tabStatus.teachers ? en['Upload Teachers'] : en['Upload Students']
        );
      }

      if (type === 'delete') setOpenDeleteDialog(true);

      if (type === 'info' && selectedRow?.id) {
        const displayData = structuredData?.find(
          (item) => item?._id === selectedRow?.id
        );
        if (displayData) {
          setSelectedInfo(displayData);
          setOpenInfo(true);
        }
      }
    } catch (error) {
      console.log(error);
      console.log(error.message);
      setCallUserSave(false);
      const notiOps = getNotificationOpt('pbs', 'error', 'update');
      notify(notiOps.message, notiOps.options);
    }
  };

  const deleteData = async (changeType, decision) => {
    if (changeType && decision && !checkbox) {
      const notiOps = getNotificationOpt('material', 'warning', 'delete');
      notify(notiOps.message, notiOps.options);
      return;
    }
    if (changeType && decision && checkbox) {
      await deleteDocument({
        variables: {
          schemaType: resources?.schemaType,
          id: selectedRow?.id
        }
      });

      handleRefresh(true);
      const notiOps = getNotificationOpt('userlist', 'success', 'delete');
      notify(notiOps.message, notiOps.options);
      setCheckbox(false);
    }
    setOpenDeleteDialog(false);
    setSelectedRow();
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const searchHandle = (value) => {
    setSearchValue(value);
  };

  const searchTitle = () =>
    UsersResource.find((item) => item['schemaType'] === resources['schemaType'])
      ?.name;

  return (
    <EditPanel
      title={title}
      currentMenu="user"
      hideAction={true}
      isTabReset={isTabReset}
      canEdit={true}
      canAdd={resources['schemaType'] === 'sysAdmin'}
      canClearFilters={resources['schemaType'] !== 'sysAdmin'}
      canDelete={selectedRow ? true : false}
      canShowInfo={selectedRow ? true : false}
      selectedData={resources}
      showLeftDropDown={false}
      filterValue={filterValue}
      canUpload={false}
      onFilter={handleFilter}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      UserSearch={
        <UserSearch
          isResetSearch={isResetSearch}
          setResetSearch={setResetSearch}
          type={searchTitle()}
          useStyles={useStylesSearch}
          onChange={(value) => searchHandle(value)}
        />
      }
      hasNoSliderMenu={true}
      // hasNoActions={resources['schemaType'] !== 'sysAdmin'}
    >
      <Grid
        spacing={globalStyles.GridSpacingStyles}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          {resources['schemaType'] === 'schoolAdmin' ? (
            <UserListForm
              type={resources['schemaType']}
              filterUser={false}
              canUpload={true}
              currentMenu="user"
              showUserDialog={showUserDialog}
              isUserMenu={true}
              setShowUserDialog={setShowUserDialog}
              hasTypeField={hasTypeField}
              userTypeData={userTypeData}
              updateValue={updateValue}
              onFilter={handleFilter}
              disable={false}
              filterValue={filterValue}
              dataToFilter={userTypeData}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              onChange={(value) => handleFormChange('studentEdit', value)}
              setStructuredData={setStructuredData}
              classLoadedData={classLoadedData}
              schoolLoadedData={schoolLoadedData}
              districtLoadedData={districtLoadedData}
              stationLoadedData={stationLoadedData}
              searchValue={searchValue}
            />
          ) : (
            <UserListForm
              type={resources['schemaType']}
              canUpload={true}
              currentMenu="user"
              disable={false}
              showUserDialog={showUserDialog}
              isUserMenu={true}
              setShowUserDialog={setShowUserDialog}
              hasTypeField={hasTypeField}
              userTypeData={userTypeData}
              updateValue={updateValue}
              onFilter={handleFilter}
              filterValue={filterValue}
              dataToFilter={userTypeData}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              setStructuredData={setStructuredData}
              onChange={(value) => handleFormChange('studentEdit', value)}
              classLoadedData={classLoadedData}
              schoolLoadedData={schoolLoadedData}
              stationLoadedData={stationLoadedData}
              districtLoadedData={districtLoadedData}
              onRefresh={handleRefresh}
              searchValue={searchValue}
            />
          )}
        </Grid>
      </Grid>
      <CustomDialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="lg"
        open={openUpload}
        title={uploadDialogTitle}
        mainBtnName={en['Upload']}
        onChange={handleUploadDialogChange}
      >
        <UserUploadForm
          onChange={(value) => handleFormChange('userUpload', value)}
          schemaType={selectedDocId === 6 ? 'student' : 'educator'}
        />
      </CustomDialog>
      <CustomDialog
        open={openDeleteDialog}
        title={
          en['Do you want to delete this'] + ` ${resources['schemaType']}?`
        }
        mainBtnName={en['Delete']}
        onChange={deleteData}
      >
        {en['Are you sure want to delete this data?']}
        <br />
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
      <CustomDialog
        open={openInfo}
        title={en['Information']}
        maxWidth="sm"
        fullWidth={true}
        customClass={classes.infoDialogContent}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor disable={false} resources={selectedInfo} />
        </Grid>
      </CustomDialog>
    </EditPanel>
  );
};

export default UserEdit;
