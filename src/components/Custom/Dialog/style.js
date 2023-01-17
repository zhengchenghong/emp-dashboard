import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
    // '& .MuiPaper-root': {
    //   width: '100%',
    //   minWidth: '350px'
    // }
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(0)
  },
  content: {
    marginTop: theme.spacing(1),
    minHeight: 40
  },
  paper: {
    minWidth: 880
  },

  mediumPaper: {
    minWidth: 400,
    width: '90%'
  },

  smallPaper: {
    minWidth: '92%',
    width: '92%'
  },

  button: {
    color: 'white',
    backgroundColor: '#37474f !important'
  },

  previewMode: {
    maxWidth: 1300,
    width: '80%'
  }
}));

export default useStyles;
