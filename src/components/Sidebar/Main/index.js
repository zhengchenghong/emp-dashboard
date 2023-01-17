/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useHistory, withRouter } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@material-ui/core/styles';
import {
  Box,
  List,
  Drawer,
  Divider,
  ListItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  MenuItem
} from '@material-ui/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { setMenuListByRole } from './Menu';
import { useSmallScreen } from '@app/utils/hooks';
import useStyles from './style';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { useUserContext } from '@app/providers/UserContext';
import { useMediumScreen } from '@app/utils/hooks';
import { useFilterContext } from '@app/providers/FilterContext';
import { useMenuContext } from '@app/providers/MenuContext';

const Menu = ({ el, selected, handleSelected, openMenu }) => {
  const classes = useStyles();
  const theme = useTheme();
  return el.submenu ? (
    <React.Fragment>
      <ListItem
        button
        onClick={() => handleSelected(el)}
        className={classes.listItems}
      >
        {el.icon ? (
          <ListItemIcon className={classes.listItemIcons}>
            <FontAwesomeIcon
              icon={el.icon}
              size="1x"
              color={theme.palette.primary.contrastText}
              style={{ width: '16px', height: '16px' }}
            />
          </ListItemIcon>
        ) : (
          []
        )}
        <ListItemText
          primary={<Typography type="body2">{el.text}</Typography>}
        />
        {openMenu[el.text] ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openMenu[el.text]} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {el.submenu.map((resource, i) => (
            <Link to={resource.url} style={{ textDecoration: 'none' }}>
              <MenuItem
                key="1"
                className={clsx(classes.nested, {
                  [classes.selectednested]: resource.url !== selected,
                  [classes.selectednested]: resource.url === selected
                })}
              >
                {/* <Icon type="home" /> */}
                {resource.url === selected ? (
                  <span style={{ fontWeight: 'bold' }}>{resource.text}</span>
                ) : (
                  <span>{resource.text}</span>
                )}
                {/* <span>{resource.text}</span> */}
              </MenuItem>
            </Link>
          ))}
        </List>
      </Collapse>
    </React.Fragment>
  ) : (
    <Link
      to={el.url}
      style={{
        textDecoration: 'none',
        cursor: el.disabled ? 'not-allowed' : 'pointer'
      }}
      onClick={(e) => (el.disabled ? e.preventDefault() : '')}
    >
      <ListItem
        button
        disabled={el.disabled ? true : false}
        onClick={() => handleSelected(el)}
        className={clsx(classes.listItems, {
          [classes.listItems]: selected.indexOf(el.url) === -1,
          [classes.listItemsSelected]: selected.indexOf(el.url) !== -1
        })}
      >
        {el.icon ? (
          <ListItemIcon className={classes.listItemIcons}>
            <FontAwesomeIcon
              icon={el.icon}
              size="1x"
              color={theme.palette.primary.contrastText}
              style={{ width: '16px', height: '16px' }}
            />
          </ListItemIcon>
        ) : (
          []
        )}
        {selected.indexOf(el.url) !== -1 ? (
          <ListItemText
            primary={
              <Typography type="body2" style={{ fontWeight: 'bold' }}>
                {el.text}
              </Typography>
            }
          />
        ) : (
          <ListItemText
            primary={<Typography type="body2">{el.text}</Typography>}
          />
        )}
      </ListItem>
    </Link>
  );
};

const MainSidebar = ({ open, onChange, location, isSuperAdmin }) => {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState('');
  const [openMenu, setOpenMenu] = useState({});
  const [currentUser] = useUserContext();
  const [listElements, setListElements] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const [, , , , , , , isLeftMenuOpenSmall, setIsLeftMenuOpenSmall] =
    useMenuContext();
  const isMediumScreen = useMediumScreen();
  const { filtersReset, setFiltersReset } = useFilterContext();

  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    if (currentUser) {
      try {
        if (currentUser?.schemaType === 'superAdmin') {
          setListElements(setMenuListByRole('super-admin'));
          !isFirstLoad && history.push('/topology');
        } else if (currentUser?.schemaType === 'educator') {
          setListElements(setMenuListByRole('educator'));
          !isFirstLoad && history.push('/materials/dashboard');
        } else if (currentUser?.schemaType === 'stationAdmin') {
          setListElements(setMenuListByRole('stationAdmin'));
          !isFirstLoad && history.push('/topology');
        } else if (currentUser?.schemaType === 'districtAdmin') {
          setListElements(setMenuListByRole('districtAdmin'));
          !isFirstLoad && history.push('/topology');
        } else if (currentUser?.schemaType === 'sysAdmin') {
          setListElements(setMenuListByRole('sysAdmin'));
          !isFirstLoad && history.push('/topology');
        } else if (currentUser?.schemaType === 'schoolAdmin') {
          setListElements(setMenuListByRole('schoolAdmin'));
          !isFirstLoad && history.push('/materials');
        } else {
          setListElements(setMenuListByRole('system-admin'));
          !isFirstLoad && history.push('/topology');
        }
        setIsFirstLoad(true);
      } catch (err) {
        console.log(err);
      }
    }
  }, [currentUser, isSuperAdmin]);

  useEffect(() => {
    if (location) {
      let tmpUrl = `/${location.pathname.split('/')[1]}`;
      if (tmpUrl === '/materials' || tmpUrl === '/classes') {
        tmpUrl = `/${location.pathname.split('/')[1]}/${
          location.pathname.split('/')[2]
        }`;
      }
      tmpUrl = tmpUrl.replace('/undefined/', '');

      setSelected(tmpUrl);
    }
  }, [location]);

  useEffect(() => {
    if (isMediumScreen) {
      onChange(false);
    } else {
      onChange(true);
    }
  }, [isMediumScreen]);

  const handleDrawerClose = () => {
    onChange(!open);
  };

  const handleSelected = async (value) => {
    if (value.url.includes('/materials') || value.url.includes('/topology')) {
      setFiltersReset(!filtersReset);
    }

    setSelected(value.url);
    if (value.submenu) {
      setOpenMenu({
        ...openMenu,
        [value.text]: !openMenu[value.text]
      });
    }
    setIsLeftMenuOpenSmall(false);
  };

  return (
    <Drawer
      variant={isSmallScreen ? 'temporary' : 'permanent'}
      open={isSmallScreen ? isLeftMenuOpenSmall : true}
      onClose={() => setIsLeftMenuOpenSmall((state) => !state)}
      className={clsx(classes.root, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}
      classes={{
        paper: clsx(
          classes.root,
          {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          },
          { position: 'fixed' }
        )
      }}
      style={isSmallScreen ? { zIndex: 1450 } : {}}
    >
      {!isSmallScreen && (
        <Box className={classes.toolbar}>
          <IconButton
            className={classes.openAndClose}
            onClick={handleDrawerClose}
          >
            <Box className={classes.logo}>
              <FontAwesomeIcon
                icon={faBars}
                size="1x"
                style={{ width: '16px', height: '16px' }}
              />
            </Box>
          </IconButton>
        </Box>
      )}
      <List className={classes.elList}>
        <Divider className={classes.separator} />
        {listElements.map((el, index) => (
          <Menu
            el={el}
            key={index}
            selected={selected}
            handleSelected={handleSelected}
            openMenu={openMenu}
          />
        ))}
      </List>
    </Drawer>
  );
};

export default withRouter(React.memo(MainSidebar));
