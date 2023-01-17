import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: 17,
    paddingRight: 0,
    cursor: 'pointer'
  },
  emailText: {
    fontWeight: 900,
    fontSize: 'inherit',
    color: 'white'
  },
  userNameText: {
    fontWeight: 900,
    marginBottom: 0,
    fontSize: 14,
    whiteSpace: 'nowrap',
    color: theme.palette.blueGrey['600']
  },
  roleText: {
    marginTop: 0,
    fontSize: 14,
    color: theme.palette.blueGrey['600']
  },
  saveBtn: {
    background: theme.palette.blueGrey['500'],
    backgroundColor: '#37474f !important',
    color: 'white',
    padding: 5,
    margin: 10,
    height: 30,
    width: 200,
    '&:hover': {
      background: theme.palette.blueGrey['500'],
      color: theme.palette.blueGrey['50']
    }
  },
  subMenuItem: {
    paddingLeft: '25px'
  },
  actionButton: {
    // color: theme.palette.blueGrey['800'],
    marginLeft: '2px',
    marginRight: '2px',
    // background: theme.palette.blueGrey['50'],
    background: '#37474f !important',
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 16,
    paddingLeft: 16,
    marginTop: 10,
    borderRadius: 3,
    width: 'max-content',
    textTransform: 'none',
    '& .svg-inline--fa': {
      fontSize: '16px'
    },
    height: 30,
    marginBottom: 4
  }
}));

export default useStyles;
