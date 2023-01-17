import React, { useEffect } from 'react';
import { Typography, Box, Tooltip } from '@material-ui/core';
import useStyles from './style';
import DescriptionIcon from '@material-ui/icons/Description';
import {
  faTowerCell,
  faSchool,
  faStoreAlt,
  faChalkboardTeacher,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function StyledTreeItem(props) {
  const classes = useStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    selectedTreeItem,
    state,
    isclasses,
    type,
    allData,
    onClick,
    unPublish
  } = props;
  const getItemIcon = (value) => {
    if (value === 'station') return faTowerCell;
    if (value === 'district') return faSchool;
    if (value === 'school') return faStoreAlt;
    if (value === 'class') return faChalkboardTeacher;
    if (value === 'googleClass') return faChalkboardTeacher;
    if (value === 'googleMaterial') return faFileAlt;
  };

  const handleUnpublish = () => {
    unPublish(allData);
  };

  const isSelected = () => {
    if (selectedTreeItem && selectedTreeItem._id === allData._id) {
      return true;
    }
    return false;
  };

  const getClassByStatus = () => {
    let status = allData?.schedule?.status;
    if (status) {
      if (status === 'expired') {
        return classes.labelIconExpired;
      }
      if (status === 'inactive') {
        return classes.labelIconInactive;
      }
      if (status === 'active') {
        return classes.labelIconActive;
      }
      return classes.labelIconActive;
    } else {
      return classes.labelIconActive;
    }
  };

  return (
    <div
      onClick={(event) => {
        event.preventDefault();
        onClick(event, allData?._id);
      }}
      className={isSelected() ? classes.labelRootSelected : classes.labelRoot}
    >
      {isclasses ? (
        type !== 'googleMaterial' ? (
          type && (
            <FontAwesomeIcon
              className={classes.labelIcon}
              icon={getItemIcon(type)}
            />
          )
        ) : (
          <DescriptionIcon />
        )
      ) : (
        <Tooltip
          title={
            <div>
              Start At{' '}
              <span style={{ color: 'yellow' }}>
                {allData?.schedule?.startAt == null
                  ? ''
                  : new Date(allData?.schedule?.startAt)
                      .toString()
                      .slice(0, 24)}
              </span>
              <br />
              <br />
              End At{' '}
              <span style={{ color: 'yellow' }}>
                {allData?.schedule?.endAt == null
                  ? ''
                  : new Date(allData?.schedule?.endAt).toString().slice(0, 24)}
              </span>
            </div>
          }
          classes={{ tooltip: classes.tooltip }}
        >
          <LabelIcon className={getClassByStatus()} />
        </Tooltip>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <Typography variant="body2" className={classes.labelText}>
          {labelText}
        </Typography>
        {state === 'published' && type === 'material' && (
          <Box
            className={classes.publishstate}
            component={Typography}
            onClick={handleUnpublish}
          >
            Published
          </Box>
        )}
      </div>

      {state === 'packaged' && (
        <Box className={classes.packagestate} component={Typography}>
          Packaged
        </Box>
      )}
    </div>
  );
}
