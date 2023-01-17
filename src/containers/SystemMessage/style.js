import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  rootVertical: {
    display: 'flex',
    flexDirection: 'column'
  },
  listItems: {
    cursor: 'pointer',
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0)
  },
  listItem: {
    color: theme.palette.blueGrey['900'],
    fontWeight: 700
  },
  listItemSelected: {
    color: theme.palette.common.black,
    fontWeight: 700,
    background: theme.palette.blueGrey['200']
  },
  listItemText: {
    margin: 0,
    color: theme.palette.blueGrey['700']
  },
  listSelectedItemText: {
    fontWeight: 700,
    color: theme.palette.blueGrey['700']
  },
  docId: {
    color: theme.palette.blueGrey['700'],
    marginBottom: theme.spacing(1)
  },
  selectBox: {
    minWidth: 300,
    background: theme.palette.common.white
  },
  readingData: {
    color: theme.palette.blueGrey['900']
  }
}));

export default useStyles;
