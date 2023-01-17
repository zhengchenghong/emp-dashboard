import React from 'react';
import clsx from 'clsx';
import { MainPanel } from '@app/components/Panels';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@material-ui/core';
import * as globalStyles from '@app/constants/globalStyles';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { CustomSelectBox } from '@app/components/Custom';

const LibraryMain = ({ selectedDocId, variables, resources, onChange }) => {
  const classes = globalStyles.globaluseStyles();
  const isSmallScreen = useSmallScreen();

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
        <MainPanel title={en['Libraries']} icon={faUpload}>
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
        </MainPanel>
      )}
    </>
  );
};

export default LibraryMain;
