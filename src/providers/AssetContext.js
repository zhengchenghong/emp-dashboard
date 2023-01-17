/* eslint-disable max-len */
import React, { useContext, useState, createContext, useEffect } from 'react';
import AWS from 'aws-sdk';
import { getConfigParams, getUUID } from '@app/utils/functions';
import { getFileExtension } from '@app/utils/file-manager';
import { useApolloClient, useMutation } from '@apollo/client';
import graphql from '@app/graphql';
import {
  accessToAWSwithCoginto,
  getBaseUrlforBackend,
  getBucketName,
  isFileExistS3
} from '@app/utils/aws_s3_bucket';
import { isVideoType } from '@app/utils/validate';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useSnackbar } from 'notistack';
import { update, upsertMMA } from '@app/utils/ApolloCacheManager';
import { useUserContext } from '@app/providers/UserContext';
import transmissions from '@app/constants/transmissions.json';

const AssetContext = createContext();

export function useAssetContext() {
  return useContext(AssetContext);
}

export function AssetProvider({ children }) {
  const [progress, setProgress] = useState({
    progress: 0,
    upload: null
  });
  const [uploading, setUploading] = useState(false);
  const [docId, setDocId] = useState();
  const [stationId, setStationId] = useState();
  const [type, setType] = useState();
  const [filename, setFilename] = useState();

  const [userTableHeader, setUserTableHeader] = useState([]);
  const [userTableLoadData, setUserTableLoadData] = useState([]);

  const [document, setDocument] = useState();
  const [uploadQue, setUploadQue] = useState([]);
  const [attachmentsUploaded, setAttachmentUploaded] = useState();
  const [queProgreses, setQueProgresses] = useState([]);
  const [finishedUpload, setFinishedUpload] = useState();
  const [currentQueProgress, setCurrentQueProgress] = useState();
  const [avatarUploaded, setAvatarUploaded] = useState(false);
  const [currentUser] = useUserContext();

  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [copyAssetS3] = useMutation(graphql.mutations.copyAssetS3);
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });

  const [upsertMMAGrouping] = useMutation(graphql.mutations.upsertMMA, {
    update: upsertMMA
  });

  const [getFolderSize] = useMutation(graphql.mutations.GetFolderSize);

  const upload = (files, stationId, docId, type, imageSize) => {
    setDocId(docId);
    setStationId(stationId);
    setType(type);
    let promise = new Promise(async function (resolve, reject) {
      try {
        setUploading(true);
        const fileExt = getFileExtension(files[0].name);
        const fileName = Math.random().toString(36).substring(3, 8) + 'avatar';
        setFilename(`${fileName}.${fileExt}`);

        let assetUrl = '';
        if (type === 'student') {
          if (!stationId || stationId === '') {
            reject('Please select district first!');
            setUploading(false);
            return;
          }
          const awsDirectory = `${stationId}/${docId}`;
          const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
          assetUrl = await uploadFileToS3(files[0], uploadKey, 0);
        } else if (type === 'user') {
          const awsDirectory = `users/${docId}`;
          const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
          assetUrl = await uploadFileToS3(files[0], uploadKey, 0);
        } else if (type === 'gallery') {
          const awsDirectory = `galleries`;
          const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
          assetUrl = await uploadFileToS3(files[0], uploadKey, 0);
        } else {
          const awsDirectory = `${stationId}/${docId}`;
          const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
          assetUrl = await uploadFileToS3(files[0], uploadKey, 0);
        }
        resolve(assetUrl);
        setUploading(false);
      } catch (error) {
        reject(error);
        setUploading(false);
      }
    });
    return promise;
  };

  const uploadGallery = (
    file,
    schemaType,
    docId,
    doc,
    isIcon,
    type,
    altText,
    imageSize,
    thumbnailFile
  ) => {
    let promise = new Promise(async function (resolve, reject) {
      try {
        setUploading(true);
        const fileExt = getFileExtension(file.name);
        const fileName =
          Math.random().toString(36).substring(3, 8) +
          (isIcon ? 'icon' : 'avatar');
        setFilename(`${fileName}.${fileExt}`);
        const awsDirectory = `galleries/${docId ?? schemaType}`;
        const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
        let assetUrl = await uploadFileToS3(file, uploadKey, 0);
        let thumbnail = null;
        if (thumbnailFile) {
          const ext = getFileExtension(thumbnailFile.name);
          const thumbnailFilename =
            Math.random().toString(36).substring(3, 8) + 'thumbnail';
          const thumbnailUploadKey = `${awsDirectory}/${thumbnailFilename}.${ext}`;
          thumbnail = await uploadFileToS3(
            thumbnailFile,
            thumbnailUploadKey,
            0
          );
        }

        let avatarInfo = {};

        if (isIcon) {
          avatarInfo = {
            uId: doc?.avatar?.uId ?? getUUID(),
            type: type,
            fileName: doc?.avatar?.fileName,
            fileDir: doc?.avatar?.fileDir,
            baseUrl: doc?.avatar?.baseUrl,
            altText: doc?.avatar?.altText,
            thumbnail: assetUrl,
            mimeType: doc?.avatar?.mimeType,
            status: 'ready',
            data: doc?.avatar?.data
          };
        } else {
          let baseUrl = assetUrl.split('galleries')[0];
          let fileDir = `${awsDirectory}/`;
          let mimetype = 'image/png';
          if (assetUrl.toLowerCase().endsWith('png')) {
            mimetype = 'image/png';
          } else {
            mimetype = 'image/jpeg';
          }
          avatarInfo = {
            uId: doc?.avatar?.uId ?? getUUID(),
            type: type,
            fileName: `${fileName}.${fileExt}`,
            fileDir,
            baseUrl,
            altText: altText,
            thumbnail: thumbnail ? thumbnail : doc?.avatar?.thumbnail,
            mimeType: mimetype,
            status: 'ready',
            data: {
              imageSize
            }
          };
        }

        await updateGrouping({
          variables: {
            id: docId,
            schemaType: schemaType,
            version: doc?.version,
            trackingAuthorName: currentUser?.name,
            name: doc?.name,
            avatar: avatarInfo
          }
        });
        resolve(assetUrl);
      } catch (error) {
        reject(error);
        // const notiOps = getNotificationOpt('backend', 'error', 'update');
        // enqueueSnackbar(notiOps.message, notiOps.options);
      }
      setUploading(false);
      setProgress({
        progress: 0,
        upload: null
      });
    });
    return promise;
  };

  const updateGalleryThumbnail = async (file, schemaType, docId, doc) => {
    // let promise = new Promise(async function (resolve, reject) {
    try {
      setUploading(true);
      const fileExt = getFileExtension(file.name);
      const fileName = Math.random().toString(36).substring(3, 8) + 'thumbnail';
      setFilename(`${fileName}.${fileExt}`);
      const awsDirectory = `galleries/${docId ?? schemaType}`;
      const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
      let assetUrl = await uploadFileToS3(file, uploadKey, 0);

      const avatarCopy = JSON.parse(JSON.stringify(doc?.avatar));
      delete avatarCopy.__typename;

      await updateGrouping({
        variables: {
          id: docId,
          schemaType: schemaType,
          version: doc?.version,
          trackingAuthorName: currentUser?.name,
          name: doc?.name,
          avatar: {
            ...avatarCopy,
            thumbnail: assetUrl
          }
        }
      });

      const notiOps = getNotificationOpt('gallery', 'success', 'update');
      enqueueSnackbar(notiOps.message, notiOps.options);
    } catch (error) {
      const notiOps = getNotificationOpt('backend', 'error', 'update');
      enqueueSnackbar(notiOps.message, notiOps.options);
    }
    setUploading(false);
    setProgress({
      progress: 0,
      upload: null
    });
    // });
    // return promise;
  };

  const uploadbulkFile = async (file, docId, doc, type) => {
    let promise = new Promise(async function (resolve, reject) {
      try {
        setUploading(true);
        const fileExt = getFileExtension(file.name);
        // const fileName = getCurrentUTCTime();
        const fileName = Math.random().toString(36).substring(3, 8) + 'library';
        setFilename(`${fileName}.${fileExt}`);
        const awsDirectory =
          type === 'PBS' ? `libraries/PBS/XML` : `libraries/OER/CSV`;
        const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
        const url = await uploadFileToS3(file, uploadKey, 0);
        resolve(url);
        setUploading(false);
      } catch (error) {
        // const notiOps = getNotificationOpt('backend', 'error', 'upload');
        // enqueueSnackbar(`${error}`, notiOps.options);
        reject(error);
        setUploading(false);
      }
    });
    return promise;
  };

  const uploadAvatar = async (
    image,
    stationId,
    docId,
    type,
    doc,
    altText,
    imageSize
  ) => {
    setDocId(docId);
    setStationId(stationId);
    setDocument(doc);
    setType(type);
    try {
      setUploading(true);
      const fileExt = getFileExtension(image.name);
      const fileName = Math.random().toString(36).substring(3, 8) + 'avatar';
      setFilename(`${fileName}.${fileExt}`);
      const awsDirectory = `${stationId}/${docId}`;
      const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
      let assetUrl = await uploadFileToS3(image, uploadKey, 0);
      console.log('avatar: ', assetUrl);
      updateAvatar(assetUrl, docId, doc, altText, imageSize, stationId);
    } catch (error) {
      const notiOps = getNotificationOpt('backend', 'error', 'upload');
      enqueueSnackbar(`${error}`, notiOps.options);
    }
    setUploading(false);
  };

  const updateAvatar = async (
    url,
    docId,
    doc,
    altText,
    imageSize,
    stationId
  ) => {
    try {
      let mimeType;
      const fileDir = docId + '/';
      const paths = url.split(fileDir);
      const baseUrl =
        doc.schemaType !== 'station'
          ? paths[0]
          : doc._id === doc.topology?.station || doc._id === stationId
          ? `${paths[0]}${fileDir}`
          : `${paths[0]}${doc.topology?.station}/`;
      const fileName = paths[paths.length - 1];
      if (url.toLowerCase().endsWith('png')) {
        mimeType = 'image/png';
      } else {
        mimeType = 'image/jpeg';
      }

      let avatarVariables = {
        id: doc['_id'] != null ? doc['_id'] : doc.id,
        schemaType: doc.schemaType,
        version: doc.version,
        trackingAuthorName: currentUser?.name,
        avatar: {
          uId: doc.avatar?.uId ? doc.avatar.uId : getUUID(),
          baseUrl,
          fileDir,
          fileName,
          mimeType,
          type: 'avatar',
          status: 'ready',
          altText,
          data: {
            imageSize
          }
        }
      };
      let result = await updateGrouping({
        variables: {
          ...avatarVariables
        }
      });
      // setAvatarUploaded(true);
      console.log('avatar upload success');
      if (
        result?.data?.updateGrouping?.schemaType.toLowerCase().includes('admin')
      ) {
        const notiOps = getNotificationOpt('admin', 'success', 'update');
        enqueueSnackbar(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt(
          doc.schemaType === 'myMaterial' ||
            doc.schemaType === 'sharedLesson' ||
            doc.schemaType === 'sharedResource'
            ? 'material'
            : doc.schemaType,
          'success',
          'update'
        );
        enqueueSnackbar(notiOps.message, notiOps.options);
      }
    } catch (error) {
      console.log(error);
    }
    setProgress({
      progress: 0,
      upload: null
    });
  };

  const addMoreMediaAsset = async (file, resources, info) => {
    setDocument(resources);
    info.fileTitle = info.title ?? info.fileName;
    const fileName = info.fileName;
    let awsDirectory = `${resources?.topology?.station}/${resources?._id}`;
    if (resources?.schemaType === 'tutorial') {
      awsDirectory = `tutorials/${resources?._id}`;
    }
    const uploadKey = awsDirectory + '/' + fileName;

    console.log('info', info);
    console.log('file', file);
    console.log('resources', resources);

    // get station for check transmission;
    let { data: stationItem } = await client.query({
      query: graphql.queries.nameGrouping,
      variables: {
        id: resources?.topology?.station,
        schemaType: 'station'
      }
    });

    if (stationItem?.grouping[0]?.transmission === transmissions[0].value) {
      const bucket = await getBucketName(0); // asset bucket
      const docSize = await getFolderSize({
        variables: { bucket, key: awsDirectory }
      });
      const currentUploadingFiles = uploadQue
        ?.filter((item) => item.doc._id === resources._id)
        .map((item) => item.file);
      const currentUploadingFilesSize = currentUploadingFiles.reduce(
        (a, b) => a + b.size,
        0
      );
      console.log('docSize:', docSize);
      console.log(
        'currentUPloadingFiles-size:',
        currentUploadingFilesSize + file.size
      );
      if (
        200 * 1024 * 1024 <
        docSize.data?.getFolderSize + currentUploadingFilesSize + file.size
      ) {
        const notiOps = getNotificationOpt('backend', 'error', 'attach');
        enqueueSnackbar(notiOps.message, notiOps.options);
        return;
      }
    }

    setUploadQue([
      ...uploadQue,
      {
        uploadKey,
        file,
        status: 'attached',
        url: '',
        progress: 0,
        info,
        doc: resources,
        upload: null
      }
    ]);
    setQueProgresses([
      ...queProgreses,
      { info, progress: 0, uploadKey, upload: null }
    ]);
  };

  const uploadAsset = (que) => {
    let updatedQue = [];
    for (let queue of uploadQue) {
      if (que.uploadKey === queue.uploadKey) {
        queue.status = 'uploading';
      }
      updatedQue.push(queue);
    }
    setUploadQue(updatedQue);
    uploadFileToS3(que.file, que.uploadKey, 0)
      .then((data) => {
        if (!data) {
          setUploadQue(
            updatedQue.filter((item) => item.uploadKey !== que.uploadKey)
          );
          setQueProgresses(
            queProgreses.filter((item) => item.uploadKey !== que.uploadKey)
          );
        } else {
          setFinishedUpload({ url: data, uploadKey: que.uploadKey });
        }
      })
      .catch((error) => {
        let updatedQue = [];
        for (let queue of uploadQue) {
          if (que.uploadKey === queue.uploadKey) {
            queue.status = 'failed';
          }
          updatedQue.push(queue);
        }
        setUploadQue(updatedQue);
      });
  };

  const copyAsset = (url, stationId, docId) => {
    let promise = new Promise(async function (resolve, reject) {
      try {
        const destkey = `${stationId}${url.split('galleries')[1]}`; //doc_id/filename.ext
        const assetUrl = url.split('galleries')[0];
        console.log('destkey', destkey);
        const newUrl = assetUrl + destkey;
        if (!(await isFileExistS3(newUrl))) {
          const { assetBucketName } = await getConfigParams();
          await copyAssetS3({
            variables: {
              sourceUrl: url,
              destBucket: assetBucketName,
              destKey: destkey
            }
          });
        }
        resolve(newUrl);
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  };

  const copyMMAAsset = (url, fileName, stationId, docId) => {
    let promise = new Promise(async function (resolve, reject) {
      try {
        const destkey = `${stationId}${url.split('galleries')[1]}`;
        const assetUrl = url.split('galleries')[0];

        console.log('destkey', destkey);

        const newUrl = assetUrl + destkey;
        if (!(await isFileExistS3(newUrl))) {
          const { assetBucketName } = await getConfigParams();
          await copyAssetS3({
            variables: {
              sourceUrl: url,
              destBucket: assetBucketName,
              destKey: destkey
            }
          });
        }
        resolve(newUrl);
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  };

  const uploadFileToS3 = async (file, uploadKey, bucketType) => {
    accessToAWSwithCoginto();
    const defaultBucketName = await getBucketName(bucketType);
    const fileSize = file.size;
    let fileStreamCount = Math.round(fileSize / 1024 / 1024);
    const partSize = fileStreamCount < 5 ? 5 : fileStreamCount + 1;

    const upload = new AWS.S3.ManagedUpload({
      partSize: 1024 * 1024 * 5,
      queueSize: 1,
      params: {
        Bucket: defaultBucketName,
        Key: uploadKey,
        Body: file
      }
    });

    const promise = upload
      .on('httpUploadProgress', function (event) {
        setProgress({
          progress: parseInt(Math.round((event.loaded * 100) / event.total)),
          upload
        });
        setCurrentQueProgress({
          uploadKey,
          progress: parseInt(Math.round((event.loaded * 100) / event.total)),
          upload
        });
      })
      .promise();

    return promise.then(
      function (data) {
        return data.Location;
      },
      function (err) {
        return console.log(
          'There was an error uploading your photo: ',
          err.message
        );
      }
    );
  };

  const convertFileToJSON = (file, isHeader) => {
    return new Promise(function (resolve, reject) {
      try {
        const fileReader = new FileReader();

        fileReader.onloadend = (evt) => {
          let result = [];
          const lines = evt.target.result.split('\n');
          let headers = lines[0].split(',');
          headers = headers.map((el) => el.trim());

          for (let i = 1; i < lines.length; i++) {
            let obj = {};
            const currentline = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j];
            }

            result.push(obj);
          }
          setUserTableHeader(headers);
          setUserTableLoadData(result);
          if (isHeader) {
            resolve({ result, headers });
          } else {
            resolve(result);
          }
        };

        fileReader.onerror = function (e) {
          reject(e);
        };

        fileReader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateDocument = async (que) => {
    const baseUrl = getBaseUrlforBackend(que?.url, que?.doc?._id);
    const fileDir = que.doc?._id + '/';
    let upsertMMAData = {
      uId: que?.info?.uId ? que.info?.uId : getUUID(),
      fileName: `${que.info.fileName}`,
      baseUrl,
      fileDir,
      type: que.info.type,
      mimeType: que.info.mimeType,
      altText: que.info.altText,
      status: isVideoType(que.file.name) ? 'uploaded' : 'ready',
      title: que.info.title
    };

    let upserVariable = {
      docId: que.doc?._id,
      schemaType: que.doc?.schemaType,
      mma: upsertMMAData
    };
    await upsertMMAGrouping({
      variables: upserVariable
    });
    setAttachmentUploaded(true);
  };

  useEffect(() => {
    // attached, failed, uploading, finished
    if (uploadQue.length > 0) {
      const attachedFileQue = uploadQue.filter(
        (item) =>
          item.status === 'attached' &&
          item.status !== 'failed' &&
          item.status !== 'uploading'
      );
      if (attachedFileQue.length > 0) {
        uploadAsset(attachedFileQue[0]);
      } else {
        const uploads = uploadQue.filter(
          (item) => item.status === 'uploading' || item.status === 'attached'
        );
        if (uploads.length > 0) {
          // still uploading
        } else {
          setQueProgresses([]);
          setFinishedUpload();
          // updateDocument();
        }
      }
    }
  }, [uploadQue]);

  useEffect(() => {
    if (finishedUpload) {
      let updatedQue = [];
      for (let queue of uploadQue) {
        if (finishedUpload.uploadKey === queue.uploadKey) {
          queue.status = 'finished';
          queue.url = finishedUpload.url;
          updateDocument(queue);
        }
        updatedQue.push(queue);
      }
      setQueProgresses(
        queProgreses.filter(
          (item) => item.uploadKey !== finishedUpload.uploadKey
        )
      );
      setUploadQue(updatedQue);
    }
  }, [finishedUpload]);

  useEffect(() => {
    if (currentQueProgress) {
      if (queProgreses.length > 0) {
        let updatedProgressQue = [];
        for (let queProgress of queProgreses) {
          if (currentQueProgress.uploadKey === queProgress.uploadKey) {
            queProgress.progress = currentQueProgress.progress;
            queProgress.upload = currentQueProgress.upload;
          }
          updatedProgressQue.push(queProgress);
        }
        setQueProgresses(updatedProgressQue);
      }
    }
  }, [currentQueProgress]);

  useEffect(() => {
    if (
      uploadQue.length > 0 &&
      uploadQue.filter((item) => !['finished', 'failed'].includes(item.status))
        .length === 0
    ) {
      setUploadQue([]);
      console.log('que cleared');
    }
  }, [uploadQue]);

  const value = {
    progress,
    uploading,
    docId,
    stationId,
    type,
    filename,
    userTableHeader,
    setUserTableHeader,
    userTableLoadData,
    setUserTableLoadData,
    upload,
    copyAsset,
    copyMMAAsset,
    uploadGallery,
    updateGalleryThumbnail,
    convertFileToJSON,
    addMoreMediaAsset,
    attachmentsUploaded,
    setAttachmentUploaded,
    uploadQue,
    setUploadQue,
    queProgreses,
    document,
    uploadAvatar,
    setAvatarUploaded,
    avatarUploaded,
    uploadbulkFile
  };

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
}
