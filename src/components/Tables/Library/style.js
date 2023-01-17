import { lighten, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
  },
  paper: {
    width: '100%',
    marginBottom: 0
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
  selectFilter: {
    maxHeight: 40,
    background: theme.palette.common.white,
    width: '120px',
    fontSize: '13px',
    minWidth: 120,
    maxWidth: 150
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
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  cardContent: {
    background: '#37474f',
    color: 'white'
  },

  showmoreContainer: {
    paddingTop: '20px',
    paddingLeft: '40px',
    paddingRight: '40px',
    paddingBottom: '50px'
  },

  showmoreContainerMobile: {
    paddingTop: '20px',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '30px'
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

  labelsParentDiv: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid gray',
    borderRadius: '4px',
    padding: '8px 20px 8px',
    background: 'white',
    position: 'relative'
  },

  hintLabel: {
    position: 'absolute',
    top: '-10px',
    left: '20px',
    background: '#eceff1',
    width: 'fit-content',
    height: 'fit-content',
    padding: '0px 8px',
    borderRadius: '9px',
    fontSize: '13px',
    color: 'gray'
  },

  showmoreTitle: {
    fontSize: '26px'
  },

  aliasLabel: {
    fontSize: '16px',
    width: '160px',
    minWidth: '160px'
  },

  showMoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },

  showmoreShort: {
    fontSize: '22px'
  },

  showmoreLong: {
    fontSize: '18px'
  },

  showmoreCreatedAt: {
    fontSize: '18px'
  },

  cardBottom: {
    // position: 'absolute',
    bottom: '10px',
    width: '100%',
    padding: '5px 15px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    height: '-webkit-fill-available',
    alignItems: 'flex-end'
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
  },

  referenceToolTip: {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid',
    fontSize: '13px',
    maxWidth: '400px',
    width: '400px'
  }
}));

export const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  title: {
    flex: '1 1 100%'
  }
}));

export default useStyles;
