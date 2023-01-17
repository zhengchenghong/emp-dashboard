/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useApolloClient, useMutation, useLazyQuery } from '@apollo/client';
import graphql from '@app/graphql';
import { EditPanel } from '@app/components/Panels';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import TextEditor from '@app/components/TextEditor';
import { getNotificationOpt } from '@app/constants/Notifications';
import moment from 'moment';
import {
  DescriptionForm,
  MultimediaAttachmentForm,
  AvatarUploadForm,
  MultiTagsForm,
  AltText,
  CategoryForm,
  ThumbnailView
} from '@app/components/Forms';
import { DefaultCard } from '@app/components/Cards';
import * as globalStyles from '@app/constants/globalStyles';
import JSONEditor from '@app/components/JSONEditor';
import { getAssetUrl, getUUID } from '@app/utils/functions';
import { getBucketKey } from '@app/utils/aws_s3_bucket';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useTreeListContext } from '@app/providers/TreeListContext';
import { useSearchContext } from '@app/providers/SearchContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useUserContext } from '@app/providers/UserContext';
import { CardViewDescriptionForm } from '@app/components/CardViewComponents';
import PBSLogo from '@app/styles/img/pbslm-logo.png';
import OERLogo from '@app/styles/img/oer_logo.png';
import { CustomSelectBox } from '@app/components/Custom';
import langs from '@app/constants/lang/language.json';
import { en } from '@app/language';
import CustomModal from '@app/components/Modal';
import HtmlContainer from '@app/containers/HtmlContainer';
import { groupingList } from '@app/utils/ApolloCacheManager';
import { useSmallScreen, useMediumScreen } from '@app/utils/hooks';
import useStyles from './style';
import { ConfigForm } from '@app/components/Forms';

const MyMaterialEdit = ({
  forceSave,
  resources,
  loadedData,
  setLoadedData,
  whenState,
  setSelected,
  setEditPanelData,
  setWhenState,
  classResources,
  setTopologyTitle,
  onChange,
  updateGrouping,
  upsertMMAGrouping,
  deleteMMAGrouping,
  deleteDocument,
  parentTreeItem,
  handleMainChange,
  forceChangeItem,
  viewMethod,
  setShowEdit,
  cardViewList,
  setPublishedDocs,
  setCreateNew,
  stationLoadedData
}) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [resId, setResId] = useState();
  const [avatarS3URL, setAvatarS3URL] = useState();
  const [descData, setDescData] = useState({});
  const [detailBodyData, setDetailBodyData] = useState(undefined);
  const [detailData, setDetailData] = useState(undefined);
  const [topologyData, setTopologyData] = useState({});
  const [altText, setAltText] = useState();
  const [avatarType, setAvatarType] = useState();
  const [tagsData, setTagsData] = useState([]);
  const [accessModesData, setAccessModesData] = useState([]);
  const [category, setCategory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [lifecycle, setLifecycle] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [isTabReset, setIsTabReset] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [textEditor, setTextEditor] = useState(true);
  const [openDeleteAbort, setOpenDeleteAbort] = useState(false);
  const { unPublish, setEdited, isUnpublish } = useTreeListContext();
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [tabStatus, setTabStatus] = useState({
    desc: true,
    criteria: false,
    schedule: false
  });
  const { openLessonSearch, setOpenLessonSearch } = useSearchContext();
  const { setOpenRight } = useGalleryContext();
  const [publishedClass, setPublishedClass] = useState();
  const [assignedStudentIdList, setAssignedStudentIdList] = useState();
  const [avatarSize, setAvatarSize] = useState();
  const [openConfirmPublish, setOpenConfirmPublish] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [currentUser] = useUserContext();
  const [publishedDate, setPublishedDate] = useState();
  const [language, setLanguage] = useState('en');
  const [startMMAUploading, setStartMMAUploading] = useState(false);
  const [uploadingFilesParentId, setUploadingFilesParentId] = useState(false);
  const [uploadFileType, setUploadFileType] = useState();
  const [isCategoryUpdate, setCategoryUpdate] = useState(false);
  const [isTagsUpdate, setTagsUpdate] = useState(false);
  const [assetUrl, setAssetUrl] = useState();
  const [showLearnerDashboard, setShowLearnerDashboard] = useState(false);

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const [
    getStudents,
    { loading: studentLoading, data: studentData, error: studentError }
  ] = useLazyQuery(graphql.queries.userGrouping);

  const fetchStudents = async (studentVariables) => {
    if (assignedStudentIdList && assignedStudentIdList.length > 0) {
      await getStudents({
        variables: studentVariables,
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  };

  const convertUTCDateToLocalDate = (dateStr) => {
    let convert_date = moment(new Date(dateStr)).format('MM/DD/YYYY hh:mm a');
    convert_date = convert_date.replace('am', 'AM');
    convert_date = convert_date.replace('pm', 'PM');
    return convert_date;
  };

  const convertUTCScheduleDateToLocalDate = (date) => {
    var newDate = new Date(date);
    newDate?.setMinutes(date?.getMinutes() - date?.getTimezoneOffset());
    return newDate?.toISOString().slice(0, 16);
  };

  const convertLocalDateToUTCDate = (date) => {
    var newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return newDate.toISOString();
  };

  const getTitle = async (item) => {
    return item?.name;
  };

  useEffect(() => {
    const onLoad = async () => {
      setTextEditor(!textEditor);
      // setCanUpdate(false);
      setCheckbox(false);
      let title = await getTitle(resources);
      setTitle(title);
      setDescData({
        title: resources?.desc?.title?.replace(/<[^>]+>/g, '') || '',
        short: resources?.desc?.short?.replace(/<[^>]+>/g, '') || '',
        long: resources?.desc?.long?.replace(/<[^>]+>/g, '') || ''
      });
      setTopologyData({
        ...topologyData,
        state: resources.topology?.state || '',
        station: resources.topology?.station || '',
        school: resources.topology?.school || '',
        district: resources.topology?.district || '',
        class: resources.topology?.class || ''
      });

      if (resources?.avatar) {
        const url =
          resources.avatar?.baseUrl +
          resources.avatar?.fileDir +
          resources.avatar?.fileName;
        setAvatarS3URL(url || '');
        setAltText(resources?.avatar?.altText || '');
        setAvatarType(resources?.avatar?.type || '');
        setAssetUrl(
          resources?.avatar?.thumbnail
            ? resources.avatar?.baseUrl +
                resources.avatar?.fileDir +
                resources?.avatar?.thumbnail
            : url
        );
      } else {
        setAvatarS3URL('');
        setAltText('');
        setAvatarType('');
        setAssetUrl('');
      }

      setDetailBodyData(resources?.body || undefined);
      setDetailData(resources?.body || undefined);

      // setDetailData(resources?.body || undefined);

      setTagsData(resources?.tagList || []);
      setAccessModesData(resources?.categories?.accessModes || []);
      setCategory(resources?.categories?.orgs?.level1 || []);
      setLanguage(resources?.categories?.lang);
    };

    if (resources?.multimediaAssets?.length > 0) {
      let unReadyMMA = resources?.multimediaAssets?.filter(
        (item) => item.status !== 'ready'
      );
      if (unReadyMMA?.length > 0 && resources?.state === 'published') {
        handleUnpublish();
      }
    }

    var startAtInLocal = '';
    var endAtInLocal = '';
    if (resources?.schedule?.startAt) {
      let startAtInUTC = new Date(resources?.schedule?.startAt);
      startAtInLocal = convertUTCScheduleDateToLocalDate(startAtInUTC);
    }
    if (resources?.schedule?.endAt) {
      let endAtInUTC = new Date(resources?.schedule?.endAt);
      endAtInLocal = convertUTCScheduleDateToLocalDate(endAtInUTC);
    }
    setSchedule({
      ...resources?.schedule,
      startAt: startAtInLocal,
      endAt: endAtInLocal
    });

    setLifecycle(resources?.lifecycle);

    if (resources) {
      if (resources._id === resId) {
        setAssetUrl(
          resources?.avatar?.thumbnail
            ? resources.avatar?.baseUrl +
                resources.avatar?.fileDir +
                resources?.avatar?.thumbnail
            : resources.avatar?.baseUrl +
                resources.avatar?.fileDir +
                resources?.avatar?.fileName
        );
        return;
      }
      setResId(resources._id);
      onLoad();
    }
    // setSelectedTreeItem(resources);
    setPublishedDate(resources?.data?.processDate?.publishedDate);
    setCategoryUpdate(false);
    setTagsUpdate(false);
  }, [resources]);

  const handleUnpublish = async () => {
    // if (resources.status === 'published') {
    //   let res = await updateGrouping({
    //     variables: {
    //       id: resources?._id,
    //       schemaType: resources?.schemaType,
    //       version: resources?.version,
    //       trackingAuthorName: currentUser?.name,
    //       status: 'unpublished'
    //     }
    //   });
    await unPublish(resources);
    onChange('unpublish', resources);
    const notiOps = getNotificationOpt('material', 'success', 'unpublish');
    notify(notiOps.message, notiOps.options);
    // }
  };

  useEffect(() => {
    if (forceSave) {
      handleEditPanelChange('save');
    }
  }, [forceSave]);

  const handleShowPanel = async (value) => {
    setIsTabReset(false);
    if (value === 0) {
      setDetailData(detailBodyData);
      setTabStatus({ desc: true, criteria: false, schedule: false });
    } else if (value === 1) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      setTabStatus({ desc: false, criteria: true, schedule: false });
    } else if (value === 2) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      setTabStatus({ desc: false, criteria: false, schedule: true });
    }
  };

  const handleFormChange = (type, value) => {
    if (type === 'description') {
      setDescData(value);
    }
    if (type === 'altText') {
      setAltText(value);
    }

    if (type === 'avatarType') {
      setAvatarType(value);
    }

    if (type === 'avatarUpload') {
      if (value === 'remove') {
        setAvatarAttached(false);
        setAvatarS3URL('');
        setWhenState(true);
        // onForceChange('avatar', '');
      } else {
        setAvatarAttached(true);
        setAvatarS3URL(value);
        setWhenState(true);
        // onForceChange('avatar', value);
      }
    }
    if (type === 'textEditor') {
      if (detailBodyData?.body === value) {
        return;
      }
      if (
        (detailBodyData || '')
          .replace(/<p>/gi, '')
          .replace(/<\/p>/gi, '')
          .replace(/\n/gi, '') === '' &&
        (value || '')
          .replace(/<p>/gi, '')
          .replace(/<\/p>/gi, '')
          .replace(/\n/gi, '') === ''
      ) {
        return;
      }
      if (value === '<p></p>\n') {
        setDetailBodyData(null);
        // onForceChange('body', null);
      } else {
        setDetailBodyData(value);
        // onForceChange('body', value);
      }
    }
    if (
      type === 'station' ||
      type === 'state' ||
      type === 'school' ||
      type === 'district' ||
      type === 'class'
    ) {
      setTopologyData({
        ...topologyData,
        [type]: value
      });
    }

    if (type === 'tags') {
      setTagsData(value);
      setTagsUpdate(true);
    }

    if (type === 'accessModes') {
      setAccessModesData(value);
      setCategoryUpdate(true);
    }

    if (type === 'category') {
      setCategory(value);
    }

    if (type === 'schedule') {
      console.log('schedule', value);
      setSchedule(value);
    }

    if (type === 'lifecycle') {
      setLifecycle(value);
    }

    onChange('update', true);
    setWhenState(true);
  };

  const handleMultiAttFormChange = async (type, value, from) => {
    try {
      if (type === 'upload') {
        let upserVariable = {
          docId: resources['_id'],
          schemaType: resources.schemaType,
          mma: value
        };
        let result = await upsertMMAGrouping({
          variables: upserVariable
        });
        const notiOps = getNotificationOpt('attachment', 'success', 'drop');
        notify(notiOps.message, notiOps.options);
        return;
      }

      if (type === 'delete') {
        if (!value.baseUrl) {
          const notiOps = getNotificationOpt('material', 'error', 'delete');
          notify(notiOps.message, notiOps.options);
          return false;
        }
        const bucketName = getAssetUrl(value.baseUrl).split('/')[3];
        let url = value.baseUrl + value.fileDir + value.fileName;
        const key = getBucketKey(url, bucketName);
        if (bucketName && key) {
          if (resources.avatar?.fileName !== value.fileName)
            await deleteAssetS3Grouping({
              variables: {
                bucket: bucketName,
                key: key
              }
            });

          let result = await deleteMMAGrouping({
            variables: {
              docId: resources['_id'],
              schemaType: resources.schemaType,
              uId: value.uId
            }
          });

          return;
        } else {
          const notiOps = getNotificationOpt('material', 'error', 'delete');
          notify(notiOps.message, notiOps.options);
        }
      }

      if (type === 'update') {
        const tmp = resources.multimediaAssets?.slice();
        const idx = tmp?.findIndex((el) => el.uId === value.uId);
        tmp[idx] = { ...tmp[idx], ...value };

        const multimediaAssetsData = tmp.map((item) => {
          let value = JSON.parse(JSON.stringify(item));
          delete value.__typename;
          return value;
        });

        if (multimediaAssetsData && multimediaAssetsData.length > 0) {
          for (const el of multimediaAssetsData) {
            let result = await upsertMMAGrouping({
              variables: {
                docId: resources['_id'],
                schemaType: resources.schemaType,
                mma: el
              }
            });
          }
          const notiOps = getNotificationOpt('attachment', 'success', 'update');
          notify(notiOps.message, notiOps.options);
        }
        return;
      }

      if (type === 'reOrder') {
        let assetUrlVariables = {
          id: resources['_id'],
          schemaType: resources.schemaType,
          version: resources.version,
          multimediaAssets: value,
          trackingAuthorName: currentUser?.name
        };
        await updateGrouping({
          variables: assetUrlVariables
        });
        if (from !== 'mma') {
          setWhenState(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'create') {
        setCreateNew(true);
        return;
      }
      if (type === 'edit') {
        await updateGrouping({
          variables: {
            id: resources['_id'],
            schemaType: resources.schemaType,
            version: resources.version,
            trackingAuthorName: currentUser?.name
          }
        });
        onChange('update', false);
      }

      if (type === 'cancel') {
        // setSelectedTreeItem();
        setShowEdit(false);
      }

      if (type === 'search') {
        // setOpenLessonSearch(!openLessonSearch);
        onChange('moveResource', resources?.topology?.class);
      }

      if (type === 'delete') setOpenDelete(true);
      if (type === 'save' || type === 'saveForPublish') {
        if (!whenState && !forceSave) {
          return;
        }

        let avatar;
        if (resources.avatar) {
          const copyStr = JSON.stringify(resources.avatar);
          let copyObj = JSON.parse(copyStr);
          delete copyObj['__typename'];

          avatar = {
            ...copyObj,
            uId: resources.avatar?.uId ? resources.avatar?.uId : getUUID(),
            type: avatarType || 'avatar',
            altText: altText,
            status: 'ready'
          };
        } else {
          avatar = {
            uId: getUUID(),
            type: avatarType || 'avatar',
            altText: altText,
            status: 'ready'
          };
        }

        if (
          avatarS3URL &&
          avatarS3URL !== avatar.baseUrl + avatar.fileDir + avatar.fileName
        ) {
          avatar.baseUrl =
            avatarS3URL.split(resources.topology?.station)[0] +
            resources.topology?.station +
            '/';
          avatar.fileName = avatarS3URL.split('/').pop();
          avatar.fileDir = avatarS3URL
            .replace(avatar.baseUrl, '')
            .replace(avatar.fileName, '');
          avatar.data = {
            imageSize: avatarSize
          };
          avatar.mimeType = avatarS3URL.toLowerCase().endsWith('png')
            ? 'image/png'
            : 'image/jpej';
        }

        if (resources) {
          onChange('update', false);
          let variableData = {
            id: resources['_id'],
            schemaType: resources.schemaType,
            version: resources.version,
            updatedAt: resources.updatedAt
          };

          const desc = {
            title: descData.title,
            short: descData.short,
            long: descData.long
          };

          const categories = {
            accessModes: accessModesData,
            lang: language
          };

          if (
            desc.title !== resources.desc?.title ||
            desc.short !== resources.desc?.short ||
            desc.long !== resources.desc?.long
          ) {
            variableData = {
              ...variableData,
              desc
            };
          }

          if (avatar?.fileName !== resources.avatar?.fileName) {
            variableData = avatarS3URL
              ? {
                  ...variableData,
                  avatar: {
                    ...avatar,
                    altText
                  }
                }
              : {
                  ...variableData,
                  avatar: altText ? { altText } : null
                };
          }

          if (altText !== resources.avatar?.altText) {
            avatar = {
              ...avatar,
              altText
            };
            variableData = {
              ...variableData,
              avatar
            };
          }

          if (detailBodyData !== resources.body) {
            variableData = {
              ...variableData,
              body: detailBodyData
            };
          }

          if (isTagsUpdate) {
            variableData = {
              ...variableData,
              tagList: tagsData
            };
          }

          if (isCategoryUpdate) {
            variableData = {
              ...variableData,
              categories
            };
          }
          if (schedule) {
            let scheduleVal = {
              startAt: null,
              endAt: null
            };
            let startDate = moment(loadedData?.startAt, 'YYYY-MM-DDTHH:mm');
            let endDate = moment(loadedData?.endAt, 'YYYY-MM-DDTHH:mm');
            if (startDate && endDate) {
              if (startDate > endDate) {
                const notiOps = getNotificationOpt(
                  'material',
                  'warning',
                  'schedule'
                );
                notify(notiOps.message, notiOps.options);
                return;
              }
            }
            if (schedule.startAt && schedule.startAt !== '') {
              let startAtOnInUTC = convertLocalDateToUTCDate(
                new Date(schedule.startAt)
              );
              scheduleVal.startAt = startAtOnInUTC;
            }
            if (schedule.endAt && schedule.endAt !== '') {
              let endAtOnInUTC = convertLocalDateToUTCDate(
                new Date(schedule.endAt)
              );
              scheduleVal.endAt = endAtOnInUTC;
            }
            variableData = {
              ...variableData,
              schedule: scheduleVal
            };
          }

          if (lifecycle) {
            let lifecycle = {
              publishedOn: null,
              unpublishedOn: null,
              deleteOn: null,
              archiveOn: null
            };
            if (lifecycle.archiveOn)
              lifecycle.archiveOn = new Date(lifecycle.archiveOn).toISOString();
            if (lifecycle.deleteOn)
              lifecycle.deleteOn = new Date(lifecycle.deleteOn).toISOString();
            if (lifecycle.unpublishedOn)
              lifecycle.unpublishedOn = new Date(
                lifecycle.unpublishedOn
              ).toISOString();
            if (lifecycle.publishedOn)
              lifecycle.archpublishedOniveOn = new Date(
                lifecycle.publishedOn
              ).toISOString();
            variableData = {
              ...variableData,
              lifecycle
            };
          }
          variableData = {
            ...variableData,
            trackingAuthorName: currentUser?.name
          };
          await updateGrouping({
            variables: variableData
          });

          setCategoryUpdate(false);
          setTagsUpdate(false);
          let oldTags = localStorage.getItem('tagsData');
          let newTags = JSON.parse(oldTags);

          if (newTags) {
            tagsData.map((el) => newTags.push(el));
          } else {
            newTags = tagsData;
          }
          localStorage.setItem('tagsData', JSON.stringify(newTags));
          if (forceSave) {
            onChange('forceSave', false);
            // setSelectedTreeItem(nextSelected);
          }
          setWhenState(false);
        }

        if (
          (isAvatarAttached || (avatarS3URL && avatarS3URL !== '')) &&
          resources.avatar?.fileName
        ) {
          const avatarURL = `${resources.avatar?.baseUrl}${resources.avatar?.fileDir}${resources.avatar?.fileName}`;
          if (
            (!avatarS3URL && resources.avatar?.fileName) ||
            avatarS3URL !== avatarURL
          ) {
            const isExistInAttachment = resources.multimediaAssets?.find(
              (item) => item.fileName === resources.avatar?.fileName
            );
            if (isExistInAttachment) return;
            const assetUrl = getAssetUrl(avatarURL).split('/')[3];
            const key = avatarURL.split(assetUrl)[1].slice(1);
            await deleteAssetS3Grouping({
              variables: {
                bucket: assetUrl,
                key: key
              }
            });
          }
        }

        if (type !== 'saveForPublish' && !isAvatarAttached) {
          const notiOps = getNotificationOpt('material', 'success', 'update');
          notify(notiOps.message, notiOps.options);
        } else {
          if (isAvatarAttached) {
            setAvatarUpload(true);
            setAvatarAttached(false);
          }
        }
        if (viewMethod === 'List View' && resources?.schemaType === 'class') {
          let parentItem = loadedData.find(
            (el) => el._id === resources.parentId
          );
          if (!parentItem) {
            parentItem = classResources.find(
              (el) => el._id === resources.parentId
            );
          }
          // setSelectedTreeItem(parentItem ? parentItem : resources.parentId);
          setShowEdit(false);
        }
      }

      if (type === 'publish') {
        const unReadyAssets = resources.multimediaAssets?.filter(
          (el) => el.status !== 'ready'
        );

        if (resources.status === 'published') return;

        if (
          (unReadyAssets && unReadyAssets?.length > 0) ||
          uploadingFilesParentId === resources?._id
        ) {
          // const notiOps = getNotificationOpt('material', 'warning', 'publish');
          // notify(notiOps.message, notiOps.options);
          setOpenConfirmPublish(true);
          return;
        }

        if (whenState) {
          await handleEditPanelChange('saveForPublish');
        }
        if (resources.status === 'published') {
          const notiOps = getNotificationOpt(
            'material',
            'warning',
            'published'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        // await publish(uploadingFilesParentId);

        const parentDocs = loadedData.filter((parent) =>
          resources.parentIdList?.includes(parent._id)
        );
        parentDocs.push(resources);
        let superParent = parentDocs.find(
          (item) => item.parentId === item.topology?.class
        );
        if (superParent) {
          let publishedItems = [];
          const publishedItem = await changeChildPublishStatus(superParent);
          publishedItems.push(publishedItem);
          if (
            superParent.childrenIdList &&
            superParent.childrenIdList.length > 0
          ) {
            for (const childId of superParent.childrenIdList) {
              let childDoc = loadedData.find((item) => item._id === childId);
              if (childDoc) {
                const publishedChild = await changeChildPublishStatus(childDoc);
                publishedItems.push(publishedChild);
                if (childDoc.childrenIdList?.length > 0) {
                  for (const childChildId of childDoc.childrenIdList) {
                    let childChildDoc = loadedData.find(
                      (item) => item._id === childChildId
                    );
                    if (childChildDoc) {
                      const publishedChildChild =
                        await changeChildPublishStatus(childChildDoc);
                      publishedItems.push(publishedChildChild);
                    }
                  }
                }
              }
            }
          }
          let tmp = [...loadedData];
          for (const published of publishedItems) {
            let itemIndex = loadedData.findIndex(
              (item) => item._id === published._id
            );
            if (itemIndex >= 0) {
              tmp[itemIndex] = published;
            }
          }
          setLoadedData(tmp.sort((a, b) => a.rank - b.rank));
        }

        await updateClassStatus(resources);

        setWhenState(false);
        const notiOps = getNotificationOpt('material', 'success', 'publish');
        notify(notiOps.message, notiOps.options);
      }
      if (type === 'info') {
        setOpenInfo(true);
      }

      if (type === 'preview') {
        setShowLearnerDashboard(true);
      }
    } catch (error) {
      const notiOps = getNotificationOpt('material', 'error', 'update');
      if (error.message === en['data_changed']) {
        notify(error.message, notiOps.options);
      } else {
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const changeChildPublishStatus = async (doc) => {
    let unReadyMMAFiles = doc.multimediaAssets?.filter(
      (file) => file.status === 'converting'
    );
    if (
      doc?._id !== uploadingFilesParentId &&
      (unReadyMMAFiles == null || unReadyMMAFiles?.length === 0)
    ) {
      const { data } = await updateGrouping({
        variables: {
          id: doc?._id,
          schemaType: doc?.schemaType,
          version: doc?.version,
          trackingAuthorName: currentUser?.name,
          status: 'published',
          data: {
            ...doc?.data,
            processDate: {
              ...doc?.data?.processDate,
              publishedDate: new Date()
            }
          }
        }
      });

      return data.updateGrouping;
    } else {
      return doc;
    }
  };

  const updateClassStatus = async (item) => {
    const selectedClass = classResources.filter(
      (el) => el._id === item.topology?.class
    );
    if (selectedClass && selectedClass[0]?.status !== 'published') {
      setPublishedClass(selectedClass[0]);
      let varaibleData = {
        id: selectedClass[0]['_id'],
        schemaType: selectedClass[0].schemaType,
        version: selectedClass[0].version,
        trackingAuthorName: currentUser?.name,
        status: 'published'
      };
      const { data } = await updateGrouping({
        variables: varaibleData
      });

      if (
        selectedClass[0]?.assigneeIdList &&
        selectedClass[0]?.assigneeIdList.length > 0
      ) {
        updateAssignedStudents(selectedClass[0]?.assigneeIdList);
      }
    }
  };

  const updateAssignedStudents = async (studentIds) => {
    setAssignedStudentIdList(studentIds);
    let variable = {
      parentId: publishedClass?.topology?.district,
      schemaType: 'student'
    };
    fetchStudents(variable);
  };

  useEffect(() => {
    if (
      !studentLoading &&
      !studentError &&
      studentData &&
      assignedStudentIdList?.length > 0
    ) {
      let data = studentData.grouping.filter((el) =>
        assignedStudentIdList.includes(el._id)
      );
      if (data && data.length > 0) {
        updateStudentInfo(data);
      }
    }
  }, [studentLoading, studentError, studentData]);

  const updateStudentInfo = async (studentData) => {
    for (const ml of studentData) {
      await updateGrouping({
        variables: {
          id: ml['_id'],
          schemaType: 'student',
          version: ml.version,
          trackingAuthorName: currentUser?.name,
          status: 'published'
        }
      });
    }
    setAssignedStudentIdList();
  };

  const ChildrenDelete = async (children, parentId) => {
    for (let resource of children) {
      if (resource?.childrenIdList?.length > 0) {
        let childrens = loadedData?.filter((el) =>
          // resource?.childrenIdList?.includes(el._id)
          el.parentIdList?.includes(resource?._id)
        );
        if (childrens.length > 0) {
          await ChildrenDelete(childrens, resource?._id);
        }
      }
      await deleteDocument({
        variables: {
          id: resource['_id'],
          schemaType: resource.schemaType
        }
      });

      let parentDoc = loadedData?.find((el) => el._id === parentId);
      if (!parentDoc)
        children[0].parentIdList.some((id) => {
          parentDoc = classResources?.find((el) => el._id === id);
          return parentDoc;
        });
      if (parentDoc)
        await updateGroupingList({
          variables: {
            id: parentId,
            schemaType: parentDoc.schemaType,
            item: resource?._id,
            fieldName: 'childrenIdList',
            type: 'remove',
            trackingAuthorName: currentUser?.name
          }
        });
    }
  };

  const handleConfirmDeleteDialog = async (type, value) => {
    try {
      if (type === 'btnClick') {
        let parentId = resources.parentId;
        if (value) {
          if (resources?.childrenIdList?.length > 0) {
            let childrens = loadedData?.filter((el) =>
              // resources?.childrenIdList?.includes(el._id)
              el.parentIdList?.includes(resources?._id)
            );
            if (childrens.length > 0) {
              await ChildrenDelete(childrens, parentId);
            }
          }
          await deleteDocument({
            variables: {
              id: resources['_id'],
              schemaType: resources.schemaType
            }
          });
          let parentDoc = loadedData?.find((el) => el._id === parentId);
          if (!parentDoc)
            parentDoc = classResources?.find((el) => el._id === parentId);
          if (parentDoc)
            await updateGroupingList({
              variables: {
                id: parentId,
                schemaType: parentDoc.schemaType,
                item: resources?._id,
                fieldName: 'childrenIdList',
                type: 'remove',
                trackingAuthorName: currentUser?.name
              }
            });

          const notiOps = getNotificationOpt('material', 'success', 'delete');
          notify(notiOps.message, notiOps.options);
          setWhenState(false);
          onChange('delete');
          onChange('refresh', true);
          // setSelectedTreeItem(parentTreeItem);
          handleMainChange('elSingleClick', parentTreeItem);
        }

        setOpenConfirm(false);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('material', 'error', 'delete');
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
        setOpenConfirm(true);
      }
      setCheckbox(false);
      setOpenDelete(false);
    }
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleLanguageChange = (data) => {
    setLanguage(data?.value);
    setWhenState(true);
    setCategoryUpdate(true);
  };

  const handlePublishConfirmDialog = (type, value) => {
    // if (type === 'btnClick') {
    //   if (value) {
    //     if (!isPublishConfirmed) {
    //       const notiOps = getNotificationOpt('material', 'warning', 'delete');
    //       notify(notiOps.message, notiOps.options);
    //       return;
    //     }
    //     handleEditPanelChange('publish');
    //   }
    //   setPublishConfirmed(false);
    //   setOpenConfirmPublish(false);
    // }
    setOpenConfirmPublish(false);
  };

  var user = {
    id: resources?._id,
    parentId: resources?.parentId,
    version: resources?.version
  };
  localStorage.removeItem('user');
  localStorage.setItem('user', JSON.stringify(user));

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      setWhenState(true);
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarS3URL();
      setWhenState(true);
    } else {
      handleFormChange('avatarUpload', value);
    }
  };

  useEffect(() => {
    setEdited(whenState);
  }, [whenState]);

  useEffect(() => {
    if (isUnpublish) {
      handleEditPanelChange('saveForPublish');
    }
  }, [isUnpublish]);

  useEffect(() => {
    if (startMMAUploading) {
      if (uploadFileType && uploadFileType === 'media') {
        handleUnpublish();
      }
    }
  }, [startMMAUploading, uploadFileType]);

  return (
    <EditPanel
      title={title}
      page={'Lessons'}
      // canPublish={tabStatus?.desc}
      canDelete
      canEdit={true}
      canUpdate={true}
      canSave={true}
      canGallery={tabStatus?.desc}
      // canSearch={tabStatus?.desc}
      canShowInfo={true}
      canCancel={
        viewMethod === 'Card View' && resources?.schemaType === 'class'
          ? true
          : false
      }
      isTabReset={isTabReset}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      // selectedTreeItem={selectedTreeItem}
      // schemaType={selectedTreeItem?.schemaType}
      isMenuCenter={true}
      galleryType={'banner'}
      tabSetting={{
        desc: true,
        packages: false,
        topology: false,
        people: false,
        right: false,
        students: false,
        teachers: false,
        styles: resources?.schemaType === 'district' ? true : false,
        disableMenu: { right: true },
        criteria: true,
        schedule: true
      }}
      topBarMinWidth={980}
      hideTitleOnMobile={true}
      canCreate={!cardViewList || viewMethod === 'list'}
      canIngest={currentUser.schemaType === 'schoolAdmin' && isMediumScreen}
    >
      {tabStatus?.desc && resources?.data?.processDate?.publishedDate && (
        <Typography
          variant="subtitle1"
          style={
            // cardViewList ?
            {
              marginTop: 8,
              marginRight: 24,
              marginBottom: '-10px',
              float: 'right',
              fontSize: '14px'
            }
            // : { marginTop: 10, marginLeft: 40, marginBottom: '-10px' }
          }
        >
          {/* <Box fontWeight="fontWeightBold"> */}
          {en['Published Date'] +
            ':  ' +
            convertUTCDateToLocalDate(
              new Date(resources?.data?.processDate?.publishedDate)
            )?.replace('T', ' ')}
          {/* </Box> */}
        </Typography>
      )}

      {cardViewList ? (
        <Grid
          // spacing={3}
          container
          direction="row"
          style={{ padding: 12 }}
        >
          <Grid
            item
            xs={12}
            // style={{ padding: 0, background: 'red' }}
          >
            {tabStatus?.desc ? (
              <Grid container spacing={4}>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  style={isSmallScreen ? {} : { display: 'flex' }}
                >
                  <ThumbnailView
                    disable={false}
                    resources={assetUrl}
                    cardViewList={cardViewList}
                  />
                  <Grid
                    item
                    xs={12}
                    style={isSmallScreen ? {} : { paddingLeft: 12 }}
                  >
                    <AvatarUploadForm
                      disable={false}
                      resources={avatarS3URL}
                      docId={resources?._id}
                      stationId={resources?.topology?.station}
                      acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
                      title={en['lesson dropzone banner']}
                      onChange={(value) => handleOnAvatarChange(value)}
                      changeAlt={(value) => handleFormChange('altText', value)}
                      changeAvatarType={(value) =>
                        handleFormChange('avatarType', value)
                      }
                      disableGray={true}
                      doc={resources}
                      isUpload={isAvatarUpload}
                      setUpload={setAvatarUpload}
                      altText={altText}
                      setAvatarSize={setAvatarSize}
                      cardViewList={cardViewList}
                    />
                  </Grid>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={8}
                  xl={8}
                  style={
                    isMediumScreen
                      ? { paddingTop: 0, paddingRight: 12 }
                      : { paddingTop: 0, paddingRight: 6 }
                  }
                >
                  <Grid item xs={12}>
                    <CardViewDescriptionForm
                      disable={false}
                      resources={descData}
                      onChange={(value) =>
                        handleFormChange('description', value)
                      }
                      helperText={false}
                      disableGray={true}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={
                      isMediumScreen ? { paddingTop: 12 } : { paddingTop: 8 }
                    }
                  >
                    <TextEditor
                      disable={false}
                      docId={resources?._id}
                      detailData={detailData}
                      textEditor={textEditor}
                      resources={resources}
                      onChange={(value) =>
                        handleFormChange('textEditor', value)
                      }
                      isAvatar={avatarS3URL ? true : false}
                      cardViewList={cardViewList}
                    />
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={4}
                  xl={4}
                  style={
                    isMediumScreen
                      ? { paddingTop: 0, paddingLeft: 12 }
                      : { paddingTop: 10, paddingLeft: 6 }
                  }
                >
                  <MultimediaAttachmentForm
                    disable={false}
                    resources={resources}
                    setStartMMAUploading={setStartMMAUploading}
                    setUploadingFilesParentId={setUploadingFilesParentId}
                    setUploadFileType={setUploadFileType}
                    onChange={(type, value) =>
                      handleMultiAttFormChange(type, value, 'mma')
                    }
                    cardViewList={cardViewList}
                    avatarS3URL={avatarS3URL}
                    published={resources?.status === 'published'}
                    stationTransmission={stationLoadedData?.find(
                      (item) => item?._id === resources?.topology?.station
                    )}
                  />
                  {/* </DefaultCard> */}
                </Grid>
              </Grid>
            ) : (
              []
            )}
            {tabStatus.criteria && (
              <Grid container direction="column" spacing={4}>
                <Grid item xs={12}>
                  <DefaultCard style={classes.grayPanel} lesson={true}>
                    <Grid style={{ padding: '14px 30px 24px 30px' }}>
                      <MultiTagsForm
                        disable={false}
                        resources={tagsData}
                        onChange={(value) => handleFormChange('tags', value)}
                        disableGray={true}
                        hint={en['Tags'] + '...'}
                        title={en['Tags']}
                      />

                      <MultiTagsForm
                        disable={false}
                        resources={accessModesData}
                        onChange={(value) =>
                          handleFormChange('accessModes', value)
                        }
                        disableGray={true}
                        hint={en['Access modes'] + '...'}
                        title={en['Access modes']}
                      />
                      <CustomSelectBox
                        variant="outlined"
                        addMarginTop={true}
                        style={classes.selectFilter}
                        value={language ? language : 'en'}
                        resources={langs}
                        onChange={handleLanguageChange}
                        size="small"
                      />
                    </Grid>
                  </DefaultCard>
                </Grid>
                <Grid item xs={12}>
                  <CategoryForm
                    resources={category}
                    onChange={(value) => handleFormChange('category', value)}
                  />
                </Grid>
              </Grid>
            )}
            {tabStatus.schedule && (
              <div style={{ marginTop: 0, width: 320 }}>
                <ConfigForm
                  type={resources?.schemaType}
                  scheduleData={schedule}
                  lifecycleData={lifecycle}
                  onChange={(type, value) => handleFormChange(type, value)}
                />
              </div>
            )}
          </Grid>
        </Grid>
      ) : (
        <Grid
          // spacing={3}
          container
          direction="row"
          style={{ padding: '8px' }}
        >
          <Grid item xs={12}>
            {tabStatus?.desc ? (
              <Grid
                container
                spacing={4}
                style={{ width: 'calc(100% + 20px)' }}
              >
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={8}
                  xl={8}
                  style={{ paddingRight: 6 }}
                >
                  <DefaultCard lesson={true}>
                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <DescriptionForm
                          disable={false}
                          resources={descData}
                          onChange={(value) =>
                            handleFormChange('description', value)
                          }
                          helperText={false}
                          disableGray={true}
                          hideDescription
                          hideHelpText
                          onSaveContents={(value) => {
                            setDescData(value);
                            // onForceChange('desc', value);
                            handleEditPanelChange('save');
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                      >
                        <AvatarUploadForm
                          disable={false}
                          resources={avatarS3URL}
                          docId={resources?._id}
                          stationId={resources?.topology?.station}
                          acceptedFiles={[
                            'image/png',
                            'image/jpg',
                            'image/jpeg'
                          ]}
                          title={en['lesson dropzone banner']}
                          onChange={(value) => handleOnAvatarChange(value)}
                          changeAlt={(value) =>
                            handleFormChange('altText', value)
                          }
                          changeAvatarType={(value) =>
                            handleFormChange('avatarType', value)
                          }
                          disableGray={true}
                          doc={resources}
                          isUpload={isAvatarUpload}
                          setUpload={setAvatarUpload}
                          altText={altText}
                          setAvatarSize={setAvatarSize}
                        />
                      </Grid>

                      {(avatarS3URL || isAvatarAttached) && (
                        <Grid item xs={12} style={{ paddingBottom: 0 }}>
                          <AltText
                            disable={false}
                            resources={altText}
                            onChange={(value) =>
                              handleFormChange('altText', value)
                            }
                            type="material"
                            isAvatarAttached={isAvatarAttached}
                          />
                        </Grid>
                      )}

                      {resources?.source?.flag && (
                        <Grid item xs={12} style={{ paddingBottom: 0 }}>
                          {resources.source.flag === 'PBS' ? (
                            <img className="common-pbs" src={PBSLogo} />
                          ) : resources.source.flag === 'OER' ? (
                            <img className="common-pbs" src={OERLogo} />
                          ) : (
                            []
                          )}
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <DescriptionForm
                          disable={false}
                          resources={descData}
                          onChange={(value) =>
                            handleFormChange('description', value)
                          }
                          helperText={false}
                          disableGray={true}
                          hideName
                          resourceType="lessons"
                        />
                      </Grid>
                    </Grid>
                  </DefaultCard>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={4}
                  xl={4}
                  style={
                    isMediumScreen
                      ? { paddingLeft: 12, paddingRight: 6 }
                      : { paddingLeft: 6, paddingTop: 10 }
                  }
                >
                  <DefaultCard
                    className={
                      isMediumScreen
                        ? classes.editPanelMobileAttachCard
                        : classes.editPanelAttachCard2
                    }
                  >
                    <MultimediaAttachmentForm
                      disable={false}
                      resources={resources}
                      setStartMMAUploading={setStartMMAUploading}
                      setUploadingFilesParentId={setUploadingFilesParentId}
                      setUploadFileType={setUploadFileType}
                      onChange={(type, value) =>
                        handleMultiAttFormChange(type, value, 'mma')
                      }
                      avatarS3URL={avatarS3URL}
                      published={resources?.status === 'published'}
                      stationTransmission={stationLoadedData?.find(
                        (item) => item?._id === resources?.topology?.station
                      )}
                    />
                  </DefaultCard>
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={
                    isMediumScreen
                      ? { paddingLeft: 12, paddingRight: 6 }
                      : { paddingLeft: 6 }
                  }
                >
                  <DefaultCard className={classes.editPanelHtmlCard1}>
                    <TextEditor
                      disable={false}
                      docId={resources?._id}
                      detailData={detailData}
                      textEditor={textEditor}
                      resources={resources}
                      onChange={(value) =>
                        handleFormChange('textEditor', value)
                      }
                    />
                  </DefaultCard>
                </Grid>
              </Grid>
            ) : (
              []
            )}
            {tabStatus.criteria && (
              <Grid container direction="column" spacing={4}>
                <Grid item xs={12}>
                  <DefaultCard lesson={true} inline={false} disableGray={false}>
                    <MultiTagsForm
                      disable={false}
                      resources={tagsData}
                      onChange={(value) => handleFormChange('tags', value)}
                      disableGray={true}
                      hint={en['Tags'] + '...'}
                      title={en['Tags']}
                    />

                    <MultiTagsForm
                      disable={false}
                      resources={accessModesData}
                      onChange={(value) =>
                        handleFormChange('accessModes', value)
                      }
                      disableGray={true}
                      hint={en['Access modes'] + '...'}
                      title={en['Access modes']}
                    />
                    <CustomSelectBox
                      variant="outlined"
                      addMarginTop={true}
                      style={classes.selectFilter}
                      value={language ? language : 'en'}
                      resources={langs}
                      onChange={handleLanguageChange}
                      size="small"
                      noPadding={true}
                    />
                  </DefaultCard>
                </Grid>
                <Grid item xs={12}>
                  <CategoryForm
                    resources={category}
                    onChange={(value) => handleFormChange('category', value)}
                  />
                </Grid>
              </Grid>
            )}
            {tabStatus.schedule && (
              <div style={{ marginTop: 0, width: 320 }}>
                <ConfigForm
                  type={resources?.schemaType}
                  scheduleData={schedule}
                  lifecycleData={lifecycle}
                  onChange={(type, value) => handleFormChange(type, value)}
                />
              </div>
            )}
          </Grid>
        </Grid>
      )}
      <CustomDialog
        open={openDelete}
        title={en['Do you want to delete this lesson?']}
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
      <CustomDialog
        open={openConfirm}
        title={en['Do you want to delete this lesson?']}
        mainBtnName={en['Remove']}
        onChange={handleConfirmDeleteDialog}
      >
        <Typography variant="subtitle1">{en['delete alert']}</Typography>
      </CustomDialog>
      <CustomDialog
        open={openInfo}
        title={en['Information']}
        maxWidth="md"
        fullWidth={true}
        customClass={classes.infoDialogContent}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor disable={false} resources={resources} />
        </Grid>
      </CustomDialog>
      <CustomDialog
        open={openDeleteAbort}
        title={en["Can't delete the data."]}
        secondaryBtnName={en['Ok']}
        onChange={() => {
          setOpenDeleteAbort(false);
          setOpenDelete(false);
        }}
      >
        <Typography variant="h6">{en['delete notify']}</Typography>
      </CustomDialog>
      <CustomDialog
        open={openConfirmPublish}
        title={en['The file is being processed and not ready for publishing.']}
        secondaryBtnName={en['OK']}
        onChange={handlePublishConfirmDialog}
      >
        <Typography variant="h6">{en['Please try again later!']}</Typography>
        {/* <CustomCheckBox
          color="primary"
          value={isPublishConfirmed}
          label="I agree to publish."
          onChange={(value) => setPublishConfirmed(!value)}
        /> */}
      </CustomDialog>
      <CustomModal
        icon={null}
        title={en["Learner's Dashboard"]}
        resources={resources}
        openModal={showLearnerDashboard}
        setOpenModal={setShowLearnerDashboard}
        Children={HtmlContainer}
        flag="ldash"
        classResources={classResources}
      />
    </EditPanel>
  );
};

export default MyMaterialEdit;
