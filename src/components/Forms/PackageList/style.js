import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  table: {
    maxHeight: `calc(100vh - 285px)`
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
  },
  pagination: {
    padding: theme.spacing(2),
    float: 'right',
    marginRight: '100px'
  },
  ota: {
    display: 'flex'
  },
  ota_status: {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    minHeight: '20px',
    borderRadius: '10px',
    marginRight: '10px'
  },
  ota_label: {}
}));

export default useStyles;
