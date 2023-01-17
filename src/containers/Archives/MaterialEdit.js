/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box } from '@material-ui/core';
import { useApolloClient, useMutation, useLazyQuery } from '@apollo/client';
import graphql from '@app/graphql';
import { EditPanel } from '@app/components/Panels';
import {
  CustomDialog,
  CustomCheckBox,
  CustomSelectBox
} from '@app/components/Custom';
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
  ScheduleForm,
  ConfigForm,
  ThumbnailView
} from '@app/components/Forms';
import { DefaultCard } from '@app/components/Cards';
import langs from '@app/constants/lang/language.json';
import * as globalStyles from '@app/constants/globalStyles';
import JSONEditor from '@app/components/JSONEditor';
import { getDisplayName, getAssetUrl, getUUID } from '@app/utils/functions';
import { getBucketKey } from '@app/utils/aws_s3_bucket';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useTreeListContext } from '@app/providers/TreeListContext';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { useSearchContext } from '@app/providers/SearchContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useUserContext } from '@app/providers/UserContext';
import { CardViewDescriptionForm } from '@app/components/CardViewComponents';
import PBSLogo from '@app/styles/img/pbslm-logo.png';
import OERLogo from '@app/styles/img/oer_logo.png';
import { en } from '@app/language';
import { useSmallScreen, useMediumScreen } from '@app/utils/hooks';
import { groupingList } from '@app/utils/ApolloCacheManager';

const MaterialEdit = ({
  forceSave,
  resources,
  loadedData,
  setLoadedData,
  whenState,
  selectedTreeItem,
  setSelected,
  setSelectedTreeItem,
  setEditPanelData,
  setWhenState,
  classResources,
  setTopologyTitle,
  onChange,
  updateGrouping,
  deleteDocument,
  parentTreeItem,
  handleMainChange,
  onForceChange,
  forceChangeItem,
  viewMethod,
  setShowEdit,
  cardViewList
}) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [avatarS3URL, setAvatarS3URL] = useState();
  const [descData, setDescData] = useState({});
  const isSmallScreen = useSmallScreen();
  // const [scheduleData, setScheduleData] = useState({});
  const [detailBodyData, setDetailBodyData] = useState(undefined);
  const [detailData, setDetailData] = useState(undefined);
  const [topologyData, setTopologyData] = useState({});
  const [altText, setAltText] = useState();
  const [resId, setResId] = useState();
  const [avatarType, setAvatarType] = useState();
  const [tagsData, setTagsData] = useState([]);
  const [gradesData, setGradesData] = useState([]);
  const [accessModesData, setAccessModesData] = useState([]);
  const [category, setCategory] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [isTabReset, setIsTabReset] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [textEditor, setTextEditor] = useState(true);
  const client = useApolloClient();
  const { publish, unPublish, setEdited, isUnpublish, setSelectedNode } =
    useTreeListContext();
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const { nextSelected } = useSelectionContext();
  const [tabStatus, setTabStatus] = useState({ desc: true, criteria: false });
  const { openLessonSearch, setOpenLessonSearch } = useSearchContext();
  const { setOpenRight } = useGalleryContext();
  const [publishedClass, setPublishedClass] = useState();
  const [assignedStudentIdList, setAssignedStudentIdList] = useState();
  const [avatarSize, setAvatarSize] = useState();
  const [openConfirmPublish, setOpenConfirmPublish] = useState(false);
  const [currentUser] = useUserContext();
  const [publishedDate, setPublishedDate] = useState();
  const [startMMAUploading, setStartMMAUploading] = useState(false);
  const [parentStation, setParentStation] = useState();
  const [assetUrl, setAssetUrl] = useState();

  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );
  const isMediumScreen = useMediumScreen();

  const changePage = (item) => {
    if (viewMethod === 'Card View') {
      setSelectedTreeItem(item);
      setShowEdit(false);
    } else {
      setEditPanelData(item);
      setSelectedTreeItem(item);
      setSelected(item?._id);
    }
  };

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
    const convert_date = moment(new Date(dateStr)).format('MM/DD/YY hh:mm');
    return convert_date;
  };

  const getTitle = async (item) => {
    if (item == null || item == undefined) return;
    let itemName = '';
    let finalName = <></>;

    let { data: stationItem } = await client.query({
      query: graphql.queries.nameGrouping,
      variables: {
        id: item.topology.station,
        schemaType: 'station'
      }
    });
    let station = getDisplayName(stationItem?.grouping[0]?.name);
    setParentStation(stationItem?.grouping[0]);

    let { data: districtItem } = await client.query({
      query: graphql.queries.nameGrouping,
      variables: {
        id: item.topology.district,
        schemaType: 'district'
      }
    });
    let district = getDisplayName(districtItem?.grouping[0]?.name);

    let { data: schoolItem } = await client.query({
      query: graphql.queries.nameGrouping,
      variables: {
        id: item.topology.school,
        schemaType: 'school'
      }
    });
    let school = getDisplayName(schoolItem?.grouping[0]?.name);
    if (
      currentUser?.schemaType === 'superAdmin' ||
      currentUser?.schemaType === 'sysAdmin'
    ) {
      setTopologyTitle(`${station} > ${district} > ${school}`);
    } else if (currentUser?.schemaType === 'stationAdmin') {
      setTopologyTitle(`${station} > ${district} > ${school}`);
    } else if (currentUser?.schemaType === 'districtAdmin') {
      setTopologyTitle(`${station} > ${district} > ${school}`);
    } else if (currentUser?.schemaType === 'educator') {
      setTopologyTitle(`${district} > ${school}`);
    } else if (currentUser?.schemaType === 'schoolAdmin') {
      setTopologyTitle(`${school}`);
    }

    if (item.parentIdList == null || item.parentIdList?.length === 0) {
      let parentItem = classResources?.find(
        (ele) => ele._id === item.topology?.class
      );
      itemName = getDisplayName(parentItem?.name);
      finalName = (
        <>
          {finalName}
          <span
            className={classes.breadcrumb}
            onClick={() => changePage(parentItem)}
          >
            {itemName}
          </span>
        </>
      );
    } else {
      item.parentIdList?.forEach((el) => {
        if (itemName) {
          let parentItem = loadedData?.find((ele) => ele._id === el);
          itemName = `${getDisplayName(itemName)} > ${getDisplayName(
            parentItem?.name
          )}`;
          finalName = (
            <>
              {finalName}
              {` > `}
              <span
                className={classes.breadcrumb}
                onClick={() => changePage(parentItem)}
              >
                {getDisplayName(parentItem?.name)}
              </span>
            </>
          );
        } else {
          let parentItem = classResources?.find((ele) => ele._id === el);
          itemName = getDisplayName(parentItem?.name);
          finalName = (
            <>
              {finalName}
              <span
                className={classes.breadcrumb}
                onClick={() => changePage(parentItem)}
              >
                {itemName}
              </span>
            </>
          );
        }
      });
    }

    itemName = `${itemName} > ${getDisplayName(item.name)}`;
    finalName = (
      <>
        {finalName}
        {` > `}
        <span className={classes.breadcrumb}>{getDisplayName(item.name)}</span>
      </>
    );
    return finalName;
  };

  const convertUTCScheduleDateToLocalDate = (date) => {
    var newDate = new Date(date);
    newDate?.setMinutes(date?.getMinutes() - date?.getTimezoneOffset());
    return newDate?.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const onLoad = async () => {
      setCheckbox(false);
      let title = await getTitle(selectedTreeItem);
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

      setDetailBodyData(resources?.body || undefined);
      setDetailData(resources?.body || undefined);

      setTagsData(resources?.tagList || []);
      setGradesData(resources?.categories?.grades || []);
      setAccessModesData(resources?.categories?.accessModes || []);
      setCategory(resources?.categories?.orgs?.level1 || []);
    };

    if (resources?.multimediaAssets?.length > 0) {
      let unReadyMMA = resources?.multimediaAssets?.filter(
        (item) => item.status !== 'ready'
      );
      if (unReadyMMA?.length > 0 && resources?.state === 'published') {
        handleUnpublish();
      }
    }

    if (resources?.schemaType !== 'material') {
      var startAtInLacal = null;
      var endAtInLacal = null;
      if (selectedTreeItem?.schedule?.startAt) {
        let startAtInUTC = new Date(selectedTreeItem?.schedule?.startAt);
        startAtInLacal = convertUTCScheduleDateToLocalDate(startAtInUTC);
      }
      if (selectedTreeItem?.schedule?.endAt) {
        let endAtInUTC = new Date(selectedTreeItem?.schedule?.endAt);
        endAtInLacal = convertUTCScheduleDateToLocalDate(endAtInUTC);
      }

      let publishedOn = null;
      let unPublishedOn = null;
      if (selectedTreeItem?.lifecycle?.publishedOn) {
        let publishedOnInUTC = new Date(
          selectedTreeItem?.lifecycle?.publishedOn
        );
        publishedOn = convertUTCScheduleDateToLocalDate(publishedOnInUTC);
      }
      if (selectedTreeItem?.lifecycle?.unpublishedOn) {
        let unPublishedOnInUTC = new Date(
          selectedTreeItem?.lifecycle?.unpublishedOn
        );
        unPublishedOn = convertUTCScheduleDateToLocalDate(unPublishedOnInUTC);
      }
    } else {
      if (resources?.schedule?.startAt) {
        let startAtInUTC = new Date(resources?.schedule?.startAt);
        startAtInLacal = convertUTCScheduleDateToLocalDate(startAtInUTC);
      }
      if (resources?.schedule?.endAt) {
        let endAtInUTC = new Date(resources?.schedule?.endAt);
        endAtInLacal = convertUTCScheduleDateToLocalDate(endAtInUTC);
      }
      let publishedOn = null;
      let unPublishedOn = null;
      if (resources?.lifecycle?.publishedOn) {
        let publishedOnInUTC = new Date(resources?.lifecycle?.publishedOn);
        publishedOn = convertUTCScheduleDateToLocalDate(publishedOnInUTC);
      }
      if (resources?.lifecycle?.unpublishedOn) {
        let unPublishedOnInUTC = new Date(resources?.lifecycle?.unpublishedOn);
        unPublishedOn = convertUTCScheduleDateToLocalDate(unPublishedOnInUTC);
      }
    }

    if (resources) {
      if (resources?.schemaType === 'material') {
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
        if (resources?._id === resId) {
          return;
        }
      } else {
        if (selectedTreeItem?.avatar) {
          const url =
            selectedTreeItem.avatar?.baseUrl +
            selectedTreeItem.avatar?.fileDir +
            selectedTreeItem.avatar?.fileName;
          setAvatarS3URL(url || '');
          setAltText(selectedTreeItem?.avatar?.altText || '');
          setAvatarType(selectedTreeItem?.avatar?.type || '');
          setAssetUrl(
            selectedTreeItem?.avatar?.thumbnail
              ? selectedTreeItem.avatar?.baseUrl +
                  selectedTreeItem.avatar?.fileDir +
                  selectedTreeItem?.avatar?.thumbnail
              : url
          );
        } else {
          setAvatarS3URL('');
          setAltText('');
          setAvatarType('');
          setAssetUrl('');
        }
        if (selectedTreeItem?._id === resId) {
          return;
        }
      }
      if (
        selectedTreeItem?._id === resources?._id ||
        selectedTreeItem?.intRef?._id === resources?._id
      ) {
        onLoad();
        setResId(selectedTreeItem?._id);
      }
    }
    if (resources?.schemaType === 'material') {
      setSelectedTreeItem(resources);
    }
    setPublishedDate(resources?.data?.processDate?.publishedDate);
  }, [resources, selectedTreeItem, tabStatus]);

  const handleUnpublish = async () => {
    await unPublish(resources);
    const notiOps = getNotificationOpt('material', 'success', 'unpublish');
    notify(notiOps.message, notiOps.options);
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
      setTabStatus({ desc: true, criteria: false });
    } else {
      setOpenRight(false);
      setOpenLessonSearch(false);
      setTabStatus({ desc: false, criteria: true });
    }
  };

  const handleFormChange = (type, value) => {
    if (type === 'description') {
      setDescData(value);
      onForceChange('desc', value);
    }
    if (type === 'altText') {
      setAltText(value);
      onForceChange('altText', value);
    }

    if (type === 'avatarType') {
      setAvatarType(value);
    }

    if (type === 'avatarUpload') {
      if (value === 'remove') {
        setAvatarS3URL();
        onForceChange('avatar', '');
      } else {
        setAvatarS3URL(value);
        onForceChange('avatar', value);
      }
    }
    if (type === 'textEditor') {
      if (detailBodyData === value) {
        return;
      }

      // prevent update by empty paragraph whose
      //plain text is actually an empty string
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
        onForceChange('body', null);
      } else {
        setDetailBodyData(value);
        onForceChange('body', value);
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
      onForceChange('tagList', value);
    }

    if (type === 'grades') {
      setGradesData(value);
      onForceChange('grades', value);
    }

    if (type === 'accessModes') {
      setAccessModesData(value);
      onForceChange('accessModes', value);
    }

    if (type === 'category') {
      setCategory(value);
      // onForceChange('category', value);
    }

    onChange('update', true);
  };

  const handleMultiAttFormChange = async (type, value) => {
    try {
      let assetUrlVariables = {
        id: resources['_id'],
        schemaType: resources.schemaType,
        version: resources.version,
        multimediaAssets: []
      };

      if (type === 'upload') {
        assetUrlVariables = {
          ...assetUrlVariables,
          multimediaAssets: value
        };
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

          const tmp = resources.multimediaAssets?.filter((el) => {
            const originUrl = el.baseUrl + el.fileDir + el.fileName;
            if (originUrl !== url) return el;
          });

          const multimediaAssetsData = [];
          for (let obj of tmp) {
            multimediaAssetsData.push({
              altText: obj.altText,
              thumbnail: obj.thumbnail,
              mimeType: obj.mimeType,
              fileName: obj.fileName,
              fileDir: obj.fileDir,
              type: obj.type,
              baseUrl: obj.baseUrl,
              status: obj.status
            });
          }
          assetUrlVariables = {
            ...assetUrlVariables,
            multimediaAssets: multimediaAssetsData
          };
        } else {
          const notiOps = getNotificationOpt('material', 'error', 'delete');
          notify(notiOps.message, notiOps.options);
        }
      }

      if (type === 'update') {
        const tmp = resources.multimediaAssets?.slice();
        const idx = tmp.findIndex((el) => el.url === value.url);
        tmp[idx] = { ...tmp[idx], ...value };

        const multimediaAssetsData = [];
        for (let obj of tmp) {
          multimediaAssetsData.push({
            altText: obj.altText,
            thumbnail: obj.thumbnail,
            mimeType: obj.mimeType,
            fileName: obj.fileName,
            type: obj.type,
            fileDir: obj.fileDir,
            baseUrl: obj.baseUrl
          });
        }

        assetUrlVariables = {
          ...assetUrlVariables,
          multimediaAssets: multimediaAssetsData
        };
      }

      assetUrlVariables = {
        ...assetUrlVariables,
        trackingAuthorName: currentUser?.name
      };

      await updateGrouping({
        variables: {
          ...assetUrlVariables
        }
      });
      setWhenState(false);
      onChange('attachment', false);
      if (type === 'upload') {
        const notiOps = getNotificationOpt('attachment', 'success', 'drop');
        notify(notiOps.message, notiOps.options);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditPanelChange = async (type) => {
    try {
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
        setSelectedTreeItem();
        setShowEdit(false);
      }

      if (type === 'search') {
        setOpenLessonSearch(!openLessonSearch);
      }

      if (type === 'delete') setOpenDelete(true);
      if (type === 'save' || type === 'saveForPublish') {
        if (!whenState && !forceSave) {
          return;
        }

        let avatar = avatarS3URL
          ? {
              uId: resources.avatar?.uId ? resources.avatar?.uId : getUUID(),
              type: avatarType || 'avatar',
              baseUrl: resources.avatar?.baseUrl,
              fileDir: resources.avatar?.fileDir,
              altText: altText,
              mimeType: resources.avatar?.mimeType,
              fileName: resources.avatar?.fileName,
              status: 'ready',
              data: resources.avatar?.data
            }
          : null;

        if (
          avatarS3URL &&
          // avatarS3URL.includes('galleries') &&
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
            version: resources.version
          };

          const desc = {
            title: descData.title,
            short: descData.short,
            long: descData.long
          };

          const categories = {
            accessModes: accessModesData
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

          if (
            avatar?.fileName !== resources.avatar?.fileName ||
            altText !== resources.avatar?.altText
          ) {
            variableData = {
              ...variableData,
              avatar: {
                ...avatar,
                altText
              }
            };
          }

          if (detailBodyData !== resources.body) {
            variableData = {
              ...variableData,
              body: detailBodyData
            };
          }

          if (tagsData !== resources.tagList) {
            variableData = {
              ...variableData,
              tagList: tagsData
            };
          }

          if (categories?.accessModes !== resources?.categories?.accessModes) {
            variableData = {
              ...variableData,
              categories
            };
          }

          variableData = {
            ...variableData,
            trackingAuthorName: currentUser?.name
          };

          await updateGrouping({
            variables: variableData
          });
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
            setSelectedTreeItem(nextSelected);
          }
        }

        if (resources.avatar?.fileName) {
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
        if (viewMethod === 'Card View' && resources?.schemaType === 'class') {
          let parentItem = loadedData.find(
            (el) => el._id === resources.parentId
          );
          if (!parentItem) {
            parentItem = classResources.find(
              (el) => el._id === resources.parentId
            );
          }
          setSelectedTreeItem(parentItem ? parentItem : resources.parentId);
          setShowEdit(false);
        }
      }

      if (type === 'publish') {
        const unReadyAssets = resources.multimediaAssets?.filter(
          (el) => el.status !== 'ready'
        );

        if (resources.status === 'published') return;

        if (unReadyAssets && unReadyAssets?.length > 0) {
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

        await publish();

        //publish parent collections
        const classDocs = loadedData.filter(
          (item) => item.topology?.class === resources.topology?.class
        );
        const parentDocs = loadedData.filter((parent) =>
          resources.parentIdList?.includes(parent._id)
        );

        if (parentDocs && parentDocs.length > 0) {
          for (const parent of parentDocs) {
            if (parent.status !== 'published')
              await updateGrouping({
                variables: {
                  id: parent?._id,
                  schemaType: 'material',
                  version: parent?.version,
                  trackingAuthorName: currentUser?.name,
                  status: 'published',
                  data: {
                    ...parent?.data,
                    processDate: {
                      ...parent?.data?.processDate,
                      publishedDate: new Date()
                    }
                  }
                }
              });
          }
        }

        await updateClassStatus(resources);

        setWhenState(false);
        const notiOps = getNotificationOpt('material', 'success', 'publish');
        notify(notiOps.message, notiOps.options);
      }
      if (type === 'info') {
        setOpenInfo(true);
      }
    } catch (error) {
      const notiOps = getNotificationOpt('material', 'error', 'update');
      notify(notiOps.message, notiOps.options);
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
      await updateGrouping({
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
          resource?.childrenIdList?.includes(el._id)
        );
        if (childrens.length > 0) {
          await ChildrenDelete(childrens);
        }
      }
      await deleteDocument({
        variables: {
          id: resource['_id'],
          schemaType: resource.schemaType
        }
      });
    }

    let resourceChildren = children.map((item) => item._id);

    let childrenIds = [];
    let tmp = loadedData?.filter((el) => el._id === parentId);
    if (tmp.length === 0) {
      children[0].parentIdList.some((id) => {
        tmp = classResources?.filter((el) => el._id === id);
        return tmp.length;
      });

      childrenIds = tmp[0]?.childrenIdList?.filter(
        (el) => !resourceChildren.includes(el)
      );
    } else {
      childrenIds = tmp[0].childrenIdList?.filter(
        (el) => !resourceChildren.includes(el)
      );
    }

    if (tmp.length) {
      let varaibleData = {
        id: tmp[0]?._id,
        schemaType: tmp[0]?.schemaType,
        version: tmp[0]?.version,
        trackingAuthorName: currentUser?.name,
        childrenIdList: childrenIds
      };

      await updateGrouping({
        variables: varaibleData
      });
    }
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
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

  const handleConfirmDeleteDialog = async (type, value) => {
    try {
      if (type === 'btnClick') {
        let parentId = selectedTreeItem?.parentId;
        if (value) {
          if (selectedTreeItem?.childrenIdList?.length > 0) {
            let childrens = loadedData?.filter((el) =>
              el.parentIdList?.includes(selectedTreeItem?._id)
            );
            if (childrens.length > 0) {
              await ChildrenDelete(childrens, parentId);
            }
          }
          await deleteDocument({
            variables: {
              id: selectedTreeItem?._id,
              schemaType: 'archiveMaterial'
            }
          });
          let parentDoc = loadedData?.find((el) => el._id === parentId);
          if (!parentDoc)
            parentDoc = classResources?.find((el) => el._id === parentId);
          if (parentDoc)
            await updateGroupingList({
              variables: {
                id: parentId,
                schemaType: 'archiveClass',
                item: selectedTreeItem?._id,
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
          setSelectedTreeItem(parentTreeItem);
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

  return (
    <EditPanel
      title={title}
      page={'Archives'}
      canPublish={false}
      canDelete={true}
      canEdit={false}
      canUpdate={false}
      canGallery={false}
      canSearch={false}
      canShowInfo={false}
      canCancel={false}
      isTabReset={isTabReset}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      selectedTreeItem={selectedTreeItem}
      schemaType={selectedTreeItem?.schemaType}
      isMenuCenter={true}
      hideAction
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
        criteria: true
      }}
    >
      {tabStatus?.desc && resources?.data?.processDate?.publishedDate && (
        <Typography
          variant="subtitle1"
          style={{
            marginTop: 8,
            marginRight: 24,
            marginBottom: '-10px',
            float: 'right',
            fontSize: '14px',
            pointerEvents: 'none'
          }}
        >
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
                  style={
                    isSmallScreen
                      ? {}
                      : { display: 'flex', pointerEvents: 'none' }
                  }
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
                      docId={selectedTreeItem?._id}
                      stationId={selectedTreeItem?.topology?.station}
                      acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
                      title={en['lesson dropzone banner']}
                      onChange={(value) => handleOnAvatarChange(value)}
                      changeAlt={(value) => handleFormChange('altText', value)}
                      changeAvatarType={(value) =>
                        handleFormChange('avatarType', value)
                      }
                      disableGray={true}
                      doc={selectedTreeItem}
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
                  style={{
                    paddingTop: 0,
                    paddingRight: isMediumScreen ? 12 : 6,
                    pointerEvents: 'none'
                  }}
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
                      docId={selectedTreeItem?._id}
                      detailData={detailBodyData}
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
                      : { paddingTop: 0, paddingLeft: 6 }
                  }
                >
                  <MultimediaAttachmentForm
                    onlyPreviewAllow={true}
                    disable={false}
                    resources={resources}
                    setStartMMAUploading={setStartMMAUploading}
                    // setUploadingFilesParentId={setUploadingFilesParentId}
                    // setUploadFileType={setUploadFileType}
                    onChange={(type, value) =>
                      handleMultiAttFormChange(type, value, 'mma')
                    }
                    cardViewList={cardViewList}
                    avatarS3URL={avatarS3URL}
                    published={selectedTreeItem?.status === 'published'}
                    stationTransmission={parentStation?.transmission}
                  />
                </Grid>
              </Grid>
            ) : (
              []
            )}
            {tabStatus.criteria && (
              <Grid
                container
                direction="column"
                spacing={4}
                style={{ pointerEvents: 'none' }}
              >
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
                        value={
                          resources?.categories?.lang
                            ? resources?.categories?.lang
                            : 'en'
                        }
                        resources={langs}
                        // onChange={handleLanguageChange}
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
            {tabStatus.schedule && selectedTreeItem?.schemaType === 'school' && (
              <div style={{ marginTop: 0, width: 320, pointerEvents: 'none' }}>
                <ConfigForm
                  type={resources?.schemaType}
                  scheduleData={selectedTreeItem?.schedule}
                  lifecycleData={selectedTreeItem?.lifecycle}
                  onChange={(type, value) => handleFormChange(type, value)}
                />
              </div>
            )}
            {tabStatus.schedule && selectedTreeItem?.schemaType === 'material' && (
              <Grid
                item
                xs={12}
                style={{ paddingTop: 0, pointerEvents: 'none' }}
              >
                <DefaultCard>
                  <ScheduleForm
                    resources={selectedTreeItem?.schedule}
                    // messageStatus={(
                    //   resources?.schedule?.status ?? 'Null'
                    // ).capitalizeFirstLetter()}
                    onChange={(value) => handleFormChange('schedule', value)}
                  />
                </DefaultCard>
              </Grid>
            )}
          </Grid>
        </Grid>
      ) : (
        <Grid
          // spacing={3}
          container
          style={{
            padding: '8px',
            height:
              tabStatus?.desc && resources?.data?.processDate?.publishedDate
                ? 'calc(100% - 24px)'
                : '100%'
          }}
        >
          <Grid item xs={12} style={{ height: '100%' }}>
            {tabStatus?.desc ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                <Grid
                  container
                  direction="row"
                  style={{ height: 'min-content' }}
                >
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={8}
                    xl={8}
                    style={{ paddingRight: 6, pointerEvents: 'none' }}
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
                              onForceChange('desc', value);
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
                            docId={selectedTreeItem?._id}
                            stationId={selectedTreeItem?.topology?.station}
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
                            doc={selectedTreeItem}
                            isUpload={isAvatarUpload}
                            setUpload={setAvatarUpload}
                            altText={''}
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
                    style={{
                      paddingLeft: isMediumScreen ? 0 : 6,
                      paddingTop: isMediumScreen ? 12 : 0
                    }}
                  >
                    <DefaultCard
                      className={
                        isMediumScreen
                          ? classes.editPanelMobileAttachCard
                          : classes.editPanelAttachCard2
                      }
                    >
                      <MultimediaAttachmentForm
                        onlyPreviewAllow={true}
                        disable={false}
                        resources={resources}
                        setStartMMAUploading={setStartMMAUploading}
                        // setUploadingFilesParentId={setUploadingFilesParentId}
                        // setUploadFileType={setUploadFileType}
                        onChange={(type, value) =>
                          handleMultiAttFormChange(type, value, 'mma')
                        }
                        avatarS3URL={avatarS3URL}
                        published={selectedTreeItem?.status === 'published'}
                        stationTransmission={parentStation?.transmission}
                      />
                    </DefaultCard>
                  </Grid>
                </Grid>
                <Grid
                  item
                  style={{
                    marginTop: 12,
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                  // style={
                  //   isMediumScreen
                  //     ? { paddingLeft: 12, paddingRight: 6 }
                  //     : { paddingLeft: 6, paddingTop: 0 }
                  // }
                >
                  <DefaultCard
                    className={
                      isMediumScreen
                        ? classes.editPanelMobileAttachCard
                        : classes.editPanelAttachCard2
                    }
                    // style={{ minHeight: 200 }}
                  >
                    <div
                      style={{ width: '100%', minHeight: 200, height: '100%' }}
                    >
                      <TextEditor
                        disable={false}
                        docId={selectedTreeItem?._id}
                        detailData={detailBodyData}
                        onChange={(value) =>
                          handleFormChange('textEditor', value)
                        }
                      />
                    </div>
                  </DefaultCard>
                </Grid>
              </div>
            ) : (
              []
            )}
            {tabStatus.criteria && (
              <Grid
                container
                direction="column"
                spacing={4}
                style={{ pointerEvents: 'none' }}
              >
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
                      value={
                        resources?.categories?.lang
                          ? resources?.categories?.lang
                          : 'en'
                      }
                      resources={langs}
                      // onChange={handleLanguageChange}
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
            {tabStatus.schedule && selectedTreeItem?.schemaType === 'material' && (
              <>
                <div style={{ width: 600, pointerEvents: 'none' }}>
                  <Grid container direction="column" spacing={4}>
                    <Grid item xs={12} style={{ paddingTop: 0 }}>
                      <DefaultCard>
                        <ScheduleForm
                          resources={selectedTreeItem?.schedule}
                          // messageStatus={(
                          //   resources?.schedule?.status ?? 'Null'
                          // ).capitalizeFirstLetter()}
                          onChange={(value) =>
                            handleFormChange('schedule', value)
                          }
                        />
                      </DefaultCard>
                    </Grid>
                  </Grid>
                </div>
                <div style={{ marginTop: 0, width: 600 }}>
                  <ConfigForm
                    type={selectedTreeItem?.schemaType}
                    scheduleData={selectedTreeItem?.schedule}
                    lifecycleData={selectedTreeItem?.lifecycle}
                    onChange={(type, value) => handleFormChange(type, value)}
                  />
                </div>
              </>
            )}
          </Grid>
        </Grid>
      )}
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
    </EditPanel>
  );
};

export default MaterialEdit;
