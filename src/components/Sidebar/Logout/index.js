import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import SendIcon from '@material-ui/icons/Send';
import useStyles from './style';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5'
  },
  list: {
    padding: '0'
  }
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    transformOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    backgroundColor: '#37474f',
    color: '#fff',
    '&:hover': {
      color: '#000'
    },
    '&:focus': {
      backgroundColor: '#37474f',
      color: '#fff',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem);

export const Logout = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { onClicklogout } = props;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const classes = useStyles();

  return (
    <div>
      <div className={classes.profileImage}>
        <FontAwesomeIcon
          icon={faUser}
          className={classes.profileImageAvatar}
          onClick={handleClick}
        />
        <ArrowForwardIosIcon
          className={classes.profileArrow}
        ></ArrowForwardIosIcon>
      </div>

      <StyledMenu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ left: '180px', top: '2px' }}
        className={classes.profileMenus}
      >
        <StyledMenuItem>
          <ExitToAppIcon className={classes.logoutIcon}>
            <SendIcon fontSize="small" />
          </ExitToAppIcon>
          <ListItemText primary="Log out" onClick={() => onClicklogout()} />
        </StyledMenuItem>
      </StyledMenu>
    </div>
  );
};
