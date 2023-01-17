import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1
  },
  pagination: {
    padding: theme.spacing(2),
    float: 'right',
    marginRight: '100px'
  },
  cardRoot: {
    width: 375,
    borderRadius: 10,
    marginTop: 10,
    margin: 10,
    position: 'relative'
  },
  cardContent: {
    background: '#37474f',
    color: 'white'
  },

  showmoreContainer: {
    paddingTop: '30px',
    paddingLeft: '100px',
    paddingRight: '100px',
    paddingBottom: '50px'
  },

  cardNameContainer: {},

  cardNameStyle: {
    fontWeight: 'fontWeightBold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  showmoreCloseButton: {
    float: 'right',
    marginRight: '30px',
    marginTop: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    background: '#37474f !important'
  },

  showmoreTitle: {
    fontSize: '28px',
    marginBottom: '20px'
  },

  showmoreShort: {
    fontSize: '24px',
    marginBottom: '20px'
  },

  showmoreLong: {
    fontSize: '18px',
    marginBottom: '40px'
  },

  showmoreCreatedAt: {
    fontSize: '18px'
  },

  cardBottom: {
    position: 'absolute',
    bottom: '10px',
    width: '100%',
    padding: '5px 15px',
    display: 'flex',
    justifyContent: 'space-between'
  },

  textOverflowLines: {
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 2,
    overflow: 'hidden',
    '& p': {
      margin: 0
    }
  },
  actionButton: {
    // color: theme.palette.blueGrey['800'],
    marginLeft: '2px',
    marginRight: '2px',
    // background: theme.palette.blueGrey['50'],
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 3,
    marginBottom: theme.spacing(1),
    textTransform: 'none',
    '& .svg-inline--fa': {
      fontSize: '16px'
    },
    height: 30,
    justifyContent: 'center'
  }
}));

export default useStyles;
