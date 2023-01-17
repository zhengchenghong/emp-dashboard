/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useStyles } from './style';
import Tooltip from '@material-ui/core/Tooltip';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Close } from '@material-ui/icons';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import { en } from '@app/language';
import { useMediumScreen } from '@app/utils/hooks';
import SwipeableViews from 'react-swipeable-views';
import { virtualize } from 'react-swipeable-views-utils';
import { mod } from 'react-swipeable-views-core';
import { autoPlay } from 'react-swipeable-views-utils';

const ConvertImage = ({ avatar, style }) => {
  const [signedURL, setSignedURL] = useState(null);

  useEffect(() => {
    async function getSignedUrl() {
      if (avatar?.baseUrl && avatar?.fileName) {
        const { baseUrl, fileDir, fileName } = avatar;
        let res = await getAssetUrlFromS3(`${baseUrl}${fileDir}${fileName}`);
        setSignedURL(res);
      }
    }
    if (!signedURL?.includes(avatar.fileName)) {
      getSignedUrl();
    }
    return () => {
      setSignedURL(null);
    };
  }, [avatar]);

  return (
    <>
      {avatar?.fileName && (
        <img className={style} src={signedURL} alt={avatar?.altText || ''} />
      )}
    </>
  );
};

const SystemNotifcation = ({ list, onClose }) => {
  const classes = useStyles();
  const isMediumScreen = useMediumScreen();
  const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
  const VirtualizeSwipeableViews = virtualize(AutoPlaySwipeableViews);

  const slideRenderer = (params) => {
    const { index, key } = params;
    let totalCount = list?.length;
    let messageIndex = mod(index, totalCount);
    let item = list[messageIndex];
    return (
      <div key={key}>
        {isMediumScreen ? (
          <Tooltip
            title={
              <div>
                {item?.desc?.title || en['Notification with no title']}
                <br />
                {item?.desc?.short || ''}
                <br />
                <span style={{ color: 'yellow' }}>
                  {item?.desc?.long || ''}
                </span>
              </div>
            }
            classes={{ tooltip: classes.tooltip }}
          >
            <div key={`slide-${index}`} style={{ background: 'white' }}>
              <div
                className={classes.container}
                style={{
                  background: item?.data?.styles?.bg
                }}
              >
                <div className={classes.emptyDiv} />
                <div className={classes.subContainer}>
                  <ConvertImage avatar={item?.avatar} style={classes.image} />
                  <span
                    className={classes.title}
                    style={{ color: item?.data?.styles?.fg }}
                  >
                    {item?.desc?.title || en['Notification with no title']}
                  </span>
                  <span
                    className={classes.short}
                    style={{ color: item?.data?.styles?.fg }}
                  >
                    {item?.desc?.short ? `- ${item?.desc?.short}` : ''}
                  </span>
                </div>
                <div className={classes.closeButton} onClick={onClose}>
                  <Close style={{ fontSize: '0.8rem' }} />
                </div>
              </div>
            </div>
          </Tooltip>
        ) : (
          <div
            className={classes.container}
            style={{ background: item?.data?.styles?.bg, display: 'flex' }}
          >
            <div className={classes.emptyDiv} />
            <div className={classes.subContainer}>
              <ConvertImage avatar={item?.avatar} style={classes.image} />
              <span
                className={classes.title}
                style={{ color: item?.data?.styles?.fg }}
              >
                {item?.desc?.title || en['Notification with no title']}
              </span>
              <Tooltip
                title={item?.desc?.long || ''}
                arrow
                classes={{ tooltip: classes.tooltip }}
              >
                <span
                  className={classes.short}
                  style={{ color: item?.data?.styles?.fg }}
                >
                  {item?.desc?.short ? `- ${item?.desc?.short}` : ''}
                </span>
              </Tooltip>
            </div>
            <div className={classes.closeButton} onClick={onClose}>
              <Close style={{ fontSize: '0.8rem' }} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return useMemo(() => {
    return (
      <div>
        <VirtualizeSwipeableViews
          enableMouseEvents
          slideRenderer={slideRenderer}
          autoplay={true}
          direction={'incremental'}
          interval={10000}
        />
      </div>
    );
  }, [list]);
};

export default SystemNotifcation;
