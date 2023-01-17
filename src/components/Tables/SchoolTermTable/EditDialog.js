import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Button,
  CircularProgress
} from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';

import { en } from '@app/language';
import { useStyles } from './style';
import FormattedDatTimePicker from '@app/components/Custom/FormatedDateTimePicker';
import {
  getDateFromFormattedString,
  getISOTimeString
} from '@app/utils/date-manager';

const EditSchoolTermDialog = ({
  open,
  type,
  resources,
  onChange,
  onSaveChange,
  isSchoolTermUpdating
}) => {
  const mainBtnRef = useRef();
  const classes = useStyles();
  const [rowData, setRowData] = useState({});
  const [updateData, setUpdateData] = useState({
    name: null,
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    if (resources) {
      setRowData(resources);
      setUpdateData({
        ...resources,
        schedule: {
          startDate: resources.schedule?.startAt,
          endDate: resources.schedule?.endAt
        }
      });
    }
  }, [resources]);

  const setUpdateDataInfo = (key, value, rowId) => {
    if (key === 'name') {
      setUpdateData({
        ...updateData,
        name: value
      });
    }
    if (key === 'startDate') {
      setUpdateData({
        ...updateData,
        schedule: {
          ...updateData?.schedule,
          startDate: value
        }
      });
    }
    if (key === 'endDate') {
      setUpdateData({
        ...updateData,
        schedule: {
          ...updateData?.schedule,
          endDate: value
        }
      });
    }
  };

  const handleClose = () => {
    onChange('close', false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChange(e);
    }
  };

  const getDateFromStr = (dateStr, type) => {
    return new Date(getDateStr_YYYY_MM_DD(dateStr, type));
  };

  const getDateStr_YYYY_MM_DD = (dateStr, type) => {
    if (!dateStr?.length) return null;
    let result = getISOTimeString(dateStr, type);
    return result;
  };

  const checkValidDates = (start, end) => {
    if (start == null) return true;
    if (end == null) return true;
    let startDate = getDateFromStr(start, 'start');
    let endDate = getDateFromStr(end, 'end');
    if (startDate > endDate) {
      return false;
    } else {
      return true;
    }
  };

  const handleChange = () => {
    if (
      checkValidDates(
        updateData?.schedule?.startDate,
        updateData?.schedule?.endDate
      )
    ) {
      if (updateData) onSaveChange('editSave', updateData);
    }
  };

  return (
    <>
      <Dialog
        maxWidth="xs"
        onClose={handleClose}
        open={open}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.dialogTitle} onClose={handleClose}>
          Edit School Term
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            label={en['Name']}
            className={classes.createInput}
            defaultValue={updateData?.name}
            value={updateData?.name}
            onChange={(e) =>
              setUpdateDataInfo('name', e.target.value, rowData?.id)
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <FormattedDatTimePicker
            id={'create_start_date'}
            label="Start Date"
            type="date"
            max={updateData?.schedule?.endDate}
            value={resources?.schedule?.startAt}
            onChange={(e) => setUpdateDataInfo('startDate', e)}
            maxDateMessage="Start Date must be before End Date"
            onError={(err) => {
              console.log('Error ===>', err);
            }}
          />
          <FormattedDatTimePicker
            id={'create_end_date'}
            label={en['End Date']}
            type={'date'}
            min={updateData?.schedule?.startDate}
            format={'MM-DD-YYYY'}
            value={resources?.schedule?.endAt}
            onChange={(e) => {
              setUpdateDataInfo('endDate', e);
              if (checkValidDates(updateData?.schedule?.startDate, e)) {
                mainBtnRef.current?.focus();
              }
            }}
            onAccept={(e) => {
              console.log('Accepted Date =====>', e);
              if (checkValidDates(updateData?.schedule?.startDate, e)) {
                setTimeout(function () {
                  mainBtnRef.current?.focus();
                }, 500);
              }
            }}
            minDateMessage="End Date must be after Start Date"
            onError={(err) => {
              console.log('Error ===>', err);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            ref={mainBtnRef}
            autoFocus
            onClick={handleChange}
            className={classes.dialogAddBtn}
            variant={'contained'}
            disabled={isSchoolTermUpdating}
          >
            {isSchoolTermUpdating ? (
              <CircularProgress size={25} my={5} />
            ) : (
              'Save'
            )}
          </Button>

          <Button
            autoFocus
            onClick={() => onChange('close', false)}
            className={classes.dialogAddBtn}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditSchoolTermDialog;
