import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'block',
    background: theme.palette.blueGrey['50'],
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(2),
    transition: 'width 0.8s'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    position: 'relative',
    color: theme.palette.blueGrey['500'],
    marginTop: 7
  },
  actionButton: {
    // color: theme.palette.blueGrey['600'],
    marginLeft: '2px',
    marginRight: '2px',
    // background: theme.palette.blueGrey['100'],
    background: '#37474f !important',
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 3,
    marginBottom: '3px',
    textTransform: 'none',
    '& .svg-inline--fa': {
      fontSize: '16px'
    },
    '&:disabled': {
      color: 'grey'
    },
    width: 'max-content'
  },
  separator: {
    background: theme.palette.blueGrey['500'],
    height: 2
  },
  menu: {
    position: 'absolute',
    right: 0,
    display: 'grid',
    gridAutoFlow: 'column',
    alignItems: 'center'
    // gridColumnGap: theme.spacing(3)
  },
  main: {
    overflowY: 'auto',
    height: 'calc(100vh - 183px) ',
    overflowX: 'hidden'
  },
  topologyMain: {
    overflowY: 'auto',
    height: 'calc(100vh - 183px) ',
    overflowX: 'hidden'
  },
  openAndCloseArrow: {
    zIndex: 999999,
    background: 'rgba(0, 0, 0, 0.31)',
    color: theme.palette.primary.contrastText,
    marginLeft: '7px',
    position: 'absolute',
    top: '100px',
    padding: '0px',
    transition: 'left 0.8s'
  },
  logo: {
    display: 'flex'
  },
  resizable: {
    minWidth: '320px',
    position: 'relative',
    '& .react-resizable-handle': {
      position: 'absolute',
      width: 15,
      height: '100%',
      bottom: 0,
      right: '-9px',
      background:
        "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAkElEQVQ4T2NkoDJgpLJ5DMQYKMTExNQAsvjfv38g+h0+RxBjYAEDA8NRqCFWDAwMEyk10IGJiSkS6sJlDAwMByk1EKRfHmrIQ0JhToyXCZmBIj8gBrIyMDCEQ52xkoGB4TelYRjDwMDADjXkJwMDw5JBZyDVvTz4Y5nqCZvqWY/qhQOo+KqHFg6N1Ci+BjaWARrDIhUDrLhGAAAAAElFTkSuQmCC')",
      'background-position': 'right',
      padding: '0 3px 3px 0',
      'background-repeat': 'no-repeat',
      'background-origin': 'content-box',
      'box-sizing': 'border-box',
      cursor: 'e-resize'
    }
  },
  selectFilter: {
    width: '100%',
    marginTop: theme.spacing(1),
    maxHeight: 40,
    background: theme.palette.common.white,
    marginBottom: 5,
    zIndex: theme.zIndex.drawer + 200,
    position: 'absolute',
    top: -85
  },
  tooltip: {
    fontSize: '14px'
  }
}));

export default useStyles;
