import React, { useState, useEffect } from 'react';
import graphql from '@app/graphql';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { AvatarUploadForm, MultiTagsForm } from '@app/components/Forms';
import { getNotificationOpt } from '@app/constants/Notifications';
import { CustomInput } from '@app/components/Custom';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  CardActions,
  Button
} from '@material-ui/core';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { getAssetUrl, getUUID } from '@app/utils/functions';
import { update } from '@app/utils/ApolloCacheManager';
import { en } from '@app/language';
import { useUserContext } from '@app/providers/UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    width: '100%',
    marginTop: 20
  },
  media: {
    height: 140
  },
  spaceTop10: {
    marginTop: 10
  },
  spaceTop5: {
    marginTop: 5
  },
  image: {
    objectFit: 'contain'
  },
  title: {
    color: theme.palette.blueGrey['800']
  },
  url: {
    marginTop: 10,
    color: theme.palette.common.blue,
    wordBreak: 'break-word'
  },
  input: {
    width: '100%',
    marginTop: 5
  }
}));

const getAvatarTitle = (schemaType) => {
  const titles = {
    stockLogo: 'Drag and Drop the Logo',
    stockBanner: 'Drag and Drop the Banner',
    stockAvatar: 'Drag and Drop the Avatar',
    stockImage: 'Drag and Drop the Image'
  };

  if (titles[schemaType]) {
    return titles[schemaType];
  } else {
    return 'Drag and Drop the Image';
  }
};

const WriteMode = (props) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const { onCancel, id, schemaType, version, onFinish } = props;
  const [name, setName] = useState(() => props?.name);
  const [type, setType] = useState(() => props?.type);
  const [altText, setAltText] = useState(() => props?.altText);
  const [avatarURL, setAvatarURL] = useState(() => props?.avatarURL);
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [thumbnail, setThumbnail] = useState(() => props.thumbnailURL);

  const [isThumbnailAttached, setThumbnailAttached] = useState(false);
  const [isThumbnailUpload, setThumbnailUpload] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState();

  const [avatarSize, setAvatarSize] = useState();
  const [tagsData, setTagsData] = useState(props?.tagList);
  const [currentUser] = useUserContext();

  const [startAvatarUploading, setStartAvatarUploading] = useState(false);
  const [startThumbnailUploading, setStartThumbnailUploading] = useState(false);

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });
  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSave();
    }
  };

  const onSave = async () => {
    try {
      if (!name) {
        const notiOps = getNotificationOpt('extra', 'error', 'name');
        notify(notiOps.message, notiOps.options);
        return;
      }

      if ((!avatarURL || !avatarURL.includes('http')) && !isAvatarAttached) {
        notify('Avatar Image is not attached!', {
          variant: 'error'
        });
        return;
      }

      if ((!thumbnail || !thumbnail.includes('http')) && !isThumbnailAttached) {
        notify(en['Please attach Thumbnail!'], {
          variant: 'error'
        });
        return;
      }

      const url = avatarURL ? avatarURL : props.avatarURL;
      const paths = url.split('/');
      const fileName = paths[paths.length - 1];

      let baseUrl = url.split('galleries')[0];
      let fileDir = `galleries/${paths[paths.length - 2]}/`;

      let mimetype = 'image/png';
      if (url.toLowerCase().endsWith('png')) {
        mimetype = 'image/png';
      } else {
        mimetype = 'image/jpeg';
      }

      const {
        name: oldName,
        type: oldType,
        altText: oldAltText,
        tagList: oldTagsData,
        avatarURL: oldAvatarUrl,
        thumbnailURL: oldThumbnail
      } = props;
      let isChanged = false;
      let variables = {
        id: id,
        schemaType: schemaType,
        version: version
      };

      if (name !== oldName) {
        variables = {
          ...variables,
          name
        };
        isChanged = true;
      }

      if (oldTagsData != null || tagsData != null) {
        if (tagsData?.length !== oldTagsData?.length) {
          variables = {
            ...variables,
            tagList: tagsData
          };
          isChanged = true;
        } else {
          if (tagsData?.length > 0 && oldTagsData?.length > 0) {
            let isNotEqual = false;
            for (let i = 0; i < tagsData?.length; i++) {
              if (tagsData[i] !== oldTagsData[i]) {
                isNotEqual = true;
                break;
              }
            }
            if (isNotEqual) {
              variables = {
                ...variables,
                tagList: tagsData
              };
              isChanged = true;
            }
          }
        }
      }

      const avatar = {
        uId: getUUID(),
        type: type,
        fileName,
        fileDir,
        baseUrl,
        altText: altText,
        thumbnail: thumbnail,
        mimeType: mimetype,
        status: 'ready',
        data: {
          imageSize: avatarSize
        }
      };

      if (
        avatarURL !== oldAvatarUrl ||
        type !== oldType ||
        altText !== oldAltText
      ) {
        variables = {
          ...variables,
          avatar
        };
        isChanged = true;
      }

      if (thumbnail !== oldThumbnail) {
        isChanged = true;
      }

      variables = {
        ...variables,
        trackingAuthorName: currentUser?.name
      };

      if (isChanged) {
        await updateGrouping({ variables });
        if (isAvatarAttached) {
          setAvatarUpload(true);
          setAvatarAttached(false);
        }
        if (isThumbnailAttached) {
          setThumbnailUpload(true);
          setThumbnailAttached(false);
        } else {
          onCancel();
          onFinish();
          const notiOps = getNotificationOpt('gallery', 'success', 'update');
          notify(notiOps.message, notiOps.options);
        }

        if (!avatarURL) {
          const assetUrl = getAssetUrl(props.avatarURL).split('/')[3];
          if (assetUrl) {
            const key = props.avatarURL.split(assetUrl)[1].slice(1);
            if (key) {
              try {
                await deleteAssetS3Grouping({
                  variables: {
                    bucket: assetUrl,
                    key: key
                  }
                });
              } catch (err) {
                console.log(err);
              }
            }
          }
        }

        // if (!thumbnail) {
        //   const assetUrl = getAssetUrl(props.thumbnailURL).split('/')[3];
        //   if (assetUrl) {
        //     const key = props.thumbnailURL.split(assetUrl)[1].slice(1);
        //     if (key) {
        //       try {
        //         await deleteAssetS3Grouping({
        //           variables: {
        //             bucket: assetUrl,
        //             key: key
        //           }
        //         });
        //       } catch (err) {
        //         console.log(err);
        //       }
        //     }
        //   }
        // }
      } else {
        onCancel();
        onFinish();
      }
    } catch (error) {
      console.log(error.message);
      if (!isAvatarAttached) {
        const notiOps = getNotificationOpt('backend', 'error', 'update');
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      console.log('avatar attached');
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarURL();
      console.log('avatar dettached');
    } else if (value === 'save') {
      onCancel();
    }
  };

  const handleOnThumbnailChange = (value, file) => {
    if (value === 'fileAttached') {
      setThumbnailAttached(true);
      setThumbnailFile(file);
      console.log('Thumbnail attached', thumbnail);
    } else if (value === 'fileRemoved') {
      setThumbnailAttached(false);
      setThumbnail();
      setThumbnailFile();
      console.log('Thumbnail dattached');
    }
  };

  useEffect(() => {
    if (startAvatarUploading) {
      setStartAvatarUploading(false);
      onCancel();
    }
  }, [startAvatarUploading]);

  useEffect(() => {
    if (startThumbnailUploading) {
      setStartThumbnailUploading(false);
      onCancel();
    }
  }, [startThumbnailUploading]);

  return (
    <Card className={classes.root}>
      <AvatarUploadForm
        acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
        resources={avatarURL}
        hideArrow={true}
        title={getAvatarTitle(schemaType)}
        onChange={(value) => handleOnAvatarChange(value)}
        extraStyle={{ margin: '16px 16px 0 16px' }}
        buttonCustomize={{ top: '0px', right: '0px' }}
        isUpload={isAvatarUpload}
        type="gallery"
        gallerySchemaType={schemaType}
        setStartAvatarUploading={setStartAvatarUploading}
        setUpload={setAvatarUpload}
        docId={props.id}
        doc={props}
        altText={altText}
        galleryTypeText={type}
        setAvatarSize={setAvatarSize}
        thumbnailFile={thumbnailFile}
      />

      <AvatarUploadForm
        acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
        resources={thumbnail}
        hideArrow={true}
        title={`Drag and Drop the Thumbnail`}
        gallerySchemaType={schemaType}
        onChange={(value, file) => handleOnThumbnailChange(value, file)}
        setStartThumbnailUploading={setStartThumbnailUploading}
        buttonCustomize={{ top: '0px', right: '0px' }}
        extraStyle={{ margin: '16px 16px 0 16px' }}
        type="gallery"
        isIcon={false}
        isThumbnail={true}
        docId={props.id}
        isUpload={isThumbnailUpload}
        doc={props}
        setUpload={setThumbnailUpload}
        altText={altText}
        galleryTypeText={type}
      />

      <CardContent>
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Grid item xs={12}>
            <Typography variant="h5">
              <CustomInput
                label="name"
                type="text"
                variant="outlined"
                size="small"
                resources={name}
                style={classes.input}
                onChange={(value) => setName(value)}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <CustomInput
              label="altText"
              type="text"
              variant="outlined"
              size="small"
              resources={altText}
              style={classes.input}
              onChange={(value) => setAltText(value)}
              onKeyDown={(e) => handleKeyPress(e)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomInput
              label="type"
              type="text"
              variant="outlined"
              size="small"
              resources={type}
              style={classes.input}
              onChange={(value) => setType(value)}
              onKeyDown={(e) => handleKeyPress(e)}
            />
          </Grid>
          <Grid item xs={12} style={{ paddingTop: 8 }}>
            <MultiTagsForm
              disable={false}
              resources={tagsData}
              isGallery={true}
              onChange={(value) => setTagsData(value)}
              disableGray={true}
              hint={en['Tags'] + '...'}
              title={en['Tags']}
            />
          </Grid>
        </Grid>
        {/* <Typography color="primary" variant="body1" className={classes.url}>
          {avatarURL}
        </Typography> */}
      </CardContent>

      <CardActions
        style={{
          justifyContent: 'space-between',
          padding: '0px 16px 0px 16px'
        }}
      >
        <Button color="default" onClick={() => onCancel()}>
          {en['CANCEL']}
        </Button>
        <Button color="secondary" onClick={() => onSave()}>
          {en['SAVE']}
        </Button>
      </CardActions>
    </Card>
  );
};

export default WriteMode;
