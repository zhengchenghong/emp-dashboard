/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import Pagination from '@material-ui/lab/Pagination';
import { Box } from '@material-ui/core';
import graphql from '@app/graphql';
import { useLazyQuery } from '@apollo/client';
import { usePaginationContext } from '@app/providers/Pagination';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { useFilterContext } from '@app/providers/FilterContext';
import { useLessonViewModeContext } from '@app/providers/LessonViewModeContext';

const CustomPagination = ({ userInfo, cardViewList, handlePagination }) => {
  const [totalCount, setTotalCount] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [classVariables] = usePaginationContext();
  const [classWithoutAuthorVariables] = usePaginationContext();
  const [, , , , pageNumber, setPageNumber] = usePaginationContext();
  const { pageCount, setPageCount } = usePageCountContext();
  const { filterStateValue, filteredStationId, filteredDistrictId } =
    useFilterContext();
  const { selectedClassItem, lessonViewMode } = useLessonViewModeContext();

  const [getTotalCount, { data: totalPageCount }] = useLazyQuery(
    graphql.queries.totalCount
  );

  useEffect(() => {
    fetchTotalCount();
  }, []);

  useEffect(() => {
    setTotalCount(totalPageCount?.totalCount);
  }, [totalPageCount]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalCount / pageCount));
    if (!cardViewList) {
      userInfo?.schemaType === 'sysAdmin' ||
      userInfo?.schemaType === 'superAdmin'
        ? handlePagination({
            ...classWithoutAuthorVariables,
            schemaType: 'class',
            offset: pageCount * (pageNumber - 1),
            limit: pageCount
          })
        : handlePagination({
            ...classVariables,
            schemaType: 'class',
            authorId:
              userInfo?.schemaType === 'educator' ? userInfo?._id : null,
            offset: pageCount * (pageNumber - 1),
            limit: pageCount,
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
                : userInfo?.schemaType === 'schoolAdmin'
                ? {
                    station: userInfo?.topology?.station,
                    district: userInfo?.topology?.district,
                    school: userInfo?.parentId
                  }
                : null,
            schoolId:
              userInfo?.schemaType === 'schoolAdmin'
                ? userInfo?.parentId
                : null,
            districtId:
              userInfo?.schemaType === 'districtAdmin'
                ? userInfo?.parentId
                : null,
            stationId:
              userInfo?.schemaType === 'stationAdmin'
                ? userInfo?.parentId
                : userInfo?.topology?.station
          });
    }
  }, [pageCount, pageNumber, totalCount, lessonViewMode]);

  const fetchTotalCount = async () => {
    const totalClassVariables =
      userInfo?.schemaType === 'sysAdmin' ||
      userInfo?.schemaType === 'superAdmin'
        ? {
            schemaType: 'class',
            topology: {
              station:
                filteredStationId && filteredStationId !== 'all'
                  ? filteredStationId
                  : null,
              state:
                filterStateValue && filterStateValue !== 'all'
                  ? filterStateValue
                  : null,
              district:
                filteredDistrictId && filteredDistrictId !== 'all'
                  ? filteredDistrictId
                  : null
            }
          }
        : {
            schemaType: 'class',
            authorId:
              userInfo?.schemaType === 'educator' ? userInfo?._id : null,
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
                : userInfo?.schemaType === 'schoolAdmin'
                ? {
                    station: userInfo?.topology?.station,
                    district: userInfo?.topology?.district,
                    school: userInfo?.parentId
                  }
                : null
          };

    if (cardViewList) {
      await getTotalCount({
        variables: {
          schemaType: 'material',
          parentId: selectedClassItem?._id
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    } else {
      await getTotalCount({
        variables: totalClassVariables,
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
      });
    }
  };

  useEffect(() => {
    fetchTotalCount();
  }, [
    classVariables,
    classWithoutAuthorVariables,
    filterStateValue,
    filteredStationId,
    filteredDistrictId,
    selectedClassItem,
    lessonViewMode
  ]);

  useEffect(() => {
    setPageNumber(1);
  }, [filterStateValue, filteredStationId, filteredDistrictId]);

  const handlePageNumberChange = (e, v) => {
    setPageNumber(v);
  };

  return (
    <Box
      display="table"
      alignItems="center"
      justifyContent="flex-start"
      margin="auto"
    >
      <Pagination
        count={totalPage}
        size="small"
        page={pageNumber}
        siblingCount={0}
        showFirstButton
        showLastButton
        onChange={handlePageNumberChange}
      />
    </Box>
  );
};

export default CustomPagination;
