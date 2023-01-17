import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(0)
  },
  content: {
    marginTop: theme.spacing(1),
    minWidth: 350,
    minHeight: 80
  },
  customizedButton: {
    position: 'absolute',
    left: '87%',
    top: '-5%',
    backgroundColor: 'transparent',
    color: 'red'
  },
  paper: {
    overflowY: 'unset'
  }
}));

export default useStyles;
