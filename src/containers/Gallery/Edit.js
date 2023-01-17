/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { EditPanel } from '@app/components/Panels';
import { GalleryTable } from '@app/components/Tables';
import { getNotificationOpt } from '@app/constants/Notifications';
import * as globalStyles from '@app/constants/globalStyles';
import { useNotifyContext } from '@app/providers/NotifyContext';
import useStylesSearch from '../User/searchStyle';
import UserSearch from '@app/components/Forms/UserList/Search';
import GalleryMain from './Main';

const GalleryEdit = ({ forceSave, resources }) => {
  const [createNew, setCreateNew] = useState(false);
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [isTabReset, setIsTabReset] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isResetSearch, setResetSearch] = useState();

  useEffect(() => {
    if (resources) {
      setTitle(resources.name);
      setDetailData({
        ...detailData,
        state: resources.data?.state || '',
        body: resources.data?.body || null
      });
      setResetSearch(true);
      setSearchValue('');
    }
  }, [resources]);

  useEffect(() => {
    if (forceSave) {
      handleEditPanelChange('save');
    }
  }, [forceSave]);

  const handleShowPanel = async (value) => {
    setIsTabReset(false);
  };

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'new') {
        setCreateNew(true);
        return;
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('pbs', 'error', 'update');
      notify(notiOps.message, notiOps.options);
    }
  };

  const searchHandle = (value) => {
    setSearchValue(value);
  };

  return (
    <EditPanel
      title={title}
      page="Galleries"
      hideAction={true}
      isTabReset={isTabReset}
      canNew={true}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      UserSearch={
        <UserSearch
          isResetSearch={isResetSearch}
          setResetSearch={setResetSearch}
          type={title}
          useStyles={useStylesSearch}
          onChange={(value) => searchHandle(value)}
        />
      }
    >
      <Grid
        spacing={globalStyles.GridSpacingStyles}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <GalleryTable
            contentType={title}
            schemaType={resources['schemaType']}
            createNew={createNew}
            setCreateNew={setCreateNew}
            searchValue={searchValue}
          />
        </Grid>
      </Grid>
    </EditPanel>
  );
};

export default GalleryEdit;
