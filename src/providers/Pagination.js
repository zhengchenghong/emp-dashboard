import React, { useState, useContext } from 'react';
import { useUserContext } from '@app/providers/UserContext';

const PaginationContext = React.createContext(null);
PaginationContext.displayName = 'PaginationContext';

const PaginationContextProvider = ({ ...props }) => {
  const [currentUser] = useUserContext();

  const userInfo = currentUser || null;
  const [classVariables, setClassVariables] = useState({
    schemaType: 'class',
    authorId: userInfo?.schemaType === 'educator' ? userInfo?._id : null,
    offset: null,
    limit: null,

    topology:
      userInfo?.schemaType === 'stationAdmin'
        ? {
            station: userInfo?.parentId
          }
        : userInfo?.schemaType === 'districtAdmin'
        ? {
            station: userInfo?.topology?.station,
            district: userInfo?.parentId
          }
        : null,

    // disctictId: userInfo?.schemaType === 'districtAdmin'
    //   ? userInfo?.parentId
    //   : null,
    stationId:
      userInfo?.schemaType === 'stationAdmin'
        ? userInfo?.parentId
        : userInfo?.topology?.station,
    districtId:
      userInfo?.schemaType === 'districtAdmin'
        ? userInfo?.parentId
        : userInfo?.topology?.district,
    schoolId:
      userInfo?.schemaType === 'schoolAdmin'
        ? userInfo?.parentId
        : userInfo?.topology?.school
  });

  const [classWithoutAuthorVariables, setClassWithoutAuthorVariables] =
    useState({
      schemaType: 'class',
      offset: null,
      limit: null
    });

  const [pageNumber, setPageNumber] = useState(1);

  const value = [
    classVariables,
    setClassVariables,
    classWithoutAuthorVariables,
    setClassWithoutAuthorVariables,
    pageNumber,
    setPageNumber
  ];

  return <PaginationContext.Provider value={value} {...props} />;
};

const usePaginationContext = () => {
  return useContext(PaginationContext);
};

export { PaginationContextProvider, usePaginationContext, PaginationContext };
