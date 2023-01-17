/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Navbar from '@app/components/Navbar';
import { MainSidebar, SecondarySidebar } from '@app/components/Sidebar';
import { TempGlobalStatus } from '@app/components/Temp';
import { useGalleryContext } from '@app/providers/GalleryContext';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    paddingTop: 49,
    position: 'relative'
    // overflowX: 'auto'
  },
  pageWrapper: {
    height: '100vh'
  }
}));

const NewDashboardLayout = (props) => {
  const classes = useStyles();
  const [openLeft, setOpenLeft] = useState(true);
  const { openRight, setOpenRight } = useGalleryContext();
  const [type, setType] = useState('');

  const handleSidebar = (value) => {
    setOpenLeft(value);
  };

  const handleNBItemClicked = (value) => {
    setType(value);
    setOpenRight(!openRight);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar
        layout="dashboard"
        open={openLeft}
        onElClick={handleNBItemClicked}
      />
      <MainSidebar
        open={openLeft}
        onChange={handleSidebar}
        userInfo={{ email: '', role: '' }}
      />
      <main className={classes.content}>
        <div className={classes.pageWrapper}>{props.children}</div>
        <TempGlobalStatus />
      </main>
      <SecondarySidebar type={type} open={openRight} />
    </div>
  );
};

export default NewDashboardLayout;
