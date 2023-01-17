import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(1)
  },
  inputArea: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  selectBox: {
    marginBottom: '10px'
  },
  textArea: {
    minWidth: '100%',
    maxWidth: '100%',
    marginTop: theme.spacing(1),
    fontFamily: 'Roboto',
    fontSize: 16,
    paddingTop: 9,
    paddingLeft: 12,
    outlineColor: theme.palette.primary.main,
    borderRadius: 5,
    borderColor: '#c1bdbd'
  },
  saveBtn: {
    backgroundColor: theme.palette.blueGrey['200'],
    '&:hover': {
      backgroundColor: theme.palette.blueGrey['600'],
      color: theme.palette.blueGrey['100']
    }
  }
}));

export default useStyles;
