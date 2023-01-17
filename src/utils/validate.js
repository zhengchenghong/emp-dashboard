import {
  faPaperclip,
  faImage,
  faFilm,
  faFilePdf
} from '@fortawesome/free-solid-svg-icons';

export const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateFileName = (value) => {
  return new RegExp(/[^a-zA-Z0-9._@#$%^&()[]{}!~-]/g).test(value);
};

export const getFileName = (name) => {
  let newName = name?.substring(0, name?.lastIndexOf('.')) || name;
  newName = newName?.replace(/[/<>:|?'`*"\\]/g, '').toLowerCase();
  return `${newName}`;
  // let newName = name?.replace(/[/<>:|?'`*"\\]/g, ''); //  /<>:"\|?'`
  // // ?.replace(/[^a-zA-Z0-9]/g, '')
  // // .toLowerCase();
  // return `${newName}`;
};

export const isVideoType = (name) => {
  return /\.(mov|mp4|m4v|wmv|avi|m3u8|webm|mts|mkv|mpg|swf|ogm|flv|f4v)$/i.test(
    name
  );
};

export const isImageType = (name) => {
  return /\.(png|jpg|jpeg|gif|bmp)$/i.test(name);
};

export const getIcon = (type) => {
  if (
    type === 'video/x-msvideo' ||
    type === 'video/mpeg' ||
    type === 'video/mp4'
  )
    return faFilm;
  if (type === 'image/png' || type === 'image/jpeg') return faImage;
  if (type === 'application/pdf') return faFilePdf;

  return faPaperclip;
};
