import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Auth } from 'aws-amplify';
import graphql from '@app/graphql';
import { useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { useUserContext } from '@app/providers/UserContext';
import { getCurrentUTCTime } from '@app/utils/date-manager';
import { jsPDF } from 'jspdf';
import { clearLocalStorage, getConfigParams } from '@app/utils/functions';
import axios from 'axios';
import MyPDF from './eula_agree.pdf';
import { useSmallScreen } from '@app/utils/hooks';
import { useMediumScreen } from '@app/utils/hooks';

import {
  Paper,
  Box,
  CardContent,
  Button,
  Typography,
  Link
} from '@material-ui/core';
import './style.css';

const StationAdminEula = ({ fromSetting, onChange }) => {
  const history = useHistory();
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  const targetRef = useRef();
  const [agreementDocUrl, setAgreementDocUrl] = useState();
  const [currentUser, setCurrentUser, status, setStatus] = useUserContext();
  const [definedFileLink, setDefinedFileLink] = useState(false);
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();

  const fileName = 'Educator EULA with Content License Agreement.7.29.2021.pdf';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let parames = await getConfigParams();
    let docLink =
      'https://s3.us-east-2.amazonaws.com/' +
      parames.assetBucketName +
      '/config/' +
      fileName;
    axios
      .get(docLink)
      .then((response) => {
        setDefinedFileLink(true);
        setAgreementDocUrl(docLink);
      })
      .catch((error) => {
        setDefinedFileLink(false);
      });
  }, []);

  const onSignOut = async () => {
    await Auth.signOut();
    clearLocalStorage();
    history.push('/');
  };

  const onAgree = async () => {
    if (currentUser) {
      const timestamp = getCurrentUTCTime();
      const result = await updateGrouping({
        variables: {
          id: currentUser?._id,
          schemaType: currentUser?.schemaType,
          version: currentUser?.version,
          trackingAuthorName: currentUser?.name,
          status: 'active',
          loginInfo: {
            EULAsignedAt: timestamp,
            lastSeenAt: currentUser?.loginInfo?.lastSeenAt
              ? currentUser?.loginInfo?.lastSeenAt
              : timestamp,
            count: currentUser?.loginInfo?.count
          }
        }
      });
      if (result) {
        window.location.reload();
      }
    }
  };

  const onDownloadEula = async () => {
    var HTML_Width = document.getElementById('eulaDoc').offsetWidth;
    var HTML_Height = document.getElementById('eulaDoc').offsetHeight;
    var top_left_margin = 15;
    var PDF_Width = HTML_Width + top_left_margin * 2;
    var PDF_Height = PDF_Width * 1.4 + top_left_margin * 2;
    var canvas_image_width = HTML_Width;
    var canvas_image_height = HTML_Height;

    var totalPDFPages = Math.ceil(HTML_Height / (PDF_Width * 1.4)) - 1;

    html2canvas(document.getElementById('eulaDoc'), { allowTaint: true }).then(
      function (canvas) {
        canvas.getContext('2d');

        console.log(canvas.height + '  ' + canvas.width);

        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
        pdf.addImage(
          imgData,
          'JPG',
          top_left_margin,
          top_left_margin,
          canvas_image_width,
          canvas_image_height
        );

        for (var i = 1; i <= totalPDFPages; i++) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            'JPG',
            top_left_margin,
            -(PDF_Height * i) + top_left_margin * 4,
            canvas_image_width,
            canvas_image_height
          );
        }

        pdf.save('test.pdf');
      }
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 'flex'
      }}
    >
      {/* <DocViewer
        key={'1'}
        pluginRenderers={[PDFRenderer, PNGRenderer]}
        documents={[{ uri: MyPDF, fileType: 'pdf' }]}
      /> */}
      <Paper
        style={{
          maxHeight: '90vh',
          width: isSmallScreen ? '90%' : isMediumScreen ? '75%' : '55%',
          overflowY: 'scroll',
          overflowX: 'hidden',
          marginTop: isSmallScreen ? 30 : 30,
          paddingRight: isSmallScreen ? 0 : 70,
          paddingLeft: isSmallScreen ? 0 : 70,
          marginBottom: isSmallScreen ? 25 : 30,
          boxShadow: isSmallScreen ? 'none' : 'inherit'
        }}
      >
        <CardContent
          id="eulaDoc"
          ref={targetRef}
          style={{ padding: '16px 6px 0px' }}
        >
          <Typography
            variant="h5"
            style={{ textAlign: 'left', marginBottom: 20 }}
          >
            <Box fontWeight="fontWeightBold">
              Information Equity Initiative Privacy Notice
            </Box>
          </Typography>
          <Typography
            variant="body1"
            style={{ textAlign: 'left', marginBottom: 20 }}
          >
            <Box fontWeight="fontWeightBold" sx={{ fontStyle: 'italic', m: 1 }}>
              Last Updated: February 15, 2022
            </Box>
          </Typography>

          <Typography variant="body1" style={{ marginTop: 20 }}>
            <Box>
              Welcome and thank you for your interest in Information Equity
              Initiative (“
              <strong>
                <em>Information Equity</em>
              </strong>
              ”, “
              <strong>
                <em>we</em>
              </strong>
              ”, “
              <strong>
                <em>our</em>
              </strong>
              ” or “
              <strong>
                <em>us</em>
              </strong>
              ”). Information Equity is a non-profit organization that allows
              teachers, public health officials, and other curators to engage
              individuals and provide them with digital content without
              broadband access. Participants are provided with a simple antenna
              and device, typically distributed by their school district, that
              allows individuals to download digital content onto a Wi-Fi
              connected device, such as a tablet, phone, or computer.
            </Box>
            <br />
            <Box>
              This Privacy Notice explains how information about you, that
              directly identifies you, or that makes you identifiable (“
              <strong>
                <em>personal information</em>
              </strong>
              ”) is collected, used and disclosed by Information Equity in
              connection with the Information Equity websites and applications
              that post or link to this Privacy Notice, including our website
              &nbsp;
              <Link href="https://informationequity.org/" underline="always">
                https://informationequity.org/
              </Link>{' '}
              &nbsp; (collectively, the “
              <strong>
                <em>Site</em>
              </strong>
              ”), and our services offered in connection with the Site
              (collectively with the Site, the “
              <strong>
                <em>Service</em>
              </strong>
              ”).
            </Box>

            <Box>
              <strong>Learner Data</strong>: The educators, schools, school
              districts, public health facilities, incarceration facilities, and
              broadcasters (collectively, “
              <strong>
                <em>Curators</em>
              </strong>
              ”) that use our Service may upload data such as files, documents,
              videos, or images, to our Service, or we may collect data on their
              behalf, which may include personal information or data about the
              Curator’s end users, including teachers and learner data
              (collectively, “
              <strong>
                <em>Learner Data</em>
              </strong>
              ”). We have contractually committed ourselves to only process such
              information on behalf and under the instruction of the respective
              Curator. This Privacy Notice does not apply to such processing and
              we recommend you read the Privacy Notice of the respective Curator
              or contact such entity if the processing concerns your personal
              information. For more information, please see our&nbsp;
              <strong style={{ color: '#0080ff' }}>Learner Data </strong>
              section of this Privacy Notice.
            </Box>
          </Typography>

          <Typography
            variant="subtitle1"
            style={{ marginTop: 30, marginRight: 0 }}
          >
            <ol style={{ marginLeft: 0 }}>
              <li>
                <strong style={{ marginBottom: 10 }}>
                  How We Collect and Use Information
                </strong>
                <br />
                <br />
                <ul>
                  We collect personal information in connection with your visits
                  to and use of the Service. This collection includes
                  information that you provide in connection with the Service,
                  information from third parties, and information that is
                  collected automatically such as through the use of cookies and
                  other technologies.
                </ul>
                <br />
                <strong>
                  <u>Information That You Provide</u>
                </strong>
                <br />
                <br />
                <ul>
                  We may collect personal information from you. The categories
                  of information we collect can include:
                </ul>
                <br />
                <ul style={{ listStyleType: 'disc', marginLeft: 15 }}>
                  <li>
                    <strong>
                      <em>Service Inquiries. </em>
                    </strong>
                    We collect personal information that you provide when you
                    inquire about our Service. This information includes your
                    first name, last name, email, phone number, school
                    information, and any other information you provide,
                    including your interests in relation to our Service. We use
                    this information to communicate with you about your inquiry
                    or interests.
                  </li>
                  <br />
                  <li>
                    <strong>
                      <em>Registration Information. </em>
                    </strong>
                    We collect personal and/or business information that you
                    provide when you register for an account to use our Service,
                    including using the Educator Dashboard or Kiosk Dashboard.
                    This information may include your first and last name,
                    email, phone number, username, profile photo, and password.
                    We use this information to administer your account, provide
                    you with the relevant services and information, communicate
                    with you regarding your account, the Service, and for
                    customer support purposes.
                  </li>
                  <br />
                  <li>
                    <strong>
                      <em>Communications. </em>
                    </strong>
                    If you communicate with us through any paper or electronic
                    form, we may collect your name, email address, mailing
                    address, phone number, or any other personal information you
                    choose to provide to us. We use this information to
                    investigate and respond to your inquiries, and to
                    communicate with you, to enhance the services we offer to
                    our users and to manage and grow our organization. If you
                    register for our newsletters or updates, we may communicate
                    with you by email. To unsubscribe from promotional messages,
                    please follow the instructions within our messages and
                    review the
                    <strong style={{ color: '#0080ff' }}>
                      {' '}
                      Control Over Your Information{' '}
                    </strong>{' '}
                    section below.
                  </li>
                  <br />
                  <li>
                    <strong>
                      <em>Marketing Emails. </em>
                    </strong>
                    If you sign up to receive news or alerts from us, we collect
                    your email and applicable interests and communication
                    preferences in order to send you regular updates about the
                    Service. We use this information to manage our
                    communications with you and send you information about
                    services we think may be of interest to you. If you wish to
                    stop receiving email messages from us, simply click the
                    “unsubscribe link” provided at the bottom of the email
                    communication. Note that you cannot unsubscribe from certain
                    services-related email communications (e.g., account
                    verification, technical or legal notices).
                  </li>
                  <br />
                  <li>
                    <strong>
                      <em>Employment Applications. </em>
                    </strong>
                    If you apply for employment, we collect your contact and
                    demographic information, educational and work history,
                    employment interests, information obtained during interviews
                    and any other information you choose to provide. We use the
                    information provided to evaluate your candidacy for
                    employment, to communicate with you during the application
                    process and to facilitate the onboarding process.
                  </li>
                  <br />
                </ul>
                <strong>
                  <u>Information from Third Party Sources</u>
                </strong>
                <br />
                <br />
                <ul>
                  We may receive personal information about you from our
                  business partners and service providers and combine this
                  information with other data we collect from you. The third
                  parties may include website and service operators, payment
                  processors, and shipping providers. The information may
                  include contact information, demographic information,
                  information about your communications and related activities,
                  and information about your orders. We may use this information
                  to administer and facilitate our services, your orders, and
                  our marketing activities.
                </ul>
                <br />
                <ul style={{ listStyleType: 'disc', marginLeft: 15 }}>
                  <li>
                    <strong>
                      <em>Single Sign-On. </em>
                    </strong>
                    We may use single sign-on ("
                    <strong>
                      <em>SSO</em>
                    </strong>
                    ") to allow a user to authenticate their account using one
                    set of login information, including through Google. We will
                    have access to certaininformation from those third parties
                    in accordance with the authorization procedures determined
                    by those third parties, which may include, for example, your
                    name, username, email address, language preference, and
                    profile picture. We use this information to operate,
                    maintain, and provide to you the features and functionality
                    of the Service. We may also send you service-related emails
                    or messages (e.g., account verification, customer support,
                    changes, or updates to features of the Site, technical and
                    security notices).
                  </li>
                  <br />
                  <li>
                    <strong>
                      <em>Social Media. </em>
                    </strong>
                    When you interact with our Site through various social
                    media, such as when you click on the social media icon on
                    the Site, follow us on a social media Site, or post a
                    comment to one of our pages, we may receive information from
                    the social network such as your profile information, profile
                    picture, gender, username, user ID associated with your
                    social media account, age range, language, country, and any
                    other information you permit the social network to share
                    with third parties. The data we receive is dependent upon
                    your privacy settings with the social network. We use this
                    information to operate, maintain, and provide to you the
                    features and functionality of the Service, as well as to
                    communicate directly with you, such as to send you email
                    messages about services that may be of interest to you.
                  </li>
                  <br />
                  <li>
                    <strong>
                      <em>Information from Other Sources. </em>
                    </strong>
                    We may obtain information from other sources, including
                    through our service providers or through transactions such
                    as a merger or consolidation. We may combine this
                    information with other information we collect from or about
                    you, including with publicly available information. In these
                    cases, our Privacy Notice governs the handling of the
                    combined personal information. We use this information to
                    operate, maintain, and provide to you the features and
                    functionality of the Service, as well as to communicate
                    directly with you, such as to send you email messages about
                    services that may be of interest to you.
                  </li>
                  <br />
                </ul>

                <strong>
                  <u>Other Uses of Personal Information</u>
                </strong>
                <br />
                <br />
                <ul>
                  In addition to the uses described above, we may collect and
                  use personal information for the following purposes:
                </ul>
                <ul style={{ listStyleType: 'disc', marginLeft: 15 }}>
                  <li>
                    To operate and improve the Service, and to provide you with
                    the features and functionality of the Service;
                  </li>
                  <li>
                    To communicate with you and respond to your requests, such
                    as to respond to your questions, contact you about changes
                    to the Service, and communicate about account related
                    matters;
                  </li>
                  <li>
                    To authenticate your account credentials and identify you,
                    as necessary to log you in and/or ensure the security of
                    your account;
                  </li>
                  <li>For analytics and research purposes;</li>
                  <li>
                    To enforce our contracts, to resolve disputes, to carry out
                    our obligations and enforce our rights, and to protect our
                    organizational interests and the interests and rights of
                    third parties;
                  </li>
                  <li>
                    To comply with contractual and legal obligations and
                    requirements;
                  </li>
                  <li>
                    Enable you to communicate and share files with users you
                    designate;
                  </li>
                  <li>
                    To fulfill any other purpose for which you provide personal
                    information; and
                  </li>
                  <li>
                    For any other lawful purpose, or other purpose that you
                    consent to
                  </li>
                  <br />
                </ul>
                <ul>
                  We may use aggregated and/or de-identified data for any
                  purpose.
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>
                  How We Use Cookies and Other Tracking Technology to Collect
                  Information
                </strong>
                <br />
                <br />
                <ul>
                  We, and our third-party partners, automatically collect
                  certain types of usage information when you visit our
                  services, read our emails, or otherwise engage with us. We
                  typically collect this information through a variety of
                  tracking technologies, including cookies, web beacons,
                  embedded scripts, location-identifying technologies, file
                  information, and similar technology (collectively, “
                  <strong>
                    <em>tracking technologies</em>
                  </strong>
                  ”).
                </ul>
                <br />
                <ul>
                  We, and our third-party partners, use tracking technologies to
                  automatically collect usage and device information, such as:
                </ul>
                <br />
                <ul style={{ listStyleType: 'disc', marginLeft: 15 }}>
                  <li>
                    Information about your device and its software, such as your
                    IP address, browser type, Internet service provider, device
                    type/model/manufacturer, operating system, date and time
                    stamp, and a unique ID that allows us to uniquely identify
                    your browser or your account (including, for example, a
                    persistent device identifier or a User-ID), and other such
                    information. We may also work with third-party partners to
                    employ technologies, including the application of
                    statistical modeling tools, which permit us to recognize and
                    contact you across multiple devices.
                  </li>
                  <br />
                  <li>
                    When you access our Sites from a mobile device, we may
                    collect unique identification numbers associated with your
                    device (including, for example, a UDID), and depending on
                    your mobile device settings, your geographical location data
                    as we may be able to approximate a device’s location by
                    analyzing other information, like an IP address.
                  </li>
                  <br />
                  <li>
                    Information about the way you access and use our Service,
                    for example, the website from which you came and the website
                    to which you are going when you leave our Service, the pages
                    you visit, the links you click, whether you open emails or
                    click the links contained in emails, whether you access the
                    Service from multiple devices, and other actions you take on
                    the Site.
                  </li>
                  <br />
                  <li>
                    We may collect analytics data or use third-party analytics
                    tools such as Google Analytics to help us measure traffic
                    and usage trends for the services and to understand more
                    about the demographics of our users. You can learn more
                    about Google’s practices at &nbsp;
                    <Link
                      href="https://policies.google.com/technologies/partner-sites"
                      underline="always"
                    >
                      https://policies.google.com/technologies/partner-sites
                    </Link>{' '}
                    &nbsp; and view its opt-out options at &nbsp;
                    <Link
                      href="https://tools.google.com/dlpage/gaoptout"
                      underline="always"
                    >
                      https://tools.google.com/dlpage/gaoptout
                    </Link>
                    .
                  </li>
                </ul>
                <br />
                <ul>
                  We use the data collected through tracking technologies to:
                  (a) remember information so that you will not have to re-enter
                  it during your visit or the next time you visit the Site; (b)
                  identify you across multiple devices; (c) provide and monitor
                  the effectiveness of our services; (d) monitor aggregate
                  metrics such as total number of visitors, traffic, usage, and
                  demographic patterns on our Site; (e) diagnose or fix
                  technology problems; and (g) otherwise to plan for and enhance
                  our services.
                </ul>
                <br />
                <ul>
                  For more information on how manage your cookies preferences,
                  please see{' '}
                  <strong style={{ color: '#0080ff' }}>
                    {' '}
                    Control Over Your Information{' '}
                  </strong>
                  .
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>
                  How We Share Personal Information
                </strong>
                <br />
                <br />
                <ul>
                  We may share your personal information in the instances
                  described below. For further information on your choices
                  regarding your information, see{' '}
                  <strong style={{ color: '#0080ff' }}>
                    {' '}
                    Control Over Your Information{' '}
                  </strong>
                  .
                </ul>
                <br />

                <ul style={{ listStyleType: 'disc', marginLeft: 15 }}>
                  <li>
                    We may share your personal information with third-party
                    service providers or business partners who help us deliver
                    or improve our Service or who perform services on our
                    behalf, which are subject to reasonable confidentiality
                    terms, and may include providing technology services,
                    providing mailing and shipping services, providing web
                    hosting services, or providing analytics.
                  </li>
                  <br />
                  <li>
                    If you registered for the Service and have an account that
                    was assigned by your Curator, certain information concerning
                    your use of your account may be accessible to the account
                    administrator, including your email address and access and
                    usage history.
                  </li>
                  <br />
                  <li>
                    Third parties as required by law or subpoena or if we
                    reasonably believe that such action is necessary to (a)
                    comply with the law and the reasonable requests of law
                    enforcement; (b) to enforce our agreements or to protect the
                    security or integrity of the Information Equity services,
                    including to prevent harm or financial loss, or in
                    connection with preventing fraud or illegal activity; and/or
                    (c) to exercise or protect the rights, property, or personal
                    safety of Information Equity, our Curators, visitors, or
                    others
                  </li>
                  <br />
                  <li>
                    We may transfer any information we collect in the event we
                    sell or transfer all or a portion of our organization or any
                    portion or combination of our products, services, and/or
                    assets. Should such a transaction occur (whether a merger,
                    consolidation, bankruptcy, dissolution, reorganization,
                    liquidation, or similar transaction or proceeding), we will
                    use reasonable efforts to ensure that any transferred
                    information is treated in a manner consistent with this
                    Privacy Notice.
                  </li>
                  <br />
                  <li>
                    With other third parties, with your consent or at your
                    direction.
                  </li>
                  <br />
                  <li>
                    With others in an aggregated or otherwise anonymized form
                    that does not reasonably identify you directly as an
                    individual.
                  </li>
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>
                  Control Over Your Information
                </strong>
                <br />
                <br />
                <ul>
                  <u>Modifying Account Information.</u> If you have an account
                  for our Service, you have the ability to modify certain
                  information in your account (e.g., your contact information)
                  through the account setting page or a similar option provided
                  on the Service. If you have any questions about modifying or
                  updating any information in your account, please contact us at
                  the email or postal address provided below. Please note that
                  Information Equity does not own or control the Student Data
                  uploaded to our Service by the Curators and cannot modify or
                  delete Student Data except at the request of the School.
                </ul>
                <br />
                <ul>
                  <u>Email Communications.</u> From time to time, we may send
                  you emails regarding updates to our Service, notices about our
                  organization, or information about the Services we offer. If
                  you wish to unsubscribe from such emails, imply click the
                  “unsubscribe link” provided at the bottom of the email
                  communications. Note that you cannot unsubscribe from certain
                  service-related email communications (e.g., account
                  verification, technical or legal notices).
                </ul>
                <br />
                <ul>
                  <u>Cookies and Other Tracking Technologies Opt-Out.</u>{' '}
                  Depending on your browser or mobile device, you may be able to
                  set your browser to delete or notify you of cookies and other
                  tracking technology by actively managing the settings on your
                  browser or mobile device.
                </ul>
                <br />
                <ul>
                  {' '}
                  If you would prefer not to accept cookies, most browsers will
                  allow you to: (i) change your browser settings to notify you
                  when you receive a cookie, which lets you choose whether or
                  not to accept it; (ii) disable existing cookies; or (iii) set
                  your browser to automatically reject cookies. Please note that
                  doing so may negatively impact your experience using the
                  sites, as some features and services on our sites may not work
                  properly. Depending on your mobile device and operating
                  system, you may not be able to delete or block all cookies.
                  You may also set your e-mail options to prevent the automatic
                  downloading of images that may contain technologies that would
                  allow us to know whether you have accessed our e-mail and
                  performed certain functions with it.
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>Learner Data</strong>
                <br />
                <br />
                <ul>
                  We do not use Learner Data for any purpose other than to
                  provide the services, in accordance with our contractual
                  agreements with our Curators, and this Privacy Notice.
                  Information Equity does not own or control Learning Data,
                  which belongs to the student, the learners, and/or the School
                  or Curator that contracts with Information Equity to provide
                  the Service.
                </ul>
                <br />
                <ul>
                  In relation to personal information we process on behalf of
                  schools or school districts (“
                  <strong>
                    <em>Student Data</em>
                  </strong>
                  ”), the Information Equity Service is designed to provide
                  protections for Student Data as required by applicable privacy
                  laws. For example:
                </ul>
                <br />
                <ul style={{ listStyleType: 'disc', marginLeft: 15 }}>
                  <li>
                    <strong>
                      The Family Educational Rights and Privacy Act (FERPA).
                    </strong>{' '}
                    This Privacy Notice and our Service are designed to meet our
                    responsibilities to protect personal information from the
                    students’ educational records under FERPA. We agree to work
                    with our Schools to jointly ensure compliance with the FERPA
                    regulations. A school may disclose personally identifiable
                    information from a student’s education records to a third
                    party with either written consent of the parent or by
                    meeting one of the exemptions set forth in FERPA (“FERPA
                    Exemption(s)”), including the exemption for the Directory
                    Information (“Directory Information Exemption”) or
                    disclosure to school officials with a legitimate educational
                    interest (“School Official Exemption”).
                  </li>
                  <br />
                  <li>
                    <strong>
                      Children’s Online Privacy Protection Act (COPPA).
                    </strong>{' '}
                    The Information Equity Service is not directed to children
                    under 13 and do not knowingly collect any information from
                    children under the age of 13. A School may not permit a
                    child under 13 to register for the Service, unless the
                    School represents that it has the authority to provide all
                    necessary consents for Information Equity to collect and use
                    such student’s personal information in the manner
                    contemplated by this Privacy Notice, as permitted by COPPA.
                    Please contact us at info@informationequity.org if you
                    believe we have inadvertently collected personal information
                    of a child under 13 without proper consent so that we may
                    delete such data as soon as possible.
                  </li>
                  <br />
                  <li>
                    <strong>
                      Students Online Personal Information Protection Act
                      (“SOPIPA”).
                    </strong>{' '}
                    This Privacy Notice and our Service are designed to comply
                    with SOPIPA. We do not use Student Data for targeted
                    advertising purposes. We do not use collected information to
                    amass a profile of a student except in furtherance of
                    providing the features and functionalities of the
                    Information Equity Service. We never sell Student Data
                    unless the sale is part of a corporate transaction, such as
                    a merger, acquisition, bankruptcy, or other sale of assets,
                    in which case we make efforts to ensure the successor entity
                    honors the privacy commitments made in this policy and/or we
                    will notify the School and provide an opportunity to opt-out
                    by deleting Student Data before the data transfer occurs
                  </li>
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>Data Retention</strong>
                <br />
                <br />
                <ul>
                  We will retain your personal information for the length of
                  time needed to fulfill our business purposes unless otherwise
                  required or permitted by law. Any Student Data that we have
                  access to shall be retained, stored, and deleted according to
                  our agreement with the School. We store data on servers in the
                  U.S.
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>
                  Links to Third-Party Websites and Services
                </strong>
                <br />
                <br />
                <ul>
                  For your convenience, our Service may provide links to
                  third-party websites or services that we do not own or
                  operate. We are not responsible for the practices employed by
                  any websites or services linked to or from the services,
                  including the information or content contained within them.
                  Your browsing and interaction on any other website or service
                  are subject to the applicable third party’s rules and
                  policies, not ours. If you are using a third-party website or
                  service, you do so at your own risk. We encourage you to
                  review the privacy policies of any website or service before
                  providing any personal information.
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>Children’s Privacy</strong>
                <br />
                <br />
                <ul>
                  Our services are not intended for children under the age of
                  13. We do not knowingly solicit or collect personal
                  information from children under the age of 13. If we learn
                  that any personal information has been collected inadvertently
                  from a child under 13, we will delete the information as soon
                  as possible. If you believe that we might have collected
                  information from a child under 13, please contact us at
                  info@informationequity.org.
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>
                  Changes to Privacy Notice
                </strong>
                <br />
                <br />
                <ul>
                  We reserve the right to change this Privacy Notice from time
                  to time in our sole discretion. We will notify you about
                  material changes in the way we treat personal data by sending
                  a notice to the primary email address specified in your
                  Information Equity account and/or by placing a prominent
                  notice on our Site. It is your responsibility to review this
                  Privacy Notice periodically. When we do change the Privacy
                  Notice, we will also revise the “last updated” date.
                </ul>
                <br />
              </li>
              <li>
                <strong style={{ marginBottom: 10 }}>Contact Us</strong>
                <br />
                <br />
                <ul>
                  For additional inquiries about this Privacy Notice, please
                  send us an email at privacy@informationequity.org, or contact
                  us at:
                </ul>
                <br />
              </li>

              <Box>
                <strong>Information Equity Initiative</strong>
                <br />
                3300 Arapahoe Avenue, Suite 207
              </Box>
              <Box>Boulder, CO 80303</Box>
            </ol>
          </Typography>

          <Box height={isSmallScreen ? 70 : 100}>
            <a
              href={definedFileLink ? agreementDocUrl : MyPDF}
              target="_blank"
              rel="noopener noreferrer"
              download="EULA_Agree.pdf"
            >
              <Button
                variant="contained"
                style={{ marginTop: 20, float: 'left' }}
              >
                Download
              </Button>
            </a>
            {!fromSetting && (
              <Button
                color="primary"
                variant="contained"
                style={{ marginTop: 20, float: 'right' }}
                onClick={onAgree}
              >
                Agree
              </Button>
            )}

            {!fromSetting && (
              <Button
                variant="contained"
                style={{ marginTop: 20, float: 'right', marginRight: 20 }}
                onClick={onSignOut}
              >
                Not Agree
              </Button>
            )}

            {fromSetting && (
              <Button
                variant="contained"
                style={{ marginTop: 20, float: 'right' }}
                onClick={() => onChange('close')}
              >
                Close
              </Button>
            )}
          </Box>
        </CardContent>
      </Paper>
    </div>
  );
};

export default StationAdminEula;
