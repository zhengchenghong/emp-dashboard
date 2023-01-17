import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  imageRoot: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.primary.contrastText
  },
  imageText: {
    paddingLeft: 10,
    weight: 900,
    textAlign: 'left'
  },
  image: {
    height: 80,
    width: 80
  },
  previewImage: {
    height: 200,
    width: 250
  },
  pagination: {
    position: 'absolute',
    bottom: theme.spacing(7)
  },
  closeButton: {
    position: 'absolute',
    color: theme.palette.primary.contrastText
  },
  imageURL: {
    marginLeft: 10,
    color: theme.palette.primary.contrastText,
    maxWidth: 350
  },
  title: {
    color: theme.palette.primary.contrastText,
    alignSelf: 'baseline'
  },
  resourceTitle: {
    marginLeft: 10,
    color: theme.palette.primary.contrastText,
    maxWidth: 350,
    fontWeight: 800
  },
  white: {
    '& .MuiIconButton-root': {
      color: 'white'
    },
    color: 'white'
  }
}));

export default useStyles;
