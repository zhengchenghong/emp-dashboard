import React, { useState, useEffect } from 'react';
import graphql from '@app/graphql';
import { useMutation } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import { getNotificationOpt } from '@app/constants/Notifications';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { useNotifyContext } from '@app/providers/NotifyContext';

import {
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  CardActions,
  Button
} from '@material-ui/core';
import { Img } from 'react-image';
import { getAssetUrl } from '@app/utils/functions';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import { remove } from '@app/utils/ApolloCacheManager';
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

const ReadMode = ({
  id,
  name,
  altText,
  type,
  avatarURL,
  onEdit,
  onInfo,
  tagList,
  schemaType,
  onFinish
}) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [assetUrl, setAssetUrl] = useState('');
  const [currentUser] = useUserContext();

  useEffect(() => {
    getAwsFileUrl(avatarURL);
  }, [avatarURL]);

  const getAwsFileUrl = async (avatarURL) => {
    const assetUrl = await getAssetUrlFromS3(avatarURL);
    setAssetUrl(assetUrl);
  };

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, id)
  });
  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );

  const handleDeleteDialogChange = async (type, value) => {
    try {
      if (type === 'btnClick') {
        if (!checkbox && value) {
          const notiOps = getNotificationOpt('gallery', 'warning', 'delete');
          notify(notiOps.message, notiOps.options);
          return;
        }

        if (checkbox && value) {
          await deleteDocument({
            variables: {
              id: id,
              schemaType: schemaType
            }
          });

          const assetUrl = getAssetUrl(avatarURL).split('/')[3];
          const key = avatarURL.split(assetUrl)[1].slice(1);
          await deleteAssetS3Grouping({
            variables: {
              bucket: assetUrl,
              key: key
            }
          });

          onFinish();
          const notiOps = getNotificationOpt('gallery', 'success', 'delete');
          notify(notiOps.message, notiOps.options);
        }
        setCheckbox(false);
        setOpenDelete(false);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('gallery', 'error', 'delete');
      notify(notiOps.message, notiOps.options);
    }
  };

  return (
    <>
      <Card className={classes.root}>
        {/* <CardActionArea>
          <CardMedia
            component="img"
            alt={altText}
            height="140"
            image={assetUrl}
            title={name}
            classes={{ img: classes.image }}
          />
        </CardActionArea> */}
        <div style={{ width: '100%', height: 140 }}>
          <Img
            src={assetUrl}
            key={assetUrl}
            className={classes.image}
            style={{ width: '100%', height: 140 }}
          />
        </div>

        <CardContent>
          <Typography variant="h5">{name}</Typography>
          <Grid container className={classes.spaceTop10}>
            <Typography variant="h6" className={classes.title}>
              {en['Alt Text']}:
            </Typography>
            <Typography variant="h6" style={{ marginLeft: 5 }}>
              {altText}
            </Typography>
          </Grid>
          <Grid container>
            <Typography variant="h6" className={classes.title}>
              {en['Type']}:
            </Typography>
            <Typography variant="h6" style={{ marginLeft: 5 }}>
              {type}
            </Typography>
          </Grid>
          <Grid container>
            <Typography variant="h6" className={classes.title}>
              {en['Tags']}:
            </Typography>
            <Typography variant="h6" style={{ marginLeft: 5 }}>
              {tagList != null ? tagList.join(', ') : ''}
            </Typography>
          </Grid>
          {/* <Typography color="primary" variant="body1" className={classes.url}>
            {avatarURL}
          </Typography> */}
        </CardContent>

        <CardActions style={{ justifyContent: 'space-between' }}>
          <Button color="default" onClick={() => setOpenDelete(true)}>
            {en['DELETE']}
          </Button>
          <Button color="secondary" onClick={() => onEdit()}>
            {en['EDIT']}
          </Button>
          {currentUser?.schemaType === 'superAdmin' && (
            <Button color="default" onClick={() => onInfo(id)}>
              {en['INFO']}
            </Button>
          )}
        </CardActions>
      </Card>
      <CustomDialog
        open={openDelete}
        title={en['Do you want to delete this gallery?']}
        mainBtnName={en['Remove']}
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">
          {en['This action will remove all info related to current gallery.']}
        </Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
    </>
  );
};

export default ReadMode;
