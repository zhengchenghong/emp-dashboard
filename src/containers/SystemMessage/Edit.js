/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import clsx from 'clsx';
import {
  AvatarUploadForm,
  DescriptionForm,
  AltText,
  ScheduleForm,
  StylesForm
} from '@app/components/Forms';
import JSONEditor from '@app/components/JSONEditor';
import { DefaultCard } from '@app/components/Cards';
import { EditPanel } from '@app/components/Panels';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import { getAssetUrl, getUUID } from '@app/utils/functions';
import { useNotifyContext } from '@app/providers/NotifyContext';
import * as globalStyles from '@app/constants/globalStyles';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { useMutation } from '@apollo/client';
import graphql from '@app/graphql';
import { en } from '@app/language';
import { useUserContext } from '@app/providers/UserContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useSmallScreen } from '@app/utils/hooks';
import useMediumScreen from '@app/utils/hooks/useMediumScreen';

const MessageEdit = ({
  forceSaveDocId,
  forceSave,
  variables,
  resources,
  updateGrouping,
  deleteDocument,
  onChange,
  onForceChange,
  setWhenState,
  whenState,
  selectedDocId,
  editPanelData,
  loadedData,
  createGrouping,
  handleMainChange,
  setCreateNew
}) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState('');
  const [canUpdate, setCanUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [isTabReset, setIsTabReset] = useState(false);
  const [avatarS3URL, setAvatarS3URL] = useState();
  const [avatarType, setAvatarType] = useState();
  const [altText, setAltText] = useState();
  const [resourceId, setResourceId] = useState();
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const [tabStatus, setTabStatus] = useState({
    desc: true,
    styles: false,
    right: false
  });
  const [descData, setDescData] = useState({});
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [scheduleData, setScheduleData] = useState({});
  const [panelSize, setPanelSize] = useState({
    width: 0,
    height: 0
  });
  const [openInfo, setOpenInfo] = useState(false);
  const [avatarSize, setAvatarSize] = useState();
  const [stylesData, setStylesData] = useState();
  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );
  const { nextSelected } = useSelectionContext();
  const [isFileRemove, setFileRemove] = useState(false);
  const [currentUser] = useUserContext();
  const [canGallery, setCanGallery] = useState(true);
  const { setOpenRight } = useGalleryContext();

  const [currentMessage, setCurrentMessage] = useState();

  const convertUTCDateToLocalDate = (date) => {
    if (date == null) return null;
    var newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return newDate?.toISOString().slice(0, 16);
  };

  const convertLocalDateToUTCDate = (date) => {
    if (date == null) return null;
    var newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return newDate?.toISOString();
  };

  const getCurrentTime = () => {
    var today = new Date();
    return convertUTCDateToLocalDate(today)?.toISOString();
  };

  const getEndAt = () => {
    var today = new Date();
    var startAt = today.getTime() + 5 * 60000;
    var ttt = convertUTCDateToLocalDate(startAt)?.toISOString();
    return ttt;
  };

  useEffect(() => {
    if (resources) {
      if (currentMessage?.updatedAt === resources?.updatedAt) {
        return;
      }
      setCurrentMessage(resources);
      setResourceId(resources?._id);
      setCanUpdate(false);
      setCheckbox(false);
      setTitle(resources?.name);
      if (nextSelected != null && resources?._id !== nextSelected?._id) {
        setIsTabReset(true);
      }

      if (tabStatus == null) {
        setTabStatus({
          desc: true,
          styles: false,
          right: false
        });
      }

      if (resources.avatar) {
        const url =
          resources.avatar?.baseUrl +
          resources.avatar?.fileDir +
          resources.avatar?.fileName;
        setAvatarS3URL(url || '');
        setAltText(resources.avatar?.altText || '');
        setAvatarType(resources?.avatar?.type || '');
      } else {
        setAvatarS3URL('');
        setAltText('');
        setAvatarType('');
      }

      setDescData(
        resources?.desc || {
          title: '',
          short: '',
          long: ''
        }
      );

      setStylesData(
        resources?.data?.styles || {
          bg: '',
          fg: ''
        }
      );

      // if (
      //   resources?.schedule &&
      //   resources?.schedule?.startAt &&
      //   resources?.schedule?.endAt
      // ) {
      let startInUTC = resources?.schedule?.startAt
        ? new Date(resources?.schedule?.startAt)
        : null;
      var startInLacal = convertUTCDateToLocalDate(startInUTC);
      let endInUTC = resources?.schedule?.endAt
        ? new Date(resources?.schedule?.endAt)
        : null;
      var endInLacal = convertUTCDateToLocalDate(endInUTC);

      setScheduleData({
        startAt: startInLacal,
        endAt: endInLacal,
        status: resources?.schedule?.status
      });
      // } else {
      //   setScheduleData({
      //     startAt: resources?.schedule?.startAt,
      //     endAt: resources?.schedule?.endAt
      //   });
      // }
    }
  }, [resources]);

  useEffect(() => {
    setOpenRight(false);
  }, [resourceId]);

  useEffect(() => {
    if (forceSave) {
      handleEditPanelChange('save');
    }
  }, [forceSave]);

  const handleFormChange = (type, value) => {
    if (type === 'description') {
      setDescData(value);
    }
    if (type === 'schedule') {
      setScheduleData(value);
    }
    if (type === 'altText') {
      setAltText(value);
      onForceChange && onForceChange('altText', value);
    }

    if (type === 'styles') {
      setStylesData(value);
    }

    if (type === 'avatarType') {
      setAvatarType(value);
    }

    if (type === 'avatarUpload') {
      if (value === 'remove') {
        setAvatarAttached(false);
        setAvatarS3URL('');
        setWhenState(true);
        onForceChange && onForceChange('avatar', '');
      } else {
        setAvatarAttached(true);
        setAvatarS3URL(value);
        setWhenState(true);
        onForceChange && onForceChange('avatar', value);
      }
      return;
    }
    setWhenState(true);
    setCanUpdate(true);
    onChange('update', true);
  };

  const handleShowPanel = async (value) => {
    setIsTabReset(false);
    if (value === 0) {
      setCanGallery(true);
      setTabStatus({
        desc: true,
        styles: false,
        right: false
      });
    }

    if (value === 1) {
      setOpenRight(false);
      setCanGallery(false);
      setTabStatus({
        desc: false,
        styles: true,
        right: false
      });
    }

    if (value === 2) {
      setOpenRight(false);
      setCanGallery(false);
      setTabStatus({
        desc: false,
        styles: false,
        right: true
      });
    }
  };

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'create') {
        setCreateNew(true);
      }
      if (type === 'delete') setOpenDelete(true);
      if (type === 'edit') {
        onChange('update', true);
        await updateGrouping({
          variables: {
            id: resources['_id'],
            schemaType: resources.schemaType,
            version: resources.version,
            trackingAuthorName: currentUser?.name
          }
        });
      }

      if (type === 'save') {
        if (!whenState && !forceSave) {
          return;
        }

        let scheduleStatus = null;

        let startInUTC =
          scheduleData.startAt == null
            ? null
            : new Date(scheduleData.startAt).toISOString();
        let endInUTC =
          scheduleData.endAt == null
            ? null
            : new Date(scheduleData.endAt).toISOString();

        let startTime = scheduleData.startAt
          ? new Date(scheduleData.startAt)
          : null;
        let endTime = scheduleData.endAt ? new Date(scheduleData.endAt) : null;

        if (startTime) {
          if (startTime > new Date()) {
            scheduleStatus = 'inactive';
          } else {
            if (endTime && endTime < new Date()) {
              scheduleStatus = 'expired';
            } else {
              scheduleStatus = 'active';
            }
          }
        } else {
          if (endTime && endTime < new Date()) {
            scheduleStatus = 'expired';
          } else {
            if (endTime == null) {
              scheduleStatus = null;
            } else {
              scheduleStatus = 'active';
            }
          }
        }

        const schedule = {
          startAt: startInUTC,
          endAt: endInUTC,
          status: scheduleStatus
        };

        if (
          schedule.startAt !== resources.schedule?.startAt ||
          schedule.endAt !== resources.schedule?.endAt
        ) {
          if (schedule.startAt && schedule.endAt) {
            let startAt = new Date(schedule.startAt).getTime();
            let endAt = new Date(schedule.endAt).getTime();
            if (endAt < startAt + 5 * 60000) {
              notify('EndAt must not be before StartAt', {
                autoHideDuration: 5000,
                variant: 'error'
              });
              return;
            }
          }
        }

        let variableData = {
          id: resources['_id'],
          schemaType: resources.schemaType,
          version: resources.version,
          updatedAt: resources.updatedAt
        };

        let isChanged = false;
        const desc = {
          title: descData ? descData.title : '',
          short: descData ? descData.short : '',
          long: descData ? descData.long : ''
        };
        if (
          desc.title !== resources.desc?.title ||
          desc.short !== resources.desc?.short ||
          desc.long !== resources.desc?.long
        ) {
          variableData = {
            ...variableData,
            desc
          };
          isChanged = true;
        }

        let avatar = avatarS3URL
          ? {
              uId: resources.avatar?.uId ? resources.avatar?.uId : getUUID(),
              type: avatarType || 'avatar',
              baseUrl: resources.avatar?.baseUrl,
              fileDir: resources.avatar?.fileDir,
              status: 'ready',
              altText: altText,
              mimeType: resources.avatar?.mimeType,
              fileName: resources.avatar?.fileName,
              data: {
                imageSize: avatarSize
              }
            }
          : null;

        if (
          avatarS3URL &&
          // avatarS3URL.includes('galleries') &&
          avatarS3URL !== avatar.baseUrl + avatar.fileDir + avatar.fileName
        ) {
          let mimeType = 'image/jpeg';
          if (avatarS3URL.toLowerCase().endsWith('png')) {
            mimeType = 'image/png';
          }
          avatar.baseUrl = avatarS3URL.split('messages')[0] + 'messages' + '/';
          avatar.fileName = avatarS3URL.split('/').pop();
          avatar.fileDir = avatarS3URL
            .replace(avatar.baseUrl, '')
            .replace(avatar.fileName, '');
          avatar.mimeType = mimeType;
          avatar.data = {
            imageSize: avatarSize
          };
          isChanged = true;
        }

        if (resources.avatar?.fileName) {
          if (avatar?.fileName !== resources.avatar?.fileName) {
            variableData = avatarS3URL
              ? {
                  ...variableData,
                  avatar: {
                    ...avatar
                  }
                }
              : {
                  ...variableData,
                  avatar: null
                };
            isChanged = true;
          }
        } else {
          if (avatar) {
            variableData = avatarS3URL
              ? {
                  ...variableData,
                  avatar: {
                    ...avatar
                  }
                }
              : {
                  ...variableData,
                  avatar: null
                };
            isChanged = true;
          }
        }

        if (isAvatarAttached) {
          isChanged = true;
        }

        if (altText !== '' && altText !== resources.avatar?.altText) {
          variableData = {
            ...variableData,
            avatar: {
              ...avatar,
              altText
            }
          };
          isChanged = true;
        }

        if (
          schedule.startAt !== resources.schedule?.startAt ||
          schedule.endAt !== resources.schedule?.endAt
        ) {
          variableData = {
            ...variableData,
            schedule
          };
          isChanged = true;
        }

        if (
          stylesData?.bg !== resources.data?.styles?.bg ||
          stylesData?.fg !== resources.data?.styles?.fg
        ) {
          variableData = {
            ...variableData,
            data: {
              ...resources?.data,
              styles: stylesData?.bg && stylesData?.fg ? stylesData : null
            }
          };
          isChanged = true;
        }

        variableData = {
          ...variableData,
          trackingAuthorName: currentUser?.name
        };

        if (isChanged) {
          await updateGrouping({
            variables: variableData
          });

          if (
            resources.avatar?.fileName &&
            resources.avatar?.fileName !== avatar?.fileName
          ) {
            const avatarURL =
              resources.avatar?.baseUrl +
              resources.avatar?.fileDir +
              resources.avatar?.fileName;
            const assetUrl = getAssetUrl(avatarURL).split('/')[3];
            const key = avatarURL.split(assetUrl)[1].slice(1);
            await deleteAssetS3Grouping({
              variables: {
                bucket: assetUrl,
                key: key
              }
            });
          }

          setCanUpdate(false);
          onChange('update', false);
          if (isAvatarAttached) {
            setAvatarUpload(true);
            setAvatarAttached(false);
          } else {
            const notiOps = getNotificationOpt('message', 'success', 'update');
            notify(notiOps.message, notiOps.options);
          }
          if (forceSave) {
            onChange('forceSave', false);
          }
        } else {
          setCanUpdate(false);
          onChange('update', false);
          if (forceSave) onChange('forceSave', false);
        }
      }

      if (type === 'info') {
        setOpenInfo(true);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('message', 'error', 'update');
      enqueueSnackbar(notiOps.message, notiOps.options);
      if (error.message === en['data_changed']) {
        notify(error.message, notiOps.options);
      } else {
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const handleDeleteDialogChange = async (type, value) => {
    try {
      if (type === 'btnClick') {
        if (!checkbox && value) {
          const notiOps = getNotificationOpt('message', 'warning', 'delete');
          enqueueSnackbar(notiOps.message, notiOps.options);
          return;
        }

        if (checkbox && value) {
          await deleteDocument({
            variables: {
              id: resources['_id'],
              schemaType: 'sysMessage'
            }
          });
          if (resources.avatar?.fileName) {
            const avatarURL =
              resources.avatar?.baseUrl +
              resources.avatar?.fileDir +
              resources.avatar?.fileName;
            const assetUrl = getAssetUrl(avatarURL).split('/')[3];
            const key = avatarURL.split(assetUrl)[1].slice(1);
            await deleteAssetS3Grouping({
              variables: {
                bucket: assetUrl,
                key: key
              }
            });
          }
          const notiOps = getNotificationOpt('message', 'success', 'delete');
          enqueueSnackbar(notiOps.message, notiOps.options);
          onChange('delete');
        }
        setCheckbox(false);
        setOpenDelete(false);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('message', 'error', 'delete');
      enqueueSnackbar(notiOps.message, notiOps.options);
    }
  };

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      console.log('avatar attached');
      setWhenState(true);
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarS3URL();
      console.log('avatar dettached');
      setWhenState(true);
      setFileRemove(true);
    } else {
      handleFormChange('avatarUpload', value);
    }
  };

  useEffect(() => {
    if (isAvatarAttached === false && !avatarS3URL && isFileRemove === true) {
      handleEditPanelChange('save');
      setFileRemove(false);
    }
  }, [isAvatarAttached, avatarS3URL, isFileRemove]);

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  return (
    <EditPanel
      title={title}
      page={'Messages'}
      panelSize={panelSize}
      canEdit={true}
      canUpdate={true}
      canSave={tabStatus?.analyse ? false : true}
      canDelete={!tabStatus?.analyse}
      isTabReset={isTabReset}
      tabSetting={{ desc: true, styles: true, right: false }}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      canShowInfo
      canGallery={canGallery}
      galleryType={'image'}
      hideTitleOnMobile={true}
      canCreate
    >
      <Grid
        spacing={3}
        container
        direction="row"
        style={
          !isSmallScreen && !isMediumScreen
            ? { width: '600px', minWidth: '600px' }
            : { width: 'calc(100% + 4px)' }
        }
      >
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          {tabStatus.desc && (
            <Grid container direction="column" spacing={4}>
              <Grid item xs={12} style={{ paddingBottom: 0 }}>
                <DefaultCard inline={false} disableGray={false}>
                  <Grid container spacing={4}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={6}
                      xl={6}
                      style={
                        isSmallScreen || isMediumScreen
                          ? {}
                          : { paddingRight: 6 }
                      }
                    >
                      <Grid container spacing={4}>
                        <Grid item xs={12}>
                          <AvatarUploadForm
                            disable={false}
                            resources={avatarS3URL}
                            docId={resources?._id}
                            stationId={'messages'}
                            acceptedFiles={[
                              'image/png',
                              'image/jpg',
                              'image/jpeg'
                            ]}
                            onChange={(value) => handleOnAvatarChange(value)}
                            changeAlt={(value) =>
                              handleFormChange('altText', value)
                            }
                            changeAvatarType={(value) =>
                              handleFormChange('avatarType', value)
                            }
                            extraStyle={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              objectFit: 'contain'
                            }}
                            hideArrow={true}
                            extraClass={classes.dropzone}
                            type={resources?.schemaType}
                            title="Drag and Drop a Logo Here"
                            isUpload={isAvatarUpload}
                            doc={resources}
                            altText={altText}
                            setUpload={setAvatarUpload}
                            setAvatarSize={setAvatarSize}
                          />
                        </Grid>
                        <Grid item xs={12} style={{ paddingTop: 0 }}>
                          <AltText
                            disable={false}
                            resources={altText}
                            onChange={(value) =>
                              handleFormChange('altText', value)
                            }
                            isAvatarAttached={isAvatarAttached}
                            onSaveContents={(value) => {
                              setAltText(value);
                              onForceChange && onForceChange('altText', value);
                              setWhenState(true);
                              handleEditPanelChange('save');
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={6}
                      xl={6}
                      style={
                        isSmallScreen || isMediumScreen
                          ? { paddingTop: 0 }
                          : { paddingLeft: 6 }
                      }
                    >
                      <DescriptionForm
                        disable={false}
                        onChange={(value) =>
                          handleFormChange('description', value)
                        }
                        type="station"
                        resources={descData}
                        resourceType={resources?.schemaType}
                        onSaveContents={(value) => {
                          setDescData(value);
                          setWhenState(true);
                          handleEditPanelChange('save');
                        }}
                      />
                    </Grid>
                  </Grid>
                </DefaultCard>
              </Grid>
              <Grid item xs={12} style={{ paddingTop: 0 }}>
                <DefaultCard>
                  <ScheduleForm
                    resources={scheduleData}
                    messageStatus={(
                      resources?.schedule?.status ?? 'Null'
                    ).capitalizeFirstLetter()}
                    onChange={(value) => handleFormChange('schedule', value)}
                  />
                </DefaultCard>
              </Grid>
            </Grid>
          )}
          {tabStatus.styles && (
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
              style={{
                width: isSmallScreen || isMediumScreen ? '100%' : '680px',
                minWidth: isSmallScreen || isMediumScreen ? 300 : '680px'
                // maxWidth: 680
              }}
            >
              <StylesForm
                resources={resources}
                stylesData={stylesData}
                onChange={(value) => handleFormChange('styles', value)}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <CustomDialog
        open={openDelete}
        title={`${en['Do you want to delete this']} message`}
        mainBtnName={en['Remove']}
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">
          This action will take the removing all info related to current message
        </Typography>
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
          <JSONEditor disable={false} resources={resources} />
        </Grid>
      </CustomDialog>
    </EditPanel>
  );
};

export default MessageEdit;
