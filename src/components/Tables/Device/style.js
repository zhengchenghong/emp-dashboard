import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  table: {
    maxHeight: `calc(100vh - 230px)`
  },
  cell: {
    padding: 0
  },
  tooltip: {
    fontSize: '14px'
  },
  textfield: {
    marginTop: 10,
    width: '100%'
  },
  addBtn: {
    backgroundColor: '#37474f !important',
    color: 'white',
    height: 30,
    marginLeft: theme.spacing(1),
    '&:hover': {
      background: theme.palette.blueGrey['500'],
      color: theme.palette.blueGrey['50']
    },
    minWidth: 130
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
    maxWidth: '400px',
    marginBottom: theme.spacing(1)
  },
  dialogAddBtn: {
    // color: theme.palette.blueGrey['700'],
    color: 'white',
    background: '#37474f !important'
  },
  closeButton: {
    position: 'absolute',
    bottom: -30,
    left: 30,
    right: 10
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
  uploadFromContainer: {
    marginLeft: '25px',
    marginRight: '25px'
  },
  selectedRow: {
    backgroundColor: theme.palette.action.hover
  },
  pagination: {
    padding: theme.spacing(2),
    float: 'right',
    marginRight: '8px'
  },
  closeButton: {
    fontSize: '5px',
    color: 'black',
    fontWeight: 'bold'
  },
  canvasDialogContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  removeCanvas: {
    color: 'white',
    backgroundColor: '#37474f !important'
  }
}));

export const useStylesSearch = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 280
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontSize: '0.9rem'
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  },
  closeButton: {
    // color: theme.palette.primary.contrastText,
    marginTop: 0
  }
}));

// export default useStyles;
