import { generateSignedUrl, axiosPutRequest, getAssetUrl } from './functions';
import config from '@app/Config';

export const getFileExtension = (fileName) => fileName.split('.').pop();

export const hasFileExtension = (fileName) => fileName.split('.').length > 1;

export const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
  });

export const uploadFileToS3 = async (name, file, resourceID, resourceName) => {
  try {
    let type, fileName;
    if (file.type === 'image/png') {
      type = `images`;
      fileName = `${name}.${file.name.split('.')[1]}`;
      if (resourceID) {
        type = `${resourceName}/${resourceID}`;
        fileName = 'avatar.png';
      }
    }

    const { signedUrl } = await generateSignedUrl(type, fileName);

    const assetURL = getAssetUrl(signedUrl);

    const response = await axiosPutRequest(signedUrl, file);
    if (response.status !== 200) return false;
    return resourceID
      ? `${assetURL}/${resourceName}/${resourceID}/${fileName}`
      : true;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};
