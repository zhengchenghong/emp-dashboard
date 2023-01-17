/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Paper,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem
} from '@material-ui/core';
import {
  EditingState,
  PagingState,
  SortingState,
  IntegratedSorting,
  IntegratedPaging,
  DataTypeProvider
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableEditRow,
  TableEditColumn,
  PagingPanel
} from '@devexpress/dx-react-grid-material-ui';
import {
  AsYouType,
  parsePhoneNumberFromString,
  parsePhoneNumber
} from 'libphonenumber-js';
import { MultiTagsForm } from '@app/components/Forms';
import { useQuery, useMutation } from '@apollo/client';
import graphql from '@app/graphql';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import useStyles from './style';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';

const getRowId = (row) => row.id;

const PhoneFormatter = ({ value }) =>
  (value && value.replace(/\s+/g, '-')) || null;

const phoneVerify = (value) => {
  if (!value) {
    return false;
  }
  if (value.length === 15 && value.split(' ').length - 1 !== 3) {
    return false;
  } else {
    if (value.length !== 15 || value.length === 0) {
      return false;
    }
  }
  return true;
};

const phoneHandle = (value, onValueChange) => {
  if (value.substring(0, 2) !== '+1') {
    if (value !== '+') {
      value = `+1 ${value}`;
    }
    value = '+1';
  }

  if (value.length > 15) {
    return;
  }

  const newValue = new AsYouType().input(value);
  onValueChange(newValue);
  return newValue;
};

const PhoneEditor = ({ value, onValueChange }) => {
  return (
    <TextField
      id="standard-basic"
      error={phoneVerify(value) ? false : true}
      name="phone"
      helperText={
        phoneVerify(value)
          ? ''
          : value?.length !== 15
          ? 'Phone number must contain 10digits'
          : 'The phone number is not valid'
      }
      value={value}
      onChange={(event) => phoneHandle(event.target.value, onValueChange)}
    />
  );
};

const PhoneProvider = (props) => (
  <DataTypeProvider
    formatterComponent={PhoneFormatter}
    editorComponent={PhoneEditor}
    {...props}
  />
);

const UserFormatter = ({ value }) => value || null;

const validateEmail = (email) => {
  const re =
    // eslint-disable-next-line max-len
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const userHandle = (value, onValueChange) => {
  onValueChange(value);
  return value;
};

const UserEditor = ({ value, onValueChange }) => {
  return (
    <TextField
      id="standard-basic"
      error={validateEmail(value) ? false : true}
      name="name"
      helperText={
        validateEmail(value)
          ? ''
          : value?.length
          ? 'username must be an email'
          : 'required'
      }
      value={value}
      onChange={(event) => userHandle(event.target.value, onValueChange)}
    />
  );
};

const UserProvider = (props) => (
  <DataTypeProvider
    formatterComponent={UserFormatter}
    editorComponent={UserEditor}
    {...props}
  />
);

const AdminUserTable = ({
  schemaType,
  loadedData,
  setLoadedData,
  updateValue,
  filterValue,
  setFilterValue,
  parentId,
  handleWhenState,
  addedRows,
  setAddedRows,
  rowChanges,
  setRowChanges,
  setEditingRowIds,
  editingRowIds,
  userTypeData
}) => {
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [pageSizes] = useState([5, 10, 15]);
  const { notify } = useNotifyContext();
  const [isAddDisable, setIsAddDisable] = useState(false);
  const [PhoneColumns] = useState(['phone']);
  const [UserTypeSelectColumns] = useState(['type']);
  const [UserColumns] = useState(['name']);
  const [columns, setColumns] = useState([]);
  const [currentUser] = useUserContext();

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  const [createGrouping] = useMutation(graphql.mutations.createGrouping);
  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument);

  const { loading, error, data, refetch } = useQuery(
    graphql.queries.userGrouping,
    {
      variables: {
        id: null,
        schemaType: schemaType,
        parentId: parentId,
        offset: null,
        name: null
      },
      pollInterval: 0
    }
  );

  useEffect(() => {
    if (updateValue) {
      refetch();
    }
  }, [updateValue]);

  const getTypeLabel = (value) => {
    if (value === 'stationAdmin') return 'Station';
    if (
      value === 'districtAdmin' ||
      value === 'educator' ||
      value === 'student'
    )
      return 'District';
    if (value === 'schoolAdmin') return 'School';
    return 'Type';
  };

  useEffect(() => {
    if (!loading && !error) {
      let { grouping } = data;
      if (filterValue && filterValue !== 'all') {
        grouping = grouping.filter((item) => item.parentId === filterValue);
        setLoadedData(grouping.filter((item) => item.parentId === filterValue));
      } else {
        setLoadedData(grouping);
      }

      const tmp = grouping.map((el) => {
        let phoneNumber = null;
        try {
          phoneNumber = parsePhoneNumber(el.contact?.phone).format(
            'INTERNATIONAL'
          );
        } catch (err) {
          phoneNumber = null;
        }

        let userSelectType = userTypeData.filter(
          (ele) => ele.value === el.parentId
        );
        return {
          id: el['_id'],
          name: el.name,
          firstName: el.contact?.firstName,
          lastName: el.contact?.lastName,
          email: el.contact?.email,
          phone: phoneNumber,
          type: userSelectType[0]?.label || ''
        };
      });

      setRows(tmp);
      setColumns(
        schemaType === 'sysAdmin'
          ? [
              { name: 'name', title: 'Username/Email' },
              { name: 'firstName', title: 'First Name' },
              { name: 'lastName', title: 'Last Name' },
              { name: 'phone', title: 'Phone' },
              { name: 'email', title: 'Email' }
            ]
          : schemaType === 'student'
          ? [
              { name: 'name', title: 'Username/Email' },
              { name: 'firstName', title: 'First Name' },
              { name: 'lastName', title: 'Last Name' },
              { name: 'phone', title: 'Phone' },
              { name: 'email', title: 'Email' },
              { name: 'type', title: getTypeLabel(schemaType) },
              { name: 'class', title: 'Classes' }
            ]
          : [
              { name: 'name', title: 'Username/Email' },
              { name: 'firstName', title: 'First Name' },
              { name: 'lastName', title: 'Last Name' },
              { name: 'phone', title: 'Phone' },
              { name: 'email', title: 'Email' },
              { name: 'type', title: getTypeLabel(schemaType) }
            ]
      );
    }
  }, [loading, error, data, filterValue, updateValue]);

  const UserTypeSelector = ({ value, onValueChange }) => {
    const userValue = userTypeData.find(
      (item) => item.label === value || item.value === value
    );

    return (
      <>
        <Select
          id="user-type-selector"
          value={
            userValue
              ? userValue?.value
              : userTypeData?.length
              ? userTypeData[0]?.value
              : null
          }
          style={{ minWidth: '80px' }}
          onChange={(event) => onValueChange(event.target.value)}
        >
          {userTypeData.map((item, index) => (
            <MenuItem
              value={item.value}
              key={index}
              selected={value === item.value}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </>
    );
  };

  const UserTypeSelectProvider = (props) => (
    <DataTypeProvider
      formatterComponent={UserFormatter}
      editorComponent={UserTypeSelector}
      {...props}
    />
  );

  const AddButton = ({ onExecute }) => (
    <div style={{ textAlign: 'center' }}>
      <Button color="primary" onClick={onExecute} title="Create new row">
        New
      </Button>
    </div>
  );

  const EditButton = ({ onExecute }) => {
    return (
      <IconButton
        onClick={(event) => {
          handleWhenState('update', true);
          onExecute(event);
        }}
        title="Edit row"
      >
        <EditIcon />
      </IconButton>
    );
  };

  const DeleteButton = ({ onExecute }) => (
    <IconButton
      onClick={() => {
        onExecute();
      }}
      title="Delete row"
    >
      <DeleteIcon />
    </IconButton>
  );

  const CommitButton = ({ onExecute }) => {
    return (
      <IconButton onClick={(event) => onExecute(event)} title="Save changes">
        <SaveIcon />
      </IconButton>
    );
  };

  const CancelButton = ({ onExecute }) => {
    return (
      <IconButton
        color="secondary"
        onClick={() => {
          setIsAddDisable(false);
          onExecute();
        }}
        title="Cancel changes"
      >
        <CancelIcon />
      </IconButton>
    );
  };

  const Command = ({ id, onExecute }) => {
    const CommandButton = commandComponents[id];
    return <CommandButton onExecute={onExecute} />;
  };

  const commandComponents = {
    add: AddButton,
    edit: EditButton,
    delete: DeleteButton,
    commit: CommitButton,
    cancel: CancelButton
  };

  const [tableColumnExtensions] = useState([]);

  useEffect(() => {
    setIsAddDisable(false);
    setAddedRows([]);
  }, [parentId]);

  const changeAddedRows = (value) => {
    handleWhenState('update', true);
    if (value.length > 0) setIsAddDisable(true);
    const initialized = value.map((row) => {
      if (Object.keys(row).includes('phone')) {
        row = {
          ...row,
          phone: new AsYouType().input(row['phone'])
        };
      }

      return Object.keys(row).length ? row : {};
    });
    setAddedRows(initialized);
  };

  const commitChanges = async ({ added, changed, deleted }) => {
    try {
      let changedRows;
      if (added) {
        if (!validateEmail(added[0]?.name)) {
          const notiOps = getNotificationOpt('admin', 'error', 'username');
          notify(notiOps.message, notiOps.options);
          setIsAddDisable(false);
          return false;
        }

        if (!phoneVerify(added[0]?.phone)) {
          const notiOps = getNotificationOpt('admin', 'error', 'phone');
          notify(notiOps.message, notiOps.options);
          setIsAddDisable(false);
          return false;
        }

        let adminVariables = {
          schemaType: schemaType,
          version: 1,
          name: added[0]?.name,
          trackingAuthorName: currentUser?.name,
          parentId:
            schemaType === 'sysAdmin'
              ? null
              : added[0]?.type
              ? added[0]?.type
              : userTypeData?.length
              ? userTypeData[0].value
              : null,
          contact: {
            firstName: added[0]?.firstName,
            lastName: added[0]?.lastName,
            phone: parsePhoneNumberFromString(added[0].phone, 'INTERNATIONAL')
              ?.number,
            email: added[0]?.email
          }
        };

        await createGrouping({
          variables: adminVariables
        });

        handleWhenState('update', false);

        const notiOps = getNotificationOpt('admin', 'success', 'create');
        notify(notiOps.message, notiOps.options);

        setIsAddDisable(false);
        const startingAddedId =
          rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
        changedRows = [
          ...rows,
          ...added.map((row, index) => ({
            id: startingAddedId + index,
            ...row
          }))
        ];
      }

      if (changed) {
        const changedkey = Object.keys(changed)[0];
        const changedValue = changed[changedkey];
        const tmp = loadedData.find((el) => el['_id'] === changedkey);
        if (tmp && changedValue) {
          if (!(changedValue.name === undefined)) {
            if (!validateEmail(changedValue.name)) {
              const notiOps = getNotificationOpt('admin', 'error', 'username');
              notify(notiOps.message, notiOps.options);
              setIsAddDisable(false);
              return false;
            }
          }

          if (!(changedValue.phone === undefined)) {
            if (!phoneVerify(changedValue.phone)) {
              const notiOps = getNotificationOpt('admin', 'error', 'phone');
              notify(notiOps.message, notiOps.options);
              setIsAddDisable(false);
              return false;
            }
          }

          await updateGrouping({
            variables: {
              id: tmp['_id'],
              schemaType: schemaType,
              version: tmp.version,
              trackingAuthorName: currentUser?.name,
              name: changedValue.name ? changedValue.name : tmp.name,
              parentId: changedValue.type
                ? changedValue.type
                : tmp.parentId
                ? tmp.parentId
                : userTypeData?.length
                ? userTypeData[0].value
                : null,
              contact: {
                ...tmp.contact,
                firstName: changedValue.firstName
                  ? changedValue.firstName
                  : tmp.contact?.firstName,
                lastName: changedValue.lastName
                  ? changedValue.lastName
                  : tmp.contact?.lastName,
                email: changedValue.email
                  ? changedValue.email
                  : tmp.contact?.email,
                phone: changedValue.phone
                  ? changedValue.phone
                  : tmp.contact?.phone
              }
            }
          });

          handleWhenState('update', false);
          const notiOps = getNotificationOpt('admin', 'success', 'update');
          notify(notiOps.message, notiOps.options);
        }

        changedRows = rows.map((row) =>
          changed[row.id] ? { ...row, ...changed[row.id] } : row
        );
      }

      if (deleted) {
        setIsAddDisable(false);
        const deletedSet = new Set(deleted);
        const tmp = loadedData.find((el) => el['_id'] === deleted[0]);
        if (tmp) {
          await deleteDocument({
            variables: {
              id: tmp['_id'],
              schemaType: schemaType
            }
          });
          handleWhenState('update', false);
          const notiOps = getNotificationOpt('admin', 'success', 'delete');
          notify(notiOps.message, notiOps.options);
        }
        changedRows = rows.filter((row) => !deletedSet.has(row.id));
      }
      setRows(changedRows);
    } catch (error) {
      console.log(error.message);
      setIsAddDisable(false);
      handleWhenState('update', false);
      const notiOps = getNotificationOpt('backend', 'error', 'delete');
      notify(notiOps.message, notiOps.options);
    }
  };

  return (
    <Paper className={classes.root}>
      <Grid rows={rows} columns={columns} getRowId={getRowId}>
        <PagingState />

        <UserProvider for={UserColumns} />
        <PhoneProvider for={PhoneColumns} />
        {schemaType !== 'sysAdmin' && (
          <UserTypeSelectProvider
            for={UserTypeSelectColumns}
            resources={userTypeData}
          />
        )}

        <EditingState
          editingRowIds={editingRowIds}
          onEditingRowIdsChange={setEditingRowIds}
          rowChanges={rowChanges}
          onRowChangesChange={setRowChanges}
          addedRows={addedRows}
          onAddedRowsChange={changeAddedRows}
          onCommitChanges={commitChanges}
        />
        <SortingState
          defaultSorting={[
            { name: 'id', direction: 'asc' },
            { name: 'name', direction: 'asc' },
            { name: 'firstName', direction: 'asc' },
            { name: 'lastName', direction: 'asc' },
            { name: 'email', direction: 'asc' }
          ]}
        />
        <IntegratedSorting />
        <IntegratedPaging />
        <Table columnExtensions={tableColumnExtensions} />
        <TableHeaderRow showSortingControls={true} />
        <TableEditRow />
        <TableEditColumn
          width={100}
          showAddCommand={!isAddDisable}
          showEditCommand
          showDeleteCommand
          commandComponent={Command}
        />
        <PagingPanel pageSizes={pageSizes} />
      </Grid>
    </Paper>
  );
};

export default AdminUserTable;
