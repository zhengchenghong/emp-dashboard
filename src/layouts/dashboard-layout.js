/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Box, Card } from '@material-ui/core';
import Navbar from '@app/components/Navbar';
import { MainSidebar, SecondarySidebar } from '@app/components/Sidebar';
import { TempGlobalStatus } from '@app/components/Temp';
import { useMenuContext } from '@app/providers/MenuContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useSearchContext } from '@app/providers/SearchContext';
import { StationAdminEula } from '@app/components/Eula';
import { useUserContext } from '@app/providers/UserContext';
import { useWindowSize } from '@app/utils/hooks/window';
import { useAssetContext } from '@app/providers/AssetContext';
import LinearWithValueLabel from '@app/components/LinearProgressBar';
import CustomFilterBar from '@app/components/FilterBar';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
    // position: 'fixed'
  },
  content: {
    flexGrow: 1,
    paddingTop: 49,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
    // height: 'calc(100vh + 152px)'
  },
  progress: {
    width: '400px',
    // position: 'absolute',
    bottom: '100px',
    right: '10px',
    background: '#eceff1',
    zIndex: 99,
    position: 'fixed'
  }
}));

const DashboardLayout = (props) => {
  const classes = useStyles();
  const [, , , , isLeftMenuOpen, setIsLeftMenuOpen] = useMenuContext();
  const [showEula, setShowEula] = useState(false);
  const { openRight, setOpenRight } = useGalleryContext();
  const { openSearch, setOpenSearch, openLessonSearch, setOpenLessonSearch } =
    useSearchContext();
  const [type, setType] = useState('');
  //this var is used to store the last selected userprofile,
  //so that content of useEffect will not run more than 1time.
  const [userProfile, setUserProfile] = useState();
  const [currentUser] = useUserContext();
  const { progress, uploading, filename, queProgreses } = useAssetContext();
  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    if (openLessonSearch) {
      setOpenRight(false);
      setOpenSearch(false);
    }
  }, [openLessonSearch]);

  useEffect(() => {
    if (openSearch) {
      setOpenRight(false);
      setOpenLessonSearch(false);
    }
  }, [openSearch]);

  useEffect(() => {
    if (openRight) {
      setOpenSearch(false);
      setOpenLessonSearch(false);
    }
  }, [openRight]);

  const handleSidebar = React.useCallback((value) => {
    setIsLeftMenuOpen(value);
  }, []);

  const handleNBItemClicked = (value) => {
    setType(value);
    setOpenRight(!openRight);
  };

  const checkEULA = () => {
    if (currentUser?.loginInfo?.EULAsignedAt) {
      setShowEula(false);
    } else {
      setShowEula(true);
    }
  };

  const handleClose = (e) => {};

  useEffect(() => {
    if (currentUser?.schemaType !== 'superAdmin') {
      if (currentUser?._id !== userProfile?._id) {
        checkEULA();
        setUserProfile(currentUser); //to remember the latest logged in user
      }
    } else {
      setShowEula(false);
    }
  }, [currentUser]);

  return (
    <>
      {!showEula ? (
        <div className={classes.root}>
          <CssBaseline />
          <Navbar
            layout="dashboard"
            open={isLeftMenuOpen}
            onElClick={handleNBItemClicked}
          />
          <MainSidebar
            open={isSmallScreen ? true : isLeftMenuOpen}
            onChange={handleSidebar}
          />
          {currentUser && (
            <main className={classes.content}>
              <div
                style={{
                  height: 'calc(100vh - 146px)'
                  // position: 'fixed'
                }}
              >
                {props.children}
                {uploading && (
                  <div className={classes.progress}>
                    <Box component={Card} style={{ background: '#eceff1' }}>
                      <LinearWithValueLabel
                        value={parseInt(progress.progress)}
                        name={filename}
                        close={() => {
                          if (progress.upload) progress.upload.abort();
                        }}
                      />
                    </Box>
                  </div>
                )}
                <div className={classes.progress}>
                  {queProgreses.map((item) => {
                    return (
                      <>
                        <Box component={Card} style={{ background: '#eceff1' }}>
                          <LinearWithValueLabel
                            value={parseInt(item.progress)}
                            name={item.info.title ?? item.info.fileName}
                            close={() => {
                              if (item.upload) item.upload.abort();
                            }}
                          />
                        </Box>
                      </>
                    );
                  })}
                </div>
              </div>
              <CustomFilterBar />
              <TempGlobalStatus open={isLeftMenuOpen} />
            </main>
          )}
          <SecondarySidebar type={type} open={openRight} />
          <SecondarySidebar type="search" open={openSearch} />
          <SecondarySidebar type="searchLesson" open={openLessonSearch} />
        </div>
      ) : (
        <StationAdminEula fromSetting={false} onChange={handleClose} />
      )}
    </>
  );
};

export default React.memo(DashboardLayout);
