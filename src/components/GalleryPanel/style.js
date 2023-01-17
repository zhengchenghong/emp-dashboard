import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  imageRoot: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 96,
    maxHeight: 96,
    color: theme.palette.primary.contrastText
  },
  imageText: {
    fontWeight: 900,
    textAlign: 'left'
  },
  image: {
    height: 80,
    maxWidth: 130,
    objectFit: 'contain'
  },
  imageMobile: {
    height: 80,
    maxWidth: 130,
    objectFit: 'contain',
    width: '100%'
  },
  previewImage: {
    height: 200,
    width: 250
  },
  pagination: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    justifyContent: 'center',
    display: 'flex'
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
  }
}));

export default useStyles;
