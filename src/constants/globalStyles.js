import { makeStyles } from '@material-ui/core/styles';
// import theme from '@app/styles/theme';

export const GridSpacingStyles = {
  editPanelSpacing: 0
};

export const globaluseStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  breadcrumb: {
    cursor: 'pointer',
    fontSize: 14,
    '&:hover': {
      fontWeight: 700
    }
  },
  breadcrumbLink: {
    cursor: 'pointer',
    fontSize: 14,
    color: 'blue',
    '&:hover': {
      fontWeight: 700,
      textDecorationLine: 'underline'
    }
  },
  rootStation: {
    flex: 1,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.blueGrey['50'],
    '&.MuiPaper-elevation1': {
      border: '1px solid rgb(0 0 0 / 14%)',
      boxShadow: 'none'
    },
    '&.MuiPaper-root': {
      backgroundColor: 'none'
    }
  },
  grayPanel: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.blueGrey['50'],
    justifyContent: 'space-between'
    // paddingTop: '10px'
  },
  schedule: {
    // paddingTop: theme.spacing(3),
    background: theme.palette.blueGrey['50']
  },
  column: {
    flexDirection: 'column',
    background: theme.palette.blueGrey['50'],
    padding: '24px'
  },
  descSpacing: {
    padding: '22px !important'
  },
  resourceSpacing: {
    padding: '16px !important'
  },
  avatar: {
    flexDirection: 'column'

    // background: theme.palette.blueGrey['50'],
    // marginBottom: '0px'
    // padding: 10
  },
  elementList: {
    paddingBottom: 40
  },
  listItems: {
    cursor: 'pointer',
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0)
  },
  listItem: {
    color: theme.palette.blueGrey['900'],
    fontWeight: 700
  },
  listItemSelected: {
    color: theme.palette.common.black,
    fontWeight: 700,
    background: theme.palette.blueGrey['200']
  },
  listItemText: {
    color: theme.palette.blueGrey['700']
  },
  errorListItemText: {
    color: 'red'
  },

  listSelectedItemText: {
    fontWeight: 700,
    color: theme.palette.blueGrey['700']
  },
  docId: {
    color: theme.palette.blueGrey['700'],
    marginBottom: theme.spacing(1)
  },
  descCard: {
    width: '100%',
    background: theme.palette.blueGrey['50'],
    marginBottom: theme.spacing(2)
  },
  state: {
    fontSize: 14,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    backgroundColor: '#21ff00'
  },
  warning: {
    color: theme.palette.blueGrey['800'],
    fontWeight: 500,
    fontSize: 18
  },
  boxBtn: {
    borderRadius: 3,
    width: '100%',
    backgroundColor: theme.palette.blueGrey['50'],
    height: '100px',
    lineHeight: '100px',
    fontSize: 14,
    marginBottom: theme.spacing(2),
    boxShadow:
      '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)'
  },
  category: {
    flex: 1,
    padding: theme.spacing(2),
    margin: '20px 15px 0px 15px',
    backgroundColor: theme.palette.blueGrey['50'],
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.spacing(12),
    boxShadow:
      '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  detailCard: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.blueGrey['50']
  },
  formHead: {
    marginTop: '10px'
  },
  selectBox: {
    marginTop: theme.spacing(1),
    maxHeight: 40,
    background: theme.palette.common.white
  },
  mainListSelectBox: {
    maxHeight: 46,
    height: 46,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px !important',
    background: 'lightgray !important',
    '& .MuiSelect-select:focus': {
      backgroundColor: 'lightgray !important'
    },
    '& .MuiSelect-select:hover': {
      backgroundColor: 'lightgray !important'
    },
    borderRadius: '0px',
    border: '2px solid rgb(0 0 0 / 35%)'
  },
  customDialogContent: {
    marginTop: theme.spacing(1),
    minWidth: 350,
    // minHeight: 80,
    overflowY: 'hidden !important'
  },
  dialogWidth: {
    width: 400,
    overflowY: 'unset'
  },
  labelClass: {
    marginTop: 20
  },
  selectFilter: {
    marginBottom: 5
  },

  archiveSelectFilter: {
    marginBottom: 15
  },
  toolbar: {
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  media: {
    height: 72,
    backgroundSize: 'contain'
  },
  editPanelHtmlCard: {
    backgroundColor: theme.palette.blueGrey['50']
  },
  editPanelHtmlCard1: {
    flex: 1,
    backgroundColor: theme.palette.blueGrey['50'],
    height: '100%'
    // margin: '0px 5px 0px 10px',
    // padding: theme.spacing(3)
  },
  editPanelTagCard: {
    minHeight: theme.spacing(12),
    backgroundColor: theme.palette.blueGrey['50']
  },
  editPanelAttachCard: {
    marginTop: theme.spacing(2),
    minHeight: 'calc(100vh - 259px)',
    backgroundColor: theme.palette.blueGrey['50']
  },
  editPanelAttachCard2: {
    height: '100%',
    // margin: '10px 15px 0px 0px',
    backgroundColor: theme.palette.blueGrey['50']
    // padding: theme.spacing(3)
  },

  editPanelMobileAttachCard: {
    height: '100%',
    // margin: '12px 10px 0px 10px',
    backgroundColor: theme.palette.blueGrey['50']
    // padding: theme.spacing(3)
  },
  1: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: theme.palette.blueGrey['50'],
    width: '100%',
    '& div': {
      paddingLeft: 0,
      paddingRight: 5,
      overflowX: 'hidden'
    }
  },

  dropzone: {
    width: '100%',
    outline: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stationEdit: {
    background: theme.palette.blueGrey['50'],
    '&.MuiPaper-elevation1': {
      border: '1px solid rgb(0 0 0 / 14%)',
      boxShadow: 'none'
    },
    padding: '24px'
  },
  stateSelect: {
    padding: 21,
    marginBottom: 0
  },
  infoDialogContent: {
    marginTop: theme.spacing(1),
    minWidth: 550,
    minHeight: 80
  },
  addCategoryBtn: {
    minWidth: 550,
    display: 'block',
    margin: '20px auto auto auto'
  },
  inputArea: {
    width: '100%',
    marginTop: `${theme.spacing(1)}px`,
    marginBottom: `${theme.spacing(1)}px`,
    backgroundColor: theme.palette.background.paper,
    fontSize: 14,
    fontWeight: 100
  },
  inputArea1: {
    width: '100%',
    marginTop: '0px',
    marginBottom: `${theme.spacing(1)}px`,
    backgroundColor: theme.palette.background.paper,
    fontSize: 14,
    fontWeight: 100
  },
  descInput: {
    fontSize: 14,
    marginTop: '0px'
    // marginTop: `9px !important`,
    // marginBottom: `9px !important`
  },
  thumbnailImg: {
    display: 'block',
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '.2rem solid rgb(226, 226, 226)'
  }
}));

export const DescCardStyle = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.blueGrey['50']
  },
  rootStation: {
    flex: 1,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.blueGrey['50'],
    '&.MuiPaper-elevation1': {
      border: '1px solid rgb(0 0 0 / 14%)',
      boxShadow: 'none'
    }
  },
  descSpacing: {
    padding: '22px'
  },
  resourceSpacing: {
    padding: '16px'
  },
  descSpacing1: {
    marginTop: '-12px',
    display: 'flex',
    flexDirection: 'column'
    // paddingTop: '16px',
    // paddingLeft: '22px',
    // paddingRight: '22px',
    // paddingBottom: '16px'
  },
  descInput: {
    fontSize: 14,
    marginTop: `12px !important`,
    marginBottom: `12px !important`
  },
  descInput1: {
    fontSize: 14,
    marginTop: `12px !important`
  },
  shortDesc: {
    marginTop: `11px !important`
  },
  classInput: {
    // marginTop: `${theme.spacing(1)}px !important`,
    // marginBottom: `${theme.spacing(1)}px !important`
  },
  inputArea: {
    width: '100%',
    // marginTop: `${theme.spacing(1)}px`,
    // marginBottom: `${theme.spacing(1)}px`,
    backgroundColor: theme.palette.background.paper,
    fontSize: 14,
    fontWeight: 100
  },
  inputArea_noBtmMargin: {
    width: '100%',
    // marginTop: `${theme.spacing(3)}px !important`,
    backgroundColor: theme.palette.background.paper,
    fontSize: 14,
    fontWeight: 100
  },
  inputArea_noBtmMargin_noColor: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: 100,
    color: 'white'
  },
  textArea: {
    minWidth: '100%',
    maxWidth: '100%',
    marginTop: theme.spacing(1),
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: 100,
    paddingTop: 9,
    paddingLeft: 12,
    outlineColor: theme.palette.primary.main,
    borderRadius: 5,
    borderColor: '#c1bdbd'
  },
  selectBox: {
    width: '100%',
    backgroundColor: 'white !important',
    '&:hover': {
      backgroundColor: 'white !important'
    }
  },
  textField: {
    width: '100%',
    margin: '2px'
  },
  pagination: {
    padding: theme.spacing(2),
    float: 'right',
    marginRight: '100px'
  }
}));
