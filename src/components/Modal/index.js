import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import ClearIcon from '@material-ui/icons/Clear';
import useStyles from './style';

const CustomModal = ({
  icon,
  title,
  resources,
  openModal,
  setOpenModal,
  Children,
  flag,
  classResources
}) => {
  const classes = useStyles();

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <Dialog
      open={openModal}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      fullWidth={flag === 'ldash' ? true : false}
      classes={flag === 'ldash' ? { paper: classes.dialogPaper } : null}
    >
      {/* <DialogTitle id="form-dialog-title"> */}
      <Box
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        p={2}
      >
        <Box display="flex" alignItems="center">
          {icon && icon}
          <p>{title}</p>
        </Box>
        <IconButton onClick={handleClose} style={{ width: 40, height: 40 }}>
          <ClearIcon />
        </IconButton>
      </Box>
      {/* </DialogTitle> */}
      <DialogContent>
        <Children
          handleClose={handleClose}
          resources={resources}
          classResources={classResources}
        />
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};

export default CustomModal;
