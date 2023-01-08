import * as Yup from 'yup';

export const commentValidation = Yup.object().shape({
  content: Yup.string().min(1).max(512).required('Comment content required.'),
});
