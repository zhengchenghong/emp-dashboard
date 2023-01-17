/* eslint-disable max-len */
export default {
  apolloLinks: {
    http: 'https://coreapidev.sigcomp.com/',
    // http: 'http://localhost:4001/',
    ws: 'wss://wsapidev.sigcomp.com/'
    // ws: 'ws://localhost:4001/'
  },
  dev: {
    corsHandler: 'https://cors-anywhere-handler.herokuapp.com/'
  },
  aws: {
    aws_project_region: 'us-east-2',
    aws_cognito_identity_pool_id:
      'us-east-2:3294ca33-47d9-4f83-bd52-53fddd145210',
    aws_cognito_region: 'us-east-2',
    aws_user_pools_id: 'us-east-2_ROpcRkZ5v',
    aws_user_pools_web_client_id: '209ffu8n59tc30nr07as39sc4e',
    oauth: {
      domain: 'sigcomp-dev-np.auth.us-east-2.amazoncognito.com',
      scope: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
      redirectSignIn: 'https://dashboard-dev.sigcomp.com',
      redirectSignOut: 'https://dashboard-dev.sigcomp.com',
      responseType: 'token'
    },
    federationTarget: 'COGNITO_USER_AND_IDENTITY_POOLS'
  },
  auth: {
    loginUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR65bYCnRI9i-fI0RtOHdNlZQcP4X7SGiS8cQ&usqp=CAU',
    // topLogo: 'https://dashboard-dev.sigcomp.com/PMEP-Logo.png',
    topLogo: 'http://dashboard-dev.sigcomp.com/IEI_logo_Hi-Res.png',
    bottomLogo: 'https://dashboard-dev.sigcomp.com/SIG_Logo.png',
    profileImage:
      'https://www.webxcreation.com/event-recruitment/images/profile-1.jpg'
  },
  couldFrontUrl: 'https://d384xd0slu4f7.cloudfront.net',
  api: {
    studentAndTeacherUpload:
      'https://xs9e660jm1.execute-api.us-east-2.amazonaws.com/users/multiple',
    packaging:
      'https://omuxtn7ncg.execute-api.us-east-2.amazonaws.com/packaging',
    googleclass:
      'https://9p9l2xxak2.execute-api.us-east-2.amazonaws.com/dev/api/classes/ingestClasses'
  },
  convertMediaTimeout: 3600
};
