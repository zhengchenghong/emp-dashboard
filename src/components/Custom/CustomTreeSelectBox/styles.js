import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    '& .MuiPaper-root': {
      minWidth: '91%'
    },
    height: '88vh',
    marginTop: 0
  },
  titleRoot: {
    padding: '8px 6px 0px'
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(0)
  },
  content: {
    marginTop: 5,
    minHeight: 'calc(88vh - 220px)',
    maxHeight: 'calc(88vh - 220px)',
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
  arrowDropIcon: {
    marginLeft: -35,
    zIndex: '950',
    color: 'gray'
  },
  stateSelect: {
    fontSize: '14px',
    background: theme.palette.common.white,
    '& .MuiSelect-select:focus': {
      backgroundColor: theme.palette.common.white
    },
    '& .MuiSelect-select:hover': {
      backgroundColor: theme.palette.common.white
    },
    '& div > div > div > input': {
      height: 44,
      width: '100%',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '18px !important',
      background: 'lightgray !important',
      '& .MuiSelect-select:focus': {
        backgroundColor: 'lightgray !important'
      },
      '& .MuiSelect-select:hover': {
        backgroundColor: 'lightgray !important'
      },
      borderRadius: '0px',
      border: '2px solid rgb(0 0 0 / 35%)'
    }
  },
  stateSelect1: {
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
