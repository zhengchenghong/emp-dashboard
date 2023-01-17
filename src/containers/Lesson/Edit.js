/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Input,
  Select,
  ListItemText,
  MenuItem
} from '@material-ui/core';
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
  ThumbnailView,
  ScheduleForm
} from '@app/components/Forms';
import { DefaultCard } from '@app/components/Cards';
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
import { CustomSelectBox } from '@app/components/Custom';
import langs from '@app/constants/lang/language.json';
import { en } from '@app/language';
import CustomModal from '@app/components/Modal';
import HtmlContainer from '@app/containers/HtmlContainer';
import { groupingList } from '@app/utils/ApolloCacheManager';
import { useSmallScreen, useMediumScreen } from '@app/utils/hooks';
import useStyles from './style';
import { ConfigForm } from '@app/components/Forms';

const MenuProps = {
  PaperProps: {
    style: {
      // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

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
  upsertMMAGrouping,
  deleteMMAGrouping,
  deleteDocument,
  parentTreeItem,
  handleMainChange,
  onForceChange,
  forceChangeItem,
  viewMethod,
  setShowEdit,
  cardViewList,
  setPublishedDocs,
  setCreateNew,
  newDoc,
  setNewDoc,
  allClasses
}) => {
  const classes = globalStyles.globaluseStyles();
  const classes1 = useStyles();
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [resId, setResId] = useState();
  const [avatarS3URL, setAvatarS3URL] = useState();
  const [updatedRes, setUpdatedRes] = useState();
  const [descData, setDescData] = useState({});
  const [sliderTapValue, setSliderTapValue] = useState();
  const [openSave, setOpenSave] = useState(false);
  // const [scheduleData, setScheduleData] = useState({});
  const [detailBodyData, setDetailBodyData] = useState();
  const [detailData, setDetailData] = useState(undefined);
  const [topologyData, setTopologyData] = useState({});
  const [altText, setAltText] = useState();
  const [avatarType, setAvatarType] = useState();
  const [tagsData, setTagsData] = useState([]);
  const [gradesData, setGradesData] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [accessModesData, setAccessModesData] = useState([]);
  const [category, setCategory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [lifecycle, setLifecycle] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [isTabReset, setIsTabReset] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [openDeleteAbort, setOpenDeleteAbort] = useState(false);
  const [openReferencedWarning, setOpenReferencedWarning] = useState(false);
  const client = useApolloClient();
  const { unPublish, setEdited, isUnpublish } = useTreeListContext();
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [isAvatarRemoved, setAvatarRemoved] = useState(false);
  const { nextSelected } = useSelectionContext();
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
  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [openGrades, setOpenGrades] = useState(false);
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
  const [canCopy, setCanCopy] = useState(false);

  const [stationMaterials, setStationMaterials] = useState([]);
  const [parentStation, setParentStation] = useState();

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
  const [copyResourceToMaterial] = useMutation(graphql.mutations.CopyResource);
  const [copySharedLessonToClass] = useMutation(
    graphql.mutations.CopySharedLesson
  );

  const [
    getMaterials,
    { loading: materialLoading, error: materialError, data: materialData }
  ] = useLazyQuery(graphql.queries.MaterialGrouping, {
    fetchPolicy: 'no-cache'
  });

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

  useEffect(() => {
    if (selectedTreeItem?._id) {
      getMaterials({
        variables: {
          schemaType: 'material',
          stationId: selectedTreeItem?.topology?.station
        }
      });
    }
  }, [selectedTreeItem?._id]);

  useEffect(() => {
    if (materialData && !materialLoading && !materialError) {
      const { grouping } = materialData;
      setStationMaterials(grouping);
    }
  }, [materialError, materialLoading, materialData]);

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
      setSchedule({
        ...selectedTreeItem?.schedule,
        startAt: startAtInLacal,
        endAt: endAtInLacal,
        status: selectedTreeItem?.schedule?.status
      });
      setLifecycle(selectedTreeItem?.lifecycle);
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

      setLifecycle({
        ...selectedTreeItem?.lifecycle,
        publishedOn: publishedOn,
        unpublishedOn: unPublishedOn
      });
    } else {
      if (resources?.schedule?.startAt) {
        let startAtInUTC = new Date(resources?.schedule?.startAt);
        startAtInLacal = convertUTCScheduleDateToLocalDate(startAtInUTC);
      }
      if (resources?.schedule?.endAt) {
        let endAtInUTC = new Date(resources?.schedule?.endAt);
        endAtInLacal = convertUTCScheduleDateToLocalDate(endAtInUTC);
      }
      setSchedule({
        ...resources?.schedule,
        startAt: startAtInLacal,
        endAt: endAtInLacal,
        status: resources?.schedule?.status
      });
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

      setLifecycle({
        ...resources?.lifecycle,
        publishedOn: publishedOn,
        unpublishedOn: unPublishedOn
      });
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
      setCanCopy(false);
    } else {
      setCanCopy(true);
    }
    setPublishedDate(resources?.data?.processDate?.publishedDate);
    setCategoryUpdate(false);
    setTagsUpdate(false);
  }, [resources, selectedTreeItem, tabStatus]);

  const handleUnpublish = async () => {
    if (selectedTreeItem?.status !== 'published') return;
    if (
      resources?.schemaType === 'sharedLesson' ||
      resources?.schemaType === 'sharedResource'
    ) {
      await unPublish(selectedTreeItem);
      onChange('unpublish', selectedTreeItem);
    } else {
      await unPublish(resources);
      onChange('unpublish', resources);
    }

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
    if (whenState) {
      setSliderTapValue(value);
      setOpenSave(true);
      return;
    }
    setIsTabReset(false);
    handleTabStatus(value);
  };

  const handleTabStatus = async (value) => {
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

  const handlePickedClasses = (type, value) => {
    if (type === 'grades') {
      let validValues = [];
      value?.forEach((val) => {
        if (val != null) {
          validValues.push(val);
        }
      });
      setSelectedClasses(validValues);
      // setOpenGrades(false);
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
        setAvatarAttached(false);
        setAvatarRemoved(true);
        // setAvatarS3URL('');
        setWhenState(true);
        onForceChange('avatar', '');
      } else {
        setAvatarAttached(false);
        setAvatarRemoved(false);
        setAvatarS3URL(value);
        setWhenState(true);
        onForceChange('avatar', value);
      }
    }
    if (type === 'textEditor') {
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
      onForceChange('tagList', value);
      setTagsUpdate(true);
    }

    if (type === 'grades') {
      setGradesData(value);
      onForceChange('grades', value);
    }

    if (type === 'accessModes') {
      setAccessModesData(value);
      onForceChange('accessModes', value);
      setCategoryUpdate(true);
    }

    if (type === 'category') {
      setCategory(value);
      // onForceChange('category', value);
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
        onChange('update', false);
      }

      if (type === 'cancel') {
        setSelectedTreeItem();
        setShowEdit(false);
      }

      if (type === 'search') {
        onChange('moveResource', resources?.topology?.class);
      }

      if (type === 'delete') setOpenDelete(true);
      if (type === 'save' || type === 'saveForPublish') {
        if (!whenState && !forceSave) {
          return;
        }

        if (
          (resources.schemaType === 'sharedLesson' ||
            resources.schemaType === 'sharedResource') &&
          !openReferencedWarning &&
          newDoc?._id !== selectedTreeItem?._id
        ) {
          let scheduleVal = {
            startAt: null,
            endAt: null
          };
          if (schedule.startAt && schedule.startAt !== '') {
            let startAtOnInUTC = new Date(schedule.startAt).toISOString();
            scheduleVal.startAt = startAtOnInUTC;
          }
          if (schedule.endAt && schedule.endAt !== '') {
            let endAtOnInUTC = new Date(schedule.endAt).toISOString();
            scheduleVal.endAt = endAtOnInUTC;
          }
          if (
            scheduleVal.startAt === selectedTreeItem?.schedule?.startAt &&
            scheduleVal.endAt === selectedTreeItem?.schedule?.endAt
          ) {
            setOpenReferencedWarning(true);
            return;
          }
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

          if (resources.schemaType === 'material') {
            if (isAvatarRemoved) {
              if (altText?.length > 0) {
                variableData = {
                  ...variableData,
                  avatar: {
                    altText: altText
                  }
                };
              } else {
                variableData = {
                  ...variableData,
                  avatar: null
                };
              }
            } else if (!isAvatarAttached) {
              let avatar =
                avatarS3URL && !isAvatarRemoved
                  ? {
                      uId: resources.avatar?.uId
                        ? resources.avatar?.uId
                        : getUUID(),
                      type: avatarType || 'avatar',
                      baseUrl: resources.avatar?.baseUrl,
                      fileDir: resources.avatar?.fileDir,
                      status: 'ready',
                      altText: altText,
                      mimeType: resources.avatar?.mimeType,
                      fileName: resources.avatar?.fileName,
                      data: resources.avatar?.data
                    }
                  : altText
                  ? {
                      altText: altText
                    }
                  : null;

              if (
                avatarS3URL &&
                avatarS3URL !==
                  avatar.baseUrl + avatar.fileDir + avatar.fileName
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
                  : 'image/jpeg';
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
              } else if (altText?.length) {
                let avatarData = resources.avatar;
                if (avatarData) {
                  const copyStr = JSON.stringify(avatarData);
                  let copyObj = JSON.parse(copyStr);
                  delete copyObj['__typename'];
                  avatarData = copyObj;
                  variableData = {
                    ...variableData,
                    avatar: {
                      ...avatarData,
                      altText: altText
                    }
                  };
                } else {
                  variableData = {
                    ...variableData,
                    avatar: {
                      altText: altText
                    }
                  };
                }
              }
            }
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

          if (schedule && resources.schemaType === 'material') {
            let scheduleVal = {
              startAt: null,
              endAt: null
            };
            let startDate = moment(schedule?.startAt, 'YYYY-MM-DDTHH:mm');
            let endDate = moment(schedule?.endAt, 'YYYY-MM-DDTHH:mm');
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
              let startAtOnInUTC = new Date(schedule.startAt).toISOString();
              scheduleVal.startAt = startAtOnInUTC;
            }
            if (schedule.endAt && schedule.endAt !== '') {
              let endAtOnInUTC = new Date(schedule.endAt).toISOString();
              scheduleVal.endAt = endAtOnInUTC;
            }

            variableData = {
              ...variableData,
              schedule: scheduleVal
            };
          }

          if (lifecycle && resources.schemaType === 'material') {
            let lifecycleData = {
              archiveOn: resources.lifecycle?.archiveOn,
              deleteOn: resources.lifecycle?.deleteOn,
              publishedOn: resources.lifecycle?.publishedOn,
              unpublishedOn: resources.lifecycle?.unpublishedOn
            };
            let startDate = moment(lifecycle?.publishedOn, 'YYYY-MM-DDTHH:mm');
            let endDate = moment(lifecycle?.unpublishedOn, 'YYYY-MM-DDTHH:mm');
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
            if (lifecycle.unpublishedOn && lifecycle.unpublishedOn !== '') {
              let endAtOnInUTC = new Date(
                lifecycle.unpublishedOn
              ).toISOString();
              lifecycleData.unpublishedOn = endAtOnInUTC;
            }

            variableData = {
              ...variableData,
              lifecycle: lifecycleData
            };
          }

          updateGrouping({
            variables: variableData
          }).then((mainUpdatedRes) => {
            console.log('updateGrouping');
            if (resources._id === mainUpdatedRes?.data?.updateGrouping?._id) {
              if (schedule && resources.schemaType === 'material') {
                setSelectedTreeItem(mainUpdatedRes?.data?.updateGrouping);
                setAvatarRemoved(false);
              }

              if (schedule && resources.schemaType !== 'material') {
                setUpdatedRes(mainUpdatedRes?.data?.updateGrouping);
              }
            }
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
            setSelectedTreeItem(nextSelected);
          }
          setWhenState(false);
        }

        setOpenReferencedWarning(false);
        if (type !== 'saveForPublish' && !isAvatarAttached) {
          const notiOps = getNotificationOpt('material', 'success', 'update');
          notify(notiOps.message, notiOps.options);
        } else {
          if (isAvatarAttached) {
            setAvatarUpload(true);
            setAvatarAttached(false);
          }
        }
        if (openSave) {
          setOpenSave(false);
          setIsTabReset(false);
          handleTabStatus(sliderTapValue);
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

        if (selectedTreeItem.status === 'published') return;

        if (
          (unReadyAssets && unReadyAssets?.length > 0) ||
          uploadingFilesParentId === selectedTreeItem?._id ||
          (uploadingFilesParentId &&
            uploadingFilesParentId === selectedTreeItem?.intRef?._id)
        ) {
          // const notiOps = getNotificationOpt('material', 'warning', 'publish');
          // notify(notiOps.message, notiOps.options);
          setOpenConfirmPublish(true);
          return;
        }

        if (whenState) {
          await handleEditPanelChange('saveForPublish');
        }
        if (selectedTreeItem.status === 'published') {
          const notiOps = getNotificationOpt(
            'material',
            'warning',
            'published'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        // await publish(uploadingFilesParentId);
        let parentDocs = [];
        let parentDoc = selectedTreeItem;
        do {
          parentDoc = loadedData?.find(
            (parent) => parentDoc?.parentId === parent?._id
          );
          if (parentDoc) {
            parentDocs.push(parentDoc);
          }
        } while (
          parentDoc?.parentId !== parentDoc?.topology?.class &&
          parentDoc != null
        );

        // const parentDocs = loadedData.filter((parent) =>
        //   selectedTreeItem.parentIdList?.includes(parent._id)
        // );
        if (parentDocs == null) {
          parentDocs = [selectedTreeItem];
        } else {
          parentDocs.push(selectedTreeItem);
        }

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

        await updateClassStatus(selectedTreeItem);

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

      if (type === 'copy') {
        setOpenCopyModal(true);
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

  useEffect(() => {
    async function fetchData() {
      let scheduleVal = {
        startAt: null,
        endAt: null
      };
      let startDate = moment(schedule?.startAt, 'YYYY-MM-DDTHH:mm');
      let endDate = moment(schedule?.endAt, 'YYYY-MM-DDTHH:mm');
      if (startDate && endDate) {
        if (startDate > endDate) {
          const notiOps = getNotificationOpt('material', 'warning', 'schedule');
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
      if (schedule.startAt && schedule.startAt !== '') {
        let startAtOnInUTC = new Date(schedule.startAt).toISOString();
        scheduleVal.startAt = startAtOnInUTC;
      }
      if (schedule.endAt && schedule.endAt !== '') {
        let endAtOnInUTC = new Date(schedule.endAt).toISOString();
        scheduleVal.endAt = endAtOnInUTC;
      }
      let variableData = {
        id: selectedTreeItem?._id,
        schemaType: selectedTreeItem?.schemaType,
        version: selectedTreeItem.version,
        schedule: scheduleVal,
        trackingAuthorName: currentUser?.name
      };

      if (isAvatarRemoved) {
        if (altText?.length) {
          variableData = {
            ...variableData,
            avatar: {
              altText: altText
            }
          };
        } else {
          variableData = {
            ...variableData,
            avatar: null
          };
        }
      } else if (!isAvatarAttached) {
        let avatar = avatarS3URL
          ? {
              uId: selectedTreeItem?.avatar?.uId
                ? selectedTreeItem.avatar?.uId
                : getUUID(),
              type: avatarType || 'avatar',
              baseUrl: selectedTreeItem.avatar?.baseUrl,
              fileDir: selectedTreeItem.avatar?.fileDir,
              status: 'ready',
              altText: altText,
              mimeType: selectedTreeItem.avatar?.mimeType,
              fileName: selectedTreeItem.avatar?.fileName,
              data: selectedTreeItem.avatar?.data
            }
          : altText
          ? {
              altText: altText
            }
          : null;

        if (
          avatarS3URL &&
          avatarS3URL !== avatar.baseUrl + avatar.fileDir + avatar.fileName
        ) {
          avatar.baseUrl =
            avatarS3URL.split(selectedTreeItem.topology?.station)[0] +
            selectedTreeItem.topology?.station +
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

        if (avatar?.fileName !== selectedTreeItem?.avatar?.fileName) {
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
      }

      let res = await updateGrouping({
        variables: variableData
      });
      setSelectedTreeItem(res?.data?.updateGrouping);
      setUpdatedRes(null);
      setAvatarRemoved(false);
    }
    if (updatedRes) {
      fetchData();
    }
  }, [updatedRes]);

  const changeChildPublishStatus = async (doc) => {
    let unReadyMMAFiles = doc.multimediaAssets?.filter(
      (file) => file.status === 'converting'
    );
    if (
      doc?._id !== uploadingFilesParentId &&
      (unReadyMMAFiles == null || unReadyMMAFiles?.length === 0)
    ) {
      if (doc?.lifecycle?.unpublishedOn?.length) {
        const notiOps1 = getNotificationOpt('material', 'warning', 'lifeCycle');
        notify(notiOps1.message, notiOps1.options);
      }
      var unpublishDate = new Date();
      unpublishDate.setMonth(unpublishDate.getMonth() + 6);

      const copyStr = JSON.stringify(doc?.lifecycle);
      let newLifeCycle = JSON.parse(copyStr);
      if (newLifeCycle) {
        delete newLifeCycle['__typename'];
      }
      const { data } = await updateGrouping({
        variables: {
          id: doc?._id,
          schemaType: doc?.schemaType,
          version: doc?.version,
          trackingAuthorName: currentUser?.name,
          status: 'published',
          lifecycle: {
            ...newLifeCycle,
            publishedOn: new Date().toISOString(),
            unpublishedOn: unpublishDate.toISOString()
          },
          data: {
            ...doc?.data,
            processDate: {
              ...doc?.data?.processDate,
              publishedDate: new Date()
            }
          }
        }
      });
      if (doc?._id === selectedTreeItem?._id) {
        setSelectedTreeItem(data.updateGrouping);
      }
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

  const filterClasses = (grouping) => {
    let sortedData;
    if (currentUser?.schemaType === 'districtAdmin') {
      const tmp = grouping?.filter(
        (el) => el.topology.district === currentUser?.parentId
      );
      sortedData = [...tmp];
    } else if (currentUser?.schemaType === 'stationAdmin') {
      const tmp = grouping?.filter(
        (el) => el.topology.station === currentUser?.parentId
      );
      sortedData = [...tmp];
    } else if (currentUser?.schemaType === 'schoolAdmin') {
      const tmp = grouping?.filter(
        (el) => el.parentId === currentUser?.parentId
      );
      sortedData = [...tmp];
    } else if (currentUser?.schemaType === 'educator') {
      const tmp = grouping?.filter((el) =>
        el.authorIdList?.includes(currentUser._id)
      );
      sortedData = [...tmp];
    } else {
      sortedData = [...grouping];
    }
    return sortedData;
  };

  const getCopiableClasses = () => {
    let showClasses = filterClasses(allClasses)?.filter(
      (item) =>
        item._id !== selectedTreeItem?.topology?.class &&
        item.topology?.station === selectedTreeItem?.topology?.station
    );
    return showClasses;
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
              schemaType: selectedTreeItem.schemaType
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
    setOpenConfirmPublish(false);
  };

  const handleCopyDialog = (type, value) => {
    if (type === 'btnClick') {
      if (value) {
        let pickedClasses = allClasses?.filter((item) =>
          selectedClasses?.includes(item.name)
        );
        let isExist = false;
        pickedClasses?.forEach((pClass) => {
          let allMaterials = stationMaterials?.length
            ? stationMaterials
            : loadedData;
          let copiedOne = allMaterials?.find(
            (lData) =>
              lData?.intRef?._id === resources?._id &&
              lData?.topology?.class === pClass?._id
          );
          if (copiedOne) {
            isExist = true;
          } else {
            isExist = false;
          }
        });

        if (isExist) {
          const options = {
            autoHideDuration: 10000,
            variant: 'error'
          };
          notify(
            ' This ' + resources?.schemaType + ' had been copied already. ',
            options
          );
          return;
        } else {
          let result = '';

          if (pickedClasses?.length) {
            pickedClasses?.forEach(async (item) => {
              const variables = {
                classId: item._id,
                resourceId: resources._id
              };
              if (item.schemaType === 'resource') {
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
            });
          }

          const options = {
            autoHideDuration: 10000,
            variant: 'success'
          };
          notify(
            result + ' Please refresh the lessons a few mins later.',
            options
          );
        }
      }
    }
    setOpenCopyModal(false);
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
      setAvatarRemoved(false);
      setWhenState(true);
    } else if (value === 'fileRemoved') {
      setAvatarRemoved(true);
      setAvatarAttached(false);
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

  const handleReferencedWarning = (type, value) => {
    if (value) {
      handleEditPanelChange('save');
    } else {
      setOpenReferencedWarning(false);
    }
  };

  const displayGrades = (gradeList) => {
    const names = [];
    gradeList.forEach((item) => {
      if (item !== en['Select Classes'] + '...') {
        names.push(item);
      }
    });
    if (names.length === 0) {
      return [en['Select Classes'] + '...'];
    } else {
      return names.join(', ');
    }
  };

  const handleSaveChange = async (value, type) => {
    if (type) {
      await handleEditPanelChange('save');
      // if (!isAvatarAttached) {
      // setOpenSave(false);
      // setIsTabReset(false);
      // handleTabStatus(sliderTapValue);
      // }
      // setAvatarRemoved(false);
      // setWhenState(false);
    } else {
      setOpenSave(false);
      const schemaType = resources?.schemaType;
      setIsTabReset(false);
      handleTabStatus(sliderTapValue);
      setAvatarAttached(false);
      setAvatarRemoved(false);
      // setAvatarS3URL(null);
      setWhenState(false);
    }
  };

  return (
    <EditPanel
      title={title}
      page={'Lessons'}
      canPublish={tabStatus?.desc}
      pageDisable={resources == null}
      canDelete
      canEdit={true}
      canUpdate={true}
      canSave={true}
      canGallery={tabStatus?.desc}
      canSearch={tabStatus?.desc}
      canShowInfo={true}
      canCancel={
        viewMethod === 'Card View' && resources?.schemaType === 'class'
          ? true
          : false
      }
      canCopy={canCopy}
      isTabReset={isTabReset}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      selectedTreeItem={selectedTreeItem}
      schemaType={selectedTreeItem?.schemaType}
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
      activePreview={resources?.schemaType === 'class' ? false : true}
      showPreview={resources?.schemaType === 'class' ? false : true}
      topBarMinWidth={980}
      hideTitleOnMobile={true}
      canCreate={!cardViewList || viewMethod === 'List View'}
      totalDisable={
        selectedTreeItem
          ? selectedTreeItem.schemaType === 'material' &&
            (selectedTreeItem?.childrenIdList === null ||
              selectedTreeItem?.parentIdList?.length > 2)
            ? true
            : false
          : true
      }
      canIngest={currentUser.schemaType === 'schoolAdmin' && isMediumScreen}
    >
      {tabStatus?.desc && resources?.data?.processDate?.publishedDate && (
        <Typography
          variant="subtitle1"
          style={{
            marginTop: 8,
            marginRight: 24,
            marginBottom: '-10px',
            float: 'right',
            fontSize: '14px'
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
                  style={
                    isMediumScreen
                      ? { paddingTop: 0, paddingRight: 12 }
                      : {
                          paddingTop: 0,
                          paddingRight: 6,
                          display: 'flex',
                          flexDirection: 'column'
                        }
                  }
                >
                  <Grid item>
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
                    style={
                      isMediumScreen
                        ? { paddingTop: 12 }
                        : { paddingTop: 8, height: '-webkit-fill-available' }
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
                    published={selectedTreeItem?.status === 'published'}
                    stationTransmission={parentStation?.transmission}
                  />
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
                        maxWidth="inherit"
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
              <div style={{ marginTop: 0, width: 320 }}>
                <ConfigForm
                  type={resources?.schemaType}
                  scheduleData={schedule}
                  lifecycleData={lifecycle}
                  onChange={(type, value) => handleFormChange(type, value)}
                />
              </div>
            )}
            {tabStatus.schedule && selectedTreeItem?.schemaType === 'material' && (
              <Grid item xs={12} style={{ paddingTop: 0 }}>
                <DefaultCard>
                  <ScheduleForm
                    resources={schedule}
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
                        disable={false}
                        resources={resources}
                        setStartMMAUploading={setStartMMAUploading}
                        setUploadingFilesParentId={setUploadingFilesParentId}
                        setUploadFileType={setUploadFileType}
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
                    height: '100%'
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
                      maxWidth="inherit"
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
                <div style={{ width: 600 }}>
                  <Grid container direction="column" spacing={4}>
                    <Grid item xs={12} style={{ paddingTop: 0 }}>
                      <DefaultCard>
                        <ScheduleForm
                          resources={schedule}
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
                    scheduleData={schedule}
                    lifecycleData={lifecycle}
                    onChange={(type, value) => handleFormChange(type, value)}
                  />
                </div>
              </>
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
          <JSONEditor
            disable={false}
            resources={resources}
            secondObj={
              resources?.schemaType !== 'material' ? selectedTreeItem : null
            }
          />
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
        open={openReferencedWarning}
        title={'Warning!'}
        mainBtnName={'Ok'}
        // secondaryBtnName={en['Cancel']}
        onChange={handleReferencedWarning}
        isCreateFocus
      >
        <Typography variant="h6">
          {
            'Any changes made to this lesson will affect all other shared lessons with the same reference.'
          }
        </Typography>
      </CustomDialog>
      <CustomDialog
        open={openConfirmPublish}
        title={en['The file is being processed and not ready for publishing.']}
        secondaryBtnName={en['OK']}
        onChange={handlePublishConfirmDialog}
      >
        <Typography variant="h6">{en['Please try again later!']}</Typography>
      </CustomDialog>
      <CustomDialog
        open={openCopyModal}
        title={'Select classes'}
        mainBtnName={en['Submit']}
        onChange={handleCopyDialog}
      >
        <Select
          open={openGrades}
          // labelId={'demo-mutiple-chip-label-'}
          // id={'demo-mutiple-chip-'}
          multiple={true}
          placeholder={'Classes...'}
          onOpen={() => setOpenGrades(true)}
          onClose={() => {
            setOpenGrades(false);
          }}
          disabled={getCopiableClasses()?.length ? false : true}
          value={
            selectedClasses.length > 0 ? selectedClasses : ['Select Classes...']
          }
          onChange={(e) =>
            handlePickedClasses(
              'grades',
              e.target.value.filter((item) => item !== 'Select Classes...')
            )
          }
          disableUnderline
          input={<Input id={'demo-mutiple-chip-'} />}
          renderValue={(selected) => displayGrades(selected)}
          MenuProps={MenuProps}
          className={classes1.gradesSelect}
          style={{
            color: selectedClasses.length > 0 ? 'black' : 'lightGray',
            marginTop: 0
          }}
          classes={{ root: classes1.gradesSelectInputRoot }}
        >
          {getCopiableClasses()?.map((item, index) => (
            <MenuItem key={item?._id} value={item.name}>
              <ListItemText
                primary={item.name}
                style={{
                  borderColor: '#c1bdbd'
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </CustomDialog>
      <CustomDialog
        // mainBtnName={en['SAVE']}
        // dismissBtnName="Dismiss"
        mainBtnName="Save"
        secondaryBtnName="Discard"
        open={openSave}
        onChange={handleSaveChange}
      >
        <main>
          <Typography variant="subtitle1" className={classes.warning}>
            {en['There are unsaved changes on the panel.']}
            <br />
            {en['Will you discard your current changes?']}
          </Typography>
        </main>
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

export default MaterialEdit;
