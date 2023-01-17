/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import RouteLeavingGuard from '@app/components/RouteLeavingGuard';
import LibraryMain from './Main';
import LibraryEdit from './Edit';
import useStyles from './style';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';

const loadedData = [
  {
    _id: 1,
    name: en['PBS LearningMedia'],
    schemaType: 'resource',
    type: 'PBS',
    value: 1,
    label: en['PBS LearningMedia']
  },
  {
    _id: 2,
    name: en['OER Commons'],
    schemaType: 'resource',
    type: 'OER',
    value: 2,
    label: en['OER Commons']
  },
  {
    _id: 3,
    name: en['Shared Lessons'],
    schemaType: 'sharedLesson',
    type: 'material',
    value: 3,
    label: en['Shared Lessons']
  }
];

const LibraryContainer = ({ history, match }) => {
  const classes = useStyles();
  const [showEdit, setShowEdit] = useState(true);
  const [whenState, setWhenState] = useState(false);
  const [isOutSide, setIsOutSide] = useState(false);
  const [editPanelData, setEditPanelData] = useState(() => loadedData[0]);
  const [editTmpData, setEditTmpData] = useState(() => loadedData[0]);
  const [selectedDocId, setSelectedDocId] = useState(1);
  const [isForceSave, setIsForceSave] = useState(false);
  const [forceSaveDocId, setForceSaveDocId] = useState();
  const isSmallScreen = useSmallScreen();

  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();

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
      history.push({
        pathname: `/libraries`
      });

      setShowEdit(true);
      setEditPanelData(value);
      setSelectedDocId(value['_id']);
      setEditTmpData();
    }
    if (type === 'delete') {
      setShowEdit(false);
      setEditPanelData();
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
      <LibraryMain
        selectedDocId={selectedDocId}
        resources={loadedData}
        onChange={handleMainChange}
      />

      {showEdit && (
        <LibraryEdit
          forceSaveDocId={forceSaveDocId}
          forceSave={isForceSave}
          resources={editPanelData}
          onChange={handleEditChange}
          setWhenState={setWhenState}
          selectedDocId={selectedDocId}
          loadedData={loadedData}
          handleMainChange={handleMainChange}
        />
      )}
    </Box>
  );
};

export default withRouter(LibraryContainer);
