/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useLazyQuery, useMutation } from '@apollo/client';
import clsx from 'clsx';
import graphql from '@app/graphql';
import { EditPanel } from '@app/components/Panels';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import TextEditor from '@app/components/TextEditor';
import { getNotificationOpt } from '@app/constants/Notifications';
import {
  DescriptionForm,
  MultimediaAttachmentForm,
  AvatarUploadForm,
  AltText
} from '@app/components/Forms';
import { DefaultCard } from '@app/components/Cards';
import * as globalStyles from '@app/constants/globalStyles';
import JSONEditor from '@app/components/JSONEditor';
import { getBucketKey } from '@app/utils/aws_s3_bucket';
import { useSelectionContext } from '@app/providers/SelectionContext';
import {
  getDisplayName,
  getFileNameFromURL,
  getUUID,
  getAssetUrl
} from '@app/utils/functions';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { en } from '@app/language';
import { useUserContext } from '@app/providers/UserContext';
import { groupingList } from '@app/utils/ApolloCacheManager';
import { useMediumScreen } from '@app/utils/hooks';

let publishTmpData = [];

let checker = (arr, target) => target.every((v) => arr.includes(v));

const GoogleClassEdit = ({
  forceSaveDocId,
  forceSaveDoc,
  forceSave,
  resources,
  loadedData,
  setLoadedData,
  selectedTreeItem,
  setSelectedTreeItem,
  setWhenState,
  classResources,
  onChange,
  updateGrouping,
  deleteDocument,
  parentTreeItem,
  handleMainChange,
  onForceChange,
  forceChangeItem,
  districtLoadedData,
  schoolLoadedData,
  setRefresh
}) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [avatarS3URL, setAvatarS3URL] = useState();
  const [descData, setDescData] = useState({});
  const [detailData, setDetailData] = useState({});
  const [topologyData, setTopologyData] = useState({});
  const [altText, setAltText] = useState();
  const [avatarType, setAvatarType] = useState();
  const [tagsData, setTagsData] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [isTabReset, setIsTabReset] = useState(false);
  const [attachmentStatus, setAttachmentStatus] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [textEditor, setTextEditor] = useState(true);
  const [studentResources, setStudentResources] = useState([]);
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const isMediumScreen = useMediumScreen();
  const { nextSelected } = useSelectionContext();
  const [avatarSize, setAvatarSize] = useState();
  const [currentUser] = useUserContext();
  const [startMMAUploading, setStartMMAUploading] = useState(false);

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );
  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );
  const [
    getDistrict,
    { loading: districtLoading, data: districtData, error: districtError }
  ] = useLazyQuery(graphql.queries.DistrictGrouping);

  const [
    getStation,
    { loading: stationLoading, data: stationData, error: stationError }
  ] = useLazyQuery(graphql.queries.StationGrouping);

  const [
    getSchool,
    { loading: schoolLoading, data: schoolData, error: schoolError }
  ] = useLazyQuery(graphql.queries.SchoolGrouping);

  const studentVariables = {
    id: null,
    schemaType: 'student',
    offset: null,
    name: null
  };
  const [
    getStudentItems,
    { loading: studentLoading, error: studentError, data: studentData }
  ] = useLazyQuery(graphql.queries.userGrouping);

  useEffect(() => {
    if (!studentLoading && !studentError && studentData) {
      setStudentResources(studentData.grouping);
    }
  }, [studentLoading, studentError, studentData]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      publishTopologyItems(districtData['grouping'][0]);
    }
  }, [districtData, districtError, districtLoading]);

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      publishTopologyItems(schoolData['grouping'][0]);
    }
  }, [schoolData, schoolError, schoolLoading]);

  useEffect(() => {
    if (!stationLoading && !stationError && stationData) {
      publishTopologyItems(stationData['grouping'][0]);
    }
  }, [stationData, stationError, stationLoading]);

  const getTitle = (item) => {
    let itemName = '';
    item.parentIdList?.map((el) => {
      if (itemName) {
        itemName = `${getDisplayName(itemName)} > ${getDisplayName(
          loadedData?.find((ele) => ele._id === el)?.name
        )}`;
      } else {
        itemName = getDisplayName(
          classResources?.find((ele) => ele._id === el)?.name
        );
      }
      return el;
    });
    itemName = `${itemName} > ${getDisplayName(item.name)}`;
    if (item.topology?.district) {
      const distName = getDisplayName(
        districtLoadedData.find((el) => el._id === item.topology?.district)
          ?.name
      );
      itemName = `${distName} > ${itemName}`;
    }
    if (item.topology?.school) {
      const schoolName = getDisplayName(
        schoolLoadedData.find((el) => el._id === item.topology?.school)?.name
      );
      itemName = `${schoolName} > ${itemName}`;
    }
    return itemName;
  };

  useEffect(() => {
    if (resources) {
      if (!attachmentStatus) {
        setTextEditor(!textEditor);
        setCheckbox(false);
        setTitle(getTitle(resources));
        const url =
          resources.avatar?.baseUrl +
          resources.avatar?.fileDir +
          resources.avatar?.fileName;
        setAvatarS3URL(url || '');

        setDescData({
          title: resources?.desc?.title || '',
          short: resources?.desc?.short || '',
          long: resources?.desc?.long || ''
        });

        if (resources.avatar) {
          const url =
            resources.avatar?.baseUrl +
            resources.avatar?.fileDir +
            resources.avatar?.fileName;
          setAvatarS3URL(url || '');
          setAltText(resources.avatar?.altText || '');
          setAvatarType(resources?.avatar?.type || '');
        } else {
          setAvatarS3URL('');
          setAltText('');
          setAvatarType('');
        }

        setTopologyData({
          ...topologyData,
          station: resources.topology?.station || '',
          school: resources.topology?.school || '',
          district: resources.topology?.district || '',
          class: resources.topology?.class || ''
        });

        setDetailData({
          id: resources?._id,
          body: resources?.body
        });
        setTagsData(resources.tagList || []);
      }
    }
  }, [resources]);

  useEffect(() => {
    if (forceSave) {
      handleEditPanelChange('save');
      onChange('forceSave', false);
    }
  }, [forceSave]);

  const handleShowPanel = async (value) => {
    setIsTabReset(false);
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
    if (type === 'avatarUpload') {
      if (value === 'remove') {
        setAvatarS3URL();
        onForceChange('avatar', '');
      } else {
        setAvatarS3URL(value);
        onForceChange('avatar', value);
      }
      return;
    }
    if (type === 'textEditor') {
      setDetailData({
        id: detailData?._id,
        body: value
      });
      onForceChange('body', value);
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
    onChange('update', true);
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
      if (type === 'delete') setOpenDelete(true);
      if (type === 'save') {
        if (resources) {
          onChange('update', false);

          let avatar = avatarS3URL
            ? {
                uId: resources.avatar?.uId ? resources.avatar?.uId : getUUID(),
                type: avatarType || 'avatar',
                baseUrl: resources.avatar?.baseUrl,
                fileDir: resources.avatar?.fileDir,
                status: 'ready',
                altText: altText,
                mimeType: resources.avatar?.mimeType,
                fileName: resources.avatar?.fileName,
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

          let varaibleData = {
            id: resources['_id'],
            schemaType: resources.schemaType,
            version: resources.version,
            trackingAuthorName: currentUser?.name,
            desc: {
              title: descData.title,
              short: descData.short,
              long: descData.long
            },
            avatar,
            topology: topologyData,
            data: {
              ...resources?.data
            },
            body: detailData,
            tagList: tagsData
          };

          setAttachmentStatus(false);
          await updateGrouping({
            variables: varaibleData
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
            handleMainChange('elSingleClick', nextSelected);
          }
        }

        if (resources.avatar?.fileName) {
          const avatarURL = `${resources.avatar?.baseUrl}${resources.avatar?.fileDir}${resources.avatar?.fileName}`;
          if (
            (!avatarS3URL && resources.avatar?.fileName) ||
            avatarS3URL !== avatarURL
          ) {
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

        if (isAvatarAttached) {
          setAvatarUpload(true);
          setAvatarAttached(false);
        } else {
          const notiOps = getNotificationOpt('material', 'success', 'update');
          notify(notiOps.message, notiOps.options);
        }
      }

      if (type === 'publish') {
        publishTmpData = loadedData;
        const updateResource = await updateGrouping({
          variables: {
            id: resources['_id'],
            schemaType: resources.schemaType,
            version: resources.version,
            trackingAuthorName: currentUser?.name,
            status: 'published'
          }
        });

        const { data } = updateResource;

        const oldData = publishTmpData.filter(
          (item) => item?._id !== resources?._id
        );

        publishTmpData = [...oldData, data?.updateGrouping];
        resources?.parentIdList.map(async (el) => {
          let parentDoc = loadedData.find((item) => item?._id === el);
          // if the document is not published
          if (parentDoc) {
            if (parentDoc?.status !== 'published') {
              let updatedResult = await updateGrouping({
                variables: {
                  id: parentDoc?._id,
                  schemaType: resources.schemaType,
                  version: parentDoc?.version,
                  trackingAuthorName: currentUser?.name,
                  status: 'published'
                }
              });

              let { data } = updatedResult;

              let newData = publishTmpData?.filter(
                (item) => item?._id !== parentDoc?._id
              );
              publishTmpData = [data?.updateGrouping, ...newData];
            }
          }
        });
        if (resources?.topology?.station) {
          await getStation({
            variables: {
              id: resources?.topology?.station,
              schemaType: 'station'
            }
          });
        }

        if (resources?.topology?.district) {
          await getDistrict({
            variables: {
              id: resources?.topology?.district,
              schemaType: 'district'
            }
          });
        }

        if (resources?.topology?.school) {
          await getSchool({
            variables: {
              id: resources?.topology?.school,
              schemaType: 'school'
            }
          });
        }

        // class
        let classItem = classResources?.find(
          (el) => el._id === resources.topology.class
        );

        getStudentItems({ variables: studentVariables });

        publishTopologyItems(classItem);

        // publishing the students
        if (classItem?.assigneeIdList?.length > 0) {
          for (let i = 0; i < classItem?.assigneeIdList?.length; i++) {
            let childItem = studentResources?.find(
              (el) => el._id === classItem.assigneeIdList[i]
            );
            if (childItem) {
              publishTopologyItems(childItem);
            }
          }
        }

        // if the selected item is not
        //present in the childrenIDList of class by any mistake
        if (
          classItem &&
          !classItem?.childrenIdList.includes(selectedTreeItem?._id) &&
          selectedTreeItem?.parentId === classItem?._id
        ) {
          await updateGroupingList({
            variables: {
              id: classItem?._id,
              schemaType: classItem?.schemaType,
              item: selectedTreeItem?._id,
              fieldName: 'childrenIdList',
              type: 'add',
              trackingAuthorName: currentUser?.name
            }
          });
        }

        // if the selected item is not present
        // in the childrenIDList of document by any mistake
        let newChildrenIdList = [];
        publishTmpData
          ?.filter((item) => item?.parentId === resources?._id)
          .map((item) => {
            newChildrenIdList = [...newChildrenIdList, item?._id];
            return item;
          });

        if (
          !checker(resources?.childrenIdList, newChildrenIdList) &&
          newChildrenIdList?.length
        ) {
          const nonAddedList = newChildrenIdList.filter(
            (item) => !resources.childrenIdList.includes(item)
          );
          nonAddedList?.map((childId) => {
            updateGroupingList({
              variables: {
                id: resources?._id,
                schemaType: resources?.schemaType,
                item: childId,
                fieldName: 'childrenIdList',
                type: 'add',
                trackingAuthorName: currentUser?.name
              }
            });
            return childId;
          });
        } else {
          // checking and fixing if the childrenIdList
          //of parent of selectedItem is not correct.
          let parentItem = publishTmpData?.filter(
            (item) => item?._id === resources?.parentId
          );
          if (parentItem?.length) {
            parentItem = parentItem[0];
            let childrenList = [];

            publishTmpData
              ?.filter((item) => item?.parentId === parentItem._id)
              .map((item) => {
                childrenList = [...childrenList, item?._id];
                return item;
              });

            if (
              !checker(parentItem?.childrenIdList, childrenList) &&
              childrenList?.length
            ) {
              const nonAddedList = childrenList.filter(
                (item) => !parentItem?.childrenIdList.includes(item)
              );
              nonAddedList?.map((childId) => {
                updateGroupingList({
                  variables: {
                    id: parentItem?._id,
                    schemaType: parentItem?.schemaType,
                    item: childId,
                    fieldName: 'childrenIdList',
                    type: 'add',
                    trackingAuthorName: currentUser?.name
                  }
                });
                return childId;
              });
            }
          }
          // checking end
        }

        if (newChildrenIdList?.length > 0) {
          for (const newChilrenId of newChildrenIdList) {
            let childItem = publishTmpData?.filter(
              (el) => el._id === newChilrenId
            );
            if (childItem) {
              let updateData = await updateGrouping({
                variables: {
                  id: childItem[0]._id,
                  schemaType: childItem[0]?.schemaType,
                  version: childItem[0].version,
                  trackingAuthorName: currentUser?.name,
                  status: 'published'
                }
              });
              let oldChildrenData = publishTmpData.filter(
                (item) => item?._id !== newChilrenId
              );
              publishTmpData = [
                ...oldChildrenData,
                updateData?.data?.updateGrouping
              ];
              publishChilrenItems(childItem[0]);
            }
          }
        }

        setLoadedData(publishTmpData);
        setWhenState(false);
        onChange('update', false);
        setAttachmentStatus(false);
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

  const childrensBannerChange = async (item, avatarURL) => {
    if (item?.childrenIdList?.length > 0) {
      for (let i = 0; i < item?.childrenIdList?.length; i++) {
        let childItem = loadedData?.find(
          (el) => el._id === item.childrenIdList[i]
        );
        if (childItem) {
          let mimeType = 'image/png';
          if (avatarURL && avatarURL.toLowerCase().endsWith('png')) {
            mimeType = 'image/png';
          } else {
            mimeType = 'image/jpeg';
          }

          let baseUrl;
          let fileDir;
          if (avatarURL) {
            baseUrl = avatarURL.split(`${resources['_id']}/`)[0];
            fileDir = `${resources['_id']}/`;
          }

          await updateGrouping({
            variables: {
              id: childItem._id,
              schemaType: 'material',
              version: childItem.version,
              trackingAuthorName: currentUser?.name,
              avatar: {
                uId: getUUID(),
                type: 'avatar',
                status: 'ready',
                baseUrl,
                fileDir,
                altText: altText,
                mimeType,
                fileName: getFileNameFromURL(avatarURL)
              }
            }
          });
          publishChilrenItems(childItem);
        }
      }
    }
  };

  const publishTopologyItems = async (item) => {
    console.log(item);
    if (item && item.status !== 'published') {
      await updateGrouping({
        variables: {
          id: item?._id,
          schemaType: item?.schemaType,
          version: item?.version,
          trackingAuthorName: currentUser?.name,
          status: 'published'
        }
      });
    }
  };

  const publishChilrenItems = async (item) => {
    if (item?.childrenIdList?.length > 0) {
      for (let i = 0; i < item?.childrenIdList?.length; i++) {
        let childItem = loadedData?.filter(
          (el) => el._id === item.childrenIdList[i]
        );
        if (childItem) {
          let updateData = await updateGrouping({
            variables: {
              id: childItem[0]._id,
              schemaType: 'material',
              version: childItem[0].version,
              trackingAuthorName: currentUser?.name,
              status: 'published'
            }
          });

          let oldChildrenData = publishTmpData.filter(
            (el) => el._id !== item.childrenIdList[i]
          );
          publishTmpData = [
            ...oldChildrenData,
            updateData?.data?.updateGrouping
          ];
          publishChilrenItems(childItem[0]);
        }
      }
    }
  };

  const handleDeleteDialogChange = async (type, value) => {
    try {
      if (type === 'btnClick') {
        if (!checkbox && value) {
          const notiOps = getNotificationOpt('material', 'warning', 'delete');
          notify(notiOps.message, notiOps.options);
          return;
        }
        let parentId = resources.parentId;
        if (checkbox && value) {
          await deleteDocument({
            variables: {
              id: resources['_id'],
              schemaType: resources.schemaType
            }
          });
          let tmp = loadedData?.filter((el) => el._id === parentId);
          if (tmp.length) {
            await updateGroupingList({
              variables: {
                id: tmp[0]?._id,
                schemaType: tmp[0]?.schemaType,
                item: resources['_id'],
                fieldName: 'childrenIdList',
                type: 'remove',
                trackingAuthorName: currentUser?.name
              }
            });
          }

          const notiOps = getNotificationOpt('material', 'success', 'delete');
          notify(notiOps.message, notiOps.options);
          setWhenState(false);
          // onChange('delete');
          setRefresh(true);
          setSelectedTreeItem(parentTreeItem);
          handleMainChange('elSingleClick', parentTreeItem);
        }

        setCheckbox(false);
        setOpenDelete(false);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('material', 'error', 'delete');
      notify(notiOps.message, notiOps.options);
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
      console.log('avatar attached');
      setWhenState(true);
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarS3URL();
      console.log('avatar dettached');
      setWhenState(true);
    } else {
      handleFormChange('avatarUpload', value);
    }
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
        console.log(value);
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
      setAttachmentStatus(true);
      await updateGrouping({
        variables: {
          ...assetUrlVariables
        }
      });
      setWhenState(false);
      onChange('attachment', false);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <EditPanel
      title={title}
      canDelete
      canEdit={true}
      canUpdate={true}
      canShowInfo
      isTabReset={isTabReset}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      selectedTreeItem={selectedTreeItem}
    >
      <Grid spacing={3} container direction="row" style={{ padding: '16px' }}>
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={12} lg={8} xl={8}>
              <DefaultCard style={classes.grayPanel}>
                <Grid container spacing={4} style={{ padding: '24px' }}>
                  <Grid item xs={12}>
                    <AvatarUploadForm
                      disable={false}
                      resources={avatarS3URL}
                      docId={resources?._id}
                      stationId={resources?.topology?.station}
                      acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
                      title={en['lesson dropzone banner']}
                      onChange={(value) => handleOnAvatarChange(value)}
                      disableGray={true}
                      isUpload={isAvatarUpload}
                      changeAvatarType={(value) =>
                        handleFormChange('avatarType', value)
                      }
                      doc={resources}
                      altText={altText}
                      setUpload={setAvatarUpload}
                      setAvatarSize={setAvatarSize}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {avatarS3URL ? (
                      <AltText
                        disable={false}
                        resources={altText}
                        onChange={(value) => handleFormChange('altText', value)}
                      />
                    ) : (
                      []
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <DescriptionForm
                      disable={false}
                      resources={descData}
                      onChange={(value) =>
                        handleFormChange('description', value)
                      }
                      helperText={false}
                      disableGray={true}
                    />
                  </Grid>
                </Grid>
              </DefaultCard>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={4} xl={4}>
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
                  onChange={handleMultiAttFormChange}
                  setStartMMAUploading={setStartMMAUploading}
                  avatarS3URL={avatarS3URL}
                />
              </DefaultCard>
            </Grid>
            <Grid item xs={12}>
              <DefaultCard className={classes.editPanelHtmlCard1}>
                <TextEditor
                  disable={false}
                  doc={resources}
                  docId={resources?._id}
                  detailData={detailData}
                  textEditor={textEditor}
                  resources={resources}
                  onChange={(value) => handleFormChange('textEditor', value)}
                />
              </DefaultCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <CustomDialog
        open={openDelete}
        title={en['Do you want to delete this lesson?']}
        mainBtnName={en['Remove']}
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">{en['remove lesson alert']}</Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
      <CustomDialog
        open={openInfo}
        title={en['Information']}
        maxWidth="sm"
        fullWidth={true}
        customClass={classes.infoDialogContent}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor disable={false} resources={resources} />
        </Grid>
      </CustomDialog>
    </EditPanel>
  );
};

export default GoogleClassEdit;
