import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  textfield: {
    marginTop: 10,
    width: '100%'
  },
  addBtn: {
    // background: theme.palette.blueGrey['500'],
    backgroundColor: '#37474f !important',
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
  countLabel: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  pagination: {
    padding: theme.spacing(2),
    float: 'right',
    marginRight: '100px'
  },
  AnalyticsGrid: {
    height: 100,
    width: '100%',
    padding: '5px 20px'
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
