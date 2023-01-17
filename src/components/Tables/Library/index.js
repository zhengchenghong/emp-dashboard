/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import TableContainer from '@material-ui/core/TableContainer';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Pagination from '@material-ui/lab/Pagination';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import graphql from '@app/graphql';
import JSONEditor from '@app/components/JSONEditor';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { faCopy, faInfo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, IconButton, Grid, Button, FormControl } from '@material-ui/core';
import { CustomSelectBox } from '@app/components/Custom';
import useStyles, { useToolbarStyles } from './style';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { Card, CardContent, Tooltip } from '@material-ui/core';
import { useUserContext } from '@app/providers/UserContext';
import AttachmentPreview from '@app/components/Forms/Attachment/Preview';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useSearchContext } from '@app/providers/SearchContext';
import { en } from '@app/language';
import { useSmallScreen } from '@app/utils/hooks';
import { remove } from '@app/utils/ApolloCacheManager';
import Expand from 'react-expand-animated';
import ReferencedView from './ReferencedView';
import { DefaultCard } from '@app/components/Cards';
import * as globalStyles from '@app/constants/globalStyles';

export default function LibraryTable({
  isLibrary,
  library,
  pageMenu,
  sourceType,
  searchAction,
  setSearchAction,
  tagList,
  isRefresh,
  searchKey,
  reset,
  setReset
}) {
  const mainTable = useRef();
  const [filteredData, setFilteredData] = useState([]);
  const classes = useStyles();
  const classes1 = globalStyles.DescCardStyle();
  const [page, setPage] = useState(1);
  const { pageCount, setPageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(0);
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const { notify } = useNotifyContext();
  const [showingMoreItem, setShowingMoreItem] = useState(null);
  const [currentUser] = useUserContext();
  const [openCopy, setOpenCopy] = useState(false);
  const [classLoadedData, setClassLoadedData] = useState([]);
  const [lastCopiedClass, setLastCopiedClass] = useState();
  const [selectedResourceCopy, setSelectedResourceCopy] = useState();
  const [totalRow, setTotalRow] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [pickedRow, setPickedRow] = useState();
  const [nameRegExp, setNameRegExp] = useState(null);
  const { searchClassId, setSearchClassId } = useSearchContext();
  const [selectedClassItem, setSelectedClassItem] = useState([]);
  const [selectedCopyTargetClass, setSelectedCopyTargetClass] = useState();
  const [copyClassIndex, setCopyClassIndex] = useState();
  const client = useApolloClient();
  const [copyResourceToMaterial] = useMutation(graphql.mutations.CopyResource);
  const [copySharedLessonToClass] = useMutation(
    graphql.mutations.CopySharedLesson
  );
  const isSmallScreen = useSmallScreen();
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, pickedRow?._id),
    onCompleted(data) {
      let tmp;
      if (pickedRow?.schemaType === 'sharedLesson') {
        tmp = filteredData.filter((el) => el._id !== pickedRow?._id);
      }
      setFilteredData(tmp);
    }
  });

  const [allMaterials, setAllMaterials] = useState();

  const [getMaterials, { loading: mLoading, error: mError, data: mData }] =
    useLazyQuery(graphql.queries.MaterialGrouping, {
      fetchPolicy: 'no-cache'
    });

  const getClassVariable = () => {
    if (currentUser?.schemaType === 'stationAdmin') {
      return {
        schemaType: 'class',
        stationId: currentUser?.parentId
      };
    } else if (currentUser?.schemaType === 'districtAdmin') {
      return {
        schemaType: 'class',
        districtId: currentUser?.parentId
      };
    } else if (currentUser?.schemaType === 'schoolAdmin') {
      return {
        schemaType: 'class',
        parentId: currentUser?.parentId
      };
    } else if (currentUser?.schemaType === 'educator') {
      return {
        schemaType: 'class',
        authorId: currentUser?._id
      };
    } else {
      return {
        schemaType: 'class'
      };
    }
  };

  const [getData, { loading, data, error }] = useLazyQuery(
    graphql.queries.LibraryGrouping,
    {
      fetchPolicy: 'no-cache'
    }
  );

  const [
    getClasses,
    { loading: loadingClasses, data: classData, error: errorClassLoading }
  ] = useLazyQuery(graphql.queries.ClassGrouping);

  const [
    getTotalCount,
    { loading: loadingPageCount, data: totalPageCount, error: errorPageCount }
  ] = useLazyQuery(graphql.queries.totalCount, {
    fetchPolicy: 'no-cache'
  });

  useEffect(() => {
    if (pageMenu === 'Resources') {
      if (searchAction) {
        fetchData();
      }
    } else {
      fetchData();
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    setShowingMoreItem(null);
    setPage(1);
  }, [library]);

  useEffect(() => {
    fetchData();
  }, [isRefresh]);

  useEffect(() => {
    setSelectedClassItem([lastCopiedClass]);
  }, [lastCopiedClass]);

  useEffect(() => {
    let selectedClass;
    if (searchClassId && classLoadedData?.length > 0) {
      selectedClass = classLoadedData.find(
        (item) => item.value === searchClassId
      )?.value;
    }
    if (selectedClass == null) {
      selectedClass =
        classLoadedData?.length > 0 ? classLoadedData[0].value : null;
    }
    setLastCopiedClass(selectedClass);
    let libraryClasses = JSON.parse(
      window.localStorage.getItem('libraryClasses')
    );
    let items = [];
    for (let i = 0; i < filteredData?.length; i++) {
      let item = null;
      if (libraryClasses) {
        item = libraryClasses[filteredData[i]._id] || null;
      }
      items.push(item);
    }
    setSelectedClassItem(items);
  }, [filteredData]);

  useEffect(() => {
    setNameRegExp(searchKey);
  }, [searchKey]);

  useEffect(() => {
    if (searchAction) {
      fetchData();
      setShowingMoreItem(null);
      setPage(1);
      setSearchAction(false);
    }
  }, [searchAction]);

  useEffect(() => {
    setTotalRow(totalData);
  }, [totalData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const getDataVariables = () => {
    let resType = library.type;
    if (pageMenu === 'Resources') {
      resType =
        sourceType === 'material' || sourceType === 'all' ? null : sourceType;
    }
    let schemaType =
      pageMenu === 'Resources' && sourceType === 'material'
        ? 'sharedLesson'
        : library.schemaType;
    let variables = {
      schemaType: schemaType,
      type: library.schemaType === 'sharedLesson' ? null : resType,
      nameRegExp: nameRegExp,
      tagList: tagList,
      offset: pageCount * (page - 1),
      limit: pageCount
    };
    if (schemaType !== 'resource') {
      if (currentUser?.schemaType === 'stationAdmin') {
        variables = {
          ...variables,
          topology: {
            station: currentUser?.parentId
          }
        };
      }
      if (currentUser?.schemaType === 'districtAdmin') {
        variables = {
          ...variables,
          topology: {
            district: currentUser?.parentId
          }
        };
      }
      if (currentUser?.schemaType === 'schoolAdmin') {
        variables = {
          ...variables,
          topology: {
            school: currentUser?.parentId
          }
        };
      }

      if (currentUser?.schemaType === 'educator' && schemaType !== 'resource') {
        if (
          library.schemaType === 'sharedLesson' ||
          library.schemaType === 'resource'
        ) {
          variables = {
            ...variables,
            offset: null,
            limit: null
          };
        } else {
          variables = {
            ...variables,
            authorId: currentUser?._id
          };
        }
      }
    }

    return variables;
  };

  const fetchData = async () => {
    let resType = library.type;
    if (pageMenu === 'Resources') {
      resType =
        sourceType === 'material' || sourceType === 'all' ? null : sourceType;
    }
    await getTotalCount({
      variables: {
        schemaType:
          pageMenu === 'Resources' && sourceType === 'material'
            ? 'sharedLesson'
            : library.schemaType,
        tagList: tagList,
        type: library.schemaType === 'sharedLesson' ? null : resType,
        nameRegExp: nameRegExp
      },
      fetchPolicy: 'no-cache'
    });
    await getData({
      variables: getDataVariables(),
      fetchPolicy:
        library.schemaType === 'sharedLesson'
          ? ' no-cache'
          : 'cache-and-network'
    });
  };

  const fetchClasses = async () => {
    await getClasses({
      variables: getClassVariable(),
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  useEffect(() => {
    if (pageMenu === 'Resources') {
      if (searchAction) {
        fetchData();
      } else {
        if (filteredData?.length > 0) {
          fetchData();
        }
      }
    } else {
      fetchData();
    }
  }, [library, pageCount]);

  useEffect(async () => {
    if (filteredData?.length > 0) {
      let resType = library.type;
      if (pageMenu === 'Resources') {
        resType =
          sourceType === 'material' || sourceType === 'all' ? null : sourceType;
      }
      await getData({
        variables: getDataVariables()
      });
    }
  }, [page]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
  }, [totalRow, pageCount]);

  useEffect(() => {
    if (page > totalPage) {
      if (totalPage > 0) {
        setPage(totalPage);
      } else {
        setPage(1);
      }
    }
  }, [totalPage]);

  useEffect(async () => {
    if (reset) {
      await getTotalCount({
        variables: {
          schemaType: 'resource',
          type: null
        },
        fetchPolicy: 'no-cache'
      });
      await getData({
        variables: {
          schemaType: 'resource',
          nameRegExp: null,
          type: null,
          offset: 0,
          limit: pageCount
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
      setPage(1);
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    if (!error && !loading && data) {
      const { grouping } = data;
      if (grouping) {
        if (currentUser.schemaType === 'educator') {
          const filteredGrouping = grouping.filter((el) => {
            let isValid = false;
            if (el.schemaType === 'resource') {
              isValid = true;
            } else {
              for (let i = 0; i < classLoadedData?.length; i++) {
                if (
                  el.parentId === classLoadedData[i].value &&
                  el.schemaType === 'sharedLesson'
                ) {
                  isValid = true;
                  break;
                }
                if (
                  el.parentIdList &&
                  el.parentIdList.includes(classLoadedData[i].value)
                ) {
                  isValid = true;
                  break;
                }
              }
            }
            return isValid ? true : false;
          });
          setFilteredData(filteredGrouping);
        } else {
          setFilteredData(grouping);
        }
      }
    }
  }, [error, loading, data]);

  useEffect(() => {
    let updatedData = [];
    for (const vidData of filteredData) {
      updatedData.push({
        ...vidData,
        isVideoPlay: false
      });
    }
    setFilteredData(updatedData);
  }, [showingMoreItem]);

  useEffect(() => {
    if (!errorClassLoading && !loadingClasses && classData) {
      const { grouping } = classData;
      if (grouping) {
        const formatedClasses = grouping.map((item) => ({
          label: item.name,
          topology: item.topology,
          value: item._id
        }));
        let validClasses;
        if (currentUser.schemaType === 'stationAdmin') {
          let stationClasses = grouping
            .filter((item) => item.topology?.station === currentUser.parentId)
            .map((item) => ({
              label: item.name,
              topology: item.topology,
              value: item._id
            }));
          validClasses = stationClasses;
        } else if (currentUser.schemaType === 'districtAdmin') {
          let districtClasses = grouping
            .filter((item) => item.topology?.district === currentUser.parentId)
            .map((item) => ({
              label: item.name,
              topology: item.topology,
              value: item._id
            }));
          validClasses = districtClasses;
        } else if (currentUser.schemaType === 'schoolAdmin') {
          let schoolClasses = grouping
            .filter((item) => item.parentId === currentUser.parentId)
            .map((item) => ({
              label: item.name,
              topology: item.topology,
              value: item._id
            }));
          validClasses = schoolClasses;
        } else if (currentUser.schemaType === 'educator') {
          let educatorClasses = grouping
            .filter((item) => item.authorIdList?.includes(currentUser._id))
            .map((item) => ({
              label: item.name,
              topology: item.topology,
              value: item._id
            }));
          validClasses = educatorClasses;
        } else {
          validClasses = formatedClasses;
        }
        setClassLoadedData(validClasses);
        let selectedClass;
        if (searchClassId && validClasses?.length > 0) {
          selectedClass = validClasses.find(
            (item) => item._id === searchClassId
          );
        }
        if (selectedClass == null) {
          selectedClass =
            validClasses?.length > 0 ? validClasses[0].value : null;
        }
        setLastCopiedClass(selectedClass);
      }
    }
  }, [errorClassLoading, loadingClasses, classData]);

  useEffect(() => {
    if (!errorPageCount && !loadingPageCount && totalPageCount) {
      if (totalPageCount) {
        if (
          (library.schemaType === 'sharedLesson' ||
            library.schemaType === 'resource') &&
          currentUser.schemaType === 'educator'
        ) {
          setTotalData(filteredData?.length);
        } else {
          setTotalData(totalPageCount?.totalCount);
        }
      }
    }
  }, [errorPageCount, loadingPageCount, totalPageCount]);

  useEffect(() => {
    async function getAllMaterials() {
      await getMaterials({
        variables: {
          schemaType: 'material'
        }
      });
    }
    getAllMaterials();
  }, []);

  useEffect(() => {
    if (
      (library.schemaType === 'sharedLesson' ||
        library.schemaType === 'resource') &&
      currentUser.schemaType === 'educator'
    ) {
      setTotalData(filteredData?.length);
    }
  }, [filteredData]);

  const copyResourceToClass = async (copiedResource, index) => {
    if (
      lastCopiedClass == null ||
      classLoadedData == null ||
      classLoadedData?.length === 0
    ) {
      const notiOps = getNotificationOpt('resource', 'warning', 'needClass');
      notify(notiOps.message, notiOps.options);
      return;
    }
    setCopyClassIndex(index);

    let targetClass = selectedCopyTargetClass || lastCopiedClass;

    if (allMaterials) {
      if (allMaterials?.length > 0 && copiedResource?._id) {
        let existedRes = allMaterials
          ?.filter?.((mItem) => mItem?.topology?.class === targetClass)
          ?.find((el) => el.intRef?._id === copiedResource?._id);
        if (existedRes) {
          const notiOps = getNotificationOpt(
            'resource',
            'warning',
            'duplicateCopy'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
      if (copiedResource == null) return;
      const variables = {
        classId: targetClass,
        resourceId: copiedResource?._id
      };
      let result = '';
      if (copiedResource.schemaType === 'resource') {
        const { data } = await copyResourceToMaterial({
          variables
        });
        result = data.copyResource;
      } else {
        const { data } = await copySharedLessonToClass({
          variables
        });
        result = data.copySharedLesson;
      }

      // const notiOps = getNotificationOpt('resource', 'success', 'copy');
      const options = {
        autoHideDuration: 10000,
        variant:
          result === 'The Resource copied successfully!' ? 'success' : 'warning'
      };
      notify(result, options);
    }
  };

  useEffect(() => {
    if (mData && !mLoading) {
      if (mData?.grouping.length > 0) {
        setAllMaterials(mData.grouping);
      }
    }
  }, [mData, mLoading, mError]);

  const handleTableChange = async (method, value, index) => {
    try {
      if (method === 'info') {
        setSelectedInfo(value);
        setOpenInfo(true);
      }

      if (method === 'copy') {
        if (value.multimediaAssets?.length) {
          let convertingAssets = value.multimediaAssets?.filter(
            (item) => item.status === 'converting'
          );
          if (convertingAssets?.length) {
            const notiOps = getNotificationOpt('resource', 'warning', 'copy');
            notify(notiOps.message, notiOps.options);
            return;
          }
        }
        setSelectedResourceCopy(value);
        await copyResourceToClass(value, index);
      }

      if (method === 'delete') {
        setPickedRow(value);
        setOpenDelete(true);
      }
    } catch (error) {
      console.log(error);
      console.log(error.messsage);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleDeleteDialogChange = async (type, value) => {
    if (type === 'btnClick') {
      if (!checkbox && value) {
        const notiOps = getNotificationOpt('material', 'warning', 'delete');
        notify(notiOps.message, notiOps.options);
        return;
      }

      if (checkbox && value) {
        await deleteDocument({
          variables: {
            id: pickedRow?._id,
            schemaType: pickedRow?.schemaType
          }
        });
        const notiOps = getNotificationOpt('resource', 'success', 'copy');
        notify(
          'The shared resource has been deleted successfully.',
          notiOps.options
        );
        fetchData();
      }
      setCheckbox(false);
      setOpenDelete(false);
    }
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleCopyDialogChange = async (type, value) => {
    try {
      if (value) {
        await copyResourceToClass(selectedResourceCopy);
      }
      setOpenCopy(false);
    } catch (err) {
      console.log('copy resource', err);
    }
  };

  const handleClassCopySelect = (event, index, id) => {
    setSelectedCopyTargetClass(event?.value);
    let items = [...selectedClassItem];
    let item = { ...items[index] };
    item = event.value;
    items[index] = item;
    let libraryClasses = window.localStorage.getItem('libraryClasses');
    let temp;
    if (libraryClasses) {
      temp = JSON.parse(libraryClasses);
      temp = { ...temp, [id]: event.value };
    } else {
      temp = { [id]: event.value };
    }
    window.localStorage.setItem('libraryClasses', JSON.stringify(temp));

    setSelectedClassItem(items);
  };

  const handleClickShowMore = (item) => (e) => {
    setShowingMoreItem(item);
  };

  const handleClickShowMoreCloseButton = () => {
    setShowingMoreItem(null);
  };

  const handleVidePlayState = (resId) => {
    let updatedData = [];
    for (const vidData of filteredData) {
      updatedData.push({
        ...vidData,
        isVideoPlay: vidData._id === resId
      });
    }
    setFilteredData(updatedData);
  };

  const handleVidePlayMoreView = () => {};

  const getPrimaryVideo = (data) => {
    if (!data) return {};

    let asset = data?.multimediaAssets?.find(
      (asset) =>
        asset.status === 'ready' &&
        (asset.type?.includes('video') ||
          asset.fileName?.toLowerCase().includes('.mp4'))
    );

    if (!asset) return {};

    return {
      url: `${asset.baseUrl}${asset.fileDir}${asset.fileName}`,
      type: asset.mimeType ? asset.mimeType : 'video/mp4'
    };
  };

  const getSelectedClass = (docIndex) => {
    if (selectedClassItem[docIndex]) {
      return selectedClassItem[docIndex];
    } else {
      let firstClass = classLoadedData?.filter(
        (item) =>
          item.topology?.station === filteredData[docIndex]?.topology?.station
      );
      return firstClass ? firstClass[0]?.value : null;
    }
  };

  const getReferencedMaterials = (sharedLesson) => {
    if (sharedLesson?.schemaType !== 'sharedLesson') return null;
    let copiedOnes = allMaterials?.filter(
      (item) => item?.intRef?._id === sharedLesson?._id
    );
    let referenceTopologies = [];
    copiedOnes?.forEach((lItem) => {
      let refClass = classLoadedData?.find(
        (cItem) => cItem?.topology?.class === lItem?.topology?.class
      );
      let tier1Material = null;
      let tier2Material = null;
      let tier3Material = null;
      if (lItem?.parentId === lItem?.topology?.class) {
        tier1Material = lItem;
      } else {
        let parentMaterial = allMaterials?.find(
          (mItem) => mItem?._id === lItem?.parentId
        );
        if (parentMaterial?.parentId === lItem?.topology?.class) {
          tier1Material = parentMaterial;
          tier2Material = lItem;
        } else {
          let ppMaterial = allMaterials?.find(
            (mItem) => mItem?._id === parentMaterial?.parentId
          );
          if (ppMaterial?.parentId === lItem?.topology?.class) {
            tier1Material = ppMaterial;
            tier2Material = parentMaterial;
            tier3Material = lItem;
          }
        }
      }
      referenceTopologies.push({
        class: refClass,
        tier1Material: tier1Material,
        tier2Material: tier2Material,
        tier3Material: tier3Material
      });
    });
    return referenceTopologies;
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} style={{ marginBottom: 0 }}>
        {showingMoreItem && (
          <div className={classes.showMoreContainer}>
            <div
              className={
                isSmallScreen
                  ? classes.showmoreContainerMobile
                  : classes.showmoreContainer
              }
            >
              <div
                style={{
                  width: '100%',
                  height: 'fit-content',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 20
                }}
              >
                <Button
                  onClick={handleClickShowMoreCloseButton}
                  className={classes.showmoreCloseButton}
                  startIcon={
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      size="sm"
                      style={{
                        animationDirection: 'alternate-reverse',
                        cursor: 'pointer'
                      }}
                    />
                  }
                  variant="contained"
                  color="primary"
                >
                  Back to Search
                </Button>
              </div>
              {showingMoreItem.name?.length > 0 ? (
                <div
                  style={{
                    width: '100%',
                    height: 'fit-content',
                    marginBottom: 16
                  }}
                >
                  <DefaultCard
                    style={clsx({
                      [classes1.preview]: true,
                      [classes1.resourceSpacing]: true
                    })}
                    px={0.5}
                  >
                    <div className={classes.labelsParentDiv}>
                      <div className={classes.hintLabel}>Name</div>
                      <div
                        className={classes.showmoreTitle}
                        dangerouslySetInnerHTML={{
                          __html: showingMoreItem.name
                        }}
                      ></div>
                    </div>
                  </DefaultCard>
                </div>
              ) : (
                []
              )}

              {showingMoreItem.desc?.short?.length > 0 ? (
                <div
                  style={{
                    width: '100%',
                    height: 'fit-content',
                    marginBottom: 16
                  }}
                >
                  <DefaultCard
                    style={clsx({
                      [classes1.root]: false,
                      [classes1.preview]: true,
                      [classes1.resourceSpacing]: true
                    })}
                    px={0.5}
                  >
                    <div className={classes.labelsParentDiv}>
                      <div className={classes.hintLabel}>Short Description</div>
                      <div
                        className={classes.showmoreShort}
                        dangerouslySetInnerHTML={{
                          __html: showingMoreItem.desc?.short
                        }}
                      ></div>
                    </div>
                  </DefaultCard>
                </div>
              ) : (
                []
              )}

              {showingMoreItem.desc?.long?.length > 0 ? (
                <div
                  style={{
                    width: '100%',
                    height: 'fit-content',
                    marginBottom: 16
                  }}
                >
                  <DefaultCard
                    style={clsx({
                      [classes1.root]: false,
                      [classes1.preview]: true,
                      [classes1.resourceSpacing]: true
                    })}
                    px={0.5}
                  >
                    <div className={classes.labelsParentDiv}>
                      <div className={classes.hintLabel}>Long Description</div>
                      <div
                        className={classes.showmoreLong}
                        dangerouslySetInnerHTML={{
                          __html: showingMoreItem.desc?.long
                        }}
                      ></div>
                    </div>
                  </DefaultCard>
                </div>
              ) : (
                []
              )}

              <CardContent style={{ marginBottom: '40px' }}>
                <AttachmentPreview
                  resources={getPrimaryVideo(showingMoreItem)}
                  autoPlay={false}
                  setPlay={handleVidePlayMoreView}
                />
              </CardContent>
              {showingMoreItem.createdAt?.length > 10 ? (
                <div className={classes.showmoreCreatedAt}>
                  Created At:{' '}
                  {showingMoreItem.createdAt?.substring(5, 10) +
                    '-' +
                    showingMoreItem.createdAt?.substring(0, 4)}
                </div>
              ) : (
                []
              )}
            </div>
          </div>
        )}
        {!showingMoreItem && (
          <TableContainer>
            <Grid
              container
              ref={mainTable}
              style={{ overflow: 'auto', justifyContent: 'center' }}
            >
              {filteredData.map((row, index) => (
                <Card className={classes.cardRoot} key={`pbs-item-${index}`}>
                  <CardContent
                    className={classes.cardContent}
                    classes={{ root: classes.cardNameContainer }}
                  >
                    <Typography variant="h6">
                      <div
                        className={classes.textOverflowLines}
                        dangerouslySetInnerHTML={{ __html: row.name }}
                      ></div>
                    </Typography>
                  </CardContent>
                  <CardContent
                    style={{
                      margin: '24px 0px 10px 0px',
                      paddingTop: 0,
                      paddingBottom: 0
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        paddingBottom: 0
                      }}
                      dangerouslySetInnerHTML={{ __html: row.desc?.short }}
                    ></div>
                  </CardContent>

                  <CardContent>
                    <AttachmentPreview
                      resources={getPrimaryVideo(row)}
                      resId={row._id}
                      autoPlay={false}
                      isPlay={row.isVideoPlay}
                      setPlay={handleVidePlayState}
                    />
                  </CardContent>
                  <ReferencedView references={getReferencedMaterials(row)} />

                  <div className={clsx(classes.cardBottom)}>
                    <div
                      style={{
                        width: '100%',
                        height: 'fit-content',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row'
                      }}
                    >
                      <div
                        style={{
                          cursor: 'pointer',
                          color: '#3f51b5',
                          marginTop: 12
                        }}
                        onClick={handleClickShowMore(row)}
                      >
                        {'More ->'}
                      </div>
                      {(currentUser.schemaType === 'superAdmin' ||
                        currentUser.schemaType === 'sysAdmin' ||
                        currentUser.schemaType === 'stationAdmin' ||
                        currentUser.schemaType === 'districtAdmin' ||
                        currentUser.schemaType === 'schoolAdmin' ||
                        currentUser.schemaType === 'educator') && (
                        <Box textAlign="center" style={{ display: 'flex' }}>
                          {row?.schemaType === 'sharedLesson' ? (
                            <CustomSelectBox
                              variant="outlined"
                              addMarginTop={true}
                              style={classes.selectFilter}
                              value={getSelectedClass(index)}
                              resources={classLoadedData
                                ?.filter(
                                  (item) =>
                                    item.topology?.station ===
                                    row?.topology?.station
                                )
                                ?.filter((item) => {
                                  let childMaterials = allMaterials?.filter(
                                    (mItem) =>
                                      mItem?.topology?.class === item?.value
                                  );
                                  let copiedLesson = childMaterials?.find(
                                    (cItem) => cItem?.intRef?._id === row?._id
                                  );
                                  if (copiedLesson) {
                                    return false;
                                  } else {
                                    return true;
                                  }
                                })}
                              id={row._id}
                              index={index}
                              onChange={handleClassCopySelect}
                              size="small"
                            />
                          ) : (
                            <CustomSelectBox
                              variant="outlined"
                              addMarginTop={true}
                              disabled={
                                classLoadedData == null ||
                                classLoadedData?.length === 0
                              }
                              style={classes.selectFilter}
                              value={
                                selectedClassItem[index] || lastCopiedClass
                              }
                              resources={classLoadedData?.filter((item) => {
                                let childMaterials = allMaterials?.filter(
                                  (mItem) =>
                                    mItem?.topology?.class === item?.value
                                );
                                let copiedLesson = childMaterials?.find(
                                  (cItem) => cItem?.intRef?._id === row?._id
                                );
                                if (copiedLesson) {
                                  return false;
                                } else {
                                  return true;
                                }
                              })}
                              id={row._id}
                              index={index}
                              onChange={handleClassCopySelect}
                              size="small"
                            />
                          )}

                          <IconButton
                            size="medium"
                            style={{ marginRight: 3 }}
                            disabled={
                              classLoadedData == null ||
                              classLoadedData?.length === 0
                            }
                            onClick={() =>
                              handleTableChange('copy', row, index)
                            }
                          >
                            <FontAwesomeIcon
                              icon={faCopy}
                              size="sm"
                              style={{ cursor: 'pointer' }}
                            />
                          </IconButton>
                          {currentUser.schemaType === 'superAdmin' && (
                            <IconButton
                              size="small"
                              onClick={() => handleTableChange('info', row)}
                            >
                              <FontAwesomeIcon
                                icon={faInfo}
                                size="sm"
                                style={{ cursor: 'pointer' }}
                              />
                            </IconButton>
                          )}
                          {row?.schemaType === 'sharedLesson' && (
                            <IconButton
                              size="medium"
                              style={{ marginLeft: 3 }}
                              onClick={() => handleTableChange('delete', row)}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                size="sm"
                                style={{ cursor: 'pointer' }}
                              />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>

            {filteredData?.length > 0 && (
              <Pagination
                count={totalPage}
                size="small"
                page={page}
                siblingCount={0}
                showFirstButton
                showLastButton
                onChange={handleChangePage}
                className={classes.pagination}
              />
            )}
          </TableContainer>
        )}

        <CustomDialog
          open={openInfo}
          title="Information"
          maxWidth="sm"
          fullWidth={true}
          onChange={handleInfoDialogChange}
        >
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <JSONEditor disable={false} resources={selectedInfo} />
          </Grid>
        </CustomDialog>
        <CustomDialog
          open={openCopy}
          title="Copy Library to Class"
          mainBtnName="Copy"
          maxWidth="sm"
          fullWidth={true}
          onChange={handleCopyDialogChange}
        >
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <FormControl style={{ width: '100%' }}>
              <CustomSelectBox
                variant="outlined"
                addMarginTop={true}
                style={classes.selectFilter}
                value={lastCopiedClass}
                resources={classLoadedData}
                onChange={handleClassCopySelect}
                size="small"
              />
            </FormControl>
          </Grid>
        </CustomDialog>
        <CustomDialog
          open={openDelete}
          title={en['Do you want to delete this shared resource?']}
          mainBtnName={en['Remove']}
          onChange={handleDeleteDialogChange}
        >
          <Typography variant="subtitle1">
            {en['remove material alert']}
          </Typography>
          <CustomCheckBox
            color="primary"
            value={checkbox}
            label={en['I agree with this action.']}
            onChange={(value) => setCheckbox(!value)}
          />
        </CustomDialog>
      </Paper>
    </div>
  );
}
