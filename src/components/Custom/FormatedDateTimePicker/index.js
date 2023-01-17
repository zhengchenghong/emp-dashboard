import React, { useState, useEffect } from 'react';
import { TextField } from '@material-ui/core';
import {
  getFormattedDate,
  getDateFromFormattedString
} from '@app/utils/date-manager';
import { useStyles } from './style';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { RestaurantRounded } from '@material-ui/icons';
import moment from 'moment';
const FormattedDatTimePicker = ({
  id,
  defaultValue,
  value,
  type,
  format,
  onChange = () => {},
  label,
  min,
  max,
  onAccept = () => {},
  minDateMessage,
  maxDateMessage,
  onError = () => {}
}) => {
  const [selectedDate, handleDateChange] = useState();
  const [minDate, setMinDate] = useState();
  const [maxDate, setMaxDate] = useState();

  useEffect(() => {
    if (value?.length) {
      if (value?.length > 10) {
        let dateVal = new Date(new Date(value));
        handleDateChange(dateVal);
      } else {
        let dateVal = new Date(
          new Date(value.slice(6, 10) + '-' + value.slice(0, 5))
        );
        handleDateChange(dateVal);
      }
    } else {
      handleDateChange(null);
    }
  }, [value]);

  useEffect(() => {
    if (min?.length > 9) {
      if (min?.length > 10) {
        setMinDate(new Date(min));
      } else {
        setMinDate(
          new Date(min.slice(6, 10) + '-' + min.slice(0, 5) + 'T23:59:59.000Z')
        );
      }
    } else {
      setMinDate();
    }
  }, [min]);

  useEffect(() => {
    if (max?.length > 9) {
      if (max?.length > 10) {
        setMaxDate(new Date(max));
      } else {
        setMaxDate(
          new Date(max.slice(6, 10) + '-' + max.slice(0, 5) + 'T00:00:00.000Z')
        );
      }
    } else {
      setMaxDate();
    }
  }, [max]);

  return (
    <KeyboardDatePicker
      label={label}
      placeholder={label}
      value={selectedDate}
      onChange={(date, value) => {
        if (date == null) return;
        if (date?.toString() === 'Invalid date') return;
        onChange(value);
      }}
      onAccept={(date, value) => {
        handleDateChange(date);
        let dateStr = getFormattedDate(date, 'MM-DD-YYYY');
        onChange(dateStr);
      }}
      format="MM-DD-YYYY"
      minDate={minDate}
      minDateMessage={minDateMessage}
      maxDate={maxDate}
      maxDateMessage={maxDateMessage}
      style={{ width: '100%' }}
    />
  );
};
export default FormattedDatTimePicker;
