import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Button,
  CircularProgress
} from '@material-ui/core';
import { useStyles } from './style';
import { en } from '@app/language';

const CreateDeviceDialog = ({
  open,
  onChange,
  doc,
  isUserCreating,
  setUserCreating
}) => {
  const classes = useStyles();
  const nameRef = useRef();

  const [name, setName] = useState();
  const [modelMake, setModelMake] = useState();
  const [modelNumber, setModelNumber] = useState();
  const [serialNumber, setSerialNumber] = useState();
  const [wifiPassword, setWifiPassword] = useState();
  const [parentId, setParentId] = useState();
  const [error, setError] = useState(false);

  useEffect(() => {
    setName();
    setModelMake();
    setModelNumber();
    setSerialNumber();
    setWifiPassword();
  }, [open]);

  useEffect(() => {
    if (doc) {
      setParentId(doc?.topology?.station);
    }
  }, [doc]);

  const handleClose = () => {
    onChange(false);
    setParentId();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChange();
    }
  };

  const handleChange = () => {
    if (nameRef.current.reportValidity()) {
      setError(false);
      setUserCreating(true);
      onChange(true, {
        name: serialNumber,
        desc: {
          title: (modelMake ?? '') + ':' + (modelNumber ?? ''),
          short: name,
          long: wifiPassword
        },
        parentId: parentId ?? doc?.topology?.station,
        status: 'created',
        topology: {
          state: doc?.topology?.state,
          station: doc?.topology?.station
        }
      });
    } else {
      setError(true);
    }
  };
  return (
    <>
      <Dialog
        maxWidth="xs"
        onClose={handleClose}
        open={open}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.dialogTitle} onClose={handleClose}>
          Add a new Device
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label={en['Manufacturer']}
            className={classes.createInput}
            onChange={(e) => setName(e.target.value)}
            value={name}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="Make"
            className={classes.createInput}
            onChange={(e) => setModelMake(e.target.value)}
            value={modelMake}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label={en['Model']}
            className={classes.createInput}
            onChange={(e) => setModelNumber(e.target.value)}
            value={modelNumber}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            inputRef={nameRef}
            label="Serial Number"
            className={classes.createInput}
            onChange={(e) => setSerialNumber(e.target.value)}
            value={serialNumber}
            onKeyDown={(e) => handleKeyPress(e)}
            // inputRef={input => input && input.focus()}
            helperText={error ? 'Serial Number is required!' : ''}
            required
          />
          <TextField
            label="WiFi Password"
            className={classes.createInput}
            onChange={(e) => setWifiPassword(e.target.value)}
            value={wifiPassword}
            onKeyDown={(e) => handleKeyPress(e)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={handleChange}
            className={classes.dialogAddBtn}
            variant={'contained'}
            disabled={isUserCreating}
          >
            {isUserCreating ? <CircularProgress size={25} my={5} /> : 'Save'}
          </Button>
          <Button
            autoFocus
            onClick={() => onChange(false)}
            className={classes.dialogAddBtn}
            variant={'contained'}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateDeviceDialog;
