import {
  faChartBar,
  faFileArchive,
  faPhotoVideo,
  faInfoCircle,
  faChalkboardTeacher,
  faBookOpen,
  faBookReader,
  faUsersCog,
  faLaptopCode,
  faCommentAlt,
  faSearch,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { en } from '@app/language';

import { faUpload, faSitemap } from '@fortawesome/pro-solid-svg-icons';

export const setMenuListByRole = (role) => {
  if (role === 'super-admin') {
    return [
      {
        icon: faSitemap,
        text: en['Topologies'],
        url: '/topology'
      },
      {
        icon: faBookOpen,
        text: en['Lessons'],
        url: '/materials'
      },
      // {
      //   icon: faBookReader,
      //   text: en['My Library'],
      //   url: '/mymaterials'
      // },
      {
        icon: faUsersCog,
        text: en['Users'],
        url: '/users',
        disabled: false
      },
      {
        icon: faLaptopCode,
        text: en['Devices'],
        url: '/devices',
        disabled: false
      },
      {
        icon: faPhotoVideo,
        text: en['Galleries'],
        url: '/galleries'
      },
      {
        icon: faUpload,
        text: en['Libraries'],
        url: '/libraries'
      },
      {
        icon: faInfoCircle,
        text: en['Tutorials'],
        url: '/tutorials'
      },
      {
        icon: faCommentAlt,
        text: en['Messages'],
        url: '/message'
      },
      {
        icon: faFileArchive,
        text: en['Archives'],
        url: '/archives'
        // disabled: true
      },
      {
        icon: faSearch,
        text: en['Resources'],
        url: '/resources'
      },
      {
        icon: faTrash,
        text: en['Clear'],
        url: '/clear'
      }
    ];
  }

  if (role === 'sysAdmin') {
    return [
      {
        icon: faSitemap,
        text: en['Topologies'],
        url: '/topology'
      },
      {
        icon: faBookOpen,
        text: en['Lessons'],
        url: '/materials'
      },
      // {
      //   icon: faBookReader,
      //   text: en['My Library'],
      //   url: '/mymaterials'
      // },
      {
        icon: faUsersCog,
        text: en['Users'],
        url: '/users'
      },
      {
        icon: faLaptopCode,
        text: en['Devices'],
        url: '/devices',
        disabled: false
      },
      {
        icon: faPhotoVideo,
        text: en['Galleries'],
        url: '/galleries'
      },
      {
        icon: faUpload,
        text: en['Libraries'],
        url: '/libraries'
      },
      {
        icon: faInfoCircle,
        text: en['Tutorials'],
        url: '/tutorials'
      },
      {
        icon: faCommentAlt,
        text: en['Messages'],
        url: '/message'
      },
      {
        icon: faFileArchive,
        text: en['Archives'],
        url: '/archives'
        // disabled: true
      },
      {
        icon: faSearch,
        text: en['Resources'],
        url: '/resources'
      }
      // {
      //   icon: faChartBar,
      //   text: 'Analytics',
      //   url: '/analytics',
      //   disabled: true
      // }
    ];
  }

  if (role === 'system-admin') {
    return [
      {
        icon: faBookOpen,
        text: en['Lessons'],
        url: '/materials'
      },
      // {
      //   icon: faBookReader,
      //   text: en['My Library'],
      //   url: '/mymaterials'
      // },
      {
        icon: faPhotoVideo,
        text: en['Galleries'],
        url: '/galleries'
      },
      {
        icon: faUpload,
        text: en['Libraries'],
        url: '/libraries'
      },
      {
        icon: faInfoCircle,
        text: en['Tutorials'],
        url: '/tutorials'
      },
      {
        icon: faFileArchive,
        text: en['Archives'],
        url: '/archives',
        disabled: true
      },
      {
        icon: faChartBar,
        text: en['Analytics'],
        url: '/analytics',
        disabled: true
      },
      {
        icon: faUsersCog,
        text: en['Admins'],
        url: '/users'
        // disabled: true
      }
    ];
  }

  if (role === 'schoolAdmin') {
    return [
      {
        icon: faSitemap,
        text: en['Topologies'],
        url: '/topology'
      },
      {
        icon: faBookOpen,
        text: en['Lessons'],
        url: '/materials'
      },
      // {
      //   icon: faBooks,
      //   text: en['Libraries'],
      //   url: '/libraries'
      // },
      // {
      //   icon: faBookReader,
      //   text: en['My Library'],
      //   url: '/mymaterials'
      // },
      {
        icon: faLaptopCode,
        text: en['Devices'],
        url: '/devices',
        disabled: false
      },
      {
        icon: faPhotoVideo,
        text: en['Galleries'],
        url: '/galleries'
      },
      {
        icon: faInfoCircle,
        text: en['Tutorials'],
        url: '/tutorials'
      },
      {
        icon: faSearch,
        text: 'Resources',
        url: '/resources'
      }
    ];
  }

  if (role === 'educator') {
    return [
      {
        icon: faBookOpen,
        text: en['Lessons'],
        url: '/materials'
      },
      // {
      //   icon: faBookReader,
      //   text: en['My Library'],
      //   url: '/mymaterials'
      // },
      {
        icon: faPhotoVideo,
        text: en['Galleries'],
        url: '/galleries'
      },
      // {
      //   icon: faBooks,
      //   text: en['Libraries'],
      //   url: '/libraries'
      // },
      {
        icon: faInfoCircle,
        text: en['Tutorials'],
        url: '/tutorials'
      },
      {
        icon: faSearch,
        text: en['Resources'],
        url: '/resources'
      }
    ];
  }

  if (role === 'districtAdmin') {
    return [
      {
        icon: faSitemap,
        text: en['Topologies'],
        url: '/topology'
      },
      {
        icon: faBookOpen,
        text: en['Lessons'],
        url: '/materials'
      },
      {
        icon: faLaptopCode,
        text: en['Devices'],
        url: '/devices',
        disabled: false
      },
      {
        icon: faPhotoVideo,
        text: en['Galleries'],
        url: '/galleries'
      },
      // {
      //   icon: faBooks,
      //   text: en['Libraries'],
      //   url: '/libraries'
      // },
      // {
      //   icon: faBookReader,
      //   text: en['My Library'],
      //   url: '/mymaterials'
      // },
      {
        icon: faInfoCircle,
        text: en['Tutorials'],
        url: '/tutorials'
      },
      {
        icon: faFileArchive,
        text: en['Archives'],
        url: '/archives',
        disabled: true
      },
      {
        icon: faSearch,
        text: 'Resources',
        url: '/resources'
      }
    ];
  }
  if (role === 'stationAdmin') {
    return [
      {
        icon: faSitemap,
        text: en['Topologies'],
        url: '/topology'
      },
      {
        icon: faBookOpen,
        text: en['Lessons'],
        url: '/materials'
      },
      {
        icon: faLaptopCode,
        text: en['Devices'],
        url: '/devices',
        disabled: false
      },
      {
        icon: faPhotoVideo,
        text: en['Galleries'],
        url: '/galleries'
      },
      // {
      //   icon: faBooks,
      //   text: en['Libraries'],
      //   url: '/libraries'
      // },
      // {
      //   icon: faBookReader,
      //   text: en['My Library'],
      //   url: '/mymaterials'
      // },
      {
        icon: faInfoCircle,
        text: en['Tutorials'],
        url: '/tutorials'
      },
      {
        icon: faFileArchive,
        text: en['Archives'],
        url: '/archives',
        disabled: true
      },
      {
        icon: faSearch,
        text: 'Resources',
        url: '/resources'
      }
    ];
  }

  return [];
};
