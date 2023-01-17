import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import React, { useEffect, useState, useRef } from 'react';
// import { Img } from 'react-image';
import { CardMedia } from '@material-ui/core';

export default function AvatarImage(props) {
  const { src, style, loader } = props;
  const [imageBase64, setImageBase64] = useState();
  // const [imgLoaded, setImgLoaded] = useState(false);

  const [visible, setVisible] = useState(false);
  const placeholderRef = useRef();

  useEffect(() => {
    if (src && String(src).includes('http')) {
      getAssetUrlFromS3(src).then((res) => {
        setImageBase64(res);
      });
    } else {
      setImageBase64();
    }
  }, [src]);

  useEffect(() => {
    if (!visible && placeholderRef.current) {
      const observer = new IntersectionObserver(([{ intersectionRatio }]) => {
        if (intersectionRatio > 0) {
          setVisible(true);
        }
      });
      observer.observe(placeholderRef.current);
      return () => observer.disconnect();
    }
  }, [visible, placeholderRef]);

  return visible ? (
    <CardMedia
      style={style}
      image={imageBase64}
      loader={loader}
      component="img"
    />
  ) : (
    <div ref={placeholderRef}>{loader}</div>
  );

  // return (
  // <Img
  //   key={new Date()}
  //   src={imageBase64}
  //   style={style}
  //   // onError={(e) => {
  //   //   e.target.onerror = null;
  //   //   e.target.src = image;
  //   // }}
  //   loader={loader}
  // />
  //   <CardMedia
  //     style={style}
  //     image={imageBase64}
  //     loader={loader}
  //   />
  // );
}
