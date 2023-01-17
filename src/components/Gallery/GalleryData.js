import React, { useState, useEffect } from 'react';
import WriteMode from './WriteMode';
import ReadMode from './ReadMode';

const GalleryData = (props) => {
  const [isReadMode, setIsReadMode] = useState(true);

  const onEdit = () => {
    setIsReadMode(false);
  };

  const onCancel = () => {
    setIsReadMode(true);
  };

  useEffect(() => {
    setIsReadMode(true);
  }, [props?.schemaType]);

  return (
    <>
      {isReadMode ? (
        <ReadMode
          {...props}
          onEdit={onEdit}
          onInfo={(value) => props.onInfo(value)}
        />
      ) : (
        <WriteMode {...props} onCancel={onCancel} />
      )}
    </>
  );
};

export default GalleryData;
