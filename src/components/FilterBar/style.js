import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    bottom: 40,
    padding: `2 ${theme.spacing(1)}px`,
    background: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    zIndex: 1000,
    paddingRight: 4,
    height: 52,
    maxHeight: 52
    // width: '600px'
  },
  selectFilter: {
    maxHeight: 40,
    background: theme.palette.common.white,
    zIndex: theme.zIndex.drawer + 200,
    width: '120px',
    fontSize: '13px'
  },

  selectFilterMobile: {
    maxHeight: 40,
    background: theme.palette.common.white,
    zIndex: theme.zIndex.drawer + 200,
    width: '105px',
    fontSize: '12px',
    paddingLeft: 0,
    paddingRight: 0
  },
  topologyContainer: {
    display: 'flex',
    // width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
    // justifyContent: 'flex-start'
  },
  lessonFilter: {
    width: '150px',
    maxHeight: 40,
    background: theme.palette.common.white,
    zIndex: theme.zIndex.drawer + 200
  },
  toggleButton: {
    textTransform: 'capitalize',
    color: 'rgba(0, 0, 0, 0.87)'
  }
}));

export default useStyles;
