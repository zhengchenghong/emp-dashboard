import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  drawerClose: {
    overflowX: 'hidden',
    maxWidth: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1
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
    display: 'flex'
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
    minHeight: `calc(100vh - 190px)`
  },
  listItems: {
    color: theme.palette.primary.contrastText,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0)
  },
  listItemsSelected: {
    color: theme.palette.blueGrey['300'],
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0)
  },
  listItemIcons: {
    minWidth: 45
  },
  actionList: {
    width: '100%'
  },
  nested: {
    color: theme.palette.primary.contrastText,
    paddingLeft: theme.spacing(10)
  },
  selectednested: {
    color: theme.palette.blueGrey['300'],
    paddingLeft: theme.spacing(10)
  },
  profileImage: {
    display: 'flex',
    margin: '15px 0px',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  profileImageMain: {
    height: '40px',
    width: '40px',
    borderRadius: '50%'
  },
  profileImageAvatar: {
    height: '32px !important',
    width: '32px !important'
  },
  profileArrow: {
    color: '#fff'
  },
  profileMenus: {
    left: '180px'
  },
  logoutIcon: {
    marginRight: '10px'
  }
}));

export default useStyles;
