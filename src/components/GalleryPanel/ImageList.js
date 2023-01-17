import React, { useState, useEffect } from 'react';
import {
  Grid,
  LinearProgress,
  Typography,
  Link,
  Box,
  IconButton,
  InputBase,
  Divider,
  ClickAwayListener
} from '@material-ui/core';
import { Img } from 'react-image';
import { useQuery } from '@apollo/client';
import useStyles from './style';
import Paper from '@material-ui/core/Paper';
import graphql from '@app/graphql';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import { Search as SearchIcon } from '@material-ui/icons';
import { CustomDialog } from '@app/components/Custom';
import Pagination from '@material-ui/lab/Pagination';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { en } from '@app/language';
import { useLazyQuery } from '@apollo/client';
import { useSmallScreen } from '@app/utils/hooks';

const getName = (text, count) => {
  return text.slice(0, count) + (text.length > count ? '...' : '');
};

const CustomImage = ({ url }) => {
  const classes = useStyles();
  const [image, setImage] = useState();
  const isSmallScreen = useSmallScreen();
  useEffect(() => {
    if (url) {
      getAwsFileUrl(url);
    }
  }, [url]);

  const getAwsFileUrl = async (loadedData) => {
    if (loadedData) {
      const assetUrl = await getAssetUrlFromS3(loadedData, 0);
      console.log(assetUrl);
      setImage(assetUrl);
    }
  };

  return (
    <Img
      src={image}
      className={isSmallScreen ? classes.imageMobile : classes.image}
      key={image}
      loader={<LinearProgress />}
    />
  );
};

const ImageList = ({ schemaType }) => {
  const classes = useStyles();
  const [loadedData, setLoadedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const { openRight, setOpenRight, searchGallery, setImageURL, setImageData } =
    useGalleryContext();
  const [totalPage, setTotalPage] = useState(0);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(1);
  const { pageCount, setPageCount } = usePageCountContext();
  const isSmallScreen = useSmallScreen();

  const { loading, error, data } = useQuery(graphql.queries.GalleryGrouping, {
    variables: {
      id: null,
      schemaType: schemaType
    }
  });

  const [getTotalCount, { data: totalPageCount }] = useLazyQuery(
    graphql.queries.totalCount
  );

  useEffect(() => {
    setPage(1);
    getTotalCount({
      variables: {
        schemaType: schemaType
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [schemaType]);

  useEffect(() => {
    setPage(1);
  }, [searchGallery]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalPageCount?.totalCount / pageCount));
  }, [totalPageCount]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (!loading && !error) {
      const { grouping } = data;
      setLoadedData(grouping);
      if (searchGallery && searchGallery !== '') {
        let filterGrouping = grouping.filter(
          (el) =>
            el.name?.toLowerCase().includes(searchGallery.toLowerCase()) ||
            el.tagList?.includes(searchGallery) ||
            el.tagList?.includes(searchGallery.toLowerCase())
        );
        setTotalRow(filterGrouping?.length);
        setFilteredData(filterGrouping);
      } else {
        setTotalRow(grouping?.length);
        setFilteredData(grouping);
      }
    }
  }, [loading, error, data]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
    if (loadedData?.length > 0) {
      if (searchGallery && searchGallery !== '') {
        let filterGrouping = loadedData.filter(
          (el) =>
            el.name.toLowerCase().includes(searchGallery.toLowerCase()) ||
            el.tagList?.includes(searchGallery) ||
            el.tagList?.includes(searchGallery.toLowerCase())
        );

        setTotalRow(filterGrouping?.length);
        setFilteredData(
          filterGrouping.slice(pageCount * (page - 1), pageCount * page)
        );
      } else {
        setTotalRow(loadedData?.length);
        setFilteredData(
          loadedData.slice(pageCount * (page - 1), pageCount * page)
        );
      }
    } else {
      getTotalCount({
        variables: {
          schemaType: schemaType
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  }, [pageCount, totalRow, page, searchGallery]);

  const openDialog = (item) => {
    setSelectedImage(item);
    setOpenPreview(true);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const setupImage = async () => {
    await delay(2000);
    setImageURL();
    setImageData();
  };

  // const handleClose = () => {
  //   if (openRight) {
  //     setOpenRight(false);
  //   }
  // };

  return (
    <>
      {/* <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={handleClose}
      > */}
      <Grid style={{ maxHeight: `calc(100vh - 230px)`, overflow: 'auto' }}>
        {filteredData?.map((item, index) => {
          return item.avatar?.baseUrl ? (
            <>
              <Grid item xs={12} className={classes.imageRoot}>
                {item.avatar?.baseUrl +
                  item.avatar?.fileDir +
                  item.avatar?.fileName !=
                  null && (
                  <Grid item xs={7}>
                    <CustomImage
                      url={
                        item.avatar?.baseUrl +
                        item.avatar?.fileDir +
                        item.avatar?.fileName
                      }
                      className={classes.image}
                      loader={<LinearProgress />}
                      onClick={() => openDialog(item)}
                      onDrag={() => {
                        setImageURL(
                          item.avatar?.baseUrl +
                            item.avatar?.fileDir +
                            item.avatar?.fileName
                        );
                        setImageData(item.avatar);
                      }}
                      onDragEnd={setupImage}
                    />
                  </Grid>
                )}

                <Grid item xs={5}>
                  <Typography variant="subtitle1" className={classes.imageText}>
                    {getName(item.name, 20)}
                  </Typography>
                </Grid>
              </Grid>
              <CustomDialog
                open={openPreview}
                title={selectedImage?.name}
                secondaryBtnName={en['Close']}
                onChange={(action, value) => setOpenPreview(false)}
              >
                <Grid container alignItems="baseline" justifyContent="center">
                  <CustomImage
                    url={
                      item.avatar?.baseUrl +
                      item.avatar?.fileDir +
                      item.avatar?.fileName
                    }
                  />
                </Grid>

                <Grid container alignItems="baseline" style={{ marginTop: 10 }}>
                  <Typography
                    variant="h6"
                    className={classes.title}
                    style={{ alignSelf: 'center' }}
                  >
                    url:
                  </Typography>
                  <Typography variant="subtitle2" className={classes.imageURL}>
                    <Link
                      href={
                        selectedImage?.avatar?.baseUrl +
                        selectedImage?.avatar?.fileDir +
                        selectedImage?.avatar?.fileName
                      }
                    >
                      {selectedImage?.avatar?.baseUrl +
                        selectedImage?.avatar?.fileDir +
                        selectedImage?.avatar?.fileName}
                    </Link>
                  </Typography>
                </Grid>
                <Grid container alignItems="baseline">
                  <Typography variant="h6" className={classes.title}>
                    {en['type']}:
                  </Typography>
                  <Typography variant="subtitle2" className={classes.imageURL}>
                    {selectedImage?.avatar?.type}
                  </Typography>
                </Grid>
                <Grid container alignItems="baseline">
                  <Typography variant="h6" className={classes.title}>
                    {en['tag']}:
                  </Typography>
                  <Typography variant="subtitle2" className={classes.imageURL}>
                    {selectedImage?.schemaType}
                  </Typography>
                </Grid>
              </CustomDialog>
            </>
          ) : (
            []
          );
        })}
        <Pagination
          count={totalPage}
          size="small"
          page={page}
          siblingCount={0}
          showFirstButton
          showLastButton
          onChange={handleChangePage}
          className={`${classes.pagination} gallery-pagination`}
        />
      </Grid>
      {/* </ClickAwayListener> */}
    </>
  );
};

export default ImageList;
