import React, { useCallback } from 'react';
import clsx from 'clsx';
import { Box, Typography } from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { useNotifyContext } from '@app/providers/NotifyContext';
import useStyles from './style';
import { en } from '@app/language';

const MassFileUploadForm = ({ onChange, schemaType }) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();

  const convertFileToJSON = (file) =>
    new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = (evt) => {
        const lines = evt.target.result.split('\n');
        const result = [];
        let headers = lines[0].split(',');
        headers = headers.map((el) => el.trim());

        for (let i = 1; i < lines.length; i++) {
          let obj = {};
          const currentline = lines[i].split(',');

          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }

          result.push(obj);
        }
        resolve({ result, headers });
      };
      fileReader.readAsText(file);
    });

  const genCSVData = (headers, data) => {
    const csvString = [
      [...headers],
      ...data.map((item) => headers.map((elHeader) => item[elHeader]))
    ]
      .map((e) => e.join(','))
      .join('\n');

    return csvString;
  };

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const onDrop = useCallback(async (files) => {
    try {
      onChange('upload', files[0]);
    } catch (error) {
      console.log(error.message);
      notify(error.message, { variant: 'warning' });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  });

  return (
    <Box
      {...getRootProps()}
      className={clsx(classes.dropzone, {
        [classes.dropzone]: !isDragActive,
        [classes.dropzoneDragging]: isDragActive
      })}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <Typography variant="subtitle1" className={classes.dropzoneParagraph}>
          {en['Drop the file here']} ...
        </Typography>
      ) : (
        <Typography variant="subtitle1" className={classes.dropzoneParagraph}>
          {en['Upload the file']}
        </Typography>
      )}
    </Box>
  );
};

export default MassFileUploadForm;
