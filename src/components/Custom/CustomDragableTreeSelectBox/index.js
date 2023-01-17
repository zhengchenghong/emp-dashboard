import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import useStyles from './styles';
import { Dialog, Button, DialogContent } from '@material-ui/core';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon
} from '@material-ui/icons';
import CustomFilterBar from '@app/components/FilterBar';

const CustomDragableTreeSelectBox = ({
  selectedTreeItem,
  children,
  showFilters
}) => {
  const classes = useStyles();
  const [openTreeView, setOpenTreeView] = useState();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (selectedTreeItem) {
      setTitle(selectedTreeItem?.name);
    }
  }, [selectedTreeItem]);

  const handleClose = () => {
    setOpenTreeView(false);
  };

  const treeViewRender = () => {
    setOpenTreeView(true);
  };

  return (
    <div style={{ padding: '8px 6px 0px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Button
          className={classes.stateSelect}
          disableRipple={true}
          onClick={treeViewRender}
          variant="contained"
        >
          {title}
        </Button>
        {openTreeView ? (
          <ArrowDropUpIcon
            onClick={treeViewRender}
            style={{
              marginLeft: -35,
              zIndex: '950',
              color: 'gray'
            }}
          />
        ) : (
          <ArrowDropDownIcon
            onClick={treeViewRender}
            style={{
              marginLeft: -35,
              zIndex: '950',
              color: 'gray'
            }}
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
        <div
          style={{
            // paddingLeft: 'calc(50% - 195px)',
            marginTop: 25
          }}
        >
          {showFilters && <CustomFilterBar showOnlyFilters={true} />}
        </div>

        <DialogContent className={classes.content}>
          <div style={{ margin: '0px' }}>{children}</div>
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

export default CustomDragableTreeSelectBox;
