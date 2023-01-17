import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  textfield: {
    marginTop: 10,
    width: '100%'
  },
  addBtn: {
    background: theme.palette.blueGrey['500'],
    color: 'white',
    height: 30,
    marginLeft: theme.spacing(2),
    '&:hover': {
      background: theme.palette.blueGrey['500'],
      color: theme.palette.blueGrey['50']
    }
  },
  noData: {
    minHeight: 100,
    color: theme.palette.blueGrey['500']
  },
  dialog: {},
  dialogTitle: {
    color: theme.palette.blueGrey['700']
  },
  createInput: {
    width: '100%',
    marginBottom: theme.spacing(1)
  },
  dialogAddBtn: {
    color: theme.palette.blueGrey['700']
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: 2
  },
  noLabel: {
    marginTop: theme.spacing(3)
  }
}));

export default useStyles;
