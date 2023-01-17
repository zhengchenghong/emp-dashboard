import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
    // marginBottom: theme.spacing(1)
  },
  noBoxRoot: {
    flex: 1,
    // height: 'auto !important',
    // marginBottom: theme.spacing(1),
    '&.MuiPaper-elevation1': {
      border: '1px solid rgb(0 0 0 / 14%)',
      boxShadow: 'none'
    }
  },
  shadowRoot: {
    flex: 1,
    boxShadow:
      '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)'
  },
  dropzoneCard: {
    // background: theme.palette.blueGrey['50'],
    flex: 1,
    height: '230px'
  },
  halfHeightDropzoneCard: {
    // background: theme.palette.blueGrey['50'],
    flex: 1,
    height: '117px'
  },
  dropzoneGalleryStation: {
    flex: 1,
    height: '134px'
  },
  dropzoneGalleryUserInTable: {
    flex: 1,
    height: '60px',
    padding: '0px important'
  },
  dropzone: {
    width: '100%',
    minHeight: theme.spacing(10),
    outline: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropzoneStation: {
    width: '100%',
    minHeight: '196px',
    outline: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropzoneClass: {
    width: '100%',
    minHeight: '196px',
    outline: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  halfHeightDropzoneClass: {
    width: '100%',
    minHeight: '86px',
    outline: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropzoneGallery: {
    width: '100%',
    minHeight: '126px',
    outline: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropzoneUserInTable: {
    width: '100%',
    minHeight: '60px',
    outline: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px important'
  },
  dropzoneParagraph: {
    fontSize: 14,
    color: theme.palette.blueGrey['700']
  },

  dropzoneParagraphUser: {
    fontSize: 11,
    color: theme.palette.blueGrey['700']
  },
  imageArea: {
    position: 'relative',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: theme.spacing(10),
    background: '#fff'
  },
  closeButton: {
    position: 'absolute',
    right: -21,
    top: -24
  },
  closeButtonforCardView: {
    // position: 'absolute',
    // right: -21,
    // top: -24
  },
  media: {
    // maxHeight: '214px',
    backgroundSize: 'contain',
    // width: '100% !important',
    objectFit: 'contain',
    maxWidth: '100% !important',
    height: '100% !important'
  },
  halfHeightMedia: {
    maxHeight: '107px',
    backgroundSize: 'contain',
    width: '100% !important',
    objectFit: 'contain'
  },
  media1: {
    width: '100% !important',
    backgroundSize: 'contain',
    objectFit: 'contain',
    maxHeight: '114px',
    height: '114px'
  },
  mediaforCardView: {
    // width: '100% !important',
    backgroundSize: 'contain',
    objectFit: 'contain',
    maxHeight: '114px',
    height: '114px'
  },
  mediaUserInTable: {
    width: '100% !important',
    backgroundSize: 'contain',
    objectFit: 'contain',
    maxHeight: '60px',
    height: '60px'
  },
  preview: {
    paddingBottom: theme.spacing(2),
    // display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
    // position: 'relative'
  },
  preview1: {
    flex: 1,
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    background: 'white',
    border: 'solid 1px',
    borderRadius: theme.spacing(1),
    borderColor: 'rgba(0, 0, 0, 0.23)',
    height: '230px'
  },
  preview2: {
    padding: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    border: 'solid 1px',
    borderRadius: theme.spacing(1),
    borderColor: 'rgba(0, 0, 0, 0.23)',
    height: '230px'
  },
  preview3: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    border: 'solid 1px',
    borderRadius: theme.spacing(1),
    borderColor: 'rgba(0, 0, 0, 0.23)',
    height: '134px'
  },
  previewCardView: {
    display: 'flex',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    border: 'solid 1px',
    borderRadius: theme.spacing(1),
    borderColor: 'rgba(0, 0, 0, 0.23)',
    height: '134px'
  },
  previewClass: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    background: 'white',
    border: 'solid 1px',
    borderRadius: theme.spacing(1),
    borderColor: 'rgba(0, 0, 0, 0.23)',
    height: '230px'
  },
  halfHeightPreviewClass: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    background: 'white',
    border: 'solid 1px',
    borderRadius: theme.spacing(1),
    borderColor: 'rgba(0, 0, 0, 0.23)',
    height: '117px'
  },

  previewUserInTable: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    background: 'white',
    border: 'solid 1px',
    borderRadius: 3,
    borderColor: 'rgba(0, 0, 0, 0.23)',
    height: '60px'
  },
  dropzoneGridStation: {
    padding: 0
  },
  dropzoneGridClass: {},
  dropzoneGrayDisable: {
    paddingLeft: 20
  },
  dropzoneGrayEnable: {
    padding: 20,
    paddingRight: 0
  }
}));

export default useStyles;
