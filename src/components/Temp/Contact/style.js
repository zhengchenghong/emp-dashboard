import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
  },
  header: {
    paddingX: `${theme.spacing(1)}px`
  },
  icon: {
    marginRight: theme.spacing(2)
  },
  separator: {
    height: 2,
    marginX: `${theme.spacing(1)}px`
  },
  content: {
    padding: theme.spacing(1),
    minHeight: 50,
    maxHeight: `calc(100vh - 280px)`,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  toolbar: {
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  elContactInfo: {
    padding: theme.spacing(1)
  },
  inputArea: {
    width: '100%',
    marginBottom: theme.spacing(1)
  },
  btnAdd: {
    background: '#37474f !important',
    color: 'white'
  }
}));

export default useStyles;
