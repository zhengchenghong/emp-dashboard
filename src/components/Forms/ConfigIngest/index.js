/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import graphql from '@app/graphql';
import { useMutation, useLazyQuery } from '@apollo/client';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { create, remove } from '@app/utils/ApolloCacheManager';
import { Delete } from '@material-ui/icons';
import { CustomCheckBox, CustomDialog } from '@app/components/Custom';
import AccessConfigForm from '../AccessConfig';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';

function ConfigIngest({ createAccessConfig, setCreateAccessConfig, district }) {
  const [accessConfigs, setAccessConfigs] = useState([]);
  const [accessConfig, setAccessConfig] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAccessConfig, setSelectedAccessConfig] = useState(null);
  const [check, setCheck] = useState(false);

  const { notify } = useNotifyContext();
  const [currentUser] = useUserContext();

  const [
    getCanvasData,
    { loading: canvasLoading, error: canvasError, data: canvasData }
  ] = useLazyQuery(graphql.queries.grouping, {
    fetchPolicy: 'network-only'
  });

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    update: create
  });

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, 'currentRowId')
  });

  const fetchCanvasData = async () => {
    await getCanvasData({
      variables: {
        schemaType: 'accessConfig',
        parentId: district?._id
      }
    });
  };

  useEffect(() => {
    async function fetchCanvasDataForDistrict() {
      await fetchCanvasData();
    }
    if (district?._id) {
      fetchCanvasDataForDistrict();
    }
  }, [district]);

  const handleAccessConfigForm = async (type, value) => {
    if (!value) {
      setCreateAccessConfig(false);
      return;
    }
    if (
      !accessConfig.baseUrl ||
      !accessConfig.clientId ||
      !accessConfig.secretkey ||
      !accessConfig.redirectUri
    ) {
      const notiOps = getNotificationOpt(
        'userlist',
        'error',
        'validAccessConfig'
      );
      notify(notiOps.message, notiOps.options);
    } else {
      await createGrouping({
        variables: {
          version: 1,
          schemaType: 'accessConfig',
          name: accessConfig.baseUrl,
          parentId: district?._id,
          data: {
            canvas: accessConfig
          },
          trackingAuthorName: currentUser?.name
        }
      });
      await fetchCanvasData();
    }
    setCreateAccessConfig(false);
  };

  useEffect(() => {
    fetchCanvasData();
  }, []);

  useEffect(() => {
    if (!canvasLoading && !canvasError && canvasData) {
      setAccessConfigs(canvasData.grouping);
    }
  }, [canvasLoading, canvasError, canvasData]);

  const handleTableChange = async (type, value) => {
    if (type === 'delete') {
      setSelectedAccessConfig(value);
      setOpenDeleteDialog(true);
    }
  };

  const handleDelete = async (type, value) => {
    if (!value) {
      setCheck(false);
      setOpenDeleteDialog(false);
      return;
    }
    if (!check && value) {
      const notiOps = getNotificationOpt('material', 'warning', 'delete');
      notify(notiOps.message, notiOps.options);
      return;
    }
    await deleteDocument({
      variables: {
        id: selectedAccessConfig._id,
        schemaType: selectedAccessConfig.schemaType
      }
    });
    await fetchCanvasData();
    setOpenDeleteDialog(false);
    setCheck(false);
  };

  const handleAccessConfigInput = (type, value) => {
    console.log('accessConfig', accessConfig);
    setAccessConfig({
      ...accessConfig,
      [type]: value
    });
  };

  const renderTableBody = (data) => {
    return data?.map((accessConfig) => {
      return (
        <TableRow>
          <TableCell>{accessConfig.data.canvas.baseUrl}</TableCell>
          <TableCell>{accessConfig.data.canvas.clientId}</TableCell>
          <TableCell>{accessConfig.data.canvas.secretkey}</TableCell>
          <TableCell>{accessConfig.data.canvas.redirectUri}</TableCell>
          <TableCell>
            <IconButton
              size="small"
              onClick={() => handleTableChange('delete', accessConfig)}
            >
              <Delete />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });
  };
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left">{'Base Url'}</TableCell>
                <TableCell align="left">{'Client ID'}</TableCell>
                <TableCell align="left">{'Secret Key'}</TableCell>
                <TableCell align="left">{'Redirect URI'}</TableCell>
                <TableCell align="left">{'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderTableBody(accessConfigs)}</TableBody>
          </Table>
        </TableContainer>
      </div>

      <CustomDialog
        mainBtnName={'Add'}
        dismissBtnName={null}
        secondaryBtnName={'CANCEL'}
        open={createAccessConfig}
        title={'Add new canvas configuration'}
        onChange={handleAccessConfigForm}
      >
        <AccessConfigForm
          onInputChange={handleAccessConfigInput}
          canvas={accessConfig}
        />
      </CustomDialog>

      <CustomDialog
        open={openDeleteDialog}
        title={'Do you want to delete this canvas instance?'}
        mainBtnName="Delete"
        onChange={handleDelete}
      >
        {'Are you sure want to delete this data?'}
        <br />
        <CustomCheckBox
          color="primary"
          value={check}
          label={'I agree with this action.'}
          onChange={(value) => setCheck(!value)}
        />
      </CustomDialog>
    </div>
  );
}

export default ConfigIngest;
