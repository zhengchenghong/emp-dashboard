import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, Typography } from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { getNotificationOpt } from '@app/constants/Notifications';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { validateEmail } from '@app/utils/validate';
import { useAssetContext } from '@app/providers/AssetContext';
import useStyles from './style';
import { en } from '@app/language';

const MassFileUploadForm = ({ onChange, schemaType }) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const [files, setFiles] = useState(false);
  const { convertFileToJSON } = useAssetContext();

  const genCSVData = (userTableHeader, data) => {
    const csvString = [
      [...userTableHeader],
      ...data.map((item) => userTableHeader.map((elHeader) => item[elHeader]))
    ]
      .map((e) => e.join(','))
      .join('\n');

    return csvString;
  };

  const validCsvData = (files, tableLoadData, headers) => {
    const validatedData = [];
    const invalidatedData = [];
    if (!headers.includes('phone')) {
      notify('Invalid CSV file type, CSV have to include the phone number', {
        variant: 'error'
      });
      return;
    }
    for (const obj of tableLoadData) {
      if (!obj['username/email']) {
        continue;
      }
      if (!obj['username/email']) {
        notify(`Username/Email is missing for a row in your file`, {
          variant: 'warning'
        });
        return;
      }
      // if (schemaType !== 'student') {
      //   const arrPhone = findPhoneNumbersInText(obj.phone, 'US');
      //   if (arrPhone.length === 0) {
      //     validatedData.push({
      //       ...obj,
      //       phone: null
      //     });
      //   } else {
      //     validatedData.push({
      //       ...obj,
      //       phone: arrPhone[0].number.number
      //     });
      //   }
      // } else {
      validatedData.push({
        ...obj
      });
      // }

      if (schemaType !== 'student' && obj['username/email']) {
        if (!validateEmail(obj['username/email'])) {
          invalidatedData.push(obj);
          notify(
            `In your file, ${obj['username/email']} is not a valid email`,
            {
              variant: 'warning'
            }
          );
          return;
        }
      }
    }

    // validated File logic
    const validatedCSVData = genCSVData(headers, validatedData);
    const validatedBlob = new Blob([validatedCSVData], {
      type: files[0].type
    });

    const validatedCSVFile = new File([validatedBlob], 'validated_users.csv', {
      type: files[0].type,
      lastModified: files[0].lastModified
    });
    console.log('validatedCSVData', validatedCSVData);
    onChange('upload', validatedCSVFile);

    // handling invalidated file logic
    if (invalidatedData.length > 0) {
      const invalidatedCSVData = genCSVData(headers, invalidatedData);
      const invalidatedBlob = new Blob([invalidatedCSVData], {
        type: files[0].type
      });

      var link = document.createElement('a');
      link.download = 'invalidated_users.csv';
      link.href = window.URL.createObjectURL(invalidatedBlob);
      link.click();

      const notiOps = getNotificationOpt('userupload', 'info', 'download');
      notify(notiOps.message, notiOps.options);
    }
  };

  const onDrop = useCallback(async (files) => {
    setFiles(files);
    try {
      convertFileToJSON(files[0], true)
        .then(({ result, headers }) => {
          if (headers.length > 0 && result.length > 0 && files.length > 0)
            validCsvData(files, result, headers);
        })
        .catch((error) => {
          const notiOps = getNotificationOpt('backend', 'error', 'upload');
          notify(`${error}`, notiOps.options);
        });
    } catch (error) {
      notify(error.message, { variant: 'warning' });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: '.csv'
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
