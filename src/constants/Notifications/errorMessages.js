import { en } from '@app/language';

export default {
  network: {
    code: 400,
    message: en['Network unreachable! Please check your internet connection.']
  },
  auth: {
    code: 403,
    message: en['Session has expired! please try to login again.']
  },
  username: {
    code: 100,
    message: en['Username is not valid!']
  },
  phone: {
    code: 101,
    message: en['Phone Number is not valid!']
  },
  adminCreate: {
    code: 102,
    message: en['An error occurred during creating the Admin!']
  },
  adminDelete: {
    code: 103,
    message: en['An error occurred during removing the Admin!']
  },
  adminUpdate: {
    code: 104,
    message: en['An error occurred during updating the Admin!']
  },
  archiveCreate: {
    code: 105,
    message: en['An error occurred during creating the archive!']
  },
  archiveDelete: {
    code: 106,
    message: en['An error occurred during removing the archive!']
  },
  archiveUpdate: {
    code: 107,
    message: en['An error occurred during updating the archive!']
  },
  classCreate: {
    code: 108,
    message: en['An error occurred during creating the class!']
  },
  classDelete: {
    code: 109,
    message: en['An error occurred during removing the class!']
  },
  classUpdate: {
    code: 110,
    message: en['An error occurred during updating the class!']
  },
  configCreate: {
    code: 111,
    message: en['An error occurred during creating the configuration!']
  },
  configDelete: {
    code: 112,
    message: en['An error occurred during removing the configuration!']
  },
  configUpdate: {
    code: 113,
    message: en['An error occurred during updating the configuration!']
  },
  distCreate: {
    code: 114,
    message: en['An error occurred during creating the school district!']
  },
  distDelete: {
    code: 115,
    message: en['An error occurred during removing the school district!']
  },
  distUpdate: {
    code: 116,
    message: en['An error occurred during updating the school district!']
  },
  eduCreate: {
    code: 117,
    message: en['An error occurred during creating the educator!']
  },
  eduDelete: {
    code: 118,
    message: en['An error occurred during removing the educator!']
  },
  eduUpdate: {
    code: 119,
    message: en['An error occurred during updating the educator!']
  },
  oneFile: {
    code: 120,
    message: en['Just one file allowed!']
  },
  fileName: {
    code: 121,
    message: en['File Name is Required!']
  },
  invalildFileName: {
    code: 122,
    message: en['File Name must not contain special characters!']
  },
  email: {
    code: 123,
    message: en['Please enter a valid Email!']
  },
  name: {
    code: 124,
    message: en['Name is Required!']
  },
  cache: {
    code: 125,
    message: en['Invalid Cache!']
  },
  lesson: {
    code: 126,
    message: en['This lesson already exists. Title must be unique.']
  },
  galleryCreate: {
    code: 127,
    message: en['An error occurred during creating the gallery!']
  },
  galleryDelete: {
    code: 128,
    message: en['An error occurred during removing the gallery!']
  },
  galleryUpdate: {
    code: 129,
    message: en['An error occurred during updating the gallery!']
  },
  googleCreate: {
    code: 130,
    message: en['An error occurred during creating the google class!']
  },
  googleDelete: {
    code: 131,
    message: en['An error occurred during removing the google class!']
  },
  googleUpdate: {
    code: 132,
    message: en['An error occurred during updating the google class!']
  },
  materialCreate: {
    code: 133,
    message: en['An error occurred during creating the lesson!']
  },
  materialDelete: {
    code: 134,
    message: en['An error occurred during removing the lesson!']
  },
  materialUpdate: {
    code: 135,
    message: en['An error occurred during updating the lesson!']
  },
  messageCreate: {
    code: 136,
    message: en['An error occurred during creating the system message!']
  },
  deviceCreate: {
    code: 501,
    message: en['An error occurred during creating the device!']
  },
  messageDelete: {
    code: 137,
    message: en['An error occurred during removing the system message!']
  },
  deviceDelete: {
    code: 502,
    message: en['An error occurred during removing the device!']
  },
  messageUpdate: {
    code: 138,
    message: en['An error occurred during updating the system message!']
  },
  deviceUpdate: {
    code: 503,
    message: en['An error occurred during updating the device!']
  },
  deviceInvalidSerialNumber: {
    code: 503,
    message: 'Device serial number invalid.'
  },
  deviceDuplicatedSerialNumber: {
    code: 503,
    message: 'Serial number exist already.'
  },
  packageCreate: {
    code: 139,
    message: en['An error occurred during creating the package!']
  },
  packageDelete: {
    code: 140,
    message: en['An error occurred during removing the package!']
  },
  packageUpdate: {
    code: 141,
    message: en['An error occurred during updating the package!']
  },
  packageNameRequired: {
    code: 142,
    message: en['Name is required!']
  },
  peopleSchoolCreate: {
    code: 143,
    message: en['An error occurred during creating a new school admin!']
  },
  peopleSchoolDelete: {
    code: 144,
    message: en['An error occurred during removing the school admin!']
  },
  peopleSchoolUpdate: {
    code: 145,
    message: en['An error occurred during updating the school admin!']
  },
  peopleStationCreate: {
    code: 146,
    message: en['An error occurred during creating a new station admin!']
  },
  peopleStationDelete: {
    code: 147,
    message: en['An error occurred during removing the station admin!']
  },
  peopleStationUpdate: {
    code: 148,
    message: en['An error occurred during updating the station admin!']
  },
  peopleSuperCreate: {
    code: 149,
    message: en['An error occurred during creating a new super admin!']
  },
  peopleSuperDelete: {
    code: 150,
    message: en['An error occurred during removing the super admin!']
  },
  peopleSuperUpdate: {
    code: 151,
    message: en['An error occurred during updating the super admin!']
  },
  peopleSystemCreate: {
    code: 152,
    message: en['An error occurred during creating a new system admin!']
  },
  peopleSystemDelete: {
    code: 153,
    message: en['An error occurred during removing the system admin!']
  },
  peopleSystemUpdate: {
    code: 154,
    message: en['An error occurred during updating the system admin!']
  },
  peopleDistCreate: {
    code: 155,
    message: en['An error occurred during creating a new district admin!']
  },
  peopleDistDelete: {
    code: 156,
    message: en['An error occurred during removing the district admin!']
  },
  peopleDistUpdate: {
    code: 157,
    message: en['An error occurred during updating the district admin!']
  },
  peopleStudentCreate: {
    code: 158,
    message: en['An error occurred during creating a new student admin!']
  },
  peopleStudentDelete: {
    code: 159,
    message: en['An error occurred during removing the student admin!']
  },
  peopleStudentUpdate: {
    code: 160,
    message: en['An error occurred during updating the student admin!']
  },
  peopleEducatorCreate: {
    code: 161,
    message: en['An error occurred during creating a new educator admin!']
  },
  peopleEducatorDelete: {
    code: 162,
    message: en['An error occurred during removing the educator admin!']
  },
  peopleEducatorUpdate: {
    code: 163,
    message: en['An error occurred during updating the educator admin!']
  },
  resourceCreate: {
    code: 164,
    message: en['An error occurred during creating the resource!']
  },
  resourceDelete: {
    code: 165,
    message: en['An error occurred during removing the resource!']
  },
  resourceUpdate: {
    code: 166,
    message: en['An error occurred during updating the resource!']
  },
  schoolCreate: {
    code: 167,
    message: en['An error occurred during creating the school!']
  },
  schoolDelete: {
    code: 168,
    message: en['An error occurred during removing the school!']
  },
  schoolUpdate: {
    code: 169,
    message: en['An error occurred during updating the school!']
  },
  stutentCreate: {
    code: 170,
    message: en['An error occurred during creating the gallery!']
  },
  stutentDelete: {
    code: 171,
    message: en['An error occurred during removing the gallery!']
  },
  stutentUpdate: {
    code: 172,
    message: en['An error occurred during updating the gallery!']
  },
  userEmail: {
    code: 173,
    message: en['Please enter a valid Email!']
  },
  userPassword: {
    code: 174,
    message: en['Please enter your password!']
  },
  userEmailPass: {
    code: 175,
    message: en['Please enter both your email and password!']
  },
  userName: {
    cdoe: 176,
    message: en['Name is Required!']
  },
  userListphone: {
    cdoe: 177,
    message: en['Phone number is not valid!']
  },
  userListphoneRequired: {
    cdoe: 178,
    message: en['Phone number is required!']
  },
  userListemail: {
    cdoe: 179,
    message: en['Please enter a valid email address!']
  },
  userListemailRequired: {
    cdoe: 180,
    message: en['Username/Email is required!']
  },
  userListduplicateEmail: {
    code: 181,
    message: en['A user with this email already exist.']
  },
  userListdDistrict: {
    code: 182,
    message: en["District couldn't be empty"]
  },
  userListselectDistrict: {
    code: 183,
    message: en['Please select a District.']
  },
  stateCreate: {
    code: 184,
    message: en['An error occurred during creating the state!']
  },
  stateDelete: {
    code: 185,
    message: en['An error occurred during removing the state!']
  },
  stateUpdate: {
    code: 186,
    message: en['An error occurred during updating the state!']
  },
  stationCreate: {
    code: 187,
    message: en['An error occurred during creating the station!']
  },
  stationDelete: {
    code: 188,
    message: en['An error occurred during removing the station!']
  },
  stationUpdate: {
    code: 189,
    message: en['An error occurred during updating the station!']
  },
  stationAvatar: {
    code: 200,
    message: en['Station Logo is required!']
  },
  backendCreate: {
    code: 190,
    message: en['Something went wrong']
  },
  backendDelete: {
    code: 191,
    message: en['Something went wrong']
  },
  backendUpdate: {
    code: 192,
    message: en['Something went wrong']
  },
  backendUpload: {
    code: 193,
    message: en['Something went wrong']
  },
  backendWrong: {
    code: 194,
    message: en['Something went wrong']
  },
  backendNetwork: {
    code: 195,
    message: en['Unable to connect server API']
  },
  bulkUploadStudent: {
    code: 196,
    message: en['Unable to upload over 1000 students!']
  },
  bulkUploadEducator: {
    code: 197,
    message: en['Unable to upload over 1000 educators!']
  },
  copyResourceToClass: {
    code: 198,
    message: en['Copy resource to Class failed with some reason!']
  },
  other: {
    cdoe: 500,
    message: en['Something went wrong!']
  },
  attachOver: {
    code: 199,
    message: en['Lesson exceeds its maximum allowable size!']
  }
};
