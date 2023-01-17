/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Paper,
  IconButton,
  Button,
  TextField,
  Typography
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
import { useQuery, useMutation } from '@apollo/client';
import graphql from '@app/graphql';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import useStyles from './style';
import { useErrorContext } from '@app/providers/ErrorContext';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';

const getRowId = (row) => row.id;

const PhoneFormatter = ({ value }) => value.replace(/\s+/g, '-') || null;

const phoneHandle = (value, onValueChange, setErrors, errors) => {
  if (value.substring(0, 2) !== '+1') {
    if (value !== '+') {
      value = `+1 ${value}`;
    }
    value = '+1';
  }

  if (value.length > 15) {
    return;
  }

  if (value.length === 15 && value.split(' ').length - 1 !== 3) {
    setErrors((errors) => ({
      ...errors,
      phone: { error: true, helperText: 'The phone number is not valid' }
    }));
  } else {
    if (value.length !== 15 || value.length === 0) {
      setErrors((errors) => ({
        ...errors,
        phone: { error: true, helperText: 'Phone number must contain 10digits' }
      }));
    } else {
      setErrors((errors) => ({
        ...errors,
        phone: { error: false, helperText: null }
      }));
    }
  }

  const newValue = new AsYouType().input(value);
  onValueChange(newValue);
  return newValue;
};

const PhoneEditor = ({ value, onValueChange }) => {
  const classes = useStyles();
  const [errors, setErrors] = useErrorContext();
  return (
    <TextField
      id="standard-basic"
      className={classes.textfield}
      error={errors?.phone?.error}
      name="phone"
      helperText={errors?.phone?.helperText}
      value={value}
      onChange={(event) =>
        phoneHandle(event.target.value, onValueChange, setErrors, errors)
      }
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

const userHandle = (value, onValueChange, setErrors, errors) => {
  if (!validateEmail(value)) {
    setErrors((errors) => ({
      ...errors,
      user: { error: true, helperText: 'Username must be an email' }
    }));
  } else {
    setErrors((errors) => ({
      ...errors,
      user: { error: false, helperText: null }
    }));
  }

  onValueChange(value);
  return value;
};

const UserEditor = ({ value, onValueChange }) => {
  const classes = useStyles();
  const [errors, setErrors] = useErrorContext();
  return (
    <TextField
      id="standard-basic"
      className={classes.textfield}
      error={errors?.user?.error}
      name="name"
      helperText={errors?.user?.helperText}
      value={value}
      onChange={(event) =>
        userHandle(event.target.value, onValueChange, setErrors, errors)
      }
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

const UserTable = ({
  schemaType,
  loadedData,
  setLoadedData,
  resources,
  parentId,
  handleWhenState,
  addedRows,
  setAddedRows,
  rowChanges,
  setRowChanges,
  setEditingRowIds,
  editingRowIds
}) => {
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [pageSizes] = useState([5, 10, 15]);
  const { notify } = useNotifyContext();
  const [isAddDisable, setIsAddDisable] = useState(false);
  const [PhoneColumns] = useState(['phone']);
  const [UserColumns] = useState(['name']);
  const [setErrors] = useErrorContext();
  const [openDelete, setOpenDelete] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [deletedUser, setDeletedUser] = useState();
  const [currentUser] = useUserContext();

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  const [createGrouping] = useMutation(graphql.mutations.createGrouping);
  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument);

  const { loading, error, data } = useQuery(graphql.queries.userGrouping, {
    variables: {
      id: null,
      schemaType: schemaType,
      parentId: parentId,
      offset: null,
      name: null
    }
  });

  useEffect(() => {
    if (!loading && !error) {
      const { grouping } = data;
      setLoadedData(grouping);
      const tmp = grouping.map((el) => {
        let phoneNumber = null;
        try {
          phoneNumber = parsePhoneNumber(el.contact?.phone).format(
            'INTERNATIONAL'
          );
        } catch (err) {
          phoneNumber = null;
        }
        return {
          id: el['_id'],
          name: el.name,
          firstName: el.contact?.firstName,
          lastName: el.contact?.lastName,
          email: el.contact?.email,
          phone: phoneNumber
        };
      });

      setRows(tmp);
    }
  }, [loading, error, data]);

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
    const [errors] = useErrorContext();
    return (
      <IconButton
        onClick={(event) =>
          errors?.user?.error || errors?.phone?.error
            ? console.log('')
            : onExecute(event)
        }
        title="Save changes"
      >
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

  const [columns] = useState([
    { name: 'name', title: 'Username/Email' },
    { name: 'phone', title: 'Phone' },
    { name: 'firstName', title: 'First Name' },
    { name: 'lastName', title: 'Last Name' },
    { name: 'email', title: 'Email' }
  ]);

  const [tableColumnExtensions] = useState([
    { columnName: 'name' },
    { columnName: 'firstName' },
    { columnName: 'lastName' },
    { columnName: 'phone' },
    { columnName: 'email' }
  ]);

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
        if (Object.keys(added[0]).length === 0) {
          setIsAddDisable(false);
          setErrors((errors) => ({
            ...errors,
            user: { error: true, helperText: 'Invalid user info' }
          }));
          return false;
        } else {
          setErrors((errors) => ({
            ...errors,
            user: { error: false, helperText: null }
          }));
        }

        if (!added[0].name) {
          setIsAddDisable(false);
          setErrors((errors) => ({
            ...errors,
            user: { error: true, helperText: 'Username is required' }
          }));
          return false;
        } else {
          setErrors((errors) => ({
            ...errors,
            user: { error: false, helperText: null }
          }));
        }

        if (
          added[0].phone?.length === 15 &&
          added[0].phone?.length > 0 &&
          added[0].phone?.split(' ').length - 1 !== 3
        ) {
          setIsAddDisable(false);
          setErrors((errors) => ({
            ...errors,
            phone: { error: true, helperText: 'The phone number is not valid' }
          }));
          return;
        } else {
          if (added[0].phone?.length !== 15 && added[0].phone?.length > 0) {
            setIsAddDisable(false);
            setErrors((errors) => ({
              ...errors,
              phone: {
                error: true,
                helperText: 'Phone number must contain 10 digits'
              }
            }));
            return;
          } else {
            setErrors((errors) => ({
              ...errors,
              phone: { error: false, helperText: null }
            }));
          }
        }

        let topology = resources?.topology;
        if (topology) {
          delete topology['__typename'];
        }

        await createGrouping({
          variables: {
            schemaType: schemaType,
            version: 1,
            name: added[0]?.name,
            trackingAuthorName: currentUser?.name,
            parentId: parentId,
            topology: topology,
            contact: {
              firstName: added[0]?.firstName,
              lastName: added[0]?.lastName,
              phone: parsePhoneNumberFromString(added[0].phone, 'INTERNATIONAL')
                ?.number,
              email: added[0]?.email
            }
          }
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
        setRows(changedRows);
      }

      if (changed) {
        const changedkey = Object.keys(changed)[0];
        const changedValue = changed[changedkey];
        const tmp = loadedData.find((el) => el['_id'] === changedkey);

        let topology = resources?.topology;
        if (topology) {
          delete topology['__typename'];
        }

        if (tmp && changedValue) {
          await updateGrouping({
            variables: {
              id: tmp['_id'],
              schemaType: schemaType,
              version: tmp.version,
              trackingAuthorName: currentUser?.name,
              parentId: tmp.parentId ? tmp.parentId : parentId,
              topology: topology,
              name: changedValue.name ? changedValue.name : tmp.name,
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
        setRows(changedRows);
      }

      if (deleted) {
        setDeletedUser(deleted);
        setOpenDelete(true);
      }
    } catch (error) {
      console.log(error.message);
      setIsAddDisable(false);
      handleWhenState('update', false);
      const notiOps = getNotificationOpt('backend', 'error', 'update');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleDeleteDialogChange = async (type, value) => {
    try {
      if (type === 'btnClick') {
        if (!checkbox && value) {
          const notiOps = getNotificationOpt('user', 'warning', 'delete');
          notify(notiOps.message, notiOps.options);
          return;
        }
        if (checkbox && value) {
          setIsAddDisable(false);
          const deletedSet = new Set(deletedUser);
          const tmp = loadedData.find((el) => el['_id'] === deletedUser[0]);
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
          const changedRows = rows.filter((row) => !deletedSet.has(row.id));
          setRows(changedRows);
        }
        setCheckbox(false);
        setOpenDelete(false);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt('user', 'error', 'delete');
      notify(notiOps.message, notiOps.options);
    }
  };

  return (
    <Paper className={classes.root}>
      <Grid rows={rows} columns={columns} getRowId={getRowId}>
        <PagingState />

        <UserProvider for={UserColumns} />
        <PhoneProvider for={PhoneColumns} />
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
      <CustomDialog
        open={openDelete}
        title="Do you want to delete this user?"
        mainBtnName="Remove"
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">
          This action will take the removing all info related to current user.
        </Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label="I agree with this action."
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
    </Paper>
  );
};

export default UserTable;
