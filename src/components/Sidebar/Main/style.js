import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 200;

const useStyles = makeStyles((theme) => ({
  root: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    backgroundColor: theme.palette.blueGrey['800'],
    transition: 'width 0.8s'
  },
  openAndClose: {
    color: theme.palette.primary.contrastText,
    marginLeft: '4px'
  },
  drawerOpen: {
    width: drawerWidth,
    transition: 'width 0.8s'
  },
  drawerClose: {
    overflowX: 'hidden',
    transition: 'width 0.8s',
    width: '48px',
    [theme.breakpoints.up('sm')]: {
      width: '48px',
      transition: 'width 0.8s'
    }
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxHeight: 40.9,
    padding: theme.spacing(0)
  },
  logo: {
    display: 'flex',
    marginTop: '8px'
  },
  subMenu: {
    marginLeft: '40px'
  },
  separator: {
    background: theme.palette.primary.contrastText,
    height: 2,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  elList: {
    minHeight: `calc(100vh) - 42px`,
    overflowX: 'hidden'
  },
  listItems: {
    color: theme.palette.primary.contrastText,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0)
  },
  listItemsSelected: {
    backgroundColor: theme.palette.blueGrey['600'],
    color: theme.palette.primary.contrastText,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0)
  },
  listItemIcons: {
    fontSize: 14,
    minWidth: '20px',
    marginRight: '28px',
    display: 'flex',
    justifyContent: 'center'
  },
  actionList: {
    width: '100%'
  },
  nested: {
    color: theme.palette.primary.contrastText,
    paddingLeft: theme.spacing(8)
  },
  selectednested: {
    backgroundColor: theme.palette.blueGrey['600'],
    color: theme.palette.primary.contrastText,
    paddingLeft: theme.spacing(8)
  },
  listItemTextSelected: {
    color: 'yellow'
  }
}));

export default useStyles;
