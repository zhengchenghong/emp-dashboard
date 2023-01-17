import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  title: {
    color: theme.palette.blueGrey['700']
  },
  inputArea: {
    width: '100%',
    margin: `${theme.spacing(1)}px 0`
  }
}));

export default useStyles;
