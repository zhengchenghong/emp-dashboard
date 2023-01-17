import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@material-ui/core';
import PDFReader from '@app/components/PDFReader';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';

const AttachmentPreview = ({ resources, autoPlay, resId, isPlay, setPlay }) => {
  const { type, url } = resources;
  const [assetUrl, setAssetUrl] = useState(null);
  const vidRef = useRef();

  useEffect(() => {
    getAssetUrlFromS3(url).then((res) => {
      setAssetUrl(res);
    });
  }, [type, url]);

  useEffect(() => {
    if (vidRef.current) {
      if (isPlay) {
        vidRef.current.play();
      } else {
        vidRef.current.pause();
      }
    }
  }, [resources]);

  const handleVideoPlay = () => {
    if (resId) {
      setPlay(resId);
    }
  };

  return (
    <React.Fragment>
      {type === 'video/mp4' && (
        <Box
          ref={vidRef}
          mt="2"
          borderRadius="2px"
          component="video"
          controls
          // autoPlay={true}
          playsInline={true}
          width="100%"
          src={assetUrl}
          onPlay={handleVideoPlay}
        />
      )}

      {(type === 'image/png' ||
        type === 'image/jpeg' ||
        type === 'image/bmp') && (
        <Box
          mt="2"
          borderRadius="2px"
          component="img"
          controls
          autoPlay
          width="100%"
          src={assetUrl}
        />
      )}

      {type === 'application/pdf' && (
        <Box mt="2" borderRadius="2px" component={PDFReader} url={url} />
      )}
    </React.Fragment>
  );
};

export default AttachmentPreview;
