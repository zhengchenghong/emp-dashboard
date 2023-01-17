/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import { Box, IconButton, LinearProgress, Grid } from '@material-ui/core';
import { Img } from 'react-image';
import { Close } from '@material-ui/icons';
import { DefaultCard, LoadingCard } from '@app/components/Cards';
import { getBase64 } from '@app/utils/file-manager';
import useStyles from './style';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useAssetContext } from '@app/providers/AssetContext';
import './style.css';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import { en } from '@app/language';
import { getUUID } from '@app/utils/functions';
import { useUserContext } from '@app/providers/UserContext';
import { AltText } from '@app/components/Forms';
import { useSelectionContext } from '@app/providers/SelectionContext';

const AvatarUploadForm = ({
  disable,
  docId,
  stationId,
  title,
  resources,
  extraClass,
  customAction,
  acceptedFiles,
  onChange,
  changeAlt,
  changeAvatarType,
  extraStyle,
  hideArrow,
  buttonCustomize,
  disableGray,
  type,
  noSpace,
  gallerySchemaType,
  isUpload,
  setUpload = () => {},
  setStartAvatarUploading,
  setStartThumbnailUploading,
  doc,
  isIcon,
  altText,
  galleryTypeText,
  setAvatarSize,
  cardViewList,
  isThumbnail,
  thumbnailFile,
  isUserInTable,
  updateGrouping
}) => {
  const [loading, setLoading] = useState(false);
  const { notify } = useNotifyContext();
  const [loadedData, setLoadedData] = useState();
  const [assetUrl, setAssetUrl] = useState('');
  const [isUploadForUser, setUploadForUser] = useState(false);
  const {
    uploading,
    uploadAvatar,
    copyAsset,
    uploadGallery,
    updateGalleryThumbnail,
    docId: uploadedId
  } = useAssetContext();
  const [file, setFile] = useState();
  const classes = useStyles();
  const imageRef = useRef();
  const dropZoneRef = useRef();
  const [imageSize, setImageSize] = useState();
  const [currentUser] = useUserContext();
  const [isDroped, setIsDroped] = useState(false);

  const { newTopologyCreated, setNewTopologyCreated } = useSelectionContext();

  useEffect(() => {
    return () => {
      imageRef.current = false;
      dropZoneRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (docId === uploadedId) {
      setLoading(uploading);
    }
  }, [uploading]);

  useEffect(() => {
    setLoadedData(resources);
  }, [resources, docId]);

  useEffect(() => {
    if (String(loadedData).includes('http')) {
      getAwsFileUrl(loadedData);
    } else {
      setAssetUrl(loadedData);
    }
  }, [loadedData]);

  const getAwsFileUrl = async (data) => {
    setLoading(true);
    try {
      let image = await getAssetUrlFromS3(data, 0);
      setAssetUrl(image);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleChange = async (files) => {
    try {
      if (files.length > 0) {
        if (files[0].size < 1) {
          const notiOps = getNotificationOpt('attachment', 'error', 'zerosize');
          notify(notiOps.message, notiOps.options);
          return;
        }
        setLoading(true);
        const base64string = await getBase64(files[0]);
        setLoadedData(base64string);
        setFile(files[0]);
        onChange('fileAttached', files[0]);
        setLoading(false);
        if (isUserInTable) {
          setUploadForUser(!isUploadForUser);
        }
      } else {
        console.log('file is not attached');
        if (type !== 'gallery' && !isDroped) {
          setLoading(false);
          setLoadedData();
        }
      }
    } catch (error) {
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'upload');
        notify(notiOps.message, notiOps.options);
      }
      setLoading(false);
      setLoadedData();
    }
  };

  const handleDrop = (event) => {
    const uri = event.dataTransfer.getData('text/uri-list');
    if (uri && uri !== '') {
      const s3Url = uri.split('?')[0];
      copyAsset(s3Url, stationId, docId)
        .then((url) => {
          setLoadedData(url);
          onChange(url);
          saveAvatarInfo(url);
          setIsDroped(true);
        })
        .catch((error) => {
          const notiOps = getNotificationOpt('backend', 'error', 'upload');
          notify(notiOps.message, notiOps.options);
        });
    }
  };

  const saveAvatarInfo = (url) => {
    if (isUserInTable) {
      try {
        let baseUrl;
        let fileName;
        let fileDir;
        let mimeType;
        if (url) {
          baseUrl = url.split(stationId)[0] + stationId + '/';
          fileName = url.split('/').pop();
          fileDir = url.replace(baseUrl, '').replace(fileName, '');
          if (url.toLowerCase().endsWith('png')) {
            mimeType = 'image/png';
          } else {
            mimeType = 'image/jpeg';
          }
        }

        let variables = {
          id: docId,
          schemaType: doc.schemaType,
          version: doc.version,
          trackingAuthorName: currentUser?.name,
          avatar: {
            uId: getUUID(),
            baseUrl,
            fileDir,
            fileName,
            mimeType,
            type: 'avatar',
            status: 'ready'
          }
        };

        let res = updateGrouping({
          variables: variables
        });

        console.log(res);
      } catch (e) {}
    }
  };

  const handleClose = () => {
    setLoadedData('');
    onChange('fileRemoved');
  };

  const boxStyle = () => {
    if (isUserInTable) {
      return classes.previewUserInTable;
    }
    if (type === 'station') {
      return disable ? classes.preview : classes.noBoxRoot;
    } else if (type === 'class') {
      return classes.noBoxRoot;
    } else {
      return disable ? classes.preview : classes.root;
    }
  };

  const uploadAvatarFile = async (file) => {
    try {
      if (file) {
        if (type === 'gallery') {
          setLoading(true);
          setLoadedData('gallery');
          uploadGallery(
            file,
            gallerySchemaType,
            docId,
            doc,
            isIcon,
            galleryTypeText,
            altText,
            imageSize,
            thumbnailFile
          )
            .then((url) => {
              if (setStartAvatarUploading) setStartAvatarUploading(true);
              // onChange(url);
              const notiOps = getNotificationOpt(
                'gallery',
                'success',
                'update'
              );
              notify(notiOps.message, notiOps.options);
              setUpload(false);
            })
            .catch((error) => {
              setLoading(false);
              const notiOps = getNotificationOpt('backend', 'error', 'upload');
              notify(`${error}`, notiOps.options);
              setLoadedData();
              setUpload(false);
            });
          onChange('save');
        } else if (type === 'sysMessage') {
          uploadAvatar(file, 'messages', docId, type, doc, altText, imageSize);
        } else if (type === 'user') {
          uploadAvatar(file, 'users', docId, type, doc, altText, imageSize);
        } else {
          uploadAvatar(file, stationId, docId, type, doc, altText, imageSize);
        }
      } else {
        if (!isDroped) {
          setLoading(false);
          setLoadedData();
        } else {
          setIsDroped(false);
        }
      }
    } catch (error) {
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'upload');
        notify(notiOps.message, notiOps.options);
      }
      setLoading(false);
      setLoadedData();
    }
  };

  const uploadThumbFile = async (file) => {
    try {
      if (file) {
        if (type === 'gallery') {
          setLoading(true);
          setLoadedData('gallery');
          updateGalleryThumbnail(file, gallerySchemaType, docId, doc);
          // onChange('save');
        }
      } else {
        setLoading(false);
        setLoadedData();
      }
    } catch (error) {
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'upload');
        notify(notiOps.message, notiOps.options);
      }
      setLoading(false);
      setLoadedData();
    }
  };

  useEffect(() => {
    if (newTopologyCreated && dropZoneRef.current) {
      dropZoneRef.current?.focus();
      setNewTopologyCreated(false);
    }
  }, [newTopologyCreated, dropZoneRef.current]);

  useEffect(() => {
    if (file != null) uploadAvatarFile(file);
  }, [isUploadForUser]);

  useEffect(() => {
    if (stationId) {
      if (isUpload && !isThumbnail) {
        uploadAvatarFile(file);
        if (setUpload) setUpload(false);
      }

      console.log(doc);

      if (isUpload && isThumbnail) {
        uploadThumbFile(file);
        if (setUpload) setUpload(false);
        if (setStartThumbnailUploading) setStartThumbnailUploading(true);
      }
    }
  }, [isUpload, file, isThumbnail, stationId]);

  const filterLoadedImage = (data) => {
    if (data === 0) return;
    let loadedURL = loadedData?.split('?')[0];
    if (data?.includes('http')) {
      const filename = loadedURL?.split('/').pop();

      if (data.includes(filename)) {
        return data;
      } else {
        return imageRef.current?.src;
      }
    } else {
      return data;
    }
  };

  return (
    <Box className={boxStyle()} style={extraStyle ? extraStyle : null}>
      {disable ? (
        <DefaultCard className={classes.dropzoneCard}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            className={classes.imageArea}
          >
            {resources ? (
              <Img
                key={new Date()}
                src={resources}
                className={classes.media1}
                loader={<LinearProgress />}
              />
            ) : (
              <React.Fragment>No Image</React.Fragment>
            )}
          </Box>
        </DefaultCard>
      ) : loadedData ? (
        <>
          <LoadingCard
            loading={loading}
            style={
              isUserInTable
                ? classes.previewUserInTable
                : type !== 'station' && type !== 'district' && type !== 'school'
                ? type === 'class' || type === 'googleClass'
                  ? doc.schemaType === 'class'
                    ? classes.halfHeightPreviewClass
                    : classes.previewClass
                  : type === 'gallery'
                  ? classes.preview3
                  : cardViewList
                  ? classes.previewCardView
                  : classes.preview1
                : classes.preview1
            }
            isShadow={false}
          >
            {cardViewList ? (
              <div>
                <img
                  ref={imageRef}
                  className={
                    isUserInTable
                      ? classes.mediaUserInTable
                      : type !== 'gallery'
                      ? cardViewList
                        ? classes.mediaforCardView
                        : doc?.schemaType === 'class'
                        ? classes.halfHeightMedia
                        : classes.media
                      : classes.media1
                  }
                  src={filterLoadedImage(assetUrl)}
                  // style={extraStyle ? extraStyle : {}}
                  alt={altText}
                  onLoad={() => {
                    if (setAvatarSize)
                      setAvatarSize({
                        w: imageRef.current.naturalWidth,
                        h: imageRef.current.naturalHeight
                      });
                    setImageSize({
                      w: imageRef.current.naturalWidth,
                      h: imageRef.current.naturalHeight
                    });
                  }}
                />
                <AltText
                  imgWidth={imageRef?.current?.naturalWidth}
                  imgHeight={imageRef?.current?.naturalHeight}
                  disable={false}
                  resources={altText}
                  onChange={(value) => changeAlt(value)}
                  type="material"
                  cardViewList={cardViewList}
                />
              </div>
            ) : (
              <img
                ref={imageRef}
                className={
                  isUserInTable
                    ? classes.mediaUserInTable
                    : type !== 'gallery'
                    ? cardViewList
                      ? classes.mediaforCardView
                      : doc?.schemaType === 'class'
                      ? classes.halfHeightMedia
                      : classes.media
                    : classes.media1
                }
                src={filterLoadedImage(assetUrl)}
                // style={extraStyle ? extraStyle : {}}
                alt={altText}
                onLoad={() => {
                  if (setAvatarSize)
                    setAvatarSize({
                      w: imageRef.current.naturalWidth,
                      h: imageRef.current.naturalHeight
                    });
                  setImageSize({
                    w: imageRef.current.naturalWidth,
                    h: imageRef.current.naturalHeight
                  });
                }}
              />
            )}
            <IconButton
              className={
                cardViewList
                  ? classes.closeButtonforCardView
                  : classes.closeButton
              }
              onClick={handleClose}
              style={
                buttonCustomize
                  ? cardViewList
                    ? { position: 'relative', top: '-58px', right: '6px' }
                    : buttonCustomize
                  : cardViewList
                  ? { position: 'relative', top: '-58px', right: '6px' }
                  : {}
              }
            >
              <Close style={{ fontSize: '0.8rem' }} />
            </IconButton>
          </LoadingCard>
        </>
      ) : (
        <Grid container direction="row" alignItems="center">
          <DefaultCard
            className={
              isUserInTable
                ? classes.dropzoneGalleryUserInTable
                : type === 'gallery'
                ? classes.dropzoneGalleryStation
                : cardViewList
                ? classes.dropzoneGalleryStation
                : doc?.schemaType === 'class' || doc?.schemaType === 'tutorial'
                ? classes.halfHeightDropzoneCard
                : classes.dropzoneCard
            }
            style={isUserInTable && { padding: 0 }}
            onDrop={handleDrop}
          >
            <DropzoneArea
              // ref={dropZoneRef}
              dropzoneText={
                title ? title : en['Drag and Drop a Logo from the Logo Gallery']
              }
              dropzoneClass={
                isUserInTable
                  ? classes.dropzoneUserInTable
                  : type !== 'gallery'
                  ? cardViewList
                    ? classes.dropzoneGallery
                    : doc?.schemaType === 'class' ||
                      doc?.schemaType === 'tutorial'
                    ? classes.halfHeightDropzoneClass
                    : classes.dropzoneClass
                  : classes.dropzoneGallery
              }
              style={{
                pointerEvents: 'none',
                cursor: 'default'
              }}
              dropzoneParagraphClass={
                isUserInTable
                  ? classes.dropzoneParagraphUser
                  : classes.dropzoneParagraph
              }
              showPreviewsInDropzone={false}
              showPreviews={false}
              acceptedFiles={acceptedFiles ? acceptedFiles : ['image/*']}
              filesLimit={1}
              maxFileSize={1024 * 1024 * 200} //240M max file size
              onChange={handleChange}
              showAlerts={false}
            />
          </DefaultCard>
        </Grid>
      )}
    </Box>
  );
};

export default AvatarUploadForm;
