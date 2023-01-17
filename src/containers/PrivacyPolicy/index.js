import React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import config from '@app/Config';
import { Img } from 'react-image';

import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import {
  Container,
  AppBar,
  Toolbar,
  CssBaseline,
  useScrollTrigger,
  Slide,
  Button,
  Fab,
  Fade,
  Box
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  privacyPolicy: {
    lineHeight: '1.7em',
    padding: '50px 50px 50px'
  },
  logo: {
    width: '110px',
    height: '40px',
    marginRight: '20px'
  }
}));

const HideOnScroll = (props) => {
  const trigger = useScrollTrigger({ target: props.window });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
};

const ScrollTop = (props) => {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor'
    );

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center'
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Fade>
  );
};

const PrivacyPolicy = (props) => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <React.Fragment>
      <CssBaseline />
      <div id="back-to-top-anchor"></div>
      <HideOnScroll {...props}>
        <AppBar style={{ background: '#fff' }}>
          <Toolbar>
            <Img
              src={config.auth.bottomLogo}
              alt="Signal Infrastructure Logo"
              className={classes.logo}
            ></Img>
            <Button variant="outlined" onClick={() => history.goBack()}>
              Back
            </Button>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container maxWidth="lg" className={classes.privacyPolicy}>
        <p>
          <em>Last Updated: 2/16/2022</em>
        </p>
        <ul>
          <li>
            <strong>
              <a href="#howWeCollect">How We Collect and Use Information</a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#howWeUseCookies">
                How We Use Cookies and Other Tracking Technology to Collect
                Information
              </a>
            </strong>
          </li>
          <li>
            <strong>
              <a
                href="#howWeSharePersonalInformation"
                data-type="internal"
                data-id="#howWeSharePersonalInformation"
              >
                How We Share Personal Information
              </a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#controlOverYourInformation">
                Control Over Your Information
              </a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#learnerData">Learner Data</a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#dataRetention">Data Retention</a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#linksToThirdParty">
                Links to Third-Party Websites and Services
              </a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#childrensPrivacy">Children’s Privacy</a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#changesToPrivacyNotice">Changes to Privacy Notice</a>
            </strong>
          </li>
          <li>
            <strong>
              <a href="#contactUs">Contact Us</a>
            </strong>
          </li>
        </ul>
        <p>
          Welcome and thank you for your interest in Information Equity
          Initiative (“
          <strong>
            <em>Information Equity</em>
          </strong>
          ,” “
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
          individuals and provide them with digital content without broadband
          access. Participants are provided with a simple antenna and device,
          typically distributed by their school district, that allows
          individuals to download digital content onto a Wi-Fi connected device,
          such as a tablet, phone, or computer.
        </p>
        <p>
          This Privacy Notice explains how information about you, that directly
          identifies you, or that makes you identifiable (“
          <strong>
            <em>personal information</em>
          </strong>
          ”) is collected, used and disclosed by Information Equity in
          connection with the Information Equity websites and applications that
          post or link to this Privacy Notice, including our website
          <a href="https:/informationequity.org/">
            {' '}
            https://informationequity.org/
          </a>{' '}
          (collectively, the “
          <strong>
            <em>Site</em>
          </strong>
          ”), and our services offered in connection with the Site (collectively
          with the Site, the “
          <strong>
            <em>Service</em>
          </strong>
          ”).
        </p>
        <p>
          <strong>Learner Data: </strong>The educators, schools, school
          districts, public health facilities, incarceration facilities, and
          broadcasters (collectively, <em>“</em>
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
          Curator. This Privacy Notice does not apply to such processing and we
          recommend you read the Privacy Notice of the respective Curator or
          contact such entity if the processing concerns your personal
          information. For more information, please see our{' '}
          <strong>
            <a href="#learnerData">Learner Data</a>
          </strong>{' '}
          section of this Privacy Notice.
        </p>
        <p id="howWeCollect">
          <strong>1. How We Collect and Use Information</strong>
        </p>
        <p>
          We collect personal information in connection with your visits to and
          use of the Service. This collection includes information that you
          provide in connection with the Service, information from third
          parties, and information that is collected automatically such as
          through the use of cookies and other technologies.
        </p>
        <p>
          <strong>
            <u>Information That You Provide</u>
          </strong>
        </p>
        <p>
          We may collect personal information from you. The categories of
          information we collect can include:
        </p>
        <ul>
          <li>
            <strong>
              <em>Service Inquiries</em>
            </strong>
            . We collect personal information that you provide when you inquire
            about our Service. This information includes your first name, last
            name, email, phone number, school information, and any other
            information you provide, including your interests in relation to our
            Service. We use this information to communicate with you about your
            inquiry or interests.&nbsp;
          </li>
          <li>
            <strong>
              <em>Registration Information.</em>
            </strong>{' '}
            We collect personal and/or business information that you provide
            when you register for an account to use our Service, including using
            the Educator Dashboard or Kiosk Dashboard. This information may
            include your first and last name, email, phone number, username,
            profile photo, and password. We use this information to administer
            your account, provide you with the relevant services and
            information, communicate with you regarding your account, the
            Service, and for customer support purposes.
          </li>
          <li>
            <strong>
              <em>Communications.</em>
            </strong>{' '}
            If you communicate with us through any paper or electronic form, we
            may collect your name, email address, mailing address, phone number,
            or any other personal information you choose to provide to us. We
            use this information to investigate and respond to your inquiries,
            and to communicate with you, to enhance the services we offer to our
            users and to manage and grow our organization. If you register for
            our newsletters or updates, we may communicate with you by email. To
            unsubscribe from promotional messages, please follow the
            instructions within our messages and review the{' '}
            <strong>
              <a href="#controlOverYourInformation">
                Control Over Your Information
              </a>
            </strong>{' '}
            section below.
          </li>
          <li>
            <strong>
              <em>Marketing Emails.</em>
            </strong>{' '}
            If you sign up to receive news or alerts from us, we collect your
            email and applicable interests and communication preferences in
            order to send you regular updates about the Service. We use this
            information to manage our communications with you and send you
            information about services we think may be of interest to you. If
            you wish to stop receiving email messages from us, simply click the
            “unsubscribe link” provided at the bottom of the email
            communication. Note that you cannot unsubscribe from certain
            services-related email communications (e.g., account verification,
            technical or legal notices).
          </li>
          <li>
            <strong>
              <em>Employment Applications.</em>
            </strong>{' '}
            If you apply for employment, we collect your contact and demographic
            information, educational and work history, employment interests,
            information obtained during interviews and any other information you
            choose to provide. We use the information provided to evaluate your
            candidacy for employment, to communicate with you during the
            application process and to facilitate the onboarding process.&nbsp;
          </li>
        </ul>
        <p>
          <strong>
            <u>Information from Third Party Sources</u>
          </strong>
        </p>
        <p>
          We may receive personal information about you from our business
          partners and service providers and combine this information with other
          data we collect from you. The third parties may include website and
          service operators, payment processors, and shipping providers. The
          information may include contact information, demographic information,
          information about your communications and related activities, and
          information about your orders. We may use this information to
          administer and facilitate our services, your orders, and our marketing
          activities.
        </p>
        <ul>
          <li>
            <strong>
              <em>Single Sign-On. </em>
            </strong>
            We may use single sign-on (“
            <strong>
              <em>SSO</em>
            </strong>
            “) to allow a user to authenticate their account using one set of
            login information, including through Google. We will have access to
            certain information from those third parties in accordance with the
            authorization procedures determined by those third parties, which
            may include, for example, your name, username, email address,
            language preference, and profile picture. We use this information to
            operate, maintain, and provide to you the features and functionality
            of the Service. We may also send you service-related emails or
            messages (e.g., account verification, customer support, changes, or
            updates to features of the Site, technical and security notices).
          </li>
          <li>
            <strong>
              <em>Social Media.</em>
            </strong>{' '}
            When you interact with our Site through various social media, such
            as when you click on the social media icon on the Site, follow us on
            a social media Site, or post a comment to one of our pages, we may
            receive information from the social network such as your profile
            information, profile picture, gender, username, user ID associated
            with your social media account, age range, language, country, and
            any other information you permit the social network to share with
            third parties. The data we receive is dependent upon your privacy
            settings with the social network. We use this information to
            operate, maintain, and provide to you the features and functionality
            of the Service, as well as to communicate directly with you, such as
            to send you email messages about services that may be of interest to
            you.
          </li>
          <li>
            <strong>
              <em>Information from Other Sources.</em>
            </strong>{' '}
            We may obtain information from other sources, including through our
            service providers or through transactions such as a merger or
            consolidation. We may combine this information with other
            information we collect from or about you, including with publicly
            available information. In these cases, our Privacy Notice governs
            the handling of the combined personal information. We use this
            information to operate, maintain, and provide to you the features
            and functionality of the Service, as well as to communicate directly
            with you, such as to send you email messages about services that may
            be of interest to you.&nbsp;
          </li>
        </ul>
        <p>
          <strong>
            <u>Other Uses of Personal Information</u>
          </strong>
        </p>
        <p>
          In addition to the uses described above, we may collect and use
          personal information for the following purposes:
        </p>
        <ul>
          <li>
            To operate and improve the Service, and to provide you with the
            features and functionality of the Service;
          </li>
          <li>
            To communicate with you and respond to your requests, such as to
            respond to your questions, contact you about changes to the Service,
            and communicate about account related matters;
          </li>
          <li>
            To authenticate your account credentials and identify you, as
            necessary to log you in and/or ensure the security of your account;
          </li>
          <li>For analytics and research purposes;</li>
          <li>
            To enforce our contracts, to resolve disputes, to carry out our
            obligations and enforce our rights, and to protect our
            organizational interests and the interests and rights of third
            parties;
          </li>
          <li>
            To comply with contractual and legal obligations and requirements;
          </li>
          <li>
            Enable you to communicate and share files with users you designate;
          </li>
          <li>
            To fulfill any other purpose for which you provide personal
            information; and
          </li>
          <li>
            For any other lawful purpose, or other purpose that you consent to.
          </li>
        </ul>
        <p>We may use aggregated and/or de-identified data for any purpose.</p>
        <p id="howWeUseCookies">
          <strong>2. </strong>
          <strong>
            How We Use Cookies and Other Tracking Technology to Collect
            Information
          </strong>
        </p>
        <p>
          We, and our third-party partners, automatically collect certain types
          of usage information when you visit our services, read our emails, or
          otherwise engage with us.&nbsp;We typically collect this information
          through a variety of tracking technologies, including cookies, web
          beacons, embedded scripts, location-identifying technologies, file
          information, and similar technology (collectively, “
          <strong>
            <em>tracking technologies</em>
          </strong>
          ”). &nbsp;
        </p>
        <p>
          We, and our third-party partners, use tracking technologies to
          automatically collect usage and device information, such as:
        </p>
        <ul>
          <li>
            Information about your device and its software, such as your IP
            address, browser type, Internet service provider, device
            type/model/manufacturer, operating system, date and time stamp, and
            a unique ID that allows us to uniquely identify your browser or your
            account (including, for example, a persistent device identifier or a
            User-ID), and other such information. We may also work with
            third-party partners to employ technologies, including the
            application of statistical modeling tools, which permit us to
            recognize and contact you across multiple devices.
          </li>
          <li>
            When you access our Sites from a mobile device, we may collect
            unique identification numbers associated with your device
            (including, for example, a UDID), and depending on your mobile
            device settings, your geographical location data as we may be able
            to approximate a device’s location by analyzing other information,
            like an IP address.&nbsp;
          </li>
          <li>
            Information about the way you access and use our Service, for
            example, the website from which you came and the website to which
            you are going when you leave our Service, the pages you visit, the
            links you click, whether you open emails or click the links
            contained in emails, whether you access the Service from multiple
            devices, and other actions you take on the Site.
          </li>
          <li>
            We may collect analytics data or use third-party analytics tools
            such as Google Analytics to help us measure traffic and usage trends
            for the services and to understand more about the demographics of
            our users. You can learn more about Google’s practices at&nbsp;
            <a href="https://policies.google.com/technologies/partner-sites">
              https://policies.google.com/technologies/partner-Websites
            </a>{' '}
            and view its opt-out options at&nbsp;
            <a href="https://tools.google.com/dlpage/gaoptout">
              https://tools.google.com/dlpage/gaoptout
            </a>
            .
          </li>
        </ul>
        <p>
          We use the data collected through tracking technologies to:&nbsp;(a)
          remember information so that you will not have to re-enter it during
          your visit or the next time you visit the Site; (b) identify you
          across multiple devices; (c) provide and monitor the effectiveness of
          our services; (d) monitor aggregate metrics such as total number of
          visitors, traffic, usage, and demographic patterns on our Site; (e)
          diagnose or fix technology problems; and (g) otherwise to plan for and
          enhance our services.
        </p>
        <p>
          For more information on how manage your cookies preferences, please
          see{' '}
          <strong>
            <a href="#controlOverYourInformation">
              Control Over Your Information
            </a>
            .
          </strong>
        </p>
        <p id="howWeSharePersonalInformation">
          <strong>3. How We Share Personal Information</strong>
        </p>
        <p>
          We may share your personal information in the instances described
          below. For further information on your choices regarding your
          information, see{' '}
          <strong>
            <a href="#controlOverYourInformation">
              Control Over Your Information
            </a>
          </strong>
          .
        </p>
        <ul>
          <li>
            We may share your personal information with third-party service
            providers or business partners who help us deliver or improve our
            Service or who perform services on our behalf, which are subject to
            reasonable confidentiality terms, and may include providing
            technology services, providing mailing and shipping services,
            providing web hosting services, or providing analytics.
          </li>
          <li>
            If you registered for the Service and have an&nbsp; account that was
            assigned by your Curator, certain information concerning your use of
            your account may be accessible to the account administrator,
            including your email address and access and usage history.
          </li>
          <li>
            Third parties as required by law or subpoena or if we reasonably
            believe that such action is necessary to (a) comply with the law and
            the reasonable requests of law enforcement; (b) to enforce our
            agreements or to protect the security or integrity of the
            Information Equity services, including to prevent harm or financial
            loss, or in connection with preventing fraud or illegal activity;
            and/or (c) to exercise or protect the rights, property, or personal
            safety of Information Equity, our Curators, visitors, or others.
          </li>
          <li>
            We may transfer any information we collect in the event we sell or
            transfer all or a portion of our organization or any portion or
            combination of our products, services, and/or assets. Should such a
            transaction occur (whether a merger, consolidation, bankruptcy,
            dissolution, reorganization, liquidation, or similar transaction or
            proceeding), we will use reasonable efforts to ensure that any
            transferred information is treated in a manner consistent with this
            Privacy Notice.
          </li>
          <li>
            With other third parties, with your consent or at your direction.
          </li>
          <li>
            With others in an aggregated or otherwise anonymized form that does
            not reasonably identify you directly as an individual.
          </li>
        </ul>
        <p id="controlOverYourInformation">
          <strong>4. Control Over Your Information</strong>
        </p>
        <p>
          Modifying Account Information. If you have an account for our Service,
          you have the ability to modify certain information in your account
          (e.g., your contact information) through the account setting page or a
          similar option provided on the Service. If you have any questions
          about modifying or updating any information in your account, please
          contact us at the email or postal address provided below. Please note
          that Information Equity does not own or control the Student Data
          uploaded to our Service by the Curators and cannot modify or delete
          Student Data except at the request of the School.
        </p>
        <p>
          Email Communications. From time to time, we may send you emails
          regarding updates to our Service, notices about our organization, or
          information about the Services we offer. If you wish to unsubscribe
          from such emails, simply click the “unsubscribe link” provided at the
          bottom of the email communications. Note that you cannot unsubscribe
          from certain service-related email communications (e.g., account
          verification, technical or legal notices).
        </p>
        <p>
          &nbsp;Cookies and Other Tracking Technologies Opt-Out.&nbsp;Depending
          on your browser or mobile device, you may be able to set your browser
          to delete or notify you of cookies and other tracking technology by
          actively managing the settings on your browser or mobile device.
          &nbsp;
        </p>
        <p>
          If you would prefer not to accept cookies, most browsers will allow
          you to: (i) change your browser settings to notify you when you
          receive a cookie, which lets you choose whether or not to accept it;
          (ii) disable existing cookies; or (iii) set your browser to
          automatically reject cookies. Please note that doing so may negatively
          impact your experience using the sites, as some features and services
          on our sites may not work properly. Depending on your mobile device
          and operating system, you may not be able to delete or block all
          cookies. You may also set your e-mail options to prevent the automatic
          downloading of images that may contain technologies that would allow
          us to know whether you have accessed our e-mail and performed certain
          functions with it.
        </p>
        <p id="learnerData">
          <strong>5. Learner Data</strong>
        </p>
        <p>
          We do not use Learner Data for any purpose other than to provide the
          services, in accordance with our contractual agreements with our
          Curators, and this Privacy Notice. Information Equity does not own or
          control Learning Data, which belongs to the student, the learners,
          and/or the School or Curator that contracts with Information Equity to
          provide the Service.
        </p>
        <p>
          In relation to personal information we process on behalf of schools or
          school districts (“
          <strong>
            <em>Student Data</em>
          </strong>
          ”), the Information Equity Service is designed to provide protections
          for Student Data as required by applicable privacy laws. For example:
        </p>
        <ul>
          <li>
            <strong>
              The Family Educational Rights and Privacy Act (FERPA).
            </strong>{' '}
            This Privacy Notice and our Service are designed to meet our
            responsibilities to protect personal information from the students’
            educational records under FERPA. We agree to work with our Schools
            to jointly ensure compliance with the FERPA regulations. A school
            may disclose personally identifiable information from a student’s
            education records to a third party with either written consent of
            the parent or by meeting one of the exemptions set forth in FERPA
            (“FERPA Exemption(s)”), including the exemption for the Directory
            Information (“Directory Information Exemption”) or disclosure to
            school officials with a legitimate educational interest (“School
            Official Exemption”).
          </li>
        </ul>
        <ul>
          <li>
            <strong>Children’s Online Privacy Protection Act (COPPA). </strong>
            The Information Equity Service is not directed to children under 13
            and do not knowingly collect any information from children under the
            age of 13. A School may not permit a child under 13 to register for
            the Service, unless the School represents that it has the authority
            to provide all necessary consents for Information Equity to collect
            and use such student’s personal information in the manner
            contemplated by this Privacy Notice, as permitted by COPPA. Please
            contact us at info@informationequity.org if you believe we have
            inadvertently collected personal information of a child under 13
            without proper consent so that we may delete such data as soon as
            possible.
          </li>
        </ul>
        <ul>
          <li>
            <strong>
              Students Online Personal Information Protection Act (“SOPIPA”).{' '}
            </strong>
            This Privacy Notice and our Service are designed to comply with
            SOPIPA. We do not use Student Data for targeted advertising
            purposes. We do not use collected information to amass a profile of
            a student except in furtherance of providing the features and
            functionalities of the Information Equity Service. We never sell
            Student Data unless the sale is part of a corporate transaction,
            such as a merger, acquisition, bankruptcy, or other sale of assets,
            in which case we make efforts to ensure the successor entity honors
            the privacy commitments made in this policy and/or we will notify
            the School and provide an opportunity to opt-out by deleting Student
            Data before the data transfer occurs.
          </li>
        </ul>
        <p id="dataRetention">
          <strong>6. Data Retention</strong>
        </p>
        <p>
          We will retain your personal information for the length of time needed
          to fulfill our business purposes unless otherwise required or
          permitted by law. Any Student Data that we have access to shall be
          retained, stored, and deleted according to our agreement with the
          School. We store data on servers in the U.S.
        </p>
        <p id="linksToThirdParty">
          <strong>7. Links to Third-Party Websites and Services</strong>
        </p>
        <p>
          For your convenience, our Service may provide links to third-party
          websites or services that we do not own or operate. We are not
          responsible for the practices employed by any websites or services
          linked to or from the services, including the information or content
          contained within them. Your browsing and interaction on any other
          website or service are subject to the applicable third party’s rules
          and policies, not ours. If you are using a third-party website or
          service, you do so at your own risk. We encourage you to review the
          privacy policies of any website or service before providing any
          personal information.
        </p>
        <p id="childrensPrivacy">
          <strong>8. Children’s Privacy</strong>
        </p>
        <p>
          Our services are not intended for children under the age of 13. We do
          not knowingly solicit or collect personal information from children
          under the age of 13. If we learn that any personal information has
          been collected inadvertently from a child under 13, we will delete the
          information as soon as possible. If you believe that we might have
          collected information from a child under 13, please contact us at
          info@informationequity.org. .
        </p>
        <p id="changesToPrivacyNotice">
          <strong>9. Changes to Privacy Notice</strong>
        </p>
        <p>
          We reserve the right to change this Privacy Notice from time to time
          in our sole discretion. We will notify you about material changes in
          the way we treat personal data by sending a notice to the primary
          email address specified in your Information Equity account and/or by
          placing a prominent notice on our Site. It is your responsibility to
          review this Privacy Notice periodically. When we do change the Privacy
          Notice, we will also revise the “last updated” date.
        </p>
        <p id="contactUs">
          <strong>10. Contact Us</strong>
        </p>
        <p>
          For additional inquiries about this Privacy Notice, please send us an
          email at privacy@informationequity.org, or contact us at:
        </p>
        <p>
          <strong>Information Equity Initiative</strong> 3300 Arapahoe Avenue,
          Suite 207 Boulder, CO 80303
        </p>
      </Container>
      <ScrollTop {...props}>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </React.Fragment>
  );
};

export default PrivacyPolicy;
