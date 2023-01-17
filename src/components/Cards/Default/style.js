import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    // marginBottom: 0,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    // height: '97%',
    backgroundColor: theme.palette.blueGrey['50'],
    '& div:focus': { backgroundColor: theme.palette.blueGrey['50'] }
  },
  lessonRoot: {
    flex: 1,
    // marginBottom: 0,
    // marginLeft: 10,
    // marginRight: 10,
    // marginTop: 10,
    // height: '97%',
    backgroundColor: theme.palette.blueGrey['50'],
    '& div:focus': { backgroundColor: theme.palette.blueGrey['50'] }
  },
  root_inlineFlex: {
    // display: 'table',
    flex: 1
    // marginBottom: theme.spacing(2),
    // marginLeft: 'auto',
    // marginRight: 'auto'
  },
  inlinedisableRoot: {
    // display: 'table',
    flex: 1,
    // marginLeft: 'auto',
    // marginRight: 'auto',
    boxShadow: 'none'
  },
  disableRoot: {
    boxShadow: 'none'
  },
  content: {
    height: '100%',
    padding: theme.spacing(3)
  }
}));

export default useStyles;
