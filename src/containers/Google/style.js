import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
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
  state: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    backgroundColor: '#21ff00'
  }
}));

export default useStyles;
