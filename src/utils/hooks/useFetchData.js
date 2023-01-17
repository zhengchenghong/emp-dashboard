import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import graphql from '@app/graphql';

// to fetch any data by providing variables to it
const useFetchData = (variables) => {
  const [loadedData, setLoadedData] = useState();
  const [selectedData, setSelectedData] = useState();

  const { loading, error, data } = useQuery(graphql.queries.grouping, {
    variables
  });

  useEffect(() => {
    if (!loading && !error) {
      const { grouping } = data;
      setLoadedData(grouping);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, data]);

  return [
    loadedData,
    setLoadedData,
    selectedData,
    setSelectedData,
    loading,
    error,
    data
  ];
};

export default useFetchData;
