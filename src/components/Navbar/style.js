import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 200;

const useStyles = makeStyles((theme) => ({
  appBar: {
    height: 50,
    zIndex: theme.zIndex.drawer + 1,
    width: `calc(100% - ${theme.spacing(7) + 1}px)`,
    transition: 'width 0.8s',
    '@media (max-width:688px)': {
      width: '100%'
    }
  },
  openAndClose: {
    color: theme.palette.blueGrey['700'],
    marginLeft: '7px',
    position: 'absolute'
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`
  },
  hide: {
    display: 'none'
  },
  menuButton: {
    marginRight: 36
  },
  toolBar: {
    minHeight: 50,
    display: 'flex',
    justifyContent: 'space-between'
  },
  items: {
    cursor: 'pointer'
  },
  logo: {
    display: 'flex'
  },
  selectBar: {
    display: 'flex',
    right: 0,
    position: 'absolute'
  },
  formControl: {
    marginTop: 0,
    margin: theme.spacing(1),
    minWidth: 150
  }
}));

export default useStyles;
