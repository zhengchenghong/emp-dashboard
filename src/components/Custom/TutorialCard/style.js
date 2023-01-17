import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 10,
    marginTop: 10
  },

  content: {
    background: '#37474f',
    color: 'white',
    whiteSpace: 'nowrap',
    height: 80
  },

  cardNameStyle: {
    marginTop: 12,
    fontWeight: 'fontWeightBold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
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
    float: 'right',
    marginTop: 20,
    marginBottom: 20
  },
  infoIcon: {
    float: 'right',
    marginTop: 20,
    marginBottom: 20
  },

  imageArea: {
    position: 'relative',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: theme.spacing(10),
    background: '#fff'
  },

  preview2: {
    flex: 1,
    padding: theme.spacing(1),
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    border: 'solid 1px',
    borderRadius: theme.spacing(1),
    borderColor: 'rgba(0, 0, 0, 0)',
    height: '150px'
  },

  media: {
    maxHeight: '150px',
    backgroundSize: 'contain',
    width: '100% !important',
    objectFit: 'contain',
    borderRadius: theme.spacing(1)
  }
}));
export default useStyles;
