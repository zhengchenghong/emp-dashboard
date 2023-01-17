import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    marginBottom: theme.spacing(1)
  },
  dropzone: {
    width: '100%',
    minHeight: 100,
    border: `2px dashed ${theme.palette.blueGrey['500']}`,
    borderRadius: 10,
    outline: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropzoneDragging: {
    filter: 'blur(0.5px)',
    '-webkit-filter': 'blur(0.5px)',
    background: theme.palette.blueGrey['50']
  },
  dropzoneParagraph: {
    fontSize: 16,
    color: theme.palette.blueGrey['700']
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 400
  },
  separator: {
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 500
  }
}));

export default useStyles;
