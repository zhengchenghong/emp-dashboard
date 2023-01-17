import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { MainPanel } from '@app/components/Panels';
import { faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Grid
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { CustomDialog, CustomInput } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import { globaluseStyles } from '@app/constants/globalStyles';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { useUserContext } from '@app/providers/UserContext';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { CustomSelectBox } from '@app/components/Custom';

const MessageMain = ({
  selectedDocId,
  selectedItem,
  variables,
  resources,
  createGrouping,
  updateGrouping,
  onChange,

  createNew,
  setCreateNew
}) => {
  const classes = globaluseStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [openCreate, setOpenCreate] = useState(false);
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [newElName, setNewElName] = useState('');
  const [buttonDisable, setButtonDisable] = useState(false);
  const [currentUser] = useUserContext();
  const [openRename, setOpenRename] = useState(false);
  const isSmallScreen = useSmallScreen();
  const [selectedMessageId, setSelectedMessageId] = useState();

  useEffect(() => {
    setCreateDialogSetting({
      error: false,
      helpText: en['Please choose one state']
    });
  }, []);

  useEffect(() => {
    if (createNew) {
      handleMainPanelChange('create');
      setCreateNew(false);
    }
  }, [createNew]);

  useEffect(() => {
    if (resources?.length) {
      if (selectedMessageId) {
        let selectedMessage = resources.find(
          (el) => el?._id === selectedMessageId
        );
        if (!selectedMessage) {
          setSelectedMessageId(resources[0]?._id);
        }
      } else {
        setSelectedMessageId(resources[0]?._id);
      }
    }
  }, [resources]);

  const handleMainPanelChange = (value) => {
    if (value === 'rename') {
      setNewElName(selectedItem && selectedItem?.name);
      setOpenRename(true);
    }
    if (value === 'create') setOpenCreate(true);
  };

  const handleElClicked = (type, value) => {
    if (type === 'single') {
      onChange('elSingleClick', value);
      setSelectedMessageId(value?._id);
    }
  };

  const handleCreateDialogChange = async (type, value) => {
    try {
      if (type === 'input') {
        setNewElName(value);
        setCreateDialogSetting({
          error: false,
          helperText: en['Please enter the new Message name']
        });
      }
      if (type === 'btnClick') {
        if (value) {
          if (openRename) {
            const result = await updateGrouping({
              variables: {
                name: newElName,
                version: selectedItem?.version,
                trackingAuthorName: currentUser?.name,
                id: selectedItem?._id,
                schemaType: selectedItem?.schemaType,
                updatedAt: selectedItem?.updatedAt
              }
            });
            handleElClicked('single', result?.data?.updateGrouping);
            const notiOps = getNotificationOpt('message', 'success', 'rename');
            enqueueSnackbar(notiOps.message, notiOps.options);
          } else {
            let startAtTimeStamp = new Date().getTime();
            let endAtTimeStamp = new Date().getTime() + 24 * 3600 * 1000;
            var startAt = new Date(startAtTimeStamp);
            var endAt = new Date(endAtTimeStamp);
            const schedule = {
              startAt: startAt && startAt.toISOString(),
              endAt: endAt && endAt.toISOString(),
              status: 'active'
            };

            const result = await createGrouping({
              variables: {
                ...variables,
                schedule,
                name: newElName,
                trackingAuthorName: currentUser?.name,
                version: 1
              }
            });
            const notiOps = getNotificationOpt('message', 'success', 'create');
            enqueueSnackbar(notiOps.message, notiOps.options);
            handleElClicked('single', result?.data?.createGrouping);
          }
        }
        setOpenRename(false);
        setOpenCreate(false);
        setNewElName('');
      }
    } catch (error) {
      console.log(error.message);
      setNewElName('');
      setButtonDisable(false);
      if (error.message.includes('Name exists')) {
        setCreateDialogSetting({
          error: true,
          helpText: en['Name exists already. Name must be unique.'],
          autoFocus: true
        });
      }
    }
  };

  return (
    <>
      {isSmallScreen ? (
        <CustomSelectBox
          size="small"
          style={clsx({
            [classes.mainListSelectBox]: true
          })}
          variant="filled"
          resources={resources}
          onChange={(value) => handleElClicked('single', value)}
          defaultValue={resources[0]?._id ?? null}
          value={selectedMessageId ?? null}
          // value={resources[0]?._id ?? null}
          noPadding={false}
          isMainList={true}
          disableUnderline={true}
        />
      ) : (
        <MainPanel
          title={en['Messages']}
          icon={faCommentAlt}
          showAddBtn
          canAdd
          onChange={handleMainPanelChange}
        >
          <List className={classes.elementList}>
            {resources &&
              resources.map((el) => (
                <ListItem
                  key={el?._id}
                  onClick={() => handleElClicked('single', el)}
                  onDoubleClick={() => handleMainPanelChange('rename', el)}
                  className={clsx(classes.listItems, {
                    [classes.listItem]: el?._id !== selectedDocId,
                    [classes.listItemSelected]: el?._id === selectedDocId
                  })}
                >
                  <ListItemText className={classes.listItemText}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      component={Typography}
                      variant="subtitle1"
                    >
                      <span
                        className={clsx({
                          [classes.listItemText]: el?._id !== selectedDocId,
                          [classes.listSelectedItemText]:
                            el?._id === selectedDocId
                        })}
                      >
                        {el.name}
                      </span>
                    </Box>
                  </ListItemText>
                </ListItem>
              ))}
          </List>
        </MainPanel>
      )}
      <CustomDialog
        mainBtnName={en['Create']}
        open={openCreate}
        title={en['Create a new Message']}
        onChange={handleCreateDialogChange}
        customClass={classes.customDialogContent}
      >
        <CustomInput
          type="text"
          label={en['Enter Message Name *']}
          value={newElName}
          onChange={(value) => handleCreateDialogChange('input', value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleCreateDialogChange('btnClick', event.target.value);
            }
          }}
          error={createDialogSetting.error}
          helperText={createDialogSetting.helperText}
          fullWidth
          variant="outlined"
          size="small"
          width="300px"
          autoFocus={true}
        />
      </CustomDialog>

      <CustomDialog
        mainBtnName={en['Rename']}
        open={openRename}
        customClass={classes.customDialogContent}
        title={en['Rename Message']}
        onChange={handleCreateDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <CustomInput
            my={2}
            size="small"
            type="text"
            label={`Enter the Message name *`}
            autoFocus={true}
            value={newElName}
            onChange={(value) => handleCreateDialogChange('input', value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateDialogChange('btnClick', event.target.value);
              }
            }}
            error={createDialogSetting.error}
            fullWidth
            helperText=""
            variant="outlined"
            width="300px"
          />
        </Grid>
      </CustomDialog>
    </>
  );
};

export default MessageMain;
