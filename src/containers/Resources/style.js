import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    padding: 100,
    paddingTop: 30,
    [theme.breakpoints.down('sm')]: {
      padding: 10
    }
  },

  nameInput: {
    background: 'white',
    margin: 22,
    marginBottom: 0,
    marginRight: 22,
    width: 'calc(100% - 44px)'
  },

  descInput: {
    fontSize: 14
    // marginTop: `9px !important`,
    // marginBottom: `9px !important`
  },

  inputArea: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    fontSize: 14,
    fontWeight: 100
  },

  avatar: {
    flexDirection: 'column',
    background: theme.palette.blueGrey['50'],
    marginBottom: '0px',
    padding: 5
  },

  column: {
    flexDirection: 'column',
    background: theme.palette.blueGrey['50'],
    padding: 5,
    paddingBottom: 0
  }
}));

export default useStyles;
