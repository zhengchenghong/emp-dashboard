/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Grid,
  Tooltip
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faUpload,
  faUndo,
  faFileImport,
  faTrash,
  faArrowLeft,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { Resizable } from 'react-resizable';
import { useMenuContext } from '@app/providers/MenuContext';
import useStyles from './style';
import { useUserContext } from '@app/providers/UserContext';
import { usePaginationContext } from '@app/providers/Pagination';
import CustomPagination from '@app/components/Pagination';
import { en } from '@app/language';
import { useSmallScreen } from '@app/utils/hooks';

const MainPanel = ({
  icon,
  title,
  showAddBtn,
  canAdd,
  showSearch,
  canSearch,
  showRefresh,
  totalDisable,
  disableAddBtn,
  canPublish,
  canReload,
  canImport,
  showDeleteBtn,
  onChange,
  children,
  extraComponent,
  selectedTreeItem,
  viewMethod,
  cardViewList,
  isLessons,
  openNameSearch,
  setOpenNameSearch,
  isMobile
}) => {
  const classes = useStyles();
  const [isMenuOpen, setIsMenuOpen, , , , , setTempOpenMenu] = useMenuContext();
  const [spinRefresh, setSpinRefresh] = useState(false);
  const listPanelWidth = localStorage.getItem('listPanelWidth');
  const isSmallScreen = useSmallScreen();
  const [panelSize, setPanelSize] = useState({
    width: listPanelWidth
      ? cardViewList
        ? parseInt(listPanelWidth) < 350
          ? 350
          : parseInt(listPanelWidth)
        : parseInt(listPanelWidth)
      : cardViewList
      ? 350
      : 310,
    height: 0
  });

  const [currentUser] = useUserContext();

  const userInfo = currentUser || null;

  const pathName = window.location.pathname;

  const [, setClassVariables] = usePaginationContext();
  const [, setClassWithoutAuthorVariables] = usePaginationContext();

  useEffect(() => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
    }
  }, []);

  function wait(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  const handleRefresh = async () => {
    setSpinRefresh(true);
    onChange('refresh');
  };

  useEffect(() => {
    const doRefresh = async () => {
      if (spinRefresh) {
        await wait(1000);
        setSpinRefresh(false);
      }
    };

    doRefresh();
  }, [spinRefresh]);

  const handleHover = () => {
    if (!isMenuOpen) {
      setTempOpenMenu(true);
    }
  };

  const handleUnHover = () => {
    if (!isMenuOpen) {
      setTempOpenMenu(false);
    }
  };

  const onResize = (event, { element, size, handle }) => {
    let width = size.width;
    if (width < 300) {
      width = 300;
    }
    if (cardViewList && width < 350) {
      width = 350;
    }
    if (isLessons && width > 800) {
      width = 800;
    }
    if (!isLessons && width > 500) {
      width = 500;
    }
    localStorage.setItem('listPanelWidth', width);
    setPanelSize({ width: width });
  };

  const renderCardViewMode = () => {
    return (
      <Resizable
        width={panelSize.width}
        height={200}
        axis="x"
        onResize={onResize}
        className={classes.resizable}
      >
        <Box
          className={classes.root}
          height={panelSize.height}
          onMouseOver={handleHover}
          onMouseOut={handleUnHover}
          style={{
            width: panelSize.width,
            transition: 'all 0.5s'
          }}
        >
          <div className={classes.toolbar}>
            <div>
              <FontAwesomeIcon
                icon={icon}
                size="1x"
                style={{ marginRight: '10px', width: '16px', height: '16px' }}
              />
            </div>
            <div>
              <Typography
                variant="h6"
                style={{ fontWeight: 600, fontSize: '1rem' }}
              >
                {title}
              </Typography>
            </div>
            {extraComponent}
            {showAddBtn && (
              <div className={classes.menu}>
                {showSearch && canSearch ? (
                  <div
                    style={{
                      height: 20,
                      width: 20,
                      cursor: 'pointer',
                      marginRight: 6
                    }}
                    onClick={() =>
                      canSearch && setOpenNameSearch(!openNameSearch)
                    }
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      size="sm"
                      style={{
                        cursor: canSearch ? 'pointer' : 'default',
                        width: '90%',
                        height: '90%',
                        color: canSearch ? '#37474f' : 'gray'
                      }}
                    />
                  </div>
                ) : showSearch && !canSearch ? (
                  <Tooltip
                    title={
                      'Select a Station/District/Class to begin lesson search.'
                    }
                    classes={{ tooltip: classes.tooltip }}
                  >
                    <div
                      style={{
                        height: 20,
                        width: 20,
                        cursor: 'pointer',
                        marginRight: 6
                      }}
                      onClick={() =>
                        canSearch && setOpenNameSearch(!openNameSearch)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faSearch}
                        size="sm"
                        style={{
                          cursor: canSearch ? 'pointer' : 'default',
                          width: '90%',
                          height: '90%',
                          color: canSearch ? '#37474f' : 'gray'
                        }}
                      />
                    </div>
                  </Tooltip>
                ) : (
                  []
                )}
                {canAdd && (
                  <Button
                    onClick={() =>
                      (selectedTreeItem && disableAddBtn) || totalDisable
                        ? onChange('')
                        : onChange('create')
                    }
                    className={classes.actionButton}
                    disabled={disableAddBtn || totalDisable}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faPlus}
                        size="sm"
                        style={
                          disableAddBtn || totalDisable
                            ? { opacity: 0.6, cursor: 'not-allowed' }
                            : { cursor: 'pointer' }
                        }
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['New']}
                  </Button>
                )}

                {canPublish && (
                  <FontAwesomeIcon
                    icon={faUpload}
                    size="lg"
                    onClick={() => onChange('publish')}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {canReload && (
                  <FontAwesomeIcon
                    icon={faUndo}
                    size="lg"
                    onClick={() => onChange('reload')}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {showDeleteBtn && (
                  <FontAwesomeIcon
                    icon={faTrash}
                    size="lg"
                    onClick={() => onChange('delete')}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {showRefresh && (
                  <Button
                    onClick={handleRefresh}
                    className={classes.actionButton}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faUndo}
                        size="sm"
                        spin={spinRefresh}
                        style={{
                          animationDirection: 'alternate-reverse',
                          cursor: 'pointer'
                        }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Reload']}
                  </Button>
                )}
              </div>
            )}
            {canImport && (
              <div className={classes.menu}>
                <FontAwesomeIcon
                  icon={faFileImport}
                  size="lg"
                  onClick={() => onChange('import')}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            )}
            {cardViewList && (
              <div className={classes.menu}>
                <Button
                  onClick={() => onChange('back')}
                  className={classes.actionButton}
                  startIcon={
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      size="sm"
                      spin={spinRefresh}
                      style={{
                        animationDirection: 'alternate-reverse',
                        cursor: 'pointer'
                      }}
                    />
                  }
                  variant="contained"
                  color="primary"
                >
                  {en['Back to Classes']}
                </Button>
              </div>
            )}
          </div>
          <Divider className={classes.separator} />
          <main
            className={classes.main}
            style={
              pathName.includes('/materials')
                ? {
                    height: 'calc(100vh - 210px)'
                  }
                : {}
            }
          >
            {children}
          </main>
          {pathName.includes('/materials') &&
            (cardViewList ? (
              <CustomPagination
                userInfo={userInfo}
                cardViewList={cardViewList}
                // handlePagination={}
              />
            ) : (
              <CustomPagination
                userInfo={userInfo}
                handlePagination={
                  userInfo?.schemaType === 'sysAdmin' ||
                  userInfo?.schemaType === 'superAdmin'
                    ? setClassWithoutAuthorVariables
                    : setClassVariables
                }
              />
            ))}
        </Box>
      </Resizable>
    );
  };

  const renderCardViewModeInMobile = () => {
    return (
      <>
        {pathName.includes('/materials') && cardViewList && (
          <div style={{ float: 'right' }}>
            <Button
              onClick={() => onChange('back')}
              className={classes.actionButton}
              startIcon={
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size="sm"
                  spin={spinRefresh}
                  style={{
                    animationDirection: 'alternate-reverse',
                    cursor: 'pointer'
                  }}
                />
              }
              variant="contained"
              color="primary"
            >
              {en['Back to Classes']}
            </Button>
          </div>
        )}
        <main
          style={
            (pathName.includes('/materials')
              ? {
                  height: 'calc(100vh - 210px)'
                }
              : {},
            {
              overflowY: 'auto',
              height: isSmallScreen
                ? 'calc(88vh - 252px)'
                : 'calc(100vh - 252px)',
              overflowX: 'auto',
              width: '100%',
              display: 'inline-block'
            })
          }
        >
          {children}
        </main>
        {pathName.includes('/materials') &&
          (cardViewList ? (
            <CustomPagination userInfo={userInfo} cardViewList={cardViewList} />
          ) : (
            <CustomPagination
              userInfo={userInfo}
              handlePagination={
                userInfo?.schemaType === 'sysAdmin' ||
                userInfo?.schemaType === 'superAdmin'
                  ? setClassWithoutAuthorVariables
                  : setClassVariables
              }
            />
          ))}
      </>
    );
  };

  const renderListViewMode = () => {
    return (
      <Grid className={classes.root} style={{ width: '100%' }}>
        <div className={classes.toolbar} style={{ marginBottom: 3 }}>
          <div>
            <FontAwesomeIcon
              icon={icon}
              size="1x"
              style={{ marginRight: '15px', width: '16px', height: '16px' }}
            />
          </div>
          <div>
            <Typography
              variant="h6"
              style={{ fontWeight: 600, fontSize: '1rem' }}
            >
              {title}
            </Typography>
          </div>
          {extraComponent}
          {showAddBtn && (
            <div className={classes.menu}>
              {canPublish && (
                <FontAwesomeIcon
                  icon={faUpload}
                  size="lg"
                  onClick={() => onChange('publish')}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {canReload && (
                <FontAwesomeIcon
                  icon={faUndo}
                  size="lg"
                  onClick={() => onChange('reload')}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {showDeleteBtn && (
                <FontAwesomeIcon
                  icon={faTrash}
                  size="lg"
                  onClick={() => onChange('delete')}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {showRefresh && (
                <Button
                  onClick={handleRefresh}
                  className={classes.actionButton}
                  startIcon={
                    <FontAwesomeIcon
                      icon={faUndo}
                      size="sm"
                      spin={spinRefresh}
                      style={{
                        animationDirection: 'alternate-reverse',
                        cursor: 'pointer'
                      }}
                    />
                  }
                  variant="contained"
                  color="primary"
                >
                  {en['Reload']}
                </Button>
              )}
            </div>
          )}
          {canImport && (
            <div className={classes.menu}>
              <FontAwesomeIcon
                icon={faFileImport}
                size="lg"
                onClick={() => onChange('import')}
                style={{ cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
        <Divider className={classes.separator} />
        <main
          className={classes.main}
          style={
            pathName.includes('/materials')
              ? {
                  height: 'calc(100vh - 210px)'
                }
              : {}
          }
        >
          {children}
        </main>
        {pathName.includes('/materials') && (
          <CustomPagination
            userInfo={userInfo}
            handlePagination={
              userInfo?.schemaType === 'sysAdmin' ||
              userInfo?.schemaType === 'superAdmin'
                ? setClassWithoutAuthorVariables
                : setClassVariables
            }
          />
        )}
      </Grid>
    );
  };

  const renderListViewModeInMobile = () => {
    return (
      <>
        <main
          className={classes.main}
          style={
            pathName.includes('/materials')
              ? {
                  height: 'calc(100vh - 242px)'
                }
              : {}
          }
        >
          {children}
        </main>
        {pathName.includes('/materials') && (
          <CustomPagination
            userInfo={userInfo}
            handlePagination={
              userInfo?.schemaType === 'sysAdmin' ||
              userInfo?.schemaType === 'superAdmin'
                ? setClassWithoutAuthorVariables
                : setClassVariables
            }
          />
        )}
      </>
    );
  };

  return isMobile ? (
    viewMethod !== 'Card View' || cardViewList ? (
      <>{renderCardViewModeInMobile()}</>
    ) : (
      <>{renderListViewModeInMobile()}</>
    )
  ) : viewMethod !== 'Card View' || cardViewList ? (
    <>{renderCardViewMode()}</>
  ) : (
    <>{renderListViewMode()}</>
  );
};

export default MainPanel;
