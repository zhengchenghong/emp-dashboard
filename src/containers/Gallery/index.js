/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useStateContext } from '@app/providers/StateContext';
import GalleryMain from './Main';
import GalleryEdit from './Edit';
import useStyles from './style';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';

const loadedData = [
  {
    _id: 1,
    name: en['Stock Image'],
    schemaType: 'stockImage',
    value: 1,
    label: en['Stock Image']
  },
  {
    _id: 2,
    name: en['Stock Banner'],
    schemaType: 'stockBanner',
    value: 2,
    label: en['Stock Banner']
  },
  {
    _id: 3,
    name: en['Stock Logo'],
    schemaType: 'stockLogo',
    value: 3,
    label: en['Stock Logo']
  },
  {
    _id: 4,
    name: en['Stock Avatar'],
    schemaType: 'stockAvatar',
    value: 4,
    label: en['Stock Avatar']
  }
];

const GalleryContainer = ({ history, match }) => {
  const classes = useStyles();
  const [showEdit, setShowEdit] = useState(true);
  const [whenState, setWhenState] = useState(false);
  const [isOutSide, setIsOutSide] = useState(false);
  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();

  const [editPanelData, setEditPanelData] = useState(() => loadedData[0]);
  const [editTmpData, setEditTmpData] = useState(() => loadedData[0]);
  const [selectedDocId, setSelectedDocId] = useState(1);
  const [isForceSave, setIsForceSave] = useState(false);
  const [forceSaveDocId, setForceSaveDocId] = useState();
  const [stateContext, setStateContext] = useStateContext();
  const isSmallScreen = useSmallScreen();
  useEffect(() => {
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
  }, []);

  const checkIsOutSide = (value) => {
    const tmp = value.split('/').length;
    if (tmp > 2) {
      setIsOutSide(true);
    } else {
      setIsOutSide(false);
    }
  };

  const handleMainChange = (type, value) => {
    if (type === 'elSingleClick') {
      console.log(value);
      setEditTmpData(value);
      setStateContext({
        ...stateContext,
        gallery: value
      });
      history.push({
        pathname: `/galleries`
      });

      setShowEdit(true);
      setEditPanelData(value);
      setSelectedDocId(value['_id']);
      setEditTmpData();
    }
    if (type === 'delete') {
      setShowEdit(false);
      setEditPanelData();
      setStateContext({
        ...stateContext,
        pbs: null
      });
    }
  };

  const handleEditChange = (type, value) => {
    if (type === 'update') {
      setWhenState(value);
    }
    if (type === 'delete') {
      setShowEdit(false);
    }
    if (type === 'forceSave') {
      setIsForceSave(value);
    }
  };

  const handleGuardChange = (value) => {
    setWhenState(false);
    setShowEdit(true);
    if (isOutSide) {
      setEditPanelData(editTmpData);
      setSelectedDocId(editTmpData['_id']);
      setEditTmpData();
    }

    if (value) {
      setForceSaveDocId(editPanelData['_id']);
      setIsForceSave(true);
    }
  };

  return (
    <Box className={!isSmallScreen ? classes.root : classes.rootVertical}>
      <RouteLeavingGuard
        when={whenState}
        navigate={(path) => {
          history.push(path);
        }}
        shouldBlockNavigation={(location) => {
          checkIsOutSide(location.pathname);
          return whenState;
        }}
        onChange={handleGuardChange}
      >
        <Typography variant="subtitle1" className={classes.warning}>
          {en['There are unsaved changes on the panel.']}
          <br />
          {en['Will you discard your current changes?']}
        </Typography>
      </RouteLeavingGuard>
      <GalleryMain
        selectedDocId={selectedDocId}
        resources={loadedData}
        onChange={handleMainChange}
      />
      {showEdit && (
        <GalleryEdit
          forceSaveDocId={forceSaveDocId}
          forceSave={isForceSave}
          selectedDocId={selectedDocId}
          resources={editPanelData}
          onChange={handleEditChange}
          handleMainChange={handleMainChange}
          setWhenState={setWhenState}
          loadedData={loadedData}
        />
      )}
    </Box>
  );
};

export default withRouter(GalleryContainer);
