import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 375,
    borderRadius: 10,
    marginTop: 10
  },

  content: {
    background: '#37474f',
    color: 'white',
    whiteSpace: 'nowrap',
    position: 'relative',
    padding: 0
  },

  cardNameStyle: {
    // marginTop: 21,
    fontWeight: 'fontWeightBold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)'
  },

  nameStyle: {
    fontWeight: 'fontWeightBold'
  },

  titleStyle: {
    fontWeight: 'fontWeightBold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    marginBottom: 10
  },

  shortDescription: {
    marginTop: 15,
    marginBottom: 15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical'
  },

  longDescription: {
    marginTop: 15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '4',
    WebkitBoxOrient: 'vertical'
  },

  boxStyle: {
    overflow: 'hidden',
    fontWeight: 'fontWeightBold'
  },

  descriptionRight: {
    float: 'right',
    marginTop: 20,
    marginBottom: 20,
    marginRight: 20
  },

  descriptionLeft: {
    float: 'left',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20
  },

  deleteIcon: {
    float: 'right',
    marginTop: 20,
    marginBottom: 20
  },

  editIcon: {
    position: 'absolute',
    float: 'right',
    color: 'white',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '10px'
  },

  imageArea: {
    position: 'relative',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: theme.spacing(10),
    background: '#fff'
  },

  preview2: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },

  media: {
    borderRadius: '50%',
    padding: 5,
    marginLeft: 5,
    objectFit: 'cover'
  }
}));
export default useStyles;
