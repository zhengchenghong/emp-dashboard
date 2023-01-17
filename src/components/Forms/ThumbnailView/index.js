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

const ThumbnailView = ({ disable, resources, cardViewList }) => {
  const [loading, setLoading] = useState(false);
  const [assetUrl, setAssetUrl] = useState('');
  const [loadedData, setLoadedData] = useState();

  const classes = useStyles();
  const imageRef = useRef();

  useEffect(() => {
    setLoadedData(resources);
  }, [resources]);

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

  const filterLoadedImage = (data) => {
    if (data === 0) return;
    if (typeof loadedData !== 'string') return;
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

  return assetUrl ? (
    <LoadingCard
      loading={loading}
      style={assetUrl ? classes.previewCardView : classes.previewCardView1}
      isShadow={false}
    >
      <img
        ref={imageRef}
        className={cardViewList ? classes.mediaforCardView : classes.media}
        src={filterLoadedImage(assetUrl)}
        // style={extraStyle ? extraStyle : {}}
        alt=""
      />
    </LoadingCard>
  ) : (
    <LoadingCard
      loading={loading}
      style={assetUrl ? classes.previewCardView : classes.previewCardView1}
      isShadow={false}
    >
      <div
        className={cardViewList ? classes.mediaforCardView : classes.media}
      ></div>
    </LoadingCard>
  );
};

export default ThumbnailView;
