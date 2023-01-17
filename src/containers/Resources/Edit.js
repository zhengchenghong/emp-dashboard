import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { EditPanel } from '@app/components/Panels';
import * as globalStyles from '@app/constants/globalStyles';
import { LibraryTable } from '@app/components/Tables';
import { en } from '@app/language';
import { useGalleryContext } from '@app/providers/GalleryContext';

const loadedData = [
  {
    schemaType: 'resource',
    type: null
  },
  {
    schemaType: 'resource',
    type: 'PBS'
  },
  {
    schemaType: 'resource',
    type: 'OER'
  },
  {
    schemaType: 'sharedLesson',
    type: null
  }
];
const ResourcesEdit = ({ history, materials }) => {
  const [canUpdate, setCanUpdate] = useState(false);
  const [sourceType, setSourceType] = useState('all');
  const [searchAction, setSearchAction] = useState(false);
  const [reset, setReset] = useState(false);
  const { setOpenRight, setGalleryChildren, setGalleryData } =
    useGalleryContext();
  const [resourceType, setResourceType] = useState(loadedData[0]);
  const [tagList, setTagList] = useState();
  const [searchStr, setSearchStr] = useState();

  useEffect(() => {
    setOpenRight(false);
    setGalleryData((data) => ({ ...data, title: '' }));
    setGalleryChildren(null);
  }, []);

  const getGrades = () => {
    return [
      'Preschool',
      'Lower Primary (K-2)',
      'Upper Primary (3-5)',
      'Middle School',
      'High School',
      'Community College',
      'College',
      'Graduate',
      'Career'
    ];
  };

  const handleSearchChange = async (type, value) => {
    if (type === 'search') {
      setSearchAction(true);
    }
  };

  const handleEditPanelChange = async (type, value) => {
    if (type === 'grade') {
    }

    if (type === 'info') {
      // setOpenInfo(true);
    }

    if (type === 'search') {
      setSearchAction(true);
    }

    if (type === 'reset') {
      setReset(true);
    }

    if (type === 'searchTag') {
      setSearchStr(value);
    }

    if (type === 'tagList') {
      if (value == null || value === '') {
        setTagList(null);
      } else {
        setTagList([value]);
      }
    }

    if (type === 'contentType') {
      if (value === 'All Resources') {
        setSourceType('all');
      } else if (value === 'PBS LearningMedia') {
        setSourceType('PBS');
        setResourceType(loadedData[1]);
      } else if (value === 'OER Commons') {
        setSourceType('OER');
        setResourceType(loadedData[2]);
      } else if (value === 'Shared Lessons') {
        setSourceType('material');
        setResourceType(loadedData[3]);
      }
    }

    if (type === 'key') {
      setSearchAction(true);
    }
  };

  useEffect(() => {
    if (reset) {
      setSourceType('all');
      setTagList(null);
      setSearchStr();
      // setSearchAction(true);
      // setInterval(setSearchAction(true), 500);
    }
  }, [reset]);

  return (
    <EditPanel
      title={en['Resources']}
      page={'Resources'}
      canSearch={true}
      canReset
      canUpdate={canUpdate}
      resourceReset={reset}
      setReSourceReset={setReset}
      onSearch={handleSearchChange}
      onChange={handleEditPanelChange}
      gradeResources={getGrades()}
    >
      <Grid
        spacing={globalStyles.GridSpacingStyles}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={12} sm={12} md={12} lg={12} container spacing={4}>
          <LibraryTable
            library={loadedData[0]}
            pageMenu={'Resources'}
            sourceType={sourceType}
            searchAction={searchAction}
            setSearchAction={setSearchAction}
            searchKey={searchStr}
            tagList={tagList}
            reset={reset}
            setReset={setReset}
            materials={materials}
          />
        </Grid>
      </Grid>
    </EditPanel>
  );
};

export default ResourcesEdit;
