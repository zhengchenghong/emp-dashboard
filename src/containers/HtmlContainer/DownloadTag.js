import { useState, useEffect } from 'react';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';

const DownloadTag = ({ resource, imgSrc }) => {
  const [assetURL, setAssetURL] = useState(null);
  const { mimeType: type, baseUrl, fileDir, fileName } = resource;

  useEffect(() => {
    const url = `${baseUrl}${fileDir}${fileName}`;
    getAssetUrlFromS3(url).then((res) => {
      setAssetURL(res);
    });
  }, []);

  return (
    <div className="doc-item">
      <a href={assetURL} target="_blank" rel="noreferrer">
        <img src={imgSrc} />
        <span>{resource?.title || resource?.fileName}</span>
      </a>
    </div>
  );
};

export default DownloadTag;
