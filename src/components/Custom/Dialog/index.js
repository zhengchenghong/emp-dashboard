import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  Box,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  CircularProgress,
  DialogActions,
  DialogContent
} from '@material-ui/core';
import useStyles from './style';
import { useMediumScreen, useSmallScreen } from '@app/utils/hooks';

const CustomDialog = ({
  open = false,
  title,
  style,
  dismissBtnName,
  mainBtnName,
  buttonDisable,
  secondaryBtnName,
  onChange,
  children,
  customStyle,
  customClass,
  info,
  contentOverFlowY,
  isCreateFocus,
  setCreateFocus,
  maxWidth,
  ...rest
}) => {
  const classes = useStyles();
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const mainBtnRef = useRef();

  useEffect(() => {
    setTimeout(function () {
      if (mainBtnName === 'Save' || isCreateFocus) {
        mainBtnRef.current?.focus();
        if (setCreateFocus) setCreateFocus(false);
      }
    }, 500);
  }, [open, isCreateFocus]);

  return (
    <Dialog
      className={clsx(classes.root, {
        [classes.root]: !style,
        [style]: style
      })}
      classes={
        title === 'Information'
          ? {
              paper: isSmallScreen
                ? classes.smallPaper
                : isMediumScreen
                ? classes.mediumPaper
                : classes.paper
            }
          : title === 'Preview' && !isSmallScreen
          ? {
              paper: classes.previewMode
            }
          : {}
      }
      open={open}
      disableEscapeKeyDown
      onClose={() => onChange('btnClick', false)}
      maxWidth={maxWidth}
    >
      <DialogTitle className={classes.title}>
        <Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        className={customClass ? customClass : classes.content}
        style={{
          minWidth: isSmallScreen ? '100%' : 400,
          overflowY: contentOverFlowY === 'hidden' ? 'hidden' : 'auto'
        }}
      >
        {children}
      </DialogContent>
      <DialogActions>
        {dismissBtnName ? (
          <Button
            color="default"
            onClick={() => onChange('dismiss', false)}
            className={classes.button}
          >
            {dismissBtnName || 'Cancel'}
          </Button>
        ) : (
          []
        )}
        <Button
          color="default"
          onClick={() => onChange('btnClick', false)}
          variant="contained"
          className={classes.button}
        >
          {secondaryBtnName || 'Cancel'}
        </Button>
        {mainBtnName && (
          <Button
            ref={mainBtnRef}
            color="primary"
            onClick={() => onChange('btnClick', true)}
            disabled={buttonDisable}
            variant="contained"
            className={classes.button}
          >
            {buttonDisable ? (
              <CircularProgress size={30} my={5} />
            ) : (
              mainBtnName
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
