import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { getVersionString } from '@app/utils/functions';

const useStyles = makeStyles((theme) => ({
  Dialog: {
    marginLeft: '75vw',
    marginTop: '0vh'
  },
  IconButton: {
    float: 'right',
    marginTop: '-1vh'
  }
}));
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [version, setVersion] = useState('');
  const handleClose = () => {
    setOpen(false);

    setInterval(props.sliderClicked(), 3000);
  };

  if (!version) {
    getVersionString().then((data) => {
      setVersion(data);
    });
  }

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        className={classes.Dialog}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle id="alert-dialog-slide-title">
          Diagnostics
          <IconButton
            className={classes.IconButton}
            aria-label="delete"
            onClick={handleClose}
          >
            <CloseOutlinedIcon fontSize="medium" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography variant="subtitle1">
              <pre>{JSON.stringify(props.context, null, 2) || 'null'}</pre>
            </Typography>
            <p>{version}</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </div>
  );
}
