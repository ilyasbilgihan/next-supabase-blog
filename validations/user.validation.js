import * as Yup from 'yup';

export const userDetailsValidation = Yup.object().shape({
  image: Yup.string(),
  name: Yup.string().max(25),
  location: Yup.string().max(25),
  profession: Yup.string().max(25),
  bio: Yup.string().max(255),
});

export const usernameValidation = Yup.object().shape({
  username: Yup.string()
    .matches(/^[a-z0-9]([_-](?![_-])|[a-z0-9]){4,14}[a-z0-9]$/)
    .required('Required'),
});

export const coverImageValidation = Yup.object().shape({
  coverImage: Yup.string(),
});
