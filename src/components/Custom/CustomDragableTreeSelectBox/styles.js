import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    '& .MuiPaper-root': {
      minWidth: '90%'
    },
    height: '88vh'
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(0)
  },
  content: {
    marginTop: 5,
    minHeight: 'calc(88vh - 210px)',
    maxHeight: 'calc(88vh - 210px)',
    overflowY: 'auto',
    padding: '0px 18px !important'
  },

  buttonArea: {
    marginTop: 0,
    minHeight: 60
  },
  paper: {
    minWidth: 580
  },
  button: {
    color: 'white',
    backgroundColor: '#37474f !important',
    height: 36
  },
  stateSelect: {
    fontSize: '18px !important',
    background: theme.palette.common.lightgray,
    '& .MuiButton-root:focus': {
      backgroundColor: theme.palette.common.lightgray
    },
    // disableRipple: true,
    '& .MuiButton-root:hover': {
      backgroundColor: theme.palette.common.lightgray
    },
    borderRadius: '0px',
    border: '2px solid rgb(0 0 0 / 35%)',
    height: 44,
    width: '100%',
    color: 'inherit',
    textAlign: 'center',
    fontWeight: 'bold',

    display: 'block',
    overflow: 'hidden',
    flexWrap: 'inherit'
  }
}));

export default useStyles;
