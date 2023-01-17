import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.blueGrey['50']
  },
  inputArea: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    // fontSize: 10,
    fontWeight: 100
  },
  textArea: {
    minWidth: '100%',
    maxWidth: '100%',
    marginTop: theme.spacing(1),
    fontFamily: 'Roboto',
    // fontSize: 10,
    fontWeight: 100,
    paddingTop: 9,
    paddingLeft: 12,
    outlineColor: theme.palette.primary.main,
    borderRadius: 5,
    borderColor: '#c1bdbd'
  }
}));

export default useStyles;
