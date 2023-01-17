import { zonedTimeToUtc, format } from 'date-fns-tz';
import moment from 'moment';

const formatDate = (date) => format(date, 'yyyy-MM-dd HH:mm:ss.SSS');

const getClientTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getCurrentUTCTime = () => {
  const currDate = formatDate(new Date());
  const timeZone = getClientTimeZone();
  const utcDate = zonedTimeToUtc(currDate, timeZone);
  return utcDate.toISOString();
};

export const getFormattedDate = (date, format) => {
  const newDate = moment(date);
  return newDate.format(format || 'MM/DD/YYYY HH:mm:ss');
};

export const getDateFromFormattedString = (dateStr) => {
  return moment(dateStr);
};

export const getISOTimeString = (dateStr, type) => {
  if (dateStr?.length < 10) return null;
  if (dateStr?.length > 10) {
    return dateStr;
  } else {
    return (
      dateStr.slice(6, 10) +
      '-' +
      dateStr.slice(0, 5) +
      (type === 'end' ? 'T23:59:59.000Z' : 'T07:00:00.000Z')
    );
  }
};
