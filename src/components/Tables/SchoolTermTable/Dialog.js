import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Button,
  CircularProgress
} from '@material-ui/core';
import { useStyles } from './style';
import { en } from '@app/language';
import FormattedDatTimePicker from '@app/components/Custom/FormatedDateTimePicker';
import {
  getDateFromFormattedString,
  getISOTimeString
} from '@app/utils/date-manager';
import { CustomInput } from '@app/components/Custom';

const CreateSchoolTermDialog = ({
  open,
  onChange,
  isSchoolTermCreating,
  setSchoolTermCreating
}) => {
  const classes = useStyles();
  const mainBtnRef = useRef();
  const [name, setName] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [error, setError] = useState(false);
  const [nameError, setNameError] = useState();

  useEffect(() => {
    setName();
    setStartDate();
    setEndDate();
  }, [open]);

  const handleClose = () => {
    onChange(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSchoolTermCreating(true);
      onChange(true, {
        name: name,
        status: 'created'
      });
    }
  };

  const handleChange = (type, value) => {
    if (!name?.length) {
      setError(true);
      setNameError('Name is required!');
      return;
    }
    if (startDate && endDate && !checkValidDates(startDate, endDate)) {
      return;
    }
    setError(false);
    setNameError();
    if (value) {
      setSchoolTermCreating(true);
      onChange(true, {
        name: name,
        startAt: startDate,
        endAt: endDate,
        status: 'created'
      });
    } else {
      onChange(false);
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
    let startDate = getDateFromStr(start);
    let endDate = getDateFromStr(end);
    if (startDate > endDate) {
      return false;
    } else {
      return true;
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
          {'Add a new School Term'}
        </DialogTitle>
        <DialogContent dividers>
          <CustomInput
            my={2}
            size="small"
            type="text"
            autoFocus={true}
            label={en['Name']}
            value={name}
            onChange={(e) => setName(e)}
            onKeyDown={(e) => handleKeyPress(e)}
            fullWidth
            error={error}
            helperText={nameError}
            width="300px"
          />
          <FormattedDatTimePicker
            id={'edit_start_date'}
            label="Start Date"
            type="date"
            max={endDate}
            format={'MM-DD-YYYY'}
            onChange={(e) => setStartDate(e)}
            maxDateMessage="Start Date must be before End Date"
          />
          <FormattedDatTimePicker
            id={'edit_end_date'}
            label={en['End Date']}
            type={'date'}
            min={startDate}
            format={'MM-DD-YYYY'}
            onChange={(e) => {
              setEndDate(e);
              if (checkValidDates(startDate, e)) {
                mainBtnRef.current?.focus();
              }
            }}
            onAccept={(e) => {
              if (checkValidDates(startDate, e)) {
                setTimeout(function () {
                  mainBtnRef.current?.focus();
                }, 500);
              }
            }}
            minDateMessage="End Date must be after Start Date"
          />
        </DialogContent>
        <DialogActions>
          <Button
            ref={mainBtnRef}
            onClick={() => handleChange('btnClicked', true)}
            className={classes.dialogAddBtn}
            variant={'contained'}
            disabled={isSchoolTermCreating}
          >
            {isSchoolTermCreating ? (
              <CircularProgress size={25} my={5} />
            ) : (
              'Save'
            )}
          </Button>

          <Button onClick={handleClose} className={classes.dialogAddBtn}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateSchoolTermDialog;
