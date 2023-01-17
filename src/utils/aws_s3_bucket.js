/* eslint-disable max-len */
import AWS from 'aws-sdk';
import { AUTH_USER_TOKEN_KEY } from '@app/utils/constants';
import config from '@app/Config';
import { getConfigParams } from '@app/utils/functions';

export const accessToAWSwithCoginto = () => {
  const idToken = window.localStorage.getItem(AUTH_USER_TOKEN_KEY);
  const cognitoLogin = {
    [`cognito-idp.${config.aws.aws_cognito_region}.amazonaws.com/${config.aws.aws_user_pools_id}`]:
      idToken
  };

  AWS.config.region = config.aws.aws_cognito_region;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: config.aws.aws_cognito_identity_pool_id,
    Logins: cognitoLogin
  });
};

export const getBucketName = async (bucketType) => {
  const { assetBucketName, packageBucketName } = await getConfigParams();
  const defaultBucketName =
    bucketType === 2 ? packageBucketName : assetBucketName;

  return defaultBucketName;
};

export const getBucketKey = (uploadUrl, defaultBucketName) => {
  const uploadUrlSpitValue = uploadUrl?.split(defaultBucketName + '/');
  const uploadKey = uploadUrlSpitValue && uploadUrlSpitValue[1];

  return uploadKey;
};

export const getAssetUrlFromS3 = async (uploadUrl, bucketType) => {
  if (uploadUrl) {
    accessToAWSwithCoginto();

    let defaultBucketName = await getBucketName(bucketType);
    let uploadKey = getBucketKey(uploadUrl, defaultBucketName);

    if (uploadKey) {
      const s3 = new AWS.S3({
        apiVersion: '2006-03-01'
      });

      const params = {
        Bucket: defaultBucketName,
        Key: uploadKey,
        Expires: 60 * 60 * 24 * 7
      };

      var promise = s3.getSignedUrlPromise('getObject', params);
      return promise.then(
        function (url) {
          return url;
        },
        function (err) {
          console.log(err);
        }
      );
    }
  }
};

export const getBaseUrlforBackend = (url, splitValue) => {
  const splitUrl = url.split('/' + splitValue);
  const baseUrl = splitUrl[0] + '/';
  return baseUrl;
};

export const fileSpliterForLargeFile = (file) => {
  let fileList = [];
  const fileSize = file.size;
  const chunkSize = 5 * 1024 * 1024;
  if (fileSize > chunkSize) {
    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize + 1);
      fileList.push(chunk);
    }
  }
  return fileList;
};

export const uploadFileToS3 = async (file, uploadKey, bucketType) => {
  accessToAWSwithCoginto();

  const defaultBucketName = await getBucketName(bucketType);

  const fileSize = file.size;
  let fileStreamCount = Math.round(fileSize / 1024 / 1024);
  const partSize = fileStreamCount < 5 ? 5 : fileStreamCount + 1;

  const upload = new AWS.S3.ManagedUpload({
    partSize: 1024 * 1024 * partSize,
    queueSize: 1,
    params: {
      Bucket: defaultBucketName,
      Key: uploadKey,
      Body: file
    }
  });

  const promise = upload
    .on('httpUploadProgress', function (event) {
      window.percent = parseInt(Math.round((event.loaded * 100) / event.total));
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

export const isFileExistS3 = async (url) => {
  try {
    // 2 -> package, 0 -> asset
    const defaultBucketName = await getBucketName(0);
    let key = getBucketKey(url, defaultBucketName);
    const params = {
      Bucket: defaultBucketName,
      Key: key
    };
    accessToAWSwithCoginto();
    const headCode = await AWS.S3.headObject(params).promise();
    const signedUrl = await AWS.S3.getSignedUrl('getObject', params);
    return true;
  } catch (headErr) {
    if (headErr.code === 'NotFound') {
      return false;
    }
    return false;
  }
};
