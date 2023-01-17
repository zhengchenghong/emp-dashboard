import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Grid,
  Box
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { useSmallScreen } from '@app/utils/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HideOnScroll } from '@app/components/ScrollButton';
import useStyles from './style';
import { Auth } from 'aws-amplify';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { UserProfileCard } from '@app/components/Cards';
import { useMenuContext } from '@app/providers/MenuContext';
import { en } from '@app/language';

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
  window: PropTypes.func
};

const MenuBurger = () => {
  const classes = useStyles();
  const [, , , , , , , , setIsLeftMenuOpenSmall] = useMenuContext();
  return (
    <Box className={classes.toolbar}>
      <IconButton onClick={() => setIsLeftMenuOpenSmall((state) => !state)}>
        <Box className={classes.logo}>
          <FontAwesomeIcon
            icon={faBars}
            size="1x"
            style={{ width: '16px', height: '16px' }}
          />
        </Box>
      </IconButton>
    </Box>
  );
};

const Navbar = ({ layout, open, onElClick }) => {
  const classes = useStyles();
  const history = useHistory();
  const [position, setPosition] = useState('relative');
  const [isDashboard, setIsDashboard] = useState(true);
  const [isAuthenticated, setLoggedIn] = useState(true);

  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    (async () => {
      let user = null;
      try {
        // console.log('$37');
        user = await Auth.currentAuthenticatedUser();
        if (user) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (e) {
        setLoggedIn(false);
      }
    })();
  });

  useEffect(() => {
    if (layout === 'dashboard') {
      setPosition('fixed');
      setIsDashboard(true);
    }
  }, [layout]);

  const handleClick = () => {
    history.push('/materials');
  };

  return (
    <HideOnScroll>
      <AppBar
        position={position}
        color="inherit"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
        style={isDashboard || { width: '100%' }}
      >
        <Toolbar id="back-to-top-anchor" className={classes.toolBar}>
          {isAuthenticated && isSmallScreen && <MenuBurger />}
          <Typography variant="h6" component="h6" onClick={handleClick} noWrap>
            {isDashboard ? '' : 'LOGO'}
          </Typography>

          {isAuthenticated && !isDashboard ? (
            <IconButton>
              <AccountCircle />
            </IconButton>
          ) : (
            !isDashboard && (
              <Button
                color="primary"
                onClick={() => {
                  history.push({ pathname: '/' });
                }}
              >
                {en['Sign In']}
              </Button>
            )
          )}
          {isAuthenticated && isDashboard && <UserProfileCard />}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;
