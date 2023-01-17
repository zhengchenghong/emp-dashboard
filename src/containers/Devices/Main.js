/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { MainPanel } from '@app/components/Panels';
import { faLaptopCode } from '@fortawesome/pro-solid-svg-icons';
import { CircularProgress, Box } from '@material-ui/core';
import * as globalStyles from '@app/constants/globalStyles';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';
import { en } from '@app/language';
import { useSmallScreen } from '@app/utils/hooks';
import DraggableTreeView from '@app/components/DraggableTreeView';
import { CustomDragableTreeSelectBox } from '@app/components/Custom';

const DeviceMain = ({
  onChange,
  selectedTreeItem,
  setSelectedTreeItem,
  stationLoadedData
}) => {
  const classes = globalStyles.globaluseStyles();
  const isSmallScreen = useSmallScreen();

  const [nodeStations, setNodeStations] = useState();

  const handleElClicked = (type, value) => {
    if (type === 'single') {
      setSelectedTreeItem(value);
      onChange('elSingleClick', value);
    }
    if (type === 'root') onChange('root', value);
  };

  useEffect(() => {
    let tmp = [];
    stationLoadedData?.forEach((element) => {
      tmp.push({
        ...element,
        childrenIdList: null
      });
    });
    setNodeStations(tmp?.sort((a, b) => (a.name > b.name ? 1 : -1)));
  }, [stationLoadedData]);

  return (
    <>
      {isSmallScreen ? (
        <CustomDragableTreeSelectBox
          selectedTreeItem={selectedTreeItem}
          showFilters={false}
        >
          <DraggableTreeView
            resources={null}
            onClick={handleElClicked}
            selectedTreeItem={selectedTreeItem}
            classLoadedData={nodeStations}
            isDevices={true}
          />
        </CustomDragableTreeSelectBox>
      ) : (
        <MainPanel
          title={en['Devices']}
          icon={faLaptopCode}
          showFilter={true}
          showAddBtn
          disableAddBtn={
            selectedTreeItem
              ? selectedTreeItem?.schemaType === 'class'
                ? true
                : false
              : true
          }
          selectedTreeItem={selectedTreeItem}
        >
          <div className={classes.elementList}>
            {!stationLoadedData || stationLoadedData.length === 0 ? (
              <Box display="flex" justifyContent="center">
                <CircularProgress size={30} my={5} />
              </Box>
            ) : (
              <DraggableTreeView
                resources={null}
                onClick={handleElClicked}
                selectedTreeItem={selectedTreeItem}
                classLoadedData={nodeStations}
                isDevices={true}
                expandedIds={[]}
              />
            )}
          </div>
        </MainPanel>
      )}
    </>
  );
};

export default DeviceMain;
