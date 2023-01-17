import React from 'react';
import { Box, Select, Button, MenuItem, InputLabel } from '@material-ui/core';
import useStyles from './style';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { useLessonViewModeContext } from '@app/providers/LessonViewModeContext';
import { en } from '@app/language';

const SettingForm = ({ handleClose }) => {
  const pageCounts = [5, 10, 15, 20, 25, 30];
  const lessonViewModes = ['List View', 'Card View'];
  const { pageCount, setPageCount } = usePageCountContext();
  const { lessonViewMode, setLessonViewMode } = useLessonViewModeContext();
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <InputLabel id="demo-simple-select-label">Page Count: &nbsp;</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={pageCount}
        onChange={(e) => {
          setPageCount(e.target.value);
        }}
        label="PageCount"
        inputProps={{
          style: { fontSize: 14 }
        }}
      >
        {pageCounts.map((item, index) => (
          <MenuItem value={parseInt(item)} key={'pageCnt' + index}>
            {parseInt(item)}
          </MenuItem>
        ))}
      </Select>
      <InputLabel id="lesson-view-mode-label" style={{ marginTop: '30px' }}>
        {en['Lesson View Mode']}
      </InputLabel>
      <Select
        labelId="lesson-view-mode-label"
        id="lesson-view-mode-select"
        value={lessonViewMode}
        onChange={(e) => setLessonViewMode(e.target.value)}
        label={en['Lesson View Mode']}
        inputProps={{
          style: { fontSize: 14 }
        }}
        style={{ marginBottom: '30px' }}
      >
        {lessonViewModes.map((item, index) => (
          <MenuItem value={item} key={'setting' + index}>
            {item}
          </MenuItem>
        ))}
      </Select>
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          size="large"
          label="end"
          className={classes.saveBtn}
          onClick={handleClose}
        >
          {en['Close']}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingForm;
