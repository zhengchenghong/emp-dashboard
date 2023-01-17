import { Cookies } from 'react-cookie';

const base64 = require('base-64');
const utf8 = require('utf8');

export const convertStringToBase64Encode = (email, password) => {
  const cookies = new Cookies();

  const email_bytes = utf8.encode(email);
  const converted_email = base64.encode(email_bytes);
  const password_bytes = utf8.encode(password);
  const converted_password = base64.encode(password_bytes);

  cookies.set('login_info', `${converted_email}::${converted_password}`, {
    path: '/'
  });
  cookies.set('remember_me', 'true', { path: '/' });
};

export const convertBase64EncodetoString = (base64code) => {
  console.log(base64code);
  const bytes = base64.decode(base64code);
  const text = utf8.decode(bytes);
  return text;
};
