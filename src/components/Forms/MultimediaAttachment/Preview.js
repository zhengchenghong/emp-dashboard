import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import DocViewer, {
  PDFRenderer,
  PNGRenderer,
  MSDocRenderer
} from 'react-doc-viewer';

const MultimediaAttachmentPreview = ({ resources }) => {
  const { mimeType: type, baseUrl, fileDir, fileName } = resources;
  const [assetUrl, setAssetUrl] = useState(null);

  useEffect(() => {
    const url = `${baseUrl}${fileDir}${fileName}`;
    getAssetUrlFromS3(url).then((res) => {
      setAssetUrl(res);
    });
  }, [baseUrl, fileDir, fileName]);

  return (
    <React.Fragment>
      {type?.includes('video') && (
        <Box
          mt="2"
          borderRadius="2px"
          component="video"
          controls
          autoPlay
          width="100%"
          src={assetUrl}
        />
      )}

      {type?.includes('image') && (
        <Box
          mt="2"
          borderRadius="2px"
          component="img"
          controls
          autoPlay
          width="100%"
          src={assetUrl}
        />
      )}

      {type?.includes('pdf') && (
        <>
          <DocViewer
            key={assetUrl}
            pluginRenderers={[PDFRenderer, PNGRenderer]}
            documents={[{ uri: assetUrl, fileType: 'pdf' }]}
          />
        </>
      )}

      {(type?.includes('document') || type?.includes('msword')) && (
        <>
          <DocViewer
            key={assetUrl}
            pluginRenderers={[MSDocRenderer]}
            documents={[{ uri: `${assetUrl}` }]}
          />
        </>
      )}
    </React.Fragment>
  );
};

export default MultimediaAttachmentPreview;
