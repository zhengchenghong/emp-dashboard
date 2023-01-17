import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import useStyles from './style';
import { StationAdminEula } from '@app/components/Eula';
import { useSmallScreen } from '@app/utils/hooks';

const EULAModal = ({ openModal, setOpenModal }) => {
  const classes = useStyles();
  const isSmallScreen = useSmallScreen();

  const handleClose = (e) => {
    setOpenModal(false);
  };

  return (
    <Dialog
      open={openModal}
      classes={{ paper: classes.dialogPaper }}
      // style={{
      //   paper: {
      //     minHeight: isSmallScreen ? '90vh' : '100vh'
      //   }
      // }}
    >
      <StationAdminEula fromSetting={true} onChange={handleClose} />
    </Dialog>
  );
};

export default EULAModal;
