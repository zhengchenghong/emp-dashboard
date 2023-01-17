import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Button,
  Select,
  InputLabel,
  MenuItem,
  DialogContentText,
  FormControl
} from '@material-ui/core';
import { useInput } from '@app/utils/hooks/form';
import { ImageList } from '@app/components/GalleryPanel';
import { AvatarUploadForm } from '@app/components/Forms';
import { useGalleryContext } from '@app/providers/GalleryContext';
import useStyles from './style';
import { en } from '@app/language';

const ConfirmDialogue = (props) => {
  const classes = useStyles();
  const { onClose, open, onYes, onNo } = props;

  return (
    <Dialog
      aria-labelledby="confirm-dialog-title"
      open={open}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogTitle id="confirm-dialog-title">Save your changes</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Will you discard your current changes?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onYes} color="default">
          Discard
        </Button>
        <Button onClick={onNo} color="primary" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const dropDownLabel = (type) => {
  const label = {
    student: 'district',
    educator: 'district',
    districtAdmin: 'district',
    schoolAdmin: 'school',
    stationAdmin: 'station'
  };
  return label[type];
};

const CreateUserDialog = ({
  open,
  type,
  onChange,
  hasTypeField,
  userTypeData
}) => {
  const classes = useStyles();
  const nameRef = useRef();
  const [closePrompt, setClosePrompt] = useState(false);
  const {
    value: name,
    setValue: setName,
    reset: resetName,
    bind: bindName
  } = useInput('');

  useEffect(() => {
    resetName();
    setTimeout(() => {
      nameRef.current && nameRef.current.focus();
    }, 100);
  }, [open]);

  const handleClose = () => {
    if (name) {
      setClosePrompt(true);
      return;
    }
    onChange(false);
  };

  const handleChange = () => {
    onChange(true, {
      name
    });
    setClosePrompt(false);
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
          {en['Package']}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label={en['Name']}
            className={classes.createInput}
            onChange={(e) => setName(e.target.value)}
            {...bindName}
            inputRef={nameRef}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleChange} color="primary">
            {en['Add Package']}
          </Button>
          <Button
            autoFocus
            onClick={() => onChange(false)}
            className={classes.dialogAddBtn}
          >
            {en['Close']}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialogue
        onYes={() => {
          setClosePrompt(false);
          onChange(false);
        }}
        onNo={handleChange}
        open={closePrompt}
      />
    </>
  );
};

export default CreateUserDialog;
