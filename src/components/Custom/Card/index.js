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
import { DefaultCard, LoadingCard } from '@app/components/Cards';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSmallScreen } from '@app/utils/hooks';

const CustomCard = ({
  resource,
  docId,
  name,
  title,
  shortDescription,
  longDescription,
  avatar_link,
  link,
  onClick,
  onUpdate,
  onClickMore
}) => {
  const classes = useStyles();
  const [currentUser] = useUserContext();
  const [loadedData, setLoadedData] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    setLoadedData(avatar_link);
  }, [avatar_link]);

  useEffect(() => {
    if (String(loadedData).includes('http')) {
      getAwsFileUrl(loadedData);
    } else {
      setAssetUrl(loadedData);
    }
  }, [loadedData]);

  const getAwsFileUrl = async (loadedData) => {
    const assetUrl = await getAssetUrlFromS3(loadedData, 0);
    setAssetUrl(assetUrl);
  };

  const handleClick = () => {
    onClick('cardClick', resource);
  };

  return (
    <Card
      className={clsx(classes.root)}
      style={{
        position: 'relative',
        paddingBottom: '30px',
        margin: isSmallScreen ? '10px 0px 10px' : 10
      }}
      onClick={handleClick}
    >
      <CardContent
        className={classes.content}
        style={{ height: isSmallScreen ? 40 : 70 }}
        classes={{ root: classes.cardNameContainer }}
      >
        {avatar_link && avatar_link !== '' && (
          <LoadingCard style={classes.preview2} isShadow={false}>
            <img
              className={classes.media}
              style={{
                width: isSmallScreen ? '40px' : '70px',
                height: isSmallScreen ? '40px' : '70px'
              }}
              src={assetUrl}
              alt=""
            />
          </LoadingCard>
        )}
        <Typography
          variant={isSmallScreen ? 'subtitle1' : 'h6'}
          className={clsx(classes.cardNameStyle)}
          style={{ left: isSmallScreen ? 50 : 95 }}
        >
          <div dangerouslySetInnerHTML={{ __html: name }}></div>
        </Typography>
        {(currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'sysAdmin') && (
          <IconButton size="small" className={clsx(classes.editIcon)}>
            <EditIcon onClick={() => onUpdate('edit', resource)} />
          </IconButton>
        )}
      </CardContent>

      <CardContent style={{ paddingBottom: 44 }}>
        {/* {title && title !== '' && (
          <Typography variant="h6">
            <Box className={clsx(classes.titleStyle)}>{title}</Box>
          </Typography>
        )} */}

        {/* {avatar_link && avatar_link !== '' && (
          <LoadingCard style={classes.preview2} isShadow={false}>
            <img className={classes.media} src={assetUrl} alt="" />
          </LoadingCard>
        )} */}

        {shortDescription != null && shortDescription !== '' && (
          <Typography
            variant={isSmallScreen ? 'subtitle2' : 'subtitle1'}
            className={clsx(classes.shortDescription)}
          >
            <Box fontWeight="fontWeightBold">{shortDescription}</Box>
          </Typography>
        )}

        {longDescription != null && longDescription !== '' && (
          <Typography
            variant={isSmallScreen ? 'body2' : 'body1'}
            className={clsx(classes.longDescription)}
          >
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
            style={{
              cursor: 'pointer',
              fontSize: isSmallScreen ? '16px' : '20px',
              fontWeight: isSmallScreen ? '600' : '600',
              borderBottom: '2px solid #3f51b5',
              marginTop: '12px'
            }}
            onClick={() => onUpdate('btnClick', resource)}
          >
            Collections and Lessons
            <FontAwesomeIcon
              icon={faAngleRight}
              size="lg"
              style={{
                animationDirection: 'alternate-reverse',
                cursor: 'pointer',
                marginLeft: 6
              }}
            />
          </Typography>
          {/* {(currentUser.schemaType === 'superAdmin' ||
            currentUser.schemaType === 'sysAdmin') && (
            <IconButton size="small" className={clsx(classes.deleteIcon)}>
              <DeleteIcon onClick={() => onUpdate('delete', resource)} />
            </IconButton>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
};
export default CustomCard;
