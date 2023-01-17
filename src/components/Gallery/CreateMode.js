import React, { useState, useEffect } from 'react';
import graphql from '@app/graphql';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { CustomInput } from '@app/components/Custom';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  CardActions,
  Button,
  Box,
  CircularProgress
} from '@material-ui/core';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { getUUID } from '@app/utils/functions';
import { create } from '@app/utils/ApolloCacheManager';
import { AvatarUploadForm, MultiTagsForm } from '@app/components/Forms';
import { en } from '@app/language';
import { useUserContext } from '@app/providers/UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    width: '100%',
    marginTop: 10
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
    color: theme.palette.common.blue
  },
  input: {
    width: '100%',
    marginTop: 5
  },
  info: {
    marginTop: 25
  },
  saveButton: {
    color: '#1aba6a'
  },
  uploadFromContainer: {
    marginTop: '20px',
    marginLeft: '25px',
    marginRight: '25px'
  }
}));

const CreateMode = (props) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const { onCancel, schemaType, onFinish } = props;
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [altText, setAltText] = useState('');
  const [avatarURL, setAvatarURL] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [doc, setDoc] = useState();
  const [avatarSize, setAvatarSize] = useState();
  const [thumbnailFile, setThumbnailFile] = useState();
  const [tagsData, setTagsData] = useState([]);

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    // update: create
  });

  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [isThumbnailAttached, setThumbnailAttached] = useState(false);
  const [isThumbnailUpload, setThumbnailUpload] = useState(false);
  const [startAvatarUploading, setStartAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser] = useUserContext();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSave();
    }
  };

  const onSave = async () => {
    try {
      if (!name) {
        notify(en['Name is required!'], {
          variant: 'error'
        });
        return;
      }

      if (!isAvatarAttached) {
        notify(en['Please attache Avatar!'], {
          variant: 'error'
        });
        return;
      }

      if (!isThumbnailAttached) {
        notify(en['Please attach Thumbnail!'], {
          variant: 'error'
        });
        return;
      }
      setLoading(true);
      const res = await createGrouping({
        variables: {
          schemaType: schemaType,
          version: 1,
          name: name,
          trackingAuthorName: currentUser?.name,
          tagList: tagsData,
          avatar: {
            uId: getUUID(),
            type: 'avatar',
            data: {
              imageSize: avatarSize
            }
          }
        }
      });

      if (res && res.data) {
        setDoc(res.data.createGrouping);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('backend', 'error', 'update');
      notify(error.message, notiOps.options);
    }
  };

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

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      console.log('avatar attached');
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarURL();
      console.log('avatar dettached');
    }
  };

  const handleOnThumbnailChange = (value, file) => {
    if (value === 'fileAttached') {
      setThumbnailAttached(true);
      setThumbnailFile(file);
      console.log('Thumbnail attached', thumbnail);
    } else if (value === 'fileRemoved') {
      setThumbnailAttached(false);
      setThumbnailFile();
      setThumbnail();
      console.log('Thumbnail dattached');
    }
  };

  useEffect(() => {
    if (doc && isAvatarAttached && isThumbnailAttached) {
      setAvatarUpload(true);
      setAvatarAttached(false);
      setThumbnailUpload(true);
      setThumbnailAttached(false);
    }
  }, [doc]);

  useEffect(() => {
    console.log('startAvatarUploading:', startAvatarUploading);
    if (startAvatarUploading) {
      setStartAvatarUploading(false);
      setLoading(false);
      onCancel();
    }
  }, [startAvatarUploading]);

  return (
    <Card className={classes.root}>
      <Box className={classes.uploadFromContainer}>
        <AvatarUploadForm
          acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
          resources={avatarURL}
          stationId={'galleries'}
          hideArrow={true}
          title={getAvatarTitle(schemaType)}
          gallerySchemaType={schemaType}
          onChange={(value) => handleOnAvatarChange(value)}
          setStartAvatarUploading={setStartAvatarUploading}
          buttonCustomize={{ top: '0px', right: '0px' }}
          type="gallery"
          isIcon={false}
          docId={doc?._id}
          isUpload={isAvatarUpload}
          doc={doc}
          setUpload={setAvatarUpload}
          altText={altText}
          galleryTypeText={type}
          setAvatarSize={setAvatarSize}
          thumbnailFile={thumbnailFile}
        />
        <div style={{ marginTop: '20px' }} />
      </Box>

      <Box className={classes.uploadFromContainer}>
        <AvatarUploadForm
          acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
          resources={thumbnail}
          hideArrow={true}
          stationId={'galleries'}
          title={`Drag and Drop the Thumbnail`}
          gallerySchemaType={schemaType}
          onChange={(value, file) => handleOnThumbnailChange(value, file)}
          buttonCustomize={{ top: '0px', right: '0px' }}
          type="gallery"
          isIcon={false}
          isThumbnail={true}
          docId={doc?._id}
          isUpload={isThumbnailUpload}
          doc={doc}
          setUpload={setThumbnailUpload}
          altText={altText}
          galleryTypeText={type}
        />
        <div style={{ marginTop: '20px' }} />
      </Box>
      <CardContent className={classes.info}>
        <Typography variant="h5">
          <CustomInput
            label="name"
            type="text"
            variant="outlined"
            size="small"
            autoFocus={true}
            resources={name}
            style={classes.input}
            onChange={(value) => setName(value)}
            onKeyDown={(e) => handleKeyPress(e)}
          />
        </Typography>
        <Grid container>
          <CustomInput
            label="altText"
            type="text"
            variant="outlined"
            size="small"
            autoFocus={false}
            resources={altText}
            style={classes.input}
            onChange={(value) => setAltText(value)}
            onKeyDown={(e) => handleKeyPress(e)}
          />
        </Grid>
        <Grid container>
          <CustomInput
            label="type"
            type="text"
            variant="outlined"
            size="small"
            autoFocus={false}
            resources={type}
            style={classes.input}
            onChange={(value) => setType(value)}
            onKeyDown={(e) => handleKeyPress(e)}
          />
        </Grid>
        <Grid container>
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
        <Typography color="primary" variant="body1" className={classes.url}>
          {avatarURL}
        </Typography>
      </CardContent>

      <CardActions style={{ justifyContent: 'space-between' }}>
        <Button color="default" onClick={() => onCancel()}>
          {en['CANCEL']}
        </Button>
        <Button
          onClick={() => onSave()}
          className={classes.saveButton}
          disabled={loading}
        >
          {loading ? <CircularProgress size={30} my={5} /> : en['SAVE']}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CreateMode;
