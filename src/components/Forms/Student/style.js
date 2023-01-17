import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  title: {
    color: theme.palette.blueGrey['700']
  },
  subtitle: {
    color: theme.palette.blueGrey['700'],
    fontSize: 18
  },
  separator: {
    height: 2
  },
  inputArea: {
    width: '100%',
    margin: `${theme.spacing(1)}px 0`
  },
  selectBox: {
    marginTop: theme.spacing(1),
    maxHeight: 40,
    background: theme.palette.common.white
  },
  main: {
    padding: theme.spacing(1)
  }
}));

export default useStyles;
