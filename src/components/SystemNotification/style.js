import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    '& div > div > div': {
      width: 'inherit !important'
      // transform: 'translate3d(0px, 0px, 0px) !important'
    },
    '& div > div > div > div': {
      width: '100% !important'
    }
  },

  container: {
    display: 'flex',
    borderRadius: '5px',
    height: '48px',
    // width: '100%',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  subContainer: {
    alignItems: 'center',
    height: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'flex',
    justifyContent: 'center'
  },
  tooltip: {
    fontSize: '14px'
  },

  imageDiv: {
    maxWidth: '60px',
    minWidth: '60px',
    marginTop: '0px',
    marginBottom: '0px'
  },

  image: {
    display: 'unset !important',
    width: '50px',
    marginTop: '3px',
    maxHeight: '42px',
    borderRadius: '2px'
  },
  title: {
    marginLeft: '10px',
    fontSize: '20px',
    fontWeight: 600
  },
  short: {
    marginLeft: '10px',
    fontSize: '20px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  long: {
    fontSize: '16px'
  },
  closeButton: {
    fontSize: '18px',
    color: 'black',
    top: '0px',
    right: '5px',
    width: '20px !important',
    maxWidth: '20px !important',
    '&:hover': {
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  },
  emptyDiv: {
    top: '0px',
    right: '5px',
    width: '20px !important',
    maxWidth: '20px !important'
  }
}));
