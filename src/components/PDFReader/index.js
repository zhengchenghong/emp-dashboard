/* eslint-disable max-len */
import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { Document, Page, pdfjs } from 'react-pdf';
import useStyles from './style';
import './style.css';

// // Core viewer
// import { Viewer } from '@react-pdf-viewer/core';

// // Plugins
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// // Import styles
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PDFReader = ({ url }) => {
  const classes = useStyles();
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <Box className={classes.root} display="flex" justifyContent="center">
      {/* <Document
        className={classes.content}
        file={`${url}`}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={console.error}
      >
        <Page scale={1} width={450} pageNumber={pageNumber} />
      </Document> */}
      <div style={{ width: '100%' }}>
        <nav>
          <button onClick={goToPrevPage}>Prev</button>
          <button onClick={goToNextPage}>Next</button>
        </nav>

        <div
          style={{
            height: 'calc(100vh - 400px)',
            overflow: 'auto',
            width: '100%'
          }}
        >
          <Document
            className={classes.content}
            file={`${url}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={console.error}
          >
            <Page
              scale={1}
              pageNumber={pageNumber}
              style={{
                width: '100%',
                maxHeight: 'calc(100vh - 400px) !important'
              }}
            />
          </Document>
        </div>

        <p>
          Page {pageNumber} of {numPages}
        </p>
      </div>
    </Box>
  );
};

export default PDFReader;
