/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Prompt } from 'react-router-dom';
import { CustomDialog } from '@app/components/Custom';

export const RouteLeavingGuard = ({
  navigate,
  when,
  shouldBlockNavigation,
  onChange,
  children,
  show,
  updateShow
}) => {
  const [modalVisible, updateModalVisible] = useState(false);
  const [lastLocation, updateLastLocation] = useState();
  const [confirmedNavigation, updateConfirmedNavigation] = useState(false);

  const showModal = (location) => {
    updateModalVisible(true);
    updateLastLocation(location);
  };

  const closeModal = (cb) => {
    updateModalVisible(false);
    if (cb) {
      cb();
    }
  };

  const handleBlockedNavigation = (nextLocation) => {
    if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
      showModal(nextLocation);
      return false;
    }
    return true;
  };

  const handleConfirmNavigationClick = (type, value) => {
    if (type === 'btnClick') {
      if (value) {
        onChange(true);
      } else {
        onChange(false);
      }

      closeModal(() => {
        if (lastLocation) {
          updateConfirmedNavigation(true);
        }
      });
    }
    if (type === 'dismiss') {
      closeModal(() => {
        if (lastLocation) {
          updateConfirmedNavigation(true);
        }
      });
    }
  };

  useEffect(() => {
    if (confirmedNavigation) {
      navigate(lastLocation.pathname);
      updateConfirmedNavigation(false);
    }
  }, [confirmedNavigation]);

  useEffect(() => {
    if (show) {
      updateModalVisible(true);
    }
  }, [show]);

  useEffect(() => {
    if (!modalVisible && updateShow) {
      updateShow(false);
    }
  }, [modalVisible]);

  return (
    <React.Fragment>
      <Prompt when={when} message={handleBlockedNavigation} />
      <CustomDialog
        dismissBtnName="Dismiss"
        mainBtnName="Save"
        secondaryBtnName="Discard"
        open={modalVisible}
        onChange={handleConfirmNavigationClick}
      >
        <main>{children}</main>
      </CustomDialog>
    </React.Fragment>
  );
};

export default RouteLeavingGuard;
