import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  Box,
  Divider,
  Select,
  MenuItem,
  TextField,
  IconButton,
  InputBase,
  ClickAwayListener
} from '@material-ui/core';
import useStyles from './style';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useSearchContext } from '@app/providers/SearchContext';
import Autocomplete from '@material-ui/lab/Autocomplete';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { Close } from '@material-ui/icons';
import { SearchList } from '@app/components/SearchPanel';
import { Resizable } from 'react-resizable';
import { ImageList } from '@app/components/GalleryPanel';
import { useSmallScreen } from '@app/utils/hooks';

const searchTypeData = [
  { value: 'pbs', label: 'PBS LearningMedia' },
  { value: 'oer', label: 'OER Commons' },
  { value: 'mycontent', label: 'My Content' }
];

const searchLessonsTypeData = [
  { value: 'pbs', label: 'All Resources' },
  { value: 'mycontent', label: 'My Content' }
];

const searchGalleryTypeData = [
  { value: 'logos', label: 'Logo Gallery' },
  { value: 'banner', label: 'Banner Gallery' },
  { value: 'image', label: 'Stock Image Gallery' },
  { value: 'avatar', label: 'Avatar Gallery' }
];

const searchGalleryType = [
  'Logo Gallery',
  'Banner Gallery',
  'Stock Image Gallery',
  'Avatar Gallery'
];

const SecondarySidebar = (props) => {
  const classes = useStyles();
  const {
    openRight,
    setOpenRight,
    GalleryChildren,
    setGalleryChildren,
    galleryData,
    setGalleryData,
    searchGallery,
    setSearchGallery,
    openUserModal
  } = useGalleryContext();
  const {
    setOpenSearch,
    searchChildren,
    setSearchChildren,
    setOpenLessonSearch
  } = useSearchContext();

  const [searchOption, setSearchOption] = useState('pbs');
  const [newSearchKey, setNewSearchKey] = useState('');
  const [galleries, setGalleries] = useState();
  const [galleryType, setGalleryType] = useState('');
  const [gallerySearchStr, setGallerySearchStr] = useState('');
  const [showClearSearchGallery, setShowClearSearchGallery] = useState();
  const isSmallScreen = useSmallScreen();
  const [panelSize, setPanelSize] = useState({
    width: isSmallScreen ? '50%' : 310,
    height: 0
  });

  const handleChange = (event) => {
    setSearchOption(event.target.value);
    setSearchChildren(
      <SearchList type={event.target.value} searchString={newSearchKey} />
    );
  };

  const handleRequestSearch = (value) => {
    setNewSearchKey(value);
    setSearchChildren(<SearchList type={searchOption} searchString={value} />);
  };

  const handleCancelSearch = (value) => {
    if (!value) {
      setNewSearchKey();
      setSearchChildren();
    }
  };

  let tagsData = JSON.parse(localStorage.getItem('tagsData')) || [];

  const onResize = (event, { element, size, handle }) => {
    let width = size.width;
    if (width < 300) {
      width = 300;
    }
    setPanelSize({ width: width });
  };

  const handleGalleryChange = (event) => {
    setGalleryType(event.target.value);
    if (event.target.value === 'banner') {
      setGalleryData((data) => ({ ...data, title: 'Banner Gallery' }));
      setGalleryChildren(<ImageList schemaType="stockBanner" />);
    } else if (event.target.value === 'avatar') {
      setGalleryData((data) => ({ ...data, title: 'Avatar Gallery' }));
      setGalleryChildren(<ImageList schemaType="stockAvatar" />);
    } else if (event.target.value === 'image') {
      setGalleryData((data) => ({ ...data, title: 'Image Gallery' }));
      setGalleryChildren(<ImageList schemaType="stockImage" />);
    } else {
      setGalleryData((data) => ({ ...data, title: 'Logo Gallery' }));
      setGalleryChildren(<ImageList schemaType="stockLogo" />);
    }
    // setSearchGallery(gallerySearchStr);
  };

  const handleSearchGallery = () => {
    setSearchGallery(gallerySearchStr);
  };

  const handleClearSearchGallery = () => {
    setGallerySearchStr('');
    setSearchGallery('');
    setShowClearSearchGallery(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setGallerySearchStr(e.target.value);
      setSearchGallery(e.target.value);
    }
  };

  useEffect(() => {
    setGallerySearchStr(searchGallery);
    setShowClearSearchGallery(searchGallery && searchGallery !== '');
  }, [searchGallery]);

  useEffect(() => {
    setGalleries(GalleryChildren);
  }, [GalleryChildren]);

  useEffect(() => {
    if (galleryData?.title === 'Logo Gallery') {
      setGalleryType('logos');
    } else if (galleryData?.title === 'Banner Gallery') {
      setGalleryType('banner');
    } else if (galleryData?.title === 'Image Gallery') {
      setGalleryType('image');
    } else if (galleryData?.title === 'Avatar Gallery') {
      setGalleryType('avatar');
    }
  }, [galleryData]);

  const handleClose = () => {
    if (openRight) {
      // setOpenRight(false);
    }
  };

  return (
    <ClickAwayListener
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={handleClose}
    >
      <Resizable
        // width={panelSize.width}
        height={200}
        axis="x"
        onResize={onResize}
        resizeHandles={['w']}
        className={classes.resizable}
        width={isSmallScreen ? '50%' : 310}
      >
        <Box
          className={clsx(classes.root, {
            [classes.open]: props.open,
            [classes.close]: !props.open
          })}
          textAlign="center"
          style={
            openUserModal
              ? {
                  width: panelSize.width,
                  transition: 'all 0.8s',
                  zIndex: 1301
                }
              : {
                  width: panelSize.width,
                  transition: 'all 0.8s'
                }
          }
        >
          <Close
            onClick={() => {
              setOpenRight(false);
              setOpenSearch(false);
              setOpenLessonSearch(false);
            }}
            style={{
              cursor: 'pointer',
              float: 'right',
              color: 'white',
              marginRight: 7,
              marginTop: 5,
              fontSize: '1rem'
            }}
          />
          {props.type === 'search' ? (
            <>
              <Select
                classes={{
                  root: classes.whiteColor,
                  icon: classes.whiteColor
                }}
                id="status-type-selector"
                value={searchOption}
                style={{ minWidth: '80px' }}
                onChange={handleChange}
              >
                {searchTypeData.map((item, index) => (
                  <MenuItem
                    value={item.value}
                    key={index}
                    // selected={rowData.status === item.value}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Select>

              <div>
                <Autocomplete
                  freeSolo
                  classes={{
                    root: classes.autoRoot,
                    inputRoot: classes.inputRoot
                  }}
                  id="free-solo-2-demo"
                  options={tagsData.map((option) => option)}
                  disableClearable
                  value={newSearchKey}
                  onChange={(event, newValue) => handleRequestSearch(newValue)}
                  onInputChange={(event, value) => handleCancelSearch(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        type: 'search',
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                      size="small"
                    />
                  )}
                />
              </div>
              <Divider className={classes.separator} />

              <main className={classes.main}>{searchChildren}</main>
            </>
          ) : props.type === 'searchLesson' ? (
            <>
              <Select
                classes={{
                  root: classes.whiteColor,
                  icon: classes.whiteColor
                }}
                id="status-type-selector"
                value={searchOption}
                style={{ minWidth: '80px' }}
                onChange={handleChange}
              >
                {searchLessonsTypeData.map((item, index) => (
                  <MenuItem
                    value={item.value}
                    key={index}
                    // selected={rowData.status === item.value}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Select>

              <div>
                <Autocomplete
                  freeSolo
                  classes={{
                    root: classes.autoRoot,
                    inputRoot: classes.inputRoot
                  }}
                  id="free-solo-2-demo"
                  options={tagsData.map((option) => option)}
                  disableClearable
                  value={newSearchKey}
                  onChange={(event, newValue) => handleRequestSearch(newValue)}
                  onInputChange={(event, value) => handleCancelSearch(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        type: 'search',
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                      size="small"
                    />
                  )}
                />
              </div>
              <Divider className={classes.separator} />

              <main className={classes.main}>{searchChildren}</main>
            </>
          ) : (
            <>
              <Select
                classes={{
                  root: classes.whiteColor,
                  icon: classes.whiteColor
                }}
                id="status-type-selector"
                value={galleryType}
                style={{ minWidth: '80px' }}
                onChange={handleGalleryChange}
              >
                {searchGalleryTypeData.map((item, index) => (
                  <MenuItem
                    value={item.value}
                    key={index}
                    // selected={rowData.status === item.value}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              {/* <Typography variant="subtitle1" className={classes.galleryTitle}>
                {galleryData?.title ? galleryData?.title : 'Gallery'}
              </Typography> */}

              <Box
                style={{
                  height: 48,
                  maxHeight: 48,
                  margin: 8,
                  backgroundColor: 'white'
                }}
              >
                <IconButton
                  onClick={handleSearchGallery}
                  style={{ paddingRight: '8px !important', float: 'left' }}
                  className={classes.iconButton}
                  aria-label="search"
                >
                  <SearchIcon />
                </IconButton>
                <InputBase
                  value={gallerySearchStr}
                  className={classes.input}
                  style={{ float: 'left', marginTop: 8 }}
                  onChange={(e) => {
                    setGallerySearchStr(e.target.value);
                    setShowClearSearchGallery(
                      e.target.value && e.target.value !== ''
                    );
                  }}
                  onKeyDown={(e) => handleKeyPress(e)}
                  placeholder={
                    galleryData?.title
                      ? `Search the ${galleryData?.title}`
                      : 'Search Gallery'
                  }
                  inputProps={{ 'aria-label': 'search users' }}
                />
                {showClearSearchGallery && (
                  <IconButton
                    onClick={handleClearSearchGallery}
                    className={classes.closeButton}
                    aria-label="close"
                  >
                    <Close style={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}
              </Box>
              <Divider className={classes.separator} />
              <main className={classes.main}>{GalleryChildren}</main>
            </>
          )}
        </Box>
      </Resizable>
    </ClickAwayListener>
  );
};

export default React.memo(SecondarySidebar);
