import { object, string, ref } from 'yup';

const createUserSchema = object({
  body: object({
    name: string().required('Name is required.'),
    password: string()
      .required('Password is required.')
      .min(6, 'Password is too short, should be at least 6 characters.')
      .matches(/^[a-zA-Z0-9_.-]*$/, 'Password can only contain Latin characters.'),
    passwordConfirmation: string().oneOf([ref('password'), null], 'Passwords must match'),
    email: string().email('Must be a valid email').required('Email is required'),
  }),
});

export default createUserSchema;
