import React, { useState, useContext, useEffect } from 'react';
import { screenSize } from '@app/utils/functions';
import { Cookies } from 'react-cookie';

const MenuContext = React.createContext(null);
MenuContext.displayName = 'MenuContext';

const MenuContextProvider = ({ ...props }) => {
  const screenWidth = screenSize();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tempOpenMenu, setTempOpenMenu] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isLeftMenuOpenSmall, setIsLeftMenuOpenSmall] = useState(false);
  const [isMobildModeEllipsisClicked, setMobildModeEllipsisClicked] =
    useState(false);
  const [isIngestGoogleClicked, setIngestGoogleClicked] = useState(false);
  const [isIngestCanvasClicked, setIngestCanvasClicked] = useState(false);

  useEffect(() => {
    if (screenWidth === 'Medium' || screenWidth === 'Small') {
      setIsLeftMenuOpen(false);
    }
    if (screenWidth === 'Large' || screenWidth === 'XLarge') {
      const cookies = new Cookies();
      const menuState = cookies.get('menuState');
      setIsLeftMenuOpen(menuState === 'false' ? false : true);
    }
  }, []);

  useEffect(() => {
    const cookies = new Cookies();
    cookies.set('menuState', isLeftMenuOpen);
  }, [isLeftMenuOpen]);

  const iconPosition = React.useMemo(() =>
    isMenuOpen || tempOpenMenu ? '280px' : '35px'
  );

  const menuWidth = React.useMemo(() =>
    isMenuOpen || tempOpenMenu ? '300px' : '50px'
  );

  const value = React.useMemo(() => [
    isMenuOpen,
    setIsMenuOpen,
    iconPosition,
    menuWidth,
    isLeftMenuOpen,
    setIsLeftMenuOpen,
    setTempOpenMenu,
    isLeftMenuOpenSmall,
    setIsLeftMenuOpenSmall,
    isMobildModeEllipsisClicked,
    setMobildModeEllipsisClicked,
    isIngestGoogleClicked,
    setIngestGoogleClicked,
    isIngestCanvasClicked,
    setIngestCanvasClicked
  ]);

  return <MenuContext.Provider value={value} {...props} />;
};

const useMenuContext = () => {
  return useContext(MenuContext);
};

export { MenuContextProvider, useMenuContext };
