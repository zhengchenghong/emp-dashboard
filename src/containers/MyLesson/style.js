import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },

  rootVertical: {
    display: 'flex',
    flexDirection: 'column'
  },

  boxRoot: {
    flex: 3,
    // padding: theme.spacing(1),
    margin: '20px 15px 0px 15px',
    padding: '20px 20px 20px 20px',
    backgroundColor: theme.palette.blueGrey['50'],
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.spacing(12) * 3,
    boxShadow:
      '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
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
  },
  topologyTitle: {
    fontWeight: 500,
    overflow: 'hidden',
    marginLeft: '20px',
    height: 21,
    marginTop: -31,
    zIndex: theme.zIndex.drawer + 50,
    position: 'absolute'
  },
  schedule: {
    padding: '16px !important'
  },
  scheduleTextField: {
    width: '100%',
    margin: '0px',
    background: 'white',
    border: '1px solid rgb(0 0 0 / 24%)',
    paddingRight: '10px',
    paddingLeft: '10px',
    borderRadius: '5px'
  }
}));

export default useStyles;
