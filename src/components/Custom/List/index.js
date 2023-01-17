import React, { useState } from 'react';
import clsx from 'clsx';
import {
  List,
  ListItem,
  ListItemText,
  Box,
  Typography
} from '@material-ui/core';
import useStyles from './style';

const CustomList = ({ resources, isBold, onClick, onDoubleClick, onBlur }) => {
  const [selected, setSelected] = useState();
  const classes = useStyles();

  const handleElClicked = (event, index) => {
    event.preventDefault();
    const element = resources[index];
    setSelected(index);
    onClick(element);
  };

  const handleDoubleClick = (e, el) => {
    e.preventDefault();
    onDoubleClick(el);
  };

  return (
    <div className={classes.root} onBlur={onBlur}>
      <List className={classes.elementList}>
        {resources && resources.length > 0 ? (
          resources.map((el, index) => (
            <ListItem
              key={index}
              button
              onClick={(e) => handleElClicked(e, index)}
              className={clsx(classes.listItems, {
                [classes.listItemTextSelected]: selected === index,
                [classes.listItemText]: selected !== index
              })}
            >
              <ListItemText onDoubleClick={(e) => handleDoubleClick(e, el)}>
                <span style={{ fontWeight: isBold ? 700 : 400 }}>
                  {el.name}
                </span>
              </ListItemText>
            </ListItem>
          ))
        ) : (
          <Box
            component={Typography}
            variant="subtitle1"
            textAlign="center"
            color="red"
          >
            No Data
          </Box>
        )}
      </List>
    </div>
  );
};

export default CustomList;
