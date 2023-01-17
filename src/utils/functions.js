import axios from 'axios';
import config from '@app/Config';
import { AUTH_USER_TOKEN_KEY } from '@app/utils/constants';
import { Auth } from 'aws-amplify';
import versionText from './version.txt';

const vis = (function () {
  let stateKey,
    eventKey,
    keys = {
      hidden: 'visibilitychange',
      webkitHidden: 'webkitvisibilitychange',
      mozHidden: 'mozvisibilitychange',
      msHidden: 'msvisibilitychange'
    };
  for (stateKey in keys) {
    if (stateKey in document) {
      eventKey = keys[stateKey];
      break;
    }
  }
  return function (c) {
    if (c) document.addEventListener(eventKey, c);
    return !document[stateKey];
  };
})();

export const idleHandler = () => {
  vis(async () => {
    if (vis()) {
      const idleTimeout = 1000 * 60 * 30;
      const lastActionTime = localStorage.getItem('lastActionTime');
      localStorage.setItem('lastActionTime', new Date().getTime());

      if (
        lastActionTime &&
        new Date().getTime() - parseInt(lastActionTime) > idleTimeout
      ) {
        clearLocalStorage();
        window.sessionStorage.setItem('last_path', window.location.pathname);

        try {
          if ((await Auth.currentSession()).isValid()) {
            await Auth.signOut();
          }
        } catch (e) {}
        window.localStorage.removeItem('ConfigParams');
        window.location.reload();
      }
    }
  });
};

export const screenSize = () => {
  const currentWidth = window?.innerWidth;
  if (currentWidth <= 375) return 'Small';
  if (currentWidth <= 680) return 'Medium';
  if (currentWidth <= 1240) return 'Large';
  if (currentWidth > 1240) return 'XLarge';
};

export const getConfigParams = () =>
  new Promise(async (resolve, reject) => {
    function isJSON(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    function getLocalConfigInfo() {
      let localConfigString = localStorage.getItem('ConfigParams');
      if (localConfigString == null) return null;
      if (!isJSON(localConfigString)) return null;
      let localConfig = JSON.parse(localConfigString);
      if (
        localConfig.assetBucketName &&
        localConfig.assetBucketName !== '' &&
        localConfig.packageBucketName &&
        localConfig.packageBucketName !== '' &&
        localConfig.learnerBucketName &&
        localConfig.learnerBucketName !== ''
      ) {
        return localConfig;
      }
      return null;
    }

    try {
      let configData = getLocalConfigInfo();
      if (configData != null) {
        resolve(configData);
      } else {
        const token = localStorage.getItem(AUTH_USER_TOKEN_KEY);
        const authorization = token ? `Bearer ${token}` : '';
        const query = `{configParams}`;
        const response = await axios({
          method: 'post',
          url: config.apolloLinks.http,
          data: {
            query
          },
          headers: {
            authorization
          }
        });
        if (response.status !== 200) {
          reject();
        }

        const configParams = {
          assetBucketName: response.data.data.configParams?.assetBucketName,
          packageBucketName: response.data.data.configParams?.packageBucketName,
          learnerBucketName: response.data.data.configParams?.learnerBucketName
        };
        const configString = JSON.stringify(configParams);
        localStorage.setItem('ConfigParams', configString);
        resolve(configParams);
      }
    } catch (error) {
      console.log(error.message);
      reject(error);
    }
  });

export const generateSignedUrl = (dirName, fileName) =>
  new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem(AUTH_USER_TOKEN_KEY);
      const authorization = token ? `Bearer ${token}` : '';
      const query = `{
        signedUrl (
          type: "asset"
          key: "${dirName}/${fileName}"
        )
      }`;
      const response = await axios({
        method: 'post',
        url: config.apolloLinks.http,
        data: {
          query
        },
        headers: {
          authorization
        }
      });

      const signedUrl = response?.data?.data?.signedUrl;
      if (response.status !== 200) {
        reject();
      }
      resolve({
        signedUrl: signedUrl
      });
    } catch (error) {
      console.log(error.message);
      reject(error);
    }
  });

export const axiosPutRequest = async (url, payload) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${url}`,
      data: payload
    });
    return response;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const isValidSerialNumber = (serialNumber) => {
  const pattern = /^([A-Fa-f0-9]{8})$/i;
  const pattern1 = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2})$/i;
  const pattern2 = /^(([A-Fa-f0-9]{2}[-]){5}[A-Fa-f0-9]{2})$/i;
  const pattern3 = /^([A-Fa-f0-9]{12})$/i;
  return (
    pattern.test(serialNumber) ||
    pattern1.test(serialNumber) ||
    pattern2.test(serialNumber) ||
    pattern3.test(serialNumber)
  );
};

export const isDuplicatedSerialNumber = (serialNumber, totalData) => {
  let dFlag = false;
  let tempSerial = serialNumber.replaceAll(':', '');
  tempSerial = tempSerial.replaceAll('-', '');
  for (let i = 0; i < totalData?.length; i++) {
    let tempName = totalData[i].name.replaceAll(':', '');
    tempName = tempName.replaceAll('-', '');
    if (tempName === tempSerial) {
      dFlag = true;
    }
  }
  return dFlag;
};

export const isValidMacAddress = (macAddress) => {
  const pattern = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2})$/i;
  const pattern1 = /^(([A-Fa-f0-9]{2}[-]){5}[A-Fa-f0-9]{2})$/i;
  return pattern.test(macAddress) || pattern1.test(macAddress);
};

export const getAssetUrl = (signedUrl) => {
  const temp =
    signedUrl.split('/')[0] +
    '//' +
    signedUrl.split('/')[2] +
    '/' +
    signedUrl.split('/')[3];
  return temp;
};

export const getNameFromURL = (url) => {
  const paths = url.split('/');
  const filename = paths[paths.length - 1];
  const names = filename.split('.');
  const ext = names[names.length - 1];
  return {
    id: paths[paths.length - 2],
    filename: filename,
    ext: ext
  };
};

export const tabsManager = () => {
  manage_crash();

  //Create a windows ID for each windows that is oppened
  var current_window_id = Date.now() + ''; //convert to string
  var time_period = 3000; //ms

  //Check to see if PageVisibility API is supported or not
  var PV_API = page_visibility_API_check();

  /************************
   ** PAGE VISIBILITY API **
   *************************/
  function page_visibility_API_check() {
    var page_visibility_API = false;
    var visibility_change_handler = false;
    if ('hidden' in document) {
      page_visibility_API = 'hidden';
      visibility_change_handler = 'visibilitychange';
    } else {
      var prefixes = ['webkit', 'moz', 'ms', 'o'];
      //loop over all the known prefixes
      for (var i = 0; i < prefixes.length; i++) {
        if (prefixes[i] + 'Hidden' in document) {
          page_visibility_API = prefixes[i] + 'Hidden';
          visibility_change_handler = prefixes[i] + 'visibilitychange';
        }
      }
    }

    if (!page_visibility_API) {
      //PageVisibility API is not supported in this device
      return page_visibility_API;
    }

    return { hidden: page_visibility_API, handler: visibility_change_handler };
  }

  if (PV_API) {
    document.addEventListener(
      PV_API.handler,
      function () {
        if (document[PV_API.hidden]) {
          //windows is hidden now
          remove_from_active_windows(current_window_id);
          //skip_once = true;
        } else {
          //windows is visible now
          //add_to_active_windows(current_window_id);
          //skip_once = false;
          check_current_window_status();
        }
      },
      false
    );
  }

  /********************************************
   ** ADD CURRENT WINDOW TO main_windows LIST **
   *********************************************/
  add_to_main_windows_list(current_window_id);
  //update active_window to current window
  localStorage.active_window = current_window_id;

  /**************************************************************************
   ** REMOVE CURRENT WINDOWS FROM THE main_windows LIST ON CLOSE OR REFRESH **
   ***************************************************************************/
  window.addEventListener('beforeunload', function () {
    remove_from_main_windows_list(current_window_id);
    const main_windows = get_main_windows_list();
  });

  /*****************************
   ** ADD TO main_windows LIST **
   ******************************/
  function add_to_main_windows_list(window_id) {
    var temp_main_windows_list = get_main_windows_list();
    var index = temp_main_windows_list.indexOf(window_id);

    if (index < 0) {
      //this windows is not in the list currently
      temp_main_windows_list.push(window_id);
    }

    localStorage.main_windows = temp_main_windows_list.join(',');

    return temp_main_windows_list;
  }

  /**************************
   ** GET main_windows LIST **
   ***************************/
  function get_main_windows_list() {
    var temp_main_windows_list = [];
    if (localStorage.main_windows) {
      temp_main_windows_list = localStorage.main_windows.split(',');
    }

    return temp_main_windows_list;
  }

  /**********************************************
   ** REMOVE WINDOWS FROM THE main_windows LIST **
   ***********************************************/
  function remove_from_main_windows_list(window_id) {
    var temp_main_windows_list = [];
    if (localStorage.main_windows) {
      temp_main_windows_list = localStorage.main_windows.split(',');
    }

    var index = temp_main_windows_list.indexOf(window_id);
    if (index > -1) {
      temp_main_windows_list.splice(index, 1);
    }

    localStorage.main_windows = temp_main_windows_list.join(',');

    //remove from active windows too
    remove_from_active_windows(window_id);

    return temp_main_windows_list;
  }

  /**************************
   ** GET active_windows LIST **
   ***************************/
  function get_active_windows_list() {
    var temp_active_windows_list = [];
    if (localStorage.actived_windows) {
      temp_active_windows_list = localStorage.actived_windows.split(',');
    }

    return temp_active_windows_list;
  }

  /*************************************
   ** REMOVE FROM actived_windows LIST **
   **************************************/
  function remove_from_active_windows(window_id) {
    var temp_active_windows_list = get_active_windows_list();

    var index = temp_active_windows_list.indexOf(window_id);
    if (index > -1) {
      temp_active_windows_list.splice(index, 1);
    }

    localStorage.actived_windows = temp_active_windows_list.join(',');

    return temp_active_windows_list;
  }

  /********************************
   ** ADD TO actived_windows LIST **
   *********************************/
  function add_to_active_windows(window_id) {
    var temp_active_windows_list = get_active_windows_list();

    var index = temp_active_windows_list.indexOf(window_id);

    if (index < 0) {
      //this windows is not in active list currently
      temp_active_windows_list.push(window_id);
    }

    localStorage.actived_windows = temp_active_windows_list.join(',');

    return temp_active_windows_list;
  }

  /*****************
   ** MANAGE CRASH **
   ******************/
  //If the last update didn't happened recently (more than time_period*2)
  //we will clear saved localStorage's data and reload the page
  function manage_crash() {
    if (localStorage.last_update) {
      if (parseInt(localStorage.last_update) + time_period * 2 < Date.now()) {
        //seems a crash came! who knows!?
        localStorage.removeItem('main_windows');
        localStorage.removeItem('actived_windows');
        localStorage.removeItem('active_window');
        localStorage.removeItem('last_update');
        localStorage.removeItem('ConfigParams');
        Auth.signOut();
        window.location.reload();
      }
    }
  }

  /********************************
   ** CHECK CURRENT WINDOW STATUS **
   *********************************/
  function check_current_window_status(test) {
    manage_crash();

    if (PV_API) {
      var active_status = 'Inactive';
      var windows_list = get_main_windows_list();

      var active_windows_list = get_active_windows_list();

      if (windows_list.indexOf(localStorage.active_window) < 0) {
        //last actived windows is not alive anymore!
        //remove_from_main_windows_list(localStorage.active_window);

        //set the last added window, as active_window
        localStorage.active_window = windows_list[windows_list.length - 1];
      }

      if (!document[PV_API.hidden]) {
        //Window's page is visible
        localStorage.active_window = current_window_id;
      }

      if (localStorage.active_window === current_window_id) {
        active_status = 'Active';
      }

      if (active_status === 'Active') {
        active_windows_list = add_to_active_windows(current_window_id);
      } else {
        active_windows_list = remove_from_active_windows(current_window_id);
      }

      // var element_holder = document.getElementById("holder_element");
      // element_holder.insertAdjacentHTML("afterbegin", "<div>" + element_holder.childElementCount + ") Current Windows is " + active_status + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + active_windows_list.length + " window(s) is visible and active of " + windows_list.length + " windows</div>");
    } else {
      console.log('PageVisibility API is not supported :(');
      //our INACTIVE pages, will remain INACTIVE forever, you need to make some action in this case!
    }

    localStorage.last_update = Date.now();
  }

  //check storage continuously
  setInterval(function () {
    check_current_window_status();
  }, time_period);

  //initial check
  check_current_window_status();
};

export const favicon = () => {
  var favIcon = 'favicon.ico';
  var docHead = document.getElementsByTagName('head')[0];
  var newLink = document.createElement('link');
  newLink.rel = 'shortcut icon';
  newLink.href = 'data:image/x-icon;base64,' + favIcon;
  docHead.appendChild(newLink);
};

export const getDisplayName = (value) => {
  var tmp = value?.split('&&');
  if (tmp) {
    return tmp[1] && tmp[1] !== '' ? tmp[1] : value;
  } else {
    return '';
  }
};

export const getFormattedDate = (date) => {
  if (date) {
    const formatedDate = new Date(date);
    return `${
      formatedDate.getMonth() < 10 ? '0' : ''
    }${formatedDate.getMonth()}/${
      formatedDate.getDate() < 10 ? '0' : ''
    }${formatedDate.getDate()}/${formatedDate
      .getFullYear()
      .toString()
      .substr(-2)}. ${
      formatedDate.getHours() < 10 ? '0' : ''
    }${formatedDate.getHours()}:${
      formatedDate.getMinutes() < 10 ? '0' : ''
    }${formatedDate.getMinutes()}:${
      formatedDate.getSeconds() < 10 ? '0' : ''
    }${formatedDate.getSeconds()}`;
  }
  return '';
};

export const getUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getFileBaseURLFromURL = (url) => {
  if (url && url.includes('/')) {
    const paths = url.split('/');
    if (paths.length > 2) {
      let baseUrl = '';
      for (let i = 0; i < paths.length - 2; i++) {
        baseUrl = baseUrl + paths[i] + '/';
      }
      return baseUrl;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const getFileNameFromURL = (url) => {
  if (url && url.includes('/')) {
    const paths = url.split('/');
    const filename = paths[paths.length - 1];
    return filename;
  } else {
    return null;
  }
};

export const getFileDirectFromURL = (url) => {
  if (url && url.includes('/')) {
    const paths = url.split('/');
    if (paths.length > 2) {
      const direct = paths[paths.length - 2];
      return direct + '/';
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const clearLocalStorage = () => {
  window.localStorage.removeItem('libraryClasses');
  window.localStorage.removeItem('user');
  window.localStorage.removeItem('tagsData');
  window.localStorage.removeItem(AUTH_USER_TOKEN_KEY);
  window.localStorage.removeItem('notifyMSG');
  window.localStorage.removeItem('currentTime');
  window.localStorage.removeItem('ConfigParams');
};

const handleOnIdle = async (event) => {
  if (await (await Auth.currentSession()).isValid) {
    await Auth.signOut();
  }
  clearLocalStorage();
  window.sessionStorage.setItem('last_path', window.location.pathname);
  window.location.reload();
};

export const inactivityTime = function () {
  var time;
  window.onload = resetTimer;
  // DOM Events
  document.onmousemove = resetTimer;
  document.onKeyDown = resetTimer;
  function resetTimer() {
    clearTimeout(time);
    const currentTime = new Date().valueOf() / 1000; //seconds
    const lastActiveTime = localStorage.getItem('idleTime')
      ? parseInt(localStorage.getItem('idleTime'))
      : currentTime;
    const sleepTime = currentTime - lastActiveTime;
    if (sleepTime > 30 * 60) {
      //30min sleep
      handleOnIdle();
    }

    if (sleepTime > 10)
      //update every 10 seconds
      localStorage.setItem('idleTime', currentTime);

    time = setTimeout(handleOnIdle, 60 * 1000 * 30);
  }

  window.addEventListener('unload', () => {
    localStorage.removeItem('ConfigParams');
    sessionStorage.setItem('last_path', window.location.pathname);
  });
};

// export const getVersionString = async () => {
//   const versionString = await fetchVersionString();
//   return versionString;
// };

export const getVersionString = () => {
  return fetch(versionText)
    .then((r) => r.text())
    .then((text) => {
      return text;
    });
};

export function emptyCache() {
  if ('caches' in window) {
    caches.keys().then((names) => {
      // Delete all the cache files
      names.forEach((name) => {
        caches.delete(name);
      });
    });

    // Makes sure the page reloads. Changes are only visible after you refresh.
    window.location.reload(true);
  }
}

const receiveMessage = async (event, callback) => {
  // Do we trust the sender of this message? (might be
  // different from what we originally opened, for example).
  console.log('receiveMessage', event);
  window.location.reload();
  if (event.origin !== process.env.REACT_APP_URL) {
    return;
  }
  // const { data } = event;
};

let windowObjectReference = null;
let previousUrl = null;
export const openPopupWindow = (url, name) => {
  // remove any existing event listeners
  window.removeEventListener('message', receiveMessage);
  // window features
  const strWindowFeatures =
    'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';
  if (windowObjectReference === null || windowObjectReference.closed) {
    windowObjectReference = window.open(url, name, strWindowFeatures);
  } else if (previousUrl !== url) {
    windowObjectReference = window.open(url, name, strWindowFeatures);
    windowObjectReference.focus();
  } else {
    windowObjectReference.focus();
  }

  // add the listener for receiving a message from the popup
  window.addEventListener('message', (event) => receiveMessage(event), false);

  // assign the previous URL
  previousUrl = url;
  return windowObjectReference;
};

export function exportToCsv(filename, rows) {
  var processRow = function (row) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  var csvFile = '';
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
