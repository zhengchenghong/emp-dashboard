import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  LinearProgress,
  Box
} from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import useStyles from './style';
import { useUserContext } from '@app/providers/UserContext';
import { Img } from 'react-image';
import { LoadingCard } from '@app/components/Cards';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import { useSmallScreen } from '@app/utils/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';

const TutorialCard = ({
  docId,
  name,
  title,
  shortDescription,
  longDescription,
  avatar_link,
  link,
  onUpdate,
  onClickMore
}) => {
  const classes = useStyles();
  const [currentUser] = useUserContext();
  const [loadedData, setLoadedData] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    setLoadedData(avatar_link);
  }, [avatar_link]);

  useEffect(() => {
    if (String(loadedData).includes('http')) {
      setLoading(true);
      getAwsFileUrl(loadedData);
    } else {
      setAssetUrl(loadedData);
    }
  }, [loadedData]);

  const getAwsFileUrl = async (loadedData) => {
    const assetUrl = await getAssetUrlFromS3(loadedData, 0);
    setAssetUrl(assetUrl);
    setLoading(false);
  };

  return (
    <Card
      className={clsx(classes.root)}
      style={{
        position: 'relative',
        paddingBottom: '30px',
        marginLeft: isSmallScreen ? 5 : 20,
        marginRight: isSmallScreen ? 5 : 20,
        marginBottom: 20,
        width: isSmallScreen ? '90%' : 375,
        maxWidth: 375
      }}
    >
      <CardContent
        className={classes.content}
        classes={{ root: classes.cardNameContainer }}
      >
        <Typography variant="h6" className={clsx(classes.cardNameStyle)}>
          <div dangerouslySetInnerHTML={{ __html: name }}></div>
        </Typography>
      </CardContent>
      <CardContent>
        {avatar_link && avatar_link !== '' && (
          <LoadingCard
            loading={loading}
            style={classes.preview2}
            isShadow={false}
          >
            <img className={classes.media} src={assetUrl} alt="" />
          </LoadingCard>
        )}

        {shortDescription != null && shortDescription !== '' && (
          <Typography
            variant="subtitle1"
            className={clsx(classes.shortDescription)}
          >
            <Box fontWeight="fontWeightBold">{shortDescription}</Box>
          </Typography>
        )}

        {longDescription != null && longDescription !== '' && (
          <Typography variant="body1" className={clsx(classes.longDescription)}>
            {longDescription}
          </Typography>
        )}

        <div
          style={{
            position: 'absolute',
            width: '100%',
            bottom: '0px',
            left: '0px'
          }}
        >
          <Typography
            variant="body2"
            color="primary"
            className={
              currentUser.schemaType === 'superAdmin' ||
              currentUser.schemaType === 'sysAdmin'
                ? clsx(classes.descriptionLeft)
                : clsx(classes.descriptionRight)
            }
            style={{ cursor: 'pointer' }}
            onClick={onClickMore}
          >
            More {`->`}
          </Typography>
          {(currentUser.schemaType === 'superAdmin' ||
            currentUser.schemaType === 'sysAdmin') && (
            <IconButton
              size="small"
              className={clsx(classes.deleteIcon)}
              onClick={() => onUpdate('delete', docId)}
            >
              <DeleteIcon />
            </IconButton>
          )}
          {(currentUser.schemaType === 'superAdmin' ||
            currentUser.schemaType === 'sysAdmin') && (
            <IconButton
              size="small"
              className={clsx(classes.editIcon)}
              onClick={() => onUpdate('edit', docId)}
            >
              <EditIcon />
            </IconButton>
          )}
          {/* {(currentUser.schemaType === 'superAdmin' ||
            currentUser.schemaType === 'sysAdmin') && (
              <IconButton size="small" className={clsx(classes.infoIcon)}
                onClick={() => onUpdate('info', docId)}>
                <FontAwesomeIcon
                  icon={faInfo}
                  size="sm"
                  style={{ cursor: 'pointer' }}
                />
              </IconButton>
            )} */}
        </div>
      </CardContent>
    </Card>
  );
};
export default TutorialCard;
