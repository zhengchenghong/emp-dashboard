/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import ResourcesEdit from './Edit';
import graphql from '@app/graphql';
import material from '@app/constants/Notifications/material';

const ResourcesContainer = ({ history }) => {
  const [allMaterials, setAllMaterails] = useState();
  const [getMaterials, { loading, error, data }] = useLazyQuery(
    graphql.queries.MaterialGrouping,
    {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    }
  );

  useEffect(() => {
    async function loadMaterials() {
      await getMaterials({
        variables: {
          schemaType: 'material',
          sortBy: 'rank'
        }
      });
    }

    loadMaterials();
  }, []);

  useEffect(() => {
    if (!loading && !error && data) {
      const { grouping } = data;
      setAllMaterails(grouping);
    }
  }, [loading, error, data]);

  return <ResourcesEdit materials={allMaterials} />;
};

export default withRouter(ResourcesContainer);
