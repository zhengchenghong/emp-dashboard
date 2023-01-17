import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(1),
    paddingTop: '20px',
    marginTop: '20px',
    backgroundColor: theme.palette.blueGrey['50']
  },
  inputArea: {
    width: '100%',
    // marginTop: theme.spacing(1),
    // marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper
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
  boxBtn: {
    borderRadius: 3
  },
  btnAdd: {
    width: '100%',
    backgroundColor: theme.palette.blueGrey['800'],
    color: theme.palette.background.paper
  },
  selectBox: {
    width: '100%',
    // marginTop: theme.spacing(1),
    // marginBottom: theme.spacing(1),
    // maxHeight: 40,
    background: theme.palette.common.white
  },
  actionButton: {
    float: 'right',
    marginTop: '-5px',
    marginBottom: '-5px',
    marginRight: '-5px',
    padding: '0',
    width: 'max-content'
  }
}));

export default useStyles;
