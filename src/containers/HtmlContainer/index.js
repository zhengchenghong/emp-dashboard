import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { getConfigParams } from '@app/utils/functions';
import { AUTH_USER_TOKEN_KEY } from '@app/utils/constants';
import config from '@app/Config';
import './style.css';
import Attachment_Icons_MOV_PMEP from '@app/styles/assets/Attachment_Icons_MOV_PMEP.png';
import Attachment_Icons_JPG_PMEP from '@app/styles/assets/Attachment_Icons_JPG_PMEP.png';
import Attachment_Icons_PDF_PMEP from '@app/styles/assets/Attachment_Icons_PDF_PMEP.png';
import Attachment_Icons_ZIP_PMEP from '@app/styles/assets/Attachment_Icons_ZIP_PMEP.png';
import Attachment_Icons_XLS_PMEP from '@app/styles/assets/Attachment_Icons_XLS_PMEP.png';
import Attachment_Icons_MP3_PMEP from '@app/styles/assets/Attachment_Icons_MP3_PMEP.png';
import icon_doc from '@app/styles/assets/icon-doc.png';
import PMEP from '@app/styles/assets/PMEP.png';
import IEI_LOGO from '@app/styles/assets/IEI_logo.png';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import {
  CustomInput,
  CustomDialog,
  CustomSelectBox
} from '@app/components/Custom';
import AttachmentPreview from '@app/components/Forms/MultimediaAttachment/Preview';
import DonwloadTag from './DownloadTag';
import { useApolloClient } from '@apollo/client';
import graphql from '@app/graphql';

function formatAMPM(hours, minutes) {
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

const HtmlContanier = ({ resources, classResources, handleClose }) => {
  const [ldashUrl, setLdashUrl] = useState();
  const [assetUrl, setAssetUrl] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [fileInfo, setFileInfo] = useState([]);
  const client = useApolloClient();

  useEffect(() => {
    const onLoad = async () => {
      try {
        const idToken = window.localStorage.getItem(AUTH_USER_TOKEN_KEY);
        const { assetBucketName, learnerBucketName } = await getConfigParams();

        const stationId =
          resources?.schemaType === 'station'
            ? resources?._id
            : resources?.topology?.station;
        let url = `https://${learnerBucketName}?bucketName=${assetBucketName}&stationId=${stationId}&token=${idToken}&aws_cognito_identity_pool_id=${config.aws.aws_cognito_identity_pool_id}&aws_user_pools_id=${config.aws.aws_user_pools_id}&aws_project_region=${config.aws.aws_project_region}`;
        console.log('Preview ===>', url);
        setLdashUrl(url, '_blank');
      } catch (err) {
        console.log(err);
      }
    };
    onLoad();
  }, []);

  useEffect(() => {
    const onLoad = async () => {
      try {
        let { data: stationItem } = await client.query({
          query: graphql.queries.nameGrouping,
          variables: {
            id: resources?.topology?.station,
            schemaType: 'station'
          }
        });

        if (stationItem) {
          let stationElement = stationItem?.grouping[0];
          if (String(stationElement?.avatar?.baseUrl).includes('http')) {
            const url =
              stationElement?.avatar?.baseUrl +
              stationElement?.avatar?.fileDir +
              stationElement?.avatar?.fileName;
            const assetUrl = await getAssetUrlFromS3(url, 0);
            setAssetUrl(assetUrl);
          } else {
            setAssetUrl(stationElement?.avatar?.baseUrl);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    onLoad();
  }, [resources]);

  const getFileTypeImage = (item) => {
    var docAvatarUrl = icon_doc;
    if (item?.type?.includes('video')) {
      docAvatarUrl = Attachment_Icons_MOV_PMEP;
    } else if (item?.type?.includes('image')) {
      docAvatarUrl = Attachment_Icons_JPG_PMEP;
    } else if (item?.type?.includes('pdf')) {
      docAvatarUrl = Attachment_Icons_PDF_PMEP;
    } else if (item?.type?.includes('zip')) {
      docAvatarUrl = Attachment_Icons_ZIP_PMEP;
    } else if (item?.type?.includes('xls')) {
      docAvatarUrl = Attachment_Icons_XLS_PMEP;
    } else if (item?.type?.includes('mp3')) {
      docAvatarUrl = Attachment_Icons_MP3_PMEP;
    }
    return docAvatarUrl;
  };

  const getLastUpdatedAt = (item) => {
    var dateStr = item?.updatedAt?.split('T')[0];
    var timeStr = item?.updatedAt?.split('T')[1];
    var dateArr = dateStr?.split('-');
    var timeArr = timeStr?.split(':');
    if (timeArr?.length > 1) {
      var formattedHour = formatAMPM(
        parseInt(timeArr[0]),
        parseInt(timeArr[1])
      );
      return (
        dateArr[1] + '/' + dateArr[2] + '/' + dateArr[0] + ' ' + formattedHour
      );
    } else return null;
  };

  const handlePreviewDialogChange = (type, value) => {
    if (type === 'btnClick') {
      if (value) {
        setFileInfo(false);
      }
      setOpenPreview(false);
    }
  };

  const handlePreview = (item) => {
    setFileInfo(item);
    setOpenPreview(true);
  };

  return resources?.schemaType === 'station' ||
    resources?.schemaType === 'class' ? (
    <Box width="100%" height="88vh">
      <iframe width="100%" height="100%" src={ldashUrl} />
    </Box>
  ) : (
    <Box width="100%" height="88vh">
      {/* <div className="screen-share">
          <span dangerouslySetInnerHTML={template} />
        </div> */}
      <div class="app-container">
        <a href="#banner-span" style={{ display: 'none' }}>
          Skip to main content
        </a>
        <div class="menu-bar">
          <a class="main-logo" href="./dashboard.html">
            <img src={IEI_LOGO} alt="PMEP" />
          </a>
        </div>

        <div class="main-container main-content">
          <div id="student-banner" style={{ display: 'block' }}>
            <img src="" alt="student" />
            <h1 id="banner-span" name="banner-span" class="student-desc__title">
              {resources?.desc?.title}
            </h1>
            <div id="lastUpdated">
              Last Updated: <span>{getLastUpdatedAt(resources)}</span>
            </div>
          </div>
          <div class="student-content">
            <div class="student-detail">
              <div id="student-desc" style={{ display: 'block' }}>
                <p
                  class="student-desc__short"
                  dangerouslySetInnerHTML={{ __html: resources?.desc?.short }}
                ></p>
                <p
                  class="student-desc__long"
                  dangerouslySetInnerHTML={{ __html: resources?.desc?.long }}
                ></p>
              </div>
              {resources?.body && (
                <div id="student-body" style={{ display: 'block' }}>
                  <div
                    dangerouslySetInnerHTML={{ __html: resources?.body }}
                  ></div>
                </div>
              )}
              <div class="div__more-info">
                <h2>Attachments</h2>
              </div>
              <div id="student-attachments-content">
                {resources?.multimediaAssets &&
                  resources?.multimediaAssets?.length > 0 &&
                  resources?.multimediaAssets.map((el) => {
                    if (
                      el?.mimeType?.includes('video') ||
                      el?.mimeType?.includes('image')
                    ) {
                      return (
                        <div class="doc-item">
                          <a href="#" onClick={() => handlePreview(el)}>
                            <img src={getFileTypeImage(el)} />
                            <span>{el?.title || el?.fileName}</span>
                          </a>
                        </div>
                      );
                    } else {
                      return (
                        <DonwloadTag
                          resource={el}
                          imgSrc={getFileTypeImage(el)}
                        />
                      );
                    }
                  })}
              </div>
              <a class="backToDash" onClick={handleClose}>
                Back to Dashboard
              </a>
            </div>
            <div id="student-attachments">
              <div class="div__contact-info">
                <h2>Your Teacher</h2>
                <p class="teacher teacher-fullname">
                  {resources?.contact
                    ? resources?.contact?.firstName +
                      ' ' +
                      resources?.contact?.lastName
                    : ''}
                </p>
                <p class="teacher teacher-email"></p>
                <p class="teacher teacher-phone"></p>
                <div class="div__course-info">
                  <p>
                    <span class="class-name">
                      {classResources
                        ? classResources?.find(
                            (el) => el._id === resources?.topology?.class
                          )?.name
                        : ''}
                    </span>
                  </p>
                  <p>
                    <span
                      class="school-name"
                      style={{ display: 'inline' }}
                    ></span>
                  </p>
                  <p>
                    <span
                      class="district-name"
                      style={{ display: 'inline' }}
                    ></span>
                  </p>
                </div>
              </div>
              <div class="div__pbs-learningmedia" style={{ display: 'none' }}>
                <hr />
                <p>This lesson contains resources from</p>
                <img title="PBS LearningMedia" src="./assets/pbslm-logo.svg" />
              </div>
              <hr />
              <div class="div__station-id">
                <h2>Technical Support</h2>
                <p>
                  Hotline: <a class="tel-station"></a>
                </p>
                <img class="img-station" alt="station" src={assetUrl} />
                <div class="copyright">©2022 PMEP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomDialog
        // mainBtnName={disable ? null : 'Update'}
        open={openPreview}
        title="Preview"
        onChange={handlePreviewDialogChange}
      >
        <AttachmentPreview resources={fileInfo} />
      </CustomDialog>
    </Box>
  );
};

export default HtmlContanier;
