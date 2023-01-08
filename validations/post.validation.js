import * as Yup from 'yup';

export const postValidation = Yup.object().shape({
  title: Yup.string().max(64).required('Title Required'),
  description: Yup.string().min(20).max(255).required('Description Required'),
  image: Yup.string().required('Image Required'),
  content: Yup.string().required('Content is required'),
  tags: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Tag's name is required"),
        slug: Yup.string().required("Tag's slug is required"),
      }),
    )
    .min(1)
    .max(5)
    .required('Required array'),
});
