import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
    flexGrow: 1,
    paddingBottom: 100
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    position: 'relative',
    color: theme.palette.blueGrey['500'],
    overflow: 'hidden'
  },
  separator: {
    background: theme.palette.blueGrey['500'],
    height: 2,
    marginBottom: theme.spacing(2)
  },
  actionGroup: {
    display: 'flex',
    position: 'absolute',
    background: 'transparent',
    right: 0,
    '@media (max-width:1280px) and (min-width:1280px)': {
      marginRight: '7vw'
    }
  },
  actionGroup1: {
    display: 'flex',
    // position: 'absolute',
    background: 'transparent',
    right: 0,
    '@media (max-width:1280px) and (min-width:1280px)': {
      marginRight: '7vw'
    }
  },
  actionButton: {
    // color: theme.palette.blueGrey['800'],
    marginLeft: '2px',
    marginRight: '2px',
    // background: theme.palette.blueGrey['50'],
    background: '#37474f !important',
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 3,
    // marginBottom: theme.spacing(0.5),
    textTransform: 'none',
    '& .svg-inline--fa': {
      fontSize: '16px'
    },
    // height: 30,
    marginBottom: 4,
    width: 'max-content',
    color: '#ffffff  !important'
  },
  disabledActionButton: {
    // color: theme.palette.blueGrey['800'],
    marginLeft: '2px',
    marginRight: '2px',
    // background: theme.palette.blueGrey['50'],
    background: '#37474f !important',
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 3,
    // marginBottom: theme.spacing(0.5),
    textTransform: 'none',
    '& .svg-inline--fa': {
      fontSize: '16px'
    },
    // height: 30,
    marginBottom: 4,
    width: 'max-content',
    color: '#808080  !important'
  },
  resSearchButton: {
    // color: theme.palette.blueGrey['800'],
    marginLeft: '6px',
    marginRight: '6px',
    // background: theme.palette.blueGrey['50'],
    background: '#37474f !important',
    borderRadius: 3,
    fontSize: '16px',
    padding: '0px 28px',
    // marginBottom: theme.spacing(0.5),
    textTransform: 'none',
    '& .svg-inline--fa': {
      fontSize: '16px'
    },
    height: 37,
    width: 'max-content'
  },
  main: {
    overflowY: 'auto',
    height: 'calc(100vh - 180px)',
    overflowX: 'auto'
  },
  sliderMenuArea: {
    height: 53,
    marginTop: -54,
    flex: 1,
    flexDirection: 'column',
    zIndex: theme.zIndex.drawer + 100,
    position: 'absolute'
  },
  sliderMenu: {
    height: 50,
    marginTop: 0,
    display: 'flex'
  },
  indicator: {
    backgroundColor: theme.palette.blueGrey['800'],
    animationDuration: '0ms',
    width: '4px'
  },
  tab: {
    minWidth: 110,
    paddingTop: theme.spacing(4)
  },
  tab2: {
    backgroundColor: theme.palette.blueGrey['200'],
    color: 'white'
  },
  tab1: {
    minWidth: 110,
    padding: 0,
    minHeight: '32px !important',
    fontFamily: 'Roboto',
    fontWeight: '800'
  },
  addBtn: {
    // background: theme.palette.blueGrey['500'],
    backgroundColor: '#37474f !important',
    color: 'white',
    height: 30,
    marginLeft: theme.spacing(2),
    '&:hover': {
      background: theme.palette.blueGrey['500'],
      color: theme.palette.blueGrey['50']
    }
  },

  dropdownMenu: {
    position: 'absolute',
    top: 27,
    right: 0,
    zIndex: 1000,
    fontSize: '14px',
    textAlign: 'left',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
    minWidth: '200px',
    paddingBlock: '4px',
    background: 'white',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.175)',
    backgroundClip: 'padding-box',
    '-webkit-transition': 'all 0.2s ease',
    // opacity: 0,
    '-webkit-transform-origin': 'right top 0px',
    // '-webkit-transform': 'scale(0)',
    '& > ul': {
      minWidth: '160px',
      padding: '5px 0',
      // margin: '2px 0 0',
      listStyle: 'none',
      position: 'relative',
      '& > li': {
        color: '#666',
        margin: 0,
        padding: '5px 5px 5px 5px',
        height: '32px',
        listStyle: 'none'
      }
    }
  },

  ellipsisDivider: {
    height: '1px',
    marginTop: '7px',
    marginBottom: '7px',
    background: 'grey',
    width: '100%',
    marginRight: '12px',
    marginLeft: '12px'
  },

  insideEllipsisDivider: {
    height: '1px',
    marginTop: '7px',
    marginBottom: '7px',
    background: 'grey',
    marginRight: '12px',
    marginLeft: '12px'
  },

  dropdownMenu1: {
    // position: 'absolute',
    // top: 23,
    right: 0,
    zIndex: 1000,
    fontSize: '14px',
    textAlign: 'left',
    // backgroundColor: '#fff',
    // border: '1px solid #ccc',
    // borderRadius: '4px',
    // boxShadow: '0 6px 12px rgba(0, 0, 0, 0.175)',
    backgroundClip: 'padding-box',
    '-webkit-transition': 'all 0.2s ease',
    // opacity: 0,
    '-webkit-transform-origin': 'right top 0px',
    // '-webkit-transform': 'scale(0)',
    '& > ul': {
      minWidth: '160px',
      padding: '5px 0',
      // margin: '2px 0 0',
      listStyle: 'none'
      // position: 'relative',
      // '& > li': {
      //   color: '#666',
      //   margin: 0,
      //   padding: '5px 5px 5px 5px',
      //   height: '32px',
      //   listStyle: 'none'
      // }
    }
  },
  disabledButton: {
    // color: 'inherit',
    marginRight: '2px',
    background: 'transparent',
    backgroundColor: 'transparent !important',
    fontFamily: 'Roboto',
    fontWeight: '800',
    paddingTop: 0,
    paddingBottom: 0,
    '&:hover': {
      background: 'transparent',
      backgroundColor: 'transparent'
    },
    boxShadow: 'none !important',
    height: 28,
    marginBottom: 4,
    width: '100%'
  },

  actionButton1: {
    color: 'inherit',
    marginRight: '2px',
    background: 'transparent !important',
    // background: '#37474f !important',
    backgroundColor: 'transparent',
    fontFamily: 'Roboto',
    fontWeight: '800',
    paddingTop: 0,
    paddingBottom: 0,
    // borderRadius: 3,
    // marginBottom: theme.spacing(0.5),
    // textTransform: 'none',
    // '& .svg-inline--fa': {
    //   fontSize: '16px'
    // },
    '&:hover': {
      background: 'transparent',
      backgroundColor: 'transparent'
    },
    boxShadow: 'none !important',
    height: 28,
    marginBottom: 4,
    width: '100%'
  },
  toggleButton: {
    textTransform: 'capitalize',
    color: '#607d8b',
    fontFamily: 'Roboto',
    fontWeight: '800',
    minWidth: 'max-content'
  },
  subMenuItem: {
    paddingLeft: '25px'
  }
}));

export default useStyles;
