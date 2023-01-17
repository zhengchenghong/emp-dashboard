import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    '& .jsoneditor-tree-inner': {
      minWidth: 400
    },

    '& .jsoneditor-tree': {
      overflow: 'auto'
    }
  },

  sliderMenuArea: {
    height: 40,
    marginTop: -53,
    flex: 1,
    flexDirection: 'column',
    zIndex: theme.zIndex.drawer + 100,
    position: 'absolute'
  },
  button: {
    height: 40,
    width: 200,
    boxShadow: 0
  },
  indicator: {
    backgroundColor: theme.palette.blueGrey['800'],
    animationDuration: '0ms'
  },
  tab: {
    minWidth: 110,
    paddingTop: 40
  },
  sliderMenu: {
    height: 40,
    marginTop: 0,
    display: 'flex'
  }
}));

export default useStyles;
