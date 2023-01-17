import notiArchive from './archive';
import notiAdmin from './admin';
import notiBackend from './backend';
import notiEducator from './educator';
import notiAttachment from './attachment';
import notiUser from './user';
import notiDevice from './device';
import notiLibrary from './library';
import notiUserInfo from './userinfo';
import notiUserList from './userlist';
import notiUserUpload from './userupload';
import notiClass from './class';
import notiGoogleClass from './googleClass';
import notiDashboard from './dashboard';
import notiEmail from './email';
import notiExtra from './extra';
import notiGallery from './gallery';
import notiStudent from './student';
import notiResource from './resource';
import notiMessage from './message';
import notiPackage from './package';
import notiPeople from './people';
import notiSchool from './school';
import notiSetting from './setting';
import notiStation from './station';
import notiConfig from './config';
import notiState from './state';
import notiDistrict from './district';
import notiMaterial from './material';
import notiTutorial from './tutorial';
import schoolTerm from './schoolTerm';
import { getCurrentUTCTime } from '@app/utils/date-manager';

const getNotificationGroup = (str) => {
  switch (str) {
    case 'backend':
      return notiBackend;
    case 'library':
      return notiLibrary;
    case 'extra':
      return notiExtra;
    case 'user':
      return notiUser;
    case 'userinfo':
      return notiUserInfo;
    case 'educator':
      return notiEducator;
    case 'userlist':
      return notiUserList;
    case 'userupload':
      return notiUserUpload;
    case 'station':
      return notiStation;
    case 'class':
      return notiClass;
    case 'googleClass':
      return notiGoogleClass;
    case 'school':
      return notiSchool;
    case 'student':
      return notiStudent;
    case 'archive':
      return notiArchive;
    case 'admin':
      return notiAdmin;
    case 'attachment':
      return notiAttachment;
    case 'dashboard':
      return notiDashboard;
    case 'email':
      return notiEmail;
    case 'gallery':
      return notiGallery;
    case 'oer':
      return notiGallery;
    case 'pbs':
      return notiGallery;
    case 'resource':
      return notiResource;
    case 'message':
      return notiMessage;
    case 'device':
      return notiDevice;
    case 'sysMessage':
      return notiMessage;
    case 'people':
      return notiPeople;
    case 'package':
      return notiPackage;
    case 'setting':
      return notiSetting;
    case 'config':
      return notiConfig;
    case 'state':
      return notiState;
    case 'district':
      return notiDistrict;
    case 'material':
      return notiMaterial;
    case 'tutorial':
      return notiTutorial;
    case 'schoolTerm':
      return schoolTerm;
    default:
      return null;
  }
};

const loggingStatus = (message, variant, document) => {
  const currTimeStamp = getCurrentUTCTime();
  const documenId = document ? document['_id'] : null;
  console.log(`${currTimeStamp}|${variant}|${documenId}|${message}`);
};

export const getNotificationOpt = (
  containerName,
  variant,
  action,
  options,
  document
) => {
  const notificationGroup = getNotificationGroup(containerName);

  if (!notificationGroup) {
    const message = `The ${containerName} container doesn't exist.
      please double-check that you registered it exactly.`;

    loggingStatus(message, variant, document);
    return {
      message,
      options: {
        variant: 'warning',
        autoHideDuration: 10000
      }
    };
  }

  if (!notificationGroup[variant]) {
    const message = `The ${variant} type alert doesn't exist.
      please double-check that you registered it exactly.`;

    loggingStatus(message, variant, document);
    return {
      message,
      options: {
        variant: 'warning',
        autoHideDuration: 10000
      }
    };
  }

  if (options) {
    if (!notificationGroup[variant][options][action]) {
      const message = `The ${action} action doesn't exist.
        please double-check that you registered it exactly.`;

      loggingStatus(message, variant, document);
      return {
        message,
        options: {
          variant: 'warning',
          autoHideDuration: 10000
        }
      };
    }

    const message = notificationGroup[variant][options][action].message;
    loggingStatus(message, variant, document);
    return notificationGroup[variant][options][action];
  }

  if (!notificationGroup[variant][action]) {
    const message = `The ${action} action doesn't exist.
      please double-check that you registered it exactly.`;
    loggingStatus(message, variant);

    return {
      message,
      options: {
        variant: 'warning',
        autoHideDuration: 10000
      }
    };
  }

  const message = notificationGroup[variant][action].message;
  loggingStatus(message, variant);
  return notificationGroup[variant][action];
};
