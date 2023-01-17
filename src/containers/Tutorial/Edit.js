import React, { useState, useEffect, useContext, useRef } from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { EditPanel } from '@app/components/Panels';
import { useMutation, useApolloClient } from '@apollo/client';
import { useUserContext } from '@app/providers/UserContext';
import { CustomInput, CustomDialog } from '@app/components/Custom';
import { AltText } from '@app/components/Forms';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import graphql from '@app/graphql';
import { DefaultCard } from '@app/components/Cards';
import TextEditor from '@app/components/TextEditor';
import * as globalStyles from '@app/constants/globalStyles';
import {
  DescriptionForm,
  MultimediaAttachmentForm,
  AvatarUploadForm
} from '@app/components/Forms';
import { getUUID, getAssetUrl } from '@app/utils/functions';
import { useAssetContext } from '@app/providers/AssetContext';
import { update, upsertMMA } from '@app/utils/ApolloCacheManager';
import AttachmentPreview from '@app/components/Forms/Attachment/Preview';
import JSONEditor from '@app/components/JSONEditor';
import { en } from '@app/language';
import UserSearch from '@app/components/Forms/UserList/Search';
import useStylesSearch from '../User/searchStyle';
import { useGalleryContext } from '@app/providers/GalleryContext';
import TutorialTable from '@app/components/Tables/Tutorial';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import { useHistory } from 'react-router-dom';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { useMediumScreen } from '@app/utils/hooks';

const TutorialEdit = () => {
  const classes = globalStyles.globaluseStyles();
  const [currentUser] = useUserContext();
  const [openCreate, setOpenCreate] = useState(false);
  const [newElName, setNewElName] = useState('');
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [buttonDisable, setButtonDisable] = useState(false);

  const [loadedData, setLoadedData] = useState([]);
  const [searchStr, setSearchStr] = useState('');
  const { notify } = useNotifyContext();
  const [currentRowId, setCurrentRowId] = useState();

  const [tutorialId, setTutorialId] = useState();
  const [descData, setDescData] = useState({});
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [avatarS3URL, setAvatarS3URL] = useState();
  const [avatarType, setAvatarType] = useState();
  const [cardName, setCardName] = useState();
  const [originDetailData, setOriginDetailData] = useState(undefined);
  const [detailData, setDetailData] = useState(undefined);
  const [altText, setAltText] = useState();
  const [showMoreData, setShowMoreData] = useState(null);
  const [showMoreMode, setShowMoreMode] = useState(false);

  const [tutorial, setTutorial] = useState();

  const [currentAction, setCurrentAction] = useState('');
  const [canUpdate, setCanUpdate] = useState(false);
  const [multimediaAssetsData, setMultimediaAssetsData] = useState();

  const nameRef = useRef();
  const { attachmentsUploaded, setAttachmentUploaded } = useAssetContext();
  const [avatarSize, setAvatarSize] = useState();
  const [openInfo, setOpenInfo] = useState(false);
  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();
  const [tablePage, setTablePage] = useState(1);

  const history = useHistory();
  const [whenState, setWhenState] = useState(false);
  const [isForceSave, setIsForceSave] = useState(false);
  const client = useApolloClient();
  const isSmallScreen = useSmallScreen();

  const isMediumScreen = useMediumScreen();

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );

  const [upsertMMAGrouping] = useMutation(graphql.mutations.upsertMMA, {
    update: upsertMMA
  });

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    // update: create
  });

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });

  useEffect(() => {
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
    setSearchStr('');
  }, []);

  useEffect(() => {
    if (tutorial?._id === tutorialId) {
      setMMAFilesFromTutorial(tutorial);
      if (avatarS3URL == null) {
        if (
          tutorial?.avatar?.fileName &&
          tutorial?.avatar?.fileDir &&
          tutorial?.avatar?.baseUrl
        ) {
          setAvatarS3URL(
            tutorial?.avatar?.baseUrl +
              tutorial?.avatar?.fileDir +
              tutorial?.avatar?.fileName
          );
        } else {
          setAvatarS3URL();
        }
      }
      return;
    }
    setTutorialId(tutorial?._id);
    if (
      tutorial?.avatar?.fileName &&
      tutorial?.avatar?.fileDir &&
      tutorial?.avatar?.baseUrl
    ) {
      setAvatarS3URL(
        tutorial?.avatar?.baseUrl +
          tutorial?.avatar?.fileDir +
          tutorial?.avatar?.fileName
      );
    } else {
      setAvatarS3URL();
    }
    setAltText(tutorial?.avatar?.altText);
    setCardName(tutorial?.name);
    setDescData({
      title: tutorial?.desc?.title?.replace(/<[^>]+>/g, '') || '',
      short: tutorial?.desc?.short?.replace(/<[^>]+>/g, '') || '',
      long: tutorial?.desc?.long?.replace(/<[^>]+>/g, '') || ''
    });
    setDetailData(tutorial?.body || '');
    setOriginDetailData(tutorial?.body || '');

    setMMAFilesFromTutorial(tutorial);
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
  }, [tutorial]);

  useEffect(() => {
    const onLoad = async () => {
      try {
        if (attachmentsUploaded) {
          if (tutorial) {
            let { data: refreshData } = await client.query({
              query: graphql.queries.TutorialGrouping,
              variables: {
                id: tutorial._id,
                schemaType: tutorial.schemaType
              }
            });
            if (refreshData?.grouping.length > 0) {
              setTutorial(refreshData?.grouping[0]);
            }
          }
          setAttachmentUploaded(false);
        }
      } catch (err) {
        console.log(err);
      }
    };
    onLoad();
  }, [attachmentsUploaded]);

  const setMMAFilesFromTutorial = (ttr) => {
    if (ttr?.multimediaAssets) {
      let mmaData = ttr.multimediaAssets.map((item) => {
        let value = JSON.parse(JSON.stringify(item));
        delete value.__typename;
        return value;
      });
      setMultimediaAssetsData(mmaData);
    }
  };

  const handleSearchChange = async (type, value) => {
    if (type === 'search') {
      setSearchStr(value);
    }
  };

  const handleEditPanelChange = async (type, additionalAction) => {
    if (type === 'backToTutorials') {
      setShowMoreData(null);
    }
    if (type === 'add') {
      setCreateDialogSetting({
        error: false,
        helpText: en['Please input the name. It is required'],
        autoFocus: true
      });
      setOpenCreate(true);
      setShowMoreData(null);
    }

    if (type === 'cancel') {
      history.push({ pathname: `/tutorials` });
      if (!whenState) {
        setCurrentAction('');
        setCanUpdate(false);
        setTutorial();
        setDescData();
      }
    }

    if (type === 'save') {
      if (!whenState && !isForceSave) {
        return;
      }

      if (tutorial == null && (cardName == null || cardName === '')) {
        const notiOps = getNotificationOpt('tutorial', 'warning', 'emptyName');
        notify(notiOps.message, notiOps.options);
        return;
      }

      if (tutorial) {
        let variableData = {
          id: tutorial['_id'],
          schemaType: tutorial.schemaType,
          version: tutorial.version,
          updatedAt: tutorial.updatedAt
        };

        let isChanged = false;

        if (cardName !== tutorial?.name) {
          variableData = {
            ...variableData,
            name: cardName
          };
          isChanged = true;
        }

        const desc = {
          title: descData ? descData.title : '',
          short: descData ? descData.short : '',
          long: descData ? descData.long : ''
        };

        if (
          desc.title !== tutorial.desc?.title ||
          desc.short !== tutorial.desc?.short ||
          desc.long !== tutorial.desc?.long
        ) {
          variableData = {
            ...variableData,
            desc
          };
          isChanged = true;
        }

        if (detailData !== tutorial.detailData) {
          variableData = {
            ...variableData,
            body: detailData
          };
          isChanged = true;
        }

        let avatar = avatarS3URL
          ? {
              uId: tutorial.avatar?.uId ? tutorial.avatar?.uId : getUUID(),
              type: avatarType || 'avatar',
              baseUrl: tutorial.avatar?.baseUrl,
              fileDir: tutorial.avatar?.fileDir,
              status: 'ready',
              altText: altText,
              mimeType: tutorial.avatar?.mimeType,
              fileName: tutorial.avatar?.fileName,
              data: {
                imageSize: avatarSize
              }
            }
          : null;

        if (
          avatarS3URL &&
          avatarS3URL !== avatar.baseUrl + avatar.fileDir + avatar.fileName
        ) {
          let mimeType = 'image/jpeg';
          if (avatarS3URL.toLowerCase().endsWith('png')) {
            mimeType = 'image/png';
          }
          avatar.baseUrl =
            avatarS3URL.split('tutorials')[0] + 'tutorials' + '/';
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

        if (tutorial.avatar?.fileName) {
          if (tutorial?.fileName !== tutorial.avatar?.fileName) {
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

        if (altText !== '' && altText !== tutorial.avatar?.altText) {
          variableData = {
            ...variableData,
            avatar: {
              ...avatar,
              altText
            }
          };
          isChanged = true;
        }

        if (isChanged) {
          try {
            let result = await updateGrouping({
              variables: variableData
            });

            setTutorial(result.data.updateGrouping);

            if (
              tutorial.avatar?.fileName &&
              tutorial.avatar?.fileName !== avatar?.fileName
            ) {
              const avatarURL =
                tutorial.avatar?.baseUrl +
                tutorial.avatar?.fileDir +
                tutorial.avatar?.fileName;
              const assetUrl = getAssetUrl(avatarURL).split('/')[3];
              const key = avatarURL.split(assetUrl)[1].slice(1);
              await deleteAssetS3Grouping({
                variables: {
                  bucket: assetUrl,
                  key: key
                }
              });
            }
            if (isAvatarAttached) {
              setAvatarUpload(true);
              setAvatarAttached(false);
            } else {
              const notiOps = getNotificationOpt(
                'tutorial',
                'success',
                'publish'
              );
              notify(notiOps.message, notiOps.options);
            }

            // if (additionalAction !== 'fileRemoved') {
            // setCanUpdate(false);
            //   setCurrentAction('');
            //   setTutorial();
            // }
          } catch (err) {
            console.log(err);
            if (err.message === 'Name exists already') {
              const notiOps = getNotificationOpt('tutorial', 'error', 'update');
              notify(notiOps.message, notiOps.options);
            } else {
              notify(err.message, {
                variant: 'error',
                autoHideDuration: 10000
              });
            }
            return;
          }
        } else {
          // setCanUpdate(false);
        }
        // setTutorial();
        // setCurrentAction('');
        setWhenState(false);
      } else {
        let createVariableData = {
          name: cardName,
          version: 1,
          trackingAuthorName: currentUser?.name,
          schemaType: 'tutorial',
          multimediaAssets: null,
          desc: {
            title: descData?.title,
            short: descData?.short,
            long: descData?.long
          },
          body: detailData,
          type: 'EDU'
        };

        try {
          setTablePage(1);
          let response = await createGrouping({
            variables: createVariableData
          });
          setTutorial(response.data.createGrouping);

          if (isAvatarAttached) {
            setAvatarUpload(true);
            setAvatarAttached(false);
            return;
          } else {
            const notiOps = getNotificationOpt(
              'tutorial',
              'success',
              'publish'
            );
            notify(notiOps.message, notiOps.options);
            setCurrentAction('');
            // setHomeReload((el) => !el);
            setCanUpdate(false);
            setTutorial();
          }
        } catch (error) {
          notify(error.message, {
            autoHideDuration: 5000,
            variant: 'error'
          });
        }
      }
      setIsForceSave(false);
    }

    if (type === 'info') {
      setOpenInfo(true);
    }
  };

  useEffect(() => {
    if (currentRowId) {
      handleUpdateChange('edit', currentRowId);
    }
    setIsForceSave(false);
  }, []);

  useEffect(() => {
    if (showMoreData == null && tutorial == null) {
      setShowMoreMode(false);
    } else {
      setShowMoreMode(true);
    }
  }, [showMoreData, tutorial]);

  useEffect(() => {
    if (isForceSave) {
      handleEditPanelChange('save');
    }
  }, [isForceSave]);

  const handleUpdateChange = async (type, value) => {
    if (type === 'edit') {
      setCurrentRowId(value);
      let currentTutorial = loadedData.filter((el) => el._id === value);
      if (currentTutorial.length > 0) {
        setTutorial(currentTutorial[0]);
      }
      setCurrentAction('add');
      setShowMoreData(null);
      setCanUpdate(true);
      if (
        tutorial?.avatar &&
        tutorial.avatar?.baseUrl &&
        tutorial.avatar?.fileName
      ) {
        setAvatarS3URL(
          tutorial.avatar?.baseUrl +
            tutorial.avatar?.fileDir +
            tutorial.avatar?.fileName
        );
      } else {
        setAvatarS3URL();
      }
    }

    if (type === 'delete') {
      setCurrentRowId(value);
    }
  };

  const handleMultiAttFormChange = async (type, value) => {
    try {
      if (type === 'upload') {
        let upserVariable = {
          docId: tutorial['_id'],
          schemaType: tutorial.schemaType,
          mma: value
        };
        let result = await upsertMMAGrouping({
          variables: upserVariable
        });
        const notiOps = getNotificationOpt('attachment', 'success', 'drop');
        notify(notiOps.message, notiOps.options);
        return;
      }
      let assetUrlVariables = {
        id: tutorial['_id'],
        schemaType: tutorial.schemaType,
        version: tutorial.version,
        multimediaAssets: []
      };
      if (type === 'upload' || type === 'reOrder') {
        assetUrlVariables = {
          ...assetUrlVariables,
          multimediaAssets: value
        };
      }

      if (type === 'delete') {
        if (multimediaAssetsData) {
          var newData = multimediaAssetsData.slice();
          let filteredData = newData?.filter(
            (el) =>
              !(el.fileName === value.fileName && el.fileDir === value.fileDir)
          );
          assetUrlVariables = {
            ...assetUrlVariables,
            multimediaAssets: filteredData
          };
          setMultimediaAssetsData(filteredData);
        } else {
          let newData = tutorial.multimediaAssets.slice();
          let filteredData = newData?.filter(
            (el) =>
              !(el.fileName === value.fileName && el.fileDir === value.fileDir)
          );

          let mmaData = [];
          if (filteredData) {
            mmaData = filteredData.map((item) => {
              let value = { ...item };
              delete value.__typename;
              return value;
            });
          }
          assetUrlVariables = {
            ...assetUrlVariables,
            multimediaAssets: mmaData
          };
          setMultimediaAssetsData(mmaData);
        }

        const avatarURL = value.baseUrl + value.fileDir + value.fileName;
        const assetUrl = getAssetUrl(avatarURL).split('/')[3];
        const key = avatarURL.split(assetUrl)[1].slice(1);
        await deleteAssetS3Grouping({
          variables: {
            bucket: assetUrl,
            key: key
          }
        });
      }

      if (type === 'update') {
        const tmp = multimediaAssetsData?.slice();
        const idx = tmp?.findIndex(
          (el) => el.fileName === value.fileName && el.fileDir === value.fileDir
        );
        tmp[idx] = { ...tmp[idx], ...value };
        assetUrlVariables = {
          ...assetUrlVariables,
          multimediaAssets: tmp
        };
        setMultimediaAssetsData(tmp);
      }

      assetUrlVariables = {
        ...assetUrlVariables,
        trackingAuthorName: currentUser?.name
      };

      let result = await updateGrouping({
        variables: {
          ...assetUrlVariables
        }
      });
      setTutorial(result.data.updateGrouping);
      if (type === 'update') {
        const notiOps = getNotificationOpt('attachment', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      setWhenState(true);
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarS3URL();
      setWhenState(true);
      handleFormChange('avatarUpload', 'remove');
      console.log('avatar dettached');
    } else {
      handleFormChange('avatarUpload', value);
    }
  };

  const handleFormChange = (type, value) => {
    if (type === 'description') {
      setDescData(value);
    }

    if (type === 'avatarType') {
      setAvatarType(value);
    }

    if (type === 'name') {
      setCardName(value);
    }

    if (type === 'avatarUpload') {
      if (value === 'remove') {
        setAvatarAttached(false);
        setAvatarS3URL('');
        setWhenState(true);
      } else {
        setAvatarAttached(true);
        setAvatarS3URL(value);
        setWhenState(true);
      }
      return;
    }

    if (type === 'textEditor') {
      if (detailData === value) {
        return;
      }

      // prevent update by empty paragraph whose
      //plain text is actually an empty string
      if (
        (detailData || '')
          .replace(/<p>/gi, '')
          .replace(/<\/p>/gi, '')
          .replace(/\n/gi, '') === '' &&
        (value || '')
          .replace(/<p>/gi, '')
          .replace(/<\/p>/gi, '')
          .replace(/\n/gi, '') === ''
      ) {
        return;
      }
      setDetailData(value);
    }

    if (type === 'altText') {
      setAltText(value);
    }
    setWhenState(true);
  };

  useEffect(() => {
    if (isAvatarUpload) {
      handleEditPanelChange('save');
      setAvatarUpload(false);
    }
  }, [avatarS3URL]);

  const handleClickMore = (data) => {
    history.push({ pathname: `/tutorials/more` });
    setShowMoreData(data);
  };

  const handleEditMode = (value) => {
    history.push({ pathname: `/tutorials/${value?._id}` });
    setTutorial(value);
    setCurrentAction('add');
    setShowMoreData(null);
    setCanUpdate(true);
    if (value?.avatar && value.avatar?.baseUrl && value.avatar?.fileName) {
      setAvatarS3URL(
        value.avatar?.baseUrl + value.avatar?.fileDir + value.avatar?.fileName
      );
    } else {
      setAvatarS3URL();
    }
  };

  const handleKeyDown = (e, change) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      handleEditPanelChange('save');
      nameRef.current?.blur();
      e.preventDefault();
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
          if (!buttonDisable) {
            setButtonDisable(true);
            let result;
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

              let variables = {
                schemaType: 'tutorial',
                name: newElName,
                version: 1,
                trackingAuthorName: currentUser?.name,
                type: 'EDU'
              };

              result = await createGrouping({ variables });
              setOpenCreate(false);

              setTablePage(1);
              const notiOps = getNotificationOpt(
                'tutorial',
                'success',
                'publish'
              );
              notify(notiOps.message, notiOps.options);

              setCurrentAction('add');
              setCanUpdate(true);
              setTutorial(result.data.createGrouping);
              setDescData();
            }
          }
          setNewElName('');

          setButtonDisable(false);
        } else {
          setOpenCreate(false);
          setNewElName('');
        }
      }
    } catch (error) {
      console.log(error.message);
      setNewElName('');
      setButtonDisable(false);
      if (error.message.includes('Name exists')) {
        setCreateDialogSetting({
          error: true,
          helpText: en['Name exists already. Name must be unique.'],
          autoFocus: true
        });
      }
    }
  };

  const getPrimaryVideo = () => {
    if (!showMoreData) return null;

    let asset = showMoreData?.multimediaAssets?.find(
      (asset) => asset.type === 'Primary'
    );

    if (!asset) return null;

    return {
      ...asset,
      url: `${asset.baseUrl}${asset.fileDir}${asset.fileName}`,
      type: asset.mimeType
    };
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleGuardChange = async (value) => {
    setWhenState(false);
    // setShowEdit(true);
    if (value) {
      setIsForceSave(true);
    } else {
      setCurrentAction('');
      setCanUpdate(false);
      setTutorial();
      setDescData();
    }
  };

  return (
    <Box className={classes.root}>
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

      <EditPanel
        title={showMoreData ? showMoreData?.name : 'Tutorial'}
        page={'Tutorials'}
        canEdit={
          (currentUser.schemaType === 'superAdmin' ||
            currentUser.schemaType === 'sysAdmin') &&
          !showMoreData
            ? true
            : false
        }
        canAdd={
          (currentUser.schemaType === 'superAdmin' ||
            currentUser.schemaType === 'sysAdmin') &&
          !showMoreData
            ? true
            : false
        }
        canGallery={currentAction === 'add'}
        galleryType={'banner'}
        schemaType="tutorial"
        canUpdate={canUpdate}
        onSearch={handleSearchChange}
        onChange={handleEditPanelChange}
        canShowInfo={tutorial ? true : false}
        showMoreMode={showMoreMode}
        UserSearch={
          <UserSearch
            type={'Tutorial'}
            defaultValue={searchStr}
            useStyles={useStylesSearch}
            onChange={(value) => handleSearchChange('search', value)}
          />
        }
        hasNoSliderMenu={true}
      >
        {showMoreData ? (
          <Grid container style={{ padding: '24px 30px 24px 30px' }}>
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              <Grid
                container
                style={
                  isSmallScreen
                    ? { width: '100%' }
                    : { width: '80%', minWidth: '680px' }
                }
                direction="column"
              >
                <Grid item xs={12}>
                  <Typography>
                    <Box
                      style={{
                        background: 'white',
                        padding: '10px',
                        fontSize: 24
                      }}
                    >
                      {showMoreData.desc?.title}
                    </Box>
                  </Typography>
                  <Typography>
                    <Box
                      style={{
                        background: 'white',
                        padding: '10px',
                        marginTop: 0,
                        fontSize: 20
                      }}
                    >
                      {showMoreData.desc?.short}
                    </Box>
                  </Typography>

                  {getPrimaryVideo() && (
                    <div
                      style={
                        isSmallScreen
                          ? {
                              paddingLeft: '10px',
                              marginTop: 24
                            }
                          : {
                              width: '680px',
                              paddingLeft: '10px',
                              marginTop: 24
                            }
                      }
                    >
                      <AttachmentPreview resources={getPrimaryVideo()} />
                    </div>
                  )}
                  <div
                    style={{
                      background: 'white',
                      padding: '10px',
                      marginTop: 0
                    }}
                    dangerouslySetInnerHTML={{ __html: showMoreData.body }}
                  ></div>
                  <div
                    style={
                      isSmallScreen
                        ? {
                            background: 'white',
                            padding: '10px',
                            borderRadius: 3,
                            border: '1px solid #d3d4d5',
                            marginTop: 0,
                            marginBottom: 30
                          }
                        : {
                            background: 'white',
                            padding: '10px',
                            borderRadius: 3,
                            border: '1px solid #d3d4d5',
                            marginTop: 0,
                            width: 600,
                            minWidth: 450,
                            marginBottom: 30
                          }
                    }
                  >
                    <MultimediaAttachmentForm
                      disable={true}
                      resources={showMoreData}
                      onChange={handleMultiAttFormChange}
                      avatarS3URL={avatarS3URL}
                    />
                  </div>
                  <Grid container spacing={4} style={{ marginTop: 0 }}></Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : currentAction === 'add' ? (
          <Grid
            spacing={isSmallScreen ? 1 : 3}
            container
            direction="row"
            style={
              isSmallScreen
                ? { padding: '6px', width: 'calc(100% - 2px)' }
                : { width: 'calc(100% - 2px)', height: '100%' }
            }
          >
            <Grid item xs={12} style={{ height: '100%', paddingBottom: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                <Grid
                  item
                  style={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    height: 'min-content'
                  }}
                >
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={8}
                    xl={8}
                    style={{ paddingRight: 12 }}
                  >
                    <DefaultCard lesson={true}>
                      <Grid container spacing={4}>
                        <Grid item xs={12}>
                          <CustomInput
                            rows={1}
                            label="Name"
                            variant="outlined"
                            size="small"
                            type="text"
                            name="Name"
                            resources={cardName}
                            disabled={false}
                            inputRef={nameRef}
                            style={clsx({
                              [classes.inputArea]: true
                            })}
                            onKeyDown={handleKeyDown}
                            onChange={(value) =>
                              handleFormChange('name', value)
                            }
                            // onKeyPress={(value) => {
                            //   // setCardName(value);
                            //   handleEditPanelChange('save');
                            //   nameRef.current?.blur();
                            // }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                        >
                          <AvatarUploadForm
                            disable={false}
                            docId={tutorial?._id}
                            stationId={'tutorials'}
                            resources={avatarS3URL}
                            acceptedFiles={[
                              'image/png',
                              'image/jpg',
                              'image/jpeg'
                            ]}
                            title={en['lesson dropzone banner']}
                            onChange={(value) => handleOnAvatarChange(value)}
                            changeAlt={(value) =>
                              handleFormChange('altText', value)
                            }
                            changeAvatarType={(value) =>
                              handleFormChange('avatarType', value)
                            }
                            disableGray={true}
                            isUpload={isAvatarUpload}
                            setUpload={setAvatarUpload}
                            doc={tutorial}
                            altText={tutorial?.avatar?.altText}
                            setAvatarSize={setAvatarSize}
                          />
                        </Grid>
                        {/* {(avatarS3URL || isAvatarAttached) && ( */}
                        <Grid item xs={12} style={{ paddingBottom: 0 }}>
                          <AltText
                            disable={false}
                            resources={altText}
                            onChange={(value) =>
                              handleFormChange('altText', value)
                            }
                            isAvatarAttached={isAvatarAttached}
                            onSaveContents={(value) => {
                              setAltText(value);
                              setWhenState(true);
                              handleEditPanelChange('save');
                            }}
                          />
                        </Grid>
                        {/* )} */}
                        <Grid item xs={12}>
                          <DescriptionForm
                            disable={false}
                            resources={descData}
                            onChange={(value) =>
                              handleFormChange('description', value)
                            }
                            helperText={false}
                            disableGray={true}
                            resourceType="tutorial"
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
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                    xl={4}
                    style={
                      isSmallScreen ? { marginTop: 12, paddingRight: 12 } : {}
                    }
                  >
                    <DefaultCard
                      className={
                        isMediumScreen
                          ? classes.editPanelMobileAttachCard
                          : classes.editPanelAttachCard2
                      }
                    >
                      <MultimediaAttachmentForm
                        disable={false}
                        resources={tutorial}
                        onChange={handleMultiAttFormChange}
                        avatarS3URL={avatarS3URL}
                        isAvatarAttached={isAvatarAttached}
                      />
                    </DefaultCard>
                  </Grid>
                </Grid>

                {/* )} */}
                {tutorial && (
                  <Grid
                    item
                    style={{
                      paddingTop: 0,
                      marginTop: 12,
                      height: 'inherit',
                      minHeight: 200
                    }}
                  >
                    <DefaultCard className={classes.editPanelHtmlCard1}>
                      <TextEditor
                        disable={false}
                        docId={tutorial?._id}
                        detailData={detailData}
                        textEditor={true}
                        resources={tutorial}
                        onChange={(value) =>
                          handleFormChange('textEditor', value)
                        }
                      />
                    </DefaultCard>
                  </Grid>
                )}
              </div>
            </Grid>
          </Grid>
        ) : (
          <TutorialTable
            searchValue={searchStr}
            handleClickMore={handleClickMore}
            setEditTutorial={handleEditMode}
            setTablePage={setTablePage}
            tablePage={tablePage}
          />
        )}
        <CustomDialog
          mainBtnName={en['Create']}
          open={openCreate}
          title={en[`Create a new Tutorial`]}
          onChange={handleCreateDialogChange}
          customClass={classes.customDialogContent}
        >
          <CustomInput
            my={2}
            size="small"
            type="text"
            autoFocus={true}
            label={en[`Enter the Tutorial name *`]}
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
            <JSONEditor disable={false} resources={tutorial} />
          </Grid>
        </CustomDialog>
      </EditPanel>
    </Box>
  );
};

export default TutorialEdit;
