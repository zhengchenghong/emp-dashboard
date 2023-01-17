import React, { useState, useEffect, createRef } from 'react';
import clsx from 'clsx';
import { Box, Typography, IconButton, Divider, Grid } from '@material-ui/core';
import { faPaperclip, faUndo } from '@fortawesome/free-solid-svg-icons';
import { CloudUpload, Delete, GetApp } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoadingCard } from '@app/components/Cards';
import {
  CustomInput,
  CustomDialog,
  CustomSelectBox
} from '@app/components/Custom';
import { hasFileExtension, getFileExtension } from '@app/utils/file-manager';
import { getNotificationOpt } from '@app/constants/Notifications';
import AttachmentPreview from './Preview';
import useStyles from './style';
import { useUserContext } from '@app/providers/UserContext';
import { DropzoneArea } from 'material-ui-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAssetContext } from '@app/providers/AssetContext';
import { useDebounce } from 'use-debounce';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { getUUID } from '@app/utils/functions';
import { useLazyQuery, useApolloClient } from '@apollo/client';
import graphql from '@app/graphql';
import {
  validateFileName,
  isVideoType,
  getIcon,
  isImageType
} from '@app/utils/validate';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import Config from '@app/Config';
import { useSmallScreen } from '@app/utils/hooks';
import { useMediumScreen } from '@app/utils/hooks';
import { en } from '@app/language';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { EXECUTABLE_FILES } from '@app/utils/constants';

const MultimediaAttachmentForm = ({
  disable,
  resources,
  onChange,
  isTutorial,
  setStartMMAUploading = () => {},
  setUploadFileType = () => {},
  setUploadingFilesParentId = () => {},
  cardViewList,
  avatarS3URL,
  published,
  isAvatarAttached,
  stationTransmission,
  onlyPreviewAllow
}) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const refUpload = createRef(null);
  const [file, setFile] = useState();
  const [files, setFiles] = useState([]);
  const [isDropping, setIsDropping] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [selected, setSelected] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);
  const [currentUser] = useUserContext();
  const [fileInfo, setFileInfo] = useState({
    type: null,
    baseUrl: '',
    fileDir: '',
    fileName: '',
    altText: '',
    status: '',
    mimeType: '',
    title: '',
    uId: ''
  });
  const [filesInfo, setFilesInfo] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUnpublishWarning, setOpenUnpublishWarning] = useState(false);
  const [openCreateFiles, setOpenCreateFiles] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [isDroped, setIsDroped] = useState(false);
  const [dropzoneKey, setDropzoneKey] = useState();
  const [debounceKey] = useDebounce(dropzoneKey, 1000);
  const [isValidFileName, setValidFileName] = useState(true);
  const [validNameHelper, setValidNameHelper] = useState('');
  const { copyMMAAsset, addMoreMediaAsset, queProgreses } = useAssetContext();
  const [fetchTimer, setFetchTimer] = useState();
  const client = useApolloClient();
  const [uniqueData, setUniqueData] = useState([]);
  const [disableDragAndDrop, setDisableDragAndDrop] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const altTextRef = createRef(null);
  const isSmallScreen = useSmallScreen();
  const { setFocusFirstAction } = useSelectionContext();

  window.onblur = () => {
    setDisableDragAndDrop(false);
  };

  window.onfocus = () => {
    setDisableDragAndDrop(false);
  };

  useEffect(() => {
    setLoadedData(resources?.multimediaAssets || []);
    setTimerForPulling();
  }, [resources]);

  const [getData, { dataLoading, data, error }] = useLazyQuery(
    resources?.schemaType === 'tutorial'
      ? graphql.queries.TutorialGrouping
      : graphql.queries.MaterialGrouping,
    {
      fetchPolicy: 'no-cache',
      onCompleted(data) {
        if (data?.grouping?.length > 0)
          client.cache.modify({
            fields: {
              grouping(allGrouping = []) {
                const updatedGrouping = allGrouping.map((group) => {
                  if (group._id === data.grouping[0]?._id) {
                    return data.grouping[0];
                  }
                  return group;
                });
                return updatedGrouping;
              }
            }
          });
      }
    }
  );

  const fetchMaterialData = async () => {
    await getData({
      variables: {
        id: resources._id,
        schemaType: resources.schemaType
      }
    });
  };

  const setTimerForPulling = () => {
    if (fetchTimer) clearInterval(fetchTimer);
    const unreadys = resources?.multimediaAssets?.filter(
      (el) => el.status !== 'ready'
    ).length;
    if (unreadys > 0) {
      const interval = setInterval(function () {
        fetchMaterialData();
      }, 5000);
      setFetchTimer(interval);
    }
  };

  useEffect(() => {
    return () => {
      if (fetchTimer) clearInterval(fetchTimer);
    };
  }, []);

  useEffect(() => {
    if (!dataLoading && !error && data) {
      const { grouping } = data;
      setLoadedData(grouping[0]?.multimediaAssets);
    }
  }, [dataLoading, data, error]);

  useEffect(() => {
    if (Array.isArray(loadedData)) {
      const tmpData = [];

      for (let item of loadedData) {
        let isDuplicated = false;

        for (let tmpItem of tmpData) {
          if (
            tmpItem.fileDir === item.fileDir &&
            tmpItem.fileName === item.fileName
          ) {
            isDuplicated = true;
            break;
          }
        }

        if (!isDuplicated) {
          tmpData.push(item);
        }
      }

      setUniqueData(tmpData);
    }

    if (isDroped) {
      let tempData = [];
      loadedData?.slice().map((el) => {
        const copyStr = JSON.stringify(el);
        let copyObj = JSON.parse(copyStr);
        delete copyObj['__typename'];
        tempData.push(copyObj);
      });
      onChange('reOrder', tempData);
      setIsDroped(false);
    }
  }, [loadedData]);

  const handleElClick = (type, value, index) => {
    if (type === 'doubleClick') setOpenPreview(true);
    setCanDownload(value?.status === 'ready');
    setSelected(index);
    setCanDelete(true);
    setFileInfo({
      ...fileInfo,
      fileName: value.fileName,
      type: value.type,
      baseUrl: value.baseUrl,
      fileDir: value.fileDir,
      altText: value.altText,
      status: value.status,
      mimeType: value.mimeType,
      title: value.title ? value.title : value.fileName,
      uId: value.uId
    });
  };

  const wrongFileTypeNotify = () => {
    notify(
      'Uploaded file must contain extension type in its name. Ex: .png , .jpg , .csv , .docx',
      { variant: 'warning' }
    );
  };

  const setFileInfosForUplodedFile = (files) => {
    let filesInfoArray = [];
    let containVideo = false;
    files.map((file) => {
      if (!hasFileExtension(file.name)) {
        wrongFileTypeNotify();
        return false;
      }
      const file_uId = getUUID();
      const file_ext = file.name?.includes('.') && file.name?.split('.').pop();
      filesInfoArray.push({
        uId: file_uId,
        fileName: file_uId + '.' + file_ext,
        baseUrl: '',
        fileDir: '',
        type: file.type,
        title: getFileName(file.name),
        mimeType: file.type,
        altText: '',
        status: isVideoType(file.name) ? 'uploaded' : 'ready'
      });
      if (file.type.includes('video')) {
        containVideo = true;
      }
    });
    setFilesInfo(filesInfoArray);
    if (published && containVideo) {
      setOpenUnpublishWarning(true);
    } else {
      setOpenCreateFiles(true);
    }
  };

  const handleInputChange = (type, field, value) => {
    if (type === 'upload') {
      let fileArray = [];
      for (let i = 0; i < value.length; i++) {
        if (value[i].size < 1) {
          const notiOps = getNotificationOpt('attachment', 'error', 'zerosize');
          notify(notiOps.message, notiOps.options);
          return;
        }
        fileArray.push(value[i]);
      }
      setFiles(fileArray);
      setFileInfosForUplodedFile(fileArray);
    }

    if (type === 'drop' && value.length > 0) {
      let fileArray = [];
      for (let i = 0; i < value.length; i++) {
        fileArray.push(value[i].file);
      }
      setFiles(fileArray);
      setFileInfosForUplodedFile(fileArray);
    }

    if (type === 'createDialog') {
      setFileInfo({
        ...fileInfo,
        [field]: field === 'fileName' ? getFileName(value) : value
      });
    }

    if (type === 'previewDialog') {
      setFileInfo({
        ...fileInfo,
        [field]: value
      });
    }
  };

  const handleCreateFilesInputDialog = (dialogType, field, value, index) => {
    if (dialogType === 'createFilesDialog') {
      let info = filesInfo.slice();
      if (field === 'fileName') {
        info[index].title = value;
        validFileName();
      } else if ('altText' === field) {
        info[index].altText = value;
      }
      setFilesInfo(info);
    }
  };

  const handleDrag = (type, event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event) => {
    if (event.dataTransfer.files.length !== 1) {
      const uri = event.dataTransfer.getData('text/uri-list');
      if (uri && uri !== '') {
        const s3Url = uri.split('?')[0];
        const stationId = resources?.topology?.station;
        const docId = resources?._id;
        const file_uId = getUUID();
        const file_ext = s3Url.split('.').pop();
        const fileName = file_uId + '.' + file_ext;
        const file_title = s3Url.split('/').pop();

        let filesSameName = loadedData.filter(
          (file) => file.title === file_title
        );
        if (filesSameName?.length > 0) {
          const notiOps = getNotificationOpt('backend', 'warning', 'upload');
          notify('File already exists!', notiOps.options);
          return;
        }
        copyMMAAsset(s3Url, fileName, stationId, docId)
          .then((url) => {
            let tempData = [];
            loadedData.map((el) => {
              const copyStr = JSON.stringify(el);
              let copyObj = JSON.parse(copyStr);
              delete copyObj['__typename'];
              tempData.push(copyObj);
            });
            const fileName = url.split('/').pop();
            const baseUrl = url.split(stationId)[0] + stationId + '/';
            const fileDir = url.replace(baseUrl, '').replace(fileName, '');
            let mimetype;
            if (url.toLowerCase().endsWith('png')) {
              mimetype = 'image/png';
            } else {
              mimetype = 'image/jpeg';
            }

            const isExist = tempData?.find(
              (item) => item.fileName === fileName
            );
            if (isExist) {
              const notiOps = getNotificationOpt(
                'backend',
                'warning',
                'upload'
              );
              notify('File already exists!', notiOps.options);
              return;
            }
            let addedData = {
              uId: file_uId,
              fileName,
              baseUrl,
              fileDir,
              mimeType: mimetype,
              title: file_title,
              status: 'ready'
            };
            tempData = [...tempData, addedData];
            setLoadedData(tempData);
            onChange('upload', addedData);
          })
          .catch((error) => {
            const notiOps = getNotificationOpt('backend', 'error', 'upload');
            notify(notiOps.message, notiOps.options);
          });
        return;
      }
      const notiOps = getNotificationOpt('attachment', 'warning', 'drop');
      notify(notiOps.message, notiOps.options);
      return;
    }

    if (!hasFileExtension(event.dataTransfer.files[0].name)) {
      wrongFileTypeNotify();
      return false;
    }

    if (event.dataTransfer.files.length > 0) {
      console.log('file::', event.dataTransfer.files);
      let fileArray = [];
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        if (!stationTransmission?.includes('3.0')) {
          if (event.dataTransfer.files[i].size > 1024 * 1024 * 200) {
            const notiOps = getNotificationOpt(
              'attachment',
              'warning',
              'oversize'
            );
            notify(notiOps.message, notiOps.options);
            return;
          }
        }
        if (event.dataTransfer.files[i].size < 1) {
          const notiOps = getNotificationOpt('attachment', 'error', 'zerosize');
          notify(notiOps.message, notiOps.options);
          return;
        }
        const ext = event.dataTransfer.files[i].name
          .split('.')
          .pop()
          .toLowerCase();
        if (!EXECUTABLE_FILES.includes(ext)) {
          return;
        }
        fileArray.push(event.dataTransfer.files[i]);
      }
      setFiles(fileArray);
      setFileInfosForUplodedFile(fileArray);
    }
  };

  const handleFormAction = async (type) => {
    try {
      if (type === 'upload') {
        refUpload.current.click();
        setFileInfo(false);
      }

      if (type === 'download') {
        if (
          (fileInfo?.type?.includes('video') ||
            fileInfo?.type?.includes('mp4')) &&
          isSmallScreen
        ) {
          setOpenDownload(true);
        } else {
          let elDom = document.createElement('a');
          const url = `${fileInfo.baseUrl}${fileInfo.fileDir}${fileInfo.fileName}`;
          getAssetUrlFromS3(url).then((res) => {
            elDom.setAttribute('href', res);
            elDom.setAttribute('download', res);
            elDom.setAttribute('rel', 'noopener noreferrer');
            elDom.setAttribute('target', '_blank');
            // elDom.style.visibility = 'hidden';
            document.body.appendChild(elDom);
            elDom.click();
            document.body.removeChild(elDom);
          });
        }
      }
      if (type === 'delete') {
        const currentTime = new Date().getTime();
        const convertStartTime = loadedData[selected].data?.startJobTimestamp
          ? loadedData[selected].data.startJobTimestamp
          : currentTime;
        const isTimeout =
          (currentTime - convertStartTime) / 1000 > Config.convertMediaTimeout;
        console.log(
          'mma-timeout-valus',
          currentTime,
          convertStartTime,
          isTimeout
        );
        if (loadedData[selected].status === 'converting' && !isTimeout) {
          const notiOps = getNotificationOpt(
            'attachment',
            'warning',
            'deleteConverting'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
        onChange('delete', loadedData[selected]);
        const tmpData = loadedData.filter((e, idx) => idx !== selected);
        setLoadedData(tmpData);
        setSelected();
        setFileInfo(false);
      }
      if (type === 'refresh') {
        setRefresh(true);
        setLoadedData([]);
        let { data: refreshData } = await client.query({
          query:
            resources.schemaType === 'tutorial'
              ? graphql.queries.TutorialGrouping
              : graphql.queries.MaterialGrouping,
          variables: {
            id: resources._id,
            schemaType: resources.schemaType
          }
        });
        if (refreshData?.grouping.length > 0) {
          setTimeout(() => {
            setLoadedData(refreshData?.grouping[0]?.multimediaAssets || []);
            setSelected();
            setFileInfo(false);
            setRefresh(false);
          }, 1000); // after 3 seconds, refresh list
        }
      }
    } catch (error) {
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };
  const handlePreviewDialogChange = (type, value) => {
    if (type === 'btnClick') {
      if (value) {
        if (!disable) onChange('update', fileInfo);
        setSelected();
        setFileInfo(false);
      }
      setOpenPreview(false);
    }
  };

  const handleDownloadDialogChange = (type, value) => {
    if (type === 'btnClick') {
      setOpenDownload(false);
    }
  };

  const handleUnpublishWarningDialogChange = (type, value) => {
    if (type === 'btnClick') {
      if (value) {
        setOpenCreateFiles(true);
      }
    }
    setOpenUnpublishWarning(false);
  };

  const handleCreateDialogChange = (type, value) => {
    try {
      if (value) {
        if (!isValidFileName) return;
        if (files) {
          attachmentUploadFunc(files);
        }
      }
      setFilesInfo([]);
      setOpenCreateFiles(false);
      altTextRef.current = null;
      setSelected();
      window.setTimeout(() => {
        setDropzoneKey();
      }, 0);
      if (refUpload.current) {
        refUpload.current.value = '';
      }
    } catch (error) {
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'wrong');
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    padding: 8,
    margin: `0 0 0px 0`,
    background: isDragging ? 'lightgreen' : 'none',
    ...draggableStyle
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? 'lightblue' : 'none',
    padding: 8
  });

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      loadedData,
      result.source.index,
      result.destination.index
    );
    setIsDroped(true);
    setLoadedData(items);
    setSelected(result.destination.index);
  };

  useEffect(() => {
    if (filesInfo) {
      validFileName();
    }
  }, [filesInfo]);

  const validFileName = () => {
    if (files.length > 0) {
      for (const file of filesInfo) {
        if (!file.title) {
          setValidNameHelper('Please enter filename!');
          setValidFileName(false);
          return;
        }

        if (validateFileName(file.title)) {
          const notiOps = getNotificationOpt(
            'extra',
            'error',
            'invalildFileName'
          );
          setValidNameHelper(notiOps.message);
          setValidFileName(false);
          return;
        }

        if (loadedData && loadedData.length > 0) {
          if (
            loadedData.find(
              (item) =>
                item?.title ===
                  `${file.title}.${getFileExtension(files[0].name)}` ||
                item?.title === `${file.title}`
            )
          ) {
            setValidNameHelper('Filename already exists!');
            setValidFileName(false);
            return;
          }
        }
      }
      setValidFileName(true);
    }
  };

  const handleDropEvent = (event) => {
    if (event) {
      let fileSize = event[0].size;
      if (!stationTransmission?.includes('3.0')) {
        if (fileSize > 1024 * 1024 * 200) {
          const notiOps = getNotificationOpt(
            'attachment',
            'warning',
            'oversize'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
    }
  };

  const attachmentUploadFunc = (files) => {
    setStartMMAUploading(true);
    if (isVideoType(files[0]?.name)) {
      if (setUploadFileType) setUploadFileType('media');
    } else {
      if (setUploadFileType) setUploadFileType('unmedia');
    }
    if (setUploadingFilesParentId) setUploadingFilesParentId(resources?._id);
    addMoreMediaAsset(files[0], resources, filesInfo[0]);
  };

  useEffect(() => {
    if (queProgreses?.length) {
      setStartMMAUploading(true);
    } else {
      setStartMMAUploading(false);
      if (setUploadingFilesParentId) setUploadingFilesParentId();
      if (setUploadFileType) setUploadFileType();
    }
  }, [queProgreses]);

  const handleChange = async (files) => {
    try {
      if (files.length > 0) {
        let fileSize = files[0].size;
        if (!stationTransmission?.includes('3.0')) {
          if (fileSize > 1024 * 1024 * 200) {
            const notiOps = getNotificationOpt(
              'attachment',
              'warning',
              'oversize'
            );
            notify(notiOps.message, notiOps.options);
            return;
          }
        }
        let fileArray = [];
        for (let i = 0; i < files.length; i++) {
          if (!stationTransmission?.includes('3.0')) {
            if (files[i].size > 1024 * 1024 * 200) {
              const notiOps = getNotificationOpt(
                'attachment',
                'warning',
                'oversize'
              );
              notify(notiOps.message, notiOps.options);
              return;
            }
          }
          if (files[i].size < 1) {
            const notiOps = getNotificationOpt(
              'attachment',
              'error',
              'zerosize'
            );
            notify(notiOps.message, notiOps.options);
            return;
          }

          console.log(files[i].name);
          const ext = files[i].name.split('.').pop().toLowerCase();
          if (!EXECUTABLE_FILES.includes(ext)) {
            notify('This file can’t be uploaded! Unsupported file type.', {
              variant: 'error'
            });
            return;
          }
          fileArray.push(files[i]);
        }
        setFiles(fileArray);
        setFileInfosForUplodedFile(fileArray);
      }
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

  const handleKeyDown = (event) => {
    if (cardViewList) {
      setFocusFirstAction(true);
      event.preventDefault();
    }
  };

  const getFileName = (filename) => {
    return filename?.substring(0, filename.lastIndexOf('.')) || filename;
  };

  const canSeeDetail = () => {
    if (
      currentUser?.schemaType === 'superAdmin' ||
      currentUser?.schemaType === 'sysAdmin'
    ) {
      return true;
    }
    return false;
  };

  return (
    <Box
      height="100%"
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
      maxHeight={!cardViewList ? '576px' : 'none'}
      border={cardViewList ? '1px solid' : ''}
      borderColor={cardViewList ? 'rgb(0, 0 ,0 ,0.27)' : ''}
      padding={cardViewList ? '10px' : ''}
      borderRadius={cardViewList ? '4px' : ''}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        style={{ pointerEvents: onlyPreviewAllow ? 'none' : 'inherit' }}
      >
        <Typography variant="subtitle2">
          <FontAwesomeIcon icon={faPaperclip} className={classes.icon} />
          Attachments
        </Typography>
        {isDropping || (
          <Box>
            {!disable && (
              <IconButton
                className={classes.actionButton}
                size="small"
                onClick={() => handleFormAction('upload')}
                disabled={disable}
              >
                <CloudUpload />
              </IconButton>
            )}
            <IconButton
              className={classes.actionButton}
              size="small"
              onClick={() => handleFormAction('download')}
              disabled={!canDownload}
            >
              <GetApp />
            </IconButton>
            {!disable && (
              <IconButton
                className={classes.actionButton}
                size="small"
                onClick={() => handleFormAction('delete')}
                disabled={!canDelete || disable}
              >
                <Delete />
              </IconButton>
            )}
            <IconButton
              className={classes.actionButton}
              size="small"
              onClick={() => handleFormAction('refresh')}
              disabled={disable}
            >
              <FontAwesomeIcon
                icon={faUndo}
                spin={refresh}
                size="sm"
                style={{
                  animationDirection: 'alternate-reverse',
                  cursor: 'pointer'
                }}
              />
            </IconButton>
          </Box>
        )}
      </Box>
      <Divider className={classes.separator} />
      <input
        type="file"
        id="file"
        ref={refUpload}
        multiple={false}
        onChange={(e) => handleInputChange('upload', 'file', e.target.files)}
        style={{
          display: 'none',
          pointerEvents: onlyPreviewAllow ? 'none' : 'inherit'
        }}
      />
      <main
        className={clsx(classes.content, {
          [classes.content]: !isDropping,
          [classes.contendDroping]: isDropping
        })}
        // style={
        //   cardViewList
        //     ? { height: '100%' }
        //     : resources?.schemaType === 'tutorial'
        //     ? isAvatarAttached || avatarS3URL
        //       ? { height: '385px' }
        //       : { height: '222px' }
        //     : isAvatarAttached || avatarS3URL
        //     ? { height: '336px' }
        //     : { height: '284px' }
        // }
      >
        {isDropping ? (
          <FontAwesomeIcon icon={faPaperclip} size="6x" />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {loadedData &&
                    uniqueData.map((item, index) => (
                      <Draggable
                        key={`${item?.fileName}-${index}`}
                        draggableId={`${item?.fileName}-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                            onClick={() =>
                              handleElClick('singleClick', item, index)
                            }
                            onDoubleClick={() =>
                              handleElClick('doubleClick', item, index)
                            }
                            className={clsx(classes.listItems, {
                              [classes.listItem]: selected !== index,
                              [classes.listItemSelected]: selected === index
                            })}
                          >
                            <Grid container spacing={1}>
                              <div style={{ width: 'calc(100% - 65px)' }}>
                                <Typography variant="subtitle2">
                                  <FontAwesomeIcon
                                    icon={getIcon(item?.mimeType)}
                                  />
                                  &nbsp;{' '}
                                  {item?.title
                                    ? getFileName(item.title)
                                    : getFileName(item.fileName)}
                                </Typography>
                              </div>
                              <div style={{ width: 'max-content' }}>
                                <Typography variant="subtitle2">
                                  {item?.status === 'ready' ? '' : item?.status}
                                </Typography>
                              </div>
                            </Grid>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>
      {!disable && (
        <div
          style={{
            padding: '10px',
            background: '#fff',
            display: disableDragAndDrop ? 'none' : 'unset',
            pointerEvents: onlyPreviewAllow ? 'none' : 'inherit'
          }}
          onKeyDown={handleKeyDown}
        >
          <LoadingCard
            loading={false}
            style={classes.dropzoneClass}
            onDragOver={(e) => disable || handleDrag('over', e)}
            onDragLeave={(e) => disable || handleDrag('leave', e)}
            onDrop={handleDrop}
          >
            <DropzoneArea
              dropzoneText={'Drag and Drop an Attachment'}
              dropzoneClass={classes.dropzoneClass}
              dropzoneParagraphClass={classes.dropzoneParagraph}
              showPreviewsInDropzone={false}
              showPreviews={false}
              clearOnUnmount={true}
              filesLimit={1}
              maxFileSize={
                stationTransmission?.includes('3.0')
                  ? 1024 * 1024 * 120000
                  : 1024 * 1024 * 200
              } //1024M max file size
              onChange={handleChange}
              onDropRejected={(event) => handleDropEvent(event)}
              showAlerts={false}
              key={debounceKey}
            />
          </LoadingCard>
        </div>
      )}

      <CustomDialog
        mainBtnName={disable || onlyPreviewAllow ? null : 'Update'}
        open={openPreview}
        title="Preview"
        onChange={handlePreviewDialogChange}
      >
        {canSeeDetail() ? (
          <>
            <CustomInput
              label="File Title"
              variant="outlined"
              size="small"
              type="text"
              helperText="Minimum length is six characters."
              resources={getFileName(fileInfo.title)}
              style={classes.inputArea}
              onChange={(value) =>
                handleInputChange('previewDialog', 'title', value)
              }
              disabled={onlyPreviewAllow}
            />
            {!isVideoType(fileInfo.fileName) && (
              <CustomInput
                label="Alt Text"
                variant="outlined"
                size="small"
                type="text"
                resources={fileInfo.altText}
                style={classes.inputArea}
                disabled={disable}
                onChange={(value) =>
                  handleInputChange('previewDialog', 'altText', value)
                }
              />
            )}
            <CustomInput
              label="File URL"
              variant="outlined"
              size="small"
              type="text"
              rows={4}
              multiline
              fullWidth
              resources={`${fileInfo.baseUrl}${fileInfo.fileDir}${fileInfo.fileName}`}
              style={classes.inputArea}
              disabled={true}
              onChange={(value) =>
                handleInputChange('previewDialog', 'url', value)
              }
            />
            {isVideoType(fileInfo.fileName) && (
              <div
                style={{
                  border: '1px solid rgb(0 0 0 / 30%)',
                  borderRadius: '3px',
                  marginBottom: 10
                }}
              >
                <CustomSelectBox
                  size="small"
                  style={clsx({
                    [classes.selectBox]: true
                  })}
                  label="Type"
                  variant="filled"
                  resources={['Primary', 'Other']}
                  onChange={(value) =>
                    handleInputChange('previewDialog', 'type', value)
                  }
                  value={fileInfo.type}
                  disabled={false}
                  disableUnderline
                />
              </div>
            )}
          </>
        ) : (
          []
        )}
        <AttachmentPreview resources={fileInfo} />
      </CustomDialog>

      <CustomDialog
        open={openUnpublishWarning}
        title="Warning!"
        mainBtnName="OK"
        onChange={handleUnpublishWarningDialogChange}
      >
        <Typography variant="subtitle1">
          {
            en[
              'Adding video files will cause the lesson to be unpublished. Please publish the lesson when the conversion of the file is complete.'
            ]
          }
        </Typography>
      </CustomDialog>

      <CustomDialog
        mainBtnName={null}
        open={openDownload}
        title="Download"
        onChange={handleDownloadDialogChange}
      >
        <AttachmentPreview resources={fileInfo} />
      </CustomDialog>

      <CustomDialog
        open={openCreate}
        title="Input the attachment name"
        mainBtnName="Submit"
        onChange={handleCreateDialogChange}
      >
        <Box className={classes.fileNameInputBox}>
          <CustomInput
            label="File Name"
            variant="outlined"
            size="small"
            helperText="Minimum length is six characters."
            autoFocus={true}
            style={classes.inputArea}
            resources={getFileName(fileInfo.title)}
            onChange={(value) =>
              handleInputChange('createDialog', 'fileName', value)
            }
            error={!isValidFileName}
          />
          <Box className={classes.extension}>
            {file ? ` .${getFileExtension(file.name)}` : ''}
          </Box>
        </Box>
        {file && !isVideoType(file.name) && (
          <CustomInput
            label="Alt Text"
            variant="outlined"
            size="small"
            helperText=""
            style={classes.inputArea}
            resources={fileInfo?.altText}
            onChange={(value) =>
              handleInputChange('createDialog', 'altText', value)
            }
          />
        )}
      </CustomDialog>
      <CustomDialog
        open={openCreateFiles}
        title={
          filesInfo.length > 1
            ? 'Multi Attachment Upload'
            : 'Input the attachment name'
        }
        mainBtnName="Submit"
        onChange={handleCreateDialogChange}
      >
        {filesInfo.length > 0 &&
          filesInfo.map((file, index) => {
            return (
              <>
                {index !== 0 && (
                  <Box m={1}>
                    <Divider style={{ marginBottom: '10px' }} />
                  </Box>
                )}
                <Box className={classes.fileNameInputBox}>
                  <CustomInput
                    label="File Title"
                    variant="outlined"
                    size="small"
                    helperText={validNameHelper}
                    autoFocus={true}
                    style={classes.inputMultiArea}
                    resources={getFileName(file.title)}
                    onChange={(value) =>
                      handleCreateFilesInputDialog(
                        'createFilesDialog',
                        'fileName',
                        value,
                        index
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (altTextRef.current) {
                          altTextRef.current?.focus();
                        } else {
                          handleCreateDialogChange('btnClick', true);
                        }
                      }
                    }}
                    error={!isValidFileName}
                  />
                </Box>
                {isImageType(files[index].name) && (
                  <CustomInput
                    ref={altTextRef}
                    label="Alt Text"
                    variant="outlined"
                    size="small"
                    helperText=""
                    style={classes.inputMultiArea}
                    resources={file?.altText}
                    onChange={(value) =>
                      handleCreateFilesInputDialog(
                        'createFilesDialog',
                        'altText',
                        value,
                        index
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleCreateDialogChange('btnClick', true);
                      }
                    }}
                  />
                )}
              </>
            );
          })}
      </CustomDialog>
    </Box>
  );
};

export default MultimediaAttachmentForm;
