import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import useStyles from './styles';
import { Dialog, Button, DialogContent } from '@material-ui/core';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon
} from '@material-ui/icons';
import CustomFilterBar from '@app/components/FilterBar';
import { useUserContext } from '@app/providers/UserContext';

const CustomTreeSelectBox = ({
  selectedDocId,
  selectedTreeItem,
  children,
  hideFilters
}) => {
  const classes = useStyles();
  const [openTreeView, setOpenTreeView] = useState();
  const [title, setTitle] = useState('');
  const [currentUser] = useUserContext();

  useEffect(() => {
    if (selectedTreeItem) {
      setTitle(selectedTreeItem?.name);
    } else {
      if (
        currentUser?.schemaType === 'superAdmin' ||
        currentUser?.schemaType === 'sysAdmin'
      ) {
        setTitle('Stations');
      }
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    if (selectedDocId === 'root') {
      setTitle('Stations');
    }
  }, [selectedDocId]);

  const handleClose = () => {
    setOpenTreeView(false);
  };

  const treeViewRender = () => {
    setOpenTreeView(true);
  };

  return (
    <div className={classes.titleRoot}>
      <div className={classes.titleGroup}>
        <Button
          className={classes.stateSelect1}
          disableRipple={true}
          onClick={treeViewRender}
          variant="contained"
        >
          {title}
        </Button>
        {openTreeView ? (
          <ArrowDropUpIcon
            onClick={treeViewRender}
            className={classes.arrowDropIcon}
          />
        ) : (
          <ArrowDropDownIcon
            onClick={treeViewRender}
            className={classes.arrowDropIcon}
          />
        )}
      </div>
      <Dialog
        open={openTreeView}
        className={clsx(classes.root, {
          [classes.root]: true
        })}
        onClose={handleClose}
      >
        {' '}
        {(currentUser?.schemaType === 'superAdmin' ||
          currentUser?.schemaType === 'sysAdmin') &&
        !hideFilters ? (
          <div
            style={{
              marginTop: 25
            }}
          >
            <CustomFilterBar showOnlyFilters={true} />
          </div>
        ) : (
          <div
            style={{
              marginTop: 25
            }}
          />
        )}
        <DialogContent className={classes.content}>
          <div style={{ margin: '0px 20px 0px 20px' }}>{children}</div>
        </DialogContent>
        <Button
          className={classes.button}
          onClick={handleClose}
          variant="contained"
        >
          {'Done'}
        </Button>
      </Dialog>
    </div>
  );
};

export default CustomTreeSelectBox;
