import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@material-ui/core';
import useStyles from './style';
import { en } from '@app/language';

const TableForm = ({ header, resources, showMode }) => {
  const classes = useStyles();

  return (
    <TableContainer
      component={Paper}
      style={showMode === 'preview' ? { height: '25vh' } : { height: '100vh' }}
    >
      <Table className={classes.table} aria-label="custom pagination table">
        <TableHead>
          <TableRow>
            {header.map((element, index) => (
              <TableCell align="center" key={index}>
                {element}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {resources.length > 0 ? (
            resources.map((row) => {
              const keys = Object.keys(row);
              return (
                <TableRow key={row.name}>
                  {keys.map((el, index) => (
                    <TableCell
                      component="th"
                      scope="row"
                      align="center"
                      key={index}
                    >
                      {row[el]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              component={Typography}
              variant="subtitle1"
            >
              {en['No data to display']}
            </Box>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableForm;
