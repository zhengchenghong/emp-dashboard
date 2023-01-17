import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Divider,
  Typography,
  TextField,
  Button,
  IconButton
} from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import { DefaultCard } from '@app/components/Cards';
import CloseIcon from '@material-ui/icons/Close';
import useStyles from './style';
import { en } from '@app/language';

const CategoryForm = ({ resources, onChange }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState([]);

  const handleInputChange = (type, value, index) => {
    let items = [...formData];
    let item = { ...items[index] };

    item[type] = value;
    items[index] = { ...item };
    setFormData(items);
    onChange(items);
  };

  useEffect(() => {
    if (resources) {
      setFormData(resources);
    }
  }, [resources]);

  const handleAddContact = () => {
    setFormData([
      ...formData,
      {
        category: '',
        subCategory: ''
      }
    ]);
  };

  const handleDelete = (value) => {
    const tmp = formData.filter((el, index) => index !== value);
    setFormData(tmp);
  };

  return (
    <DefaultCard className={classes.root}>
      <main className={classes.content}>
        {formData &&
          formData.map((el, index) => (
            <div key={index} className={classes.elCategoryInfo}>
              <Box
                className={classes.inputArea}
                component={TextField}
                value={el.category}
                onChange={(e) =>
                  handleInputChange('category', e.target.value, index)
                }
                label={en['Category']}
                variant="outlined"
                size="small"
              />
              <Box
                className={classes.inputArea}
                component={TextField}
                value={el.subCategory}
                onChange={(e) =>
                  handleInputChange('subCategory', e.target.value, index)
                }
                label={en['SubCategory']}
                variant="outlined"
                size="small"
              />
              <IconButton size="small" onClick={() => handleDelete(index)}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </div>
          ))}
      </main>
      <Box display="flex" justifyContent="center">
        <Button
          variant="contained"
          className={classes.btnAdd}
          color="primary"
          onClick={handleAddContact}
        >
          <Add />
          {en['Add Category']}
        </Button>
      </Box>
    </DefaultCard>
  );
};

export default CategoryForm;
