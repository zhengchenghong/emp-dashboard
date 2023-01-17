import React, { useState } from 'react';
import { LoadingCard } from '@app/components/Cards';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getDisplayName } from '@app/utils/functions';
import { en } from '@app/language';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
}));

const ListStudent = ({ canShow, loading, resources, onChange }) => {
  const classes = useStyles();
  const [selected, setSelected] = useState(0);

  const handleListItemClick = (value) => {
    if (value != null) {
      setSelected(value);
      onChange(value);
    }
  };

  return (
    <Box mt={2}>
      <LoadingCard loading={loading} style={classes.root}>
        <List component="nav" aria-label="secondary mailbox folder">
          {canShow &&
            (resources?.length > 0 ? (
              resources?.map((el) => (
                <ListItem
                  button
                  selected={el?._id === selected?._id}
                  onClick={() => handleListItemClick(el)}
                >
                  <ListItemText>{getDisplayName(el?.name)}</ListItemText>
                </ListItem>
              ))
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                component={Typography}
                variant="subtitle1"
              >
                {en['No data to display']}
              </Box>
            ))}
        </List>
      </LoadingCard>
    </Box>
  );
};

export default ListStudent;
