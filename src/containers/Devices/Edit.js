/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { EditPanel } from '@app/components/Panels';
import { CustomDialog } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import * as globalStyles from '@app/constants/globalStyles';
import JSONEditor from '@app/components/JSONEditor';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { en } from '@app/language';
import DeviceTable from '@app/components/Tables/Device';

const DeviceEdit = ({ resources, stationLoadedData }) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [openAbort, setOpenAbort] = useState(false);
  const [showAddDeviceDlg, setShowAddDeviceDlg] = useState(false);
  const [updateValue, setUpdateValue] = useState(false);

  const [openInfo, setOpenInfo] = useState(false);
  const [filterValue, setFilterValue] = useState('all');
  const [clearFilter, setClearFilter] = useState();

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'addDevice') {
        setShowAddDeviceDlg(true);
        return;
      }
      if (type === 'clearFilter') {
        setClearFilter(true);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt(
        resources?.schemaType,
        'error',
        'update'
      );
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleFilter = (value) => {
    setFilterValue(value);
  };

  useEffect(() => {
    setFilterValue('all');
  }, [resources]);

  var user = {
    id: resources?._id,
    parentId: resources?.parentId,
    version: resources?.version
  };
  localStorage.removeItem('user');
  localStorage.setItem('user', JSON.stringify(user));

  return (
    <EditPanel
      title={resources?.name}
      page={'Devices'}
      schemaType={resources?.schemaType}
      onChange={handleEditPanelChange}
      canClearFilters={true}
      canEdit={true}
    >
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <DeviceTable
          type={'device'}
          canUpload={true}
          disable={false}
          showAddDeviceDlg={showAddDeviceDlg}
          setShowAddDeviceDlg={setShowAddDeviceDlg}
          updateValue={updateValue}
          doc={resources}
          docId={resources?._id}
          stationLoadedData={stationLoadedData}
          onFilter={handleFilter}
          filterValue={filterValue}
          isDevicesMenu={true}
          clearFilter={clearFilter}
          setClearFilter={setClearFilter}
        />
      </Grid>
      <CustomDialog
        open={openAbort}
        title={en["Can't delete the data."]}
        secondaryBtnName={en['Ok']}
        onChange={() => setOpenAbort(false)}
      >
        <Typography variant="h6">
          {en['There is an active user using this, so it cannot be deleted.']}
        </Typography>
      </CustomDialog>
      <CustomDialog
        open={openInfo}
        title={en['Information']}
        maxWidth="sm"
        fullWidth={true}
        customClass={classes.infoDialogContent}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor disable={false} resources={resources} />
        </Grid>
      </CustomDialog>
    </EditPanel>
  );
};

export default DeviceEdit;
