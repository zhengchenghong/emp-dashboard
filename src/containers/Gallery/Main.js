import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useMutation } from '@apollo/client';
import { MainPanel } from '@app/components/Panels';
import { faPhotoVideo } from '@fortawesome/free-solid-svg-icons';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@material-ui/core';
import { CustomDialog, CustomInput } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import graphql from '@app/graphql';
import * as globalStyles from '@app/constants/globalStyles';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { CustomSelectBox } from '@app/components/Custom';

const GalleryMain = ({ selectedDocId, resources, onChange }) => {
  const classes = globalStyles.globaluseStyles();
  const { notify } = useNotifyContext();
  const [openCreate, setOpenCreate] = useState(false);
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [newElName, setNewElName] = useState('');
  const [currentUser] = useUserContext();

  const [createGrouping] = useMutation(graphql.mutations.createGrouping);
  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    setCreateDialogSetting({
      error: false,
      helperText: en['Please enter the new PBS name']
    });
  }, []);

  const handleCreateDialogChange = async (type, value) => {
    try {
      if (type === 'input') {
        setNewElName(value);
        setCreateDialogSetting({
          error: false,
          helperText: en['Please enter the new PBS name']
        });
      }
      if (type === 'btnClick') {
        if (value) {
          await createGrouping({
            variables: {
              name: newElName,
              trackingAuthorName: currentUser?.name
            }
          });
          const notiOps = getNotificationOpt('pbs', 'success', 'create');
          notify(notiOps.message, notiOps.options);
        }
        setOpenCreate(false);
        setNewElName('');
      }
    } catch (error) {
      console.log(error.message);
      setCreateDialogSetting({
        error: true,
        helpText: en['This pbs already exist!']
      });
      const notiOps = getNotificationOpt('pbs', 'error', 'create');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleMainPanelChange = (value) => {
    if (value === 'create') setOpenCreate(true);
  };

  const handleElClicked = (value) => {
    onChange('elSingleClick', value);
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
          onChange={handleElClicked}
          defaultValue={1}
          noPadding={false}
          isMainList={true}
          disableUnderline={true}
        />
      ) : (
        <MainPanel
          title={en['Galleries']}
          icon={faPhotoVideo}
          onChange={handleMainPanelChange}
        >
          <List className={classes.elementList}>
            {resources &&
              resources.map((el) => (
                <ListItem
                  key={el['_id']}
                  onClick={() => handleElClicked(el)}
                  className={clsx(classes.listItems, {
                    [classes.listItem]: el['_id'] !== selectedDocId,
                    [classes.listItemSelected]: el['_id'] === selectedDocId
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
                          [classes.listItemText]: el['_id'] !== selectedDocId,
                          [classes.listSelectedItemText]:
                            el['_id'] === selectedDocId
                        })}
                      >
                        {el.name}
                      </span>
                    </Box>
                  </ListItemText>
                </ListItem>
              ))}
          </List>
          <CustomDialog
            mainBtnName="Create"
            open={openCreate}
            title={en['Create a new pbs']}
            onChange={handleCreateDialogChange}
          >
            <CustomInput
              my={2}
              size="small"
              type="text"
              label={en['Enter the pbs name']}
              value={newElName}
              onChange={(value) => handleCreateDialogChange('input', value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleCreateDialogChange('btnClick', event.target.value);
                }
              }}
              error={createDialogSetting.error}
              helperText={createDialogSetting.helperText}
              variant="outlined"
              width="300px"
            />
          </CustomDialog>
        </MainPanel>
      )}
    </>
  );
};

export default GalleryMain;
