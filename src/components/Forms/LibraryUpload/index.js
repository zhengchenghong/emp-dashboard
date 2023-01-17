/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import UploadForm from './Upload';
import PreviewForm from './Preview';

const LibraryUploadForm = ({ onChange, schemaType }) => {
  const [loadedFile, setLoadedFile] = useState();

  useEffect(() => {
    setLoadedFile();
  }, []);

  const handleFormChange = (type, value) => {
    if (type === 'upload') {
      setLoadedFile(value);
      onChange(value);
    }
    if (type === 'clear') {
      setLoadedFile();
      onChange('clear');
    }
  };

  return (
    <React.Fragment>
      {loadedFile ? (
        <PreviewForm resources={loadedFile} onChange={handleFormChange} />
      ) : (
        <UploadForm onChange={handleFormChange} schemaType={schemaType} />
      )}
    </React.Fragment>
  );
};

export default LibraryUploadForm;
