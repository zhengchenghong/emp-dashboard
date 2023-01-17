import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    // position: 'fixed',
    bottom: 0,
    padding: `0 ${theme.spacing(1)}px`,
    background: theme.palette.blueGrey['50'],
    height: 40,
    maxHeight: 45
  },
  p: {
    margin: theme.spacing(1),
    paddingRight: theme.spacing(3),
    color: theme.palette.blueGrey['600'],
    fontWeight: 500
  },
  privacyPolicy: {
    textDecoration: 'underline',
    color: theme.palette.blue,
    cursor: 'pointer'
  }
}));

export default useStyles;
