import { en } from '@app/language';

export const UsersResource = [
  {
    _id: 1,
    name: en['System Admins'],
    schemaType: 'sysAdmin',
    urlKey: 'system-admins',
    type: 'System',
    value: 1,
    label: en['System Admins']
  },
  {
    _id: 2,
    name: en['Educators'],
    schemaType: 'educator',
    urlKey: 'educators',
    type: 'Educator',
    value: 2,
    label: en['Educators']
  },
  {
    _id: 3,
    name: en['Students'],
    schemaType: 'student',
    urlKey: 'students',
    type: 'Student',
    value: 3,
    label: en['Students']
  },
  {
    _id: 4,
    name: en['Station Admins'],
    schemaType: 'stationAdmin',
    urlKey: 'stationAdmins',
    type: 'StationAdmin',
    value: 4,
    label: en['Station Admins']
  },
  {
    _id: 5,
    name: en['District Admins'],
    schemaType: 'districtAdmin',
    urlKey: 'districtAdmins',
    type: 'DistrictAdmin',
    value: 5,
    label: en['District Admins']
  },
  {
    _id: 6,
    name: en['School Admins'],
    schemaType: 'schoolAdmin',
    urlKey: 'schoolAdmins',
    type: 'SchoolAdmin',
    value: 6,
    label: en['School Admins']
  }
];
