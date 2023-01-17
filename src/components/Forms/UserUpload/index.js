/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import UploadForm from './Upload';
import PreviewForm from './Preview';
import { en } from '@app/language';

const UserUploadForm = ({ onChange, schemaType }) => {
  const [loadedFile, setLoadedFile] = useState();

  useEffect(() => {
    setLoadedFile();
  }, []);

  const handleFormChange = (type, value) => {
    console.log(type, value);
    if (type === 'upload') {
      setLoadedFile(value);
      onChange(value);
    }
    if (type === 'clear') {
      setLoadedFile();
      onChange('clear');
    }
  };

  const handleDownload = () => {
    const elDom = document.createElement('a');
    elDom.setAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1jWzvLgRDXl2tRygpEXjKR0h84e09AzMv'
    );
    elDom.setAttribute('download', '');
    elDom.setAttribute('rel', 'noopener noreferrer');
    elDom.click();
  };

  return (
    <React.Fragment>
      {loadedFile ? (
        <PreviewForm onChange={handleFormChange} />
      ) : (
        <UploadForm onChange={handleFormChange} schemaType={schemaType} />
      )}
      <Box mt={2} textAlign="center">
        <Typography variant="subtitle1">
          {en['Before uploading your document, please check the demo document']}{' '}
          &nbsp;
          <Link onClick={handleDownload}>{en['here.']}</Link>
          <br />
          <br />
          {
            en[
              'Note: If you are using Excel to generate the data make sure column D'
            ]
          }
          (phone) <br />
          {
            en[
              'is formatted for text and you include the + sign and country code'
            ]
          }
          +12223334444
        </Typography>
      </Box>
    </React.Fragment>
  );
};

export default UserUploadForm;
