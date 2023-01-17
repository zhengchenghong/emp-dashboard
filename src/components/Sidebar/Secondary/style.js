import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    backgroundColor: theme.palette.blueGrey['700'],
    paddingTop: 55,
    zIndex: 99
  },
  open: {
    width: drawerWidth
  },
  close: {
    display: 'none'
  },
  textField: {
    padding: `3px ${theme.spacing(1)}px`,
    width: 280,
    background: theme.palette.primary.contrastText
  },
  separator: {
    background: theme.palette.blueGrey['500'],
    height: 2
  },
  galleryTitle: {
    marginTop: 3,
    color: theme.palette.primary.contrastText,
    fontWeight: 900
  },
  main: {
    marginTop: 20
  },
  whiteColor: {
    color: 'white'
  },
  autoRoot: {
    width: '95%',
    margin: 'auto',
    '& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
      // Default transform is "translate(14px, 20px) scale(1)""
      // This lines up the label with the initial cursor position in the input
      // after changing its padding-left.
      transform: 'translate(34px, 20px) scale(1);'
    }
  },
  inputRoot: {
    backgroundColor: 'white',
    // This matches the specificity of the default styles at https://github.com/mui-org/material-ui/blob/v4.11.3/packages/material-ui-lab/src/Autocomplete/Autocomplete.js#L90
    '&[class*="MuiOutlinedInput-root"]': {
      // Default left padding is 6px
      padding: '0px 0px 0px 8px'
    }
  },
  resizable: {
    // minWidth: '310px',
    position: 'relative',
    '& .react-resizable-handle': {
      position: 'absolute',
      width: 15,
      height: '100%',
      bottom: 0,
      left: 0,
      background:
        "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAkElEQVQ4T2NkoDJgpLJ5DMQYKMTExNQAsvjfv38g+h0+RxBjYAEDA8NRqCFWDAwMEyk10IGJiSkS6sJlDAwMByk1EKRfHmrIQ0JhToyXCZmBIj8gBrIyMDCEQ52xkoGB4TelYRjDwMDADjXkJwMDw5JBZyDVvTz4Y5nqCZvqWY/qhQOo+KqHFg6N1Ci+BjaWARrDIhUDrLhGAAAAAElFTkSuQmCC')",
      backgroundPosition: 'left',
      padding: '0 3px 3px 0',
      'background-repeat': 'no-repeat',
      'background-origin': 'content-box',
      'box-sizing': 'border-box',
      cursor: 'e-resize'
    },
    '& .react-resizable-handle-sw': {
      bottom: 0,
      left: 0,
      cursor: 'sw-resize',
      transform: 'rotate(90deg)'
    }
  },
  iconButton: {
    // color: theme.palette.primary.contrastText,
    paddingRight: '4px !important'
  },
  closeButton: {
    // color: theme.palette.primary.contrastText,
    paddingt: '4px !important',
    paddingLeft: '4px !important',
    paddingTop: '4px !important',
    paddingBottom: '4px !important',
    marginTop: 8
  },
  input: {
    // color: theme.palette.primary.contrastText,
    width: `calc(100% - 80px)`
  }
}));

export default useStyles;
