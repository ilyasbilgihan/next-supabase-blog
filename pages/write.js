import { Formik, Form, Field } from 'formik';

import Input from '@/components/Form/Input';
import Textarea from '@/components/Form/Textarea';
import InputTag from '@/components/Form/InputTag';
import QuillEditor from '@/components/QuillEditor';
import { postValidation } from '@/validations/post.validation';

import Button from '@/components/Form/Button';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import ImageUploader from '@/components/Form/ImageUploader';
import PageHeading from '@/components/PageHeading';
import CustomHead from '@/components/CustomHead';

export default function Write() {
  const [disableSubmit, setDisableSubmit] = useState(false);
  const router = useRouter();
  const handlePostCreate = async (values) => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    return await res.json();
  };

  const handleSubmit = async (values) => {
    if (!disableSubmit) {
      setDisableSubmit(true);
      const data = handlePostCreate(values);

      await toast.promise(data, {
        loading: 'Checking Fields...',
        success: (res) => {
          if (res?.data) {
            router.push(`/${res?.data.owner.username}/${res?.data.slug}`);
            return 'Post Created!';
          } else {
            throw new Error(res.error);
          }
        },
        error: (err) => err.message,
      });
      setDisableSubmit(false);
    }
  };
  return (
    <>
      <CustomHead title="Write Post" />
      <PageHeading title="Write Post" icon="isax-receipt-edit" color="bg-blue-50 text-blue-700" />
      <Formik
        initialValues={{
          title: '',
          description: '',
          tags: [],
          image: '',
          content: '',
        }}
        validationSchema={postValidation}
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <Form className="flex flex-col gap-6">
            <Field name="title">
              {(prop) => <Input limit={64} type="text" label="Post Title" fieldProps={prop} />}
            </Field>
            <Field name="description">
              {(prop) => (
                <Textarea limit={255} label="Post Description" fieldProps={prop} rows={4} />
              )}
            </Field>
            <Field name="tags">
              {(prop) => <InputTag limit={5} label="Tags (use Enter or Comma)" fieldProps={prop} />}
            </Field>
            <Field name="image">
              {(prop) => (
                <ImageUploader fieldProps={prop} maxSize={2}>
                  <div className="relative">
                    <label
                      htmlFor="uploader"
                      className="text-4xl group text-blue-300 hover:text-blue-400 cursor-pointer relative border-dashed overflow-hidden hover:border-blue-400 border-blue-300 duration-500 flex w-full h-80 rounded-lg border items-center justify-center"
                    >
                      <div
                        style={{ transition: '0.4s background' }}
                        className="absolute z-10 cursor-pointer bg-gray-800 group-hover:bg-opacity-50 bg-opacity-80 text-gray-100 w-16 h-16 flex items-center justify-center rounded-full"
                      >
                        {prop.field.value ? (
                          <span className="text-3xl isax-gallery-edit"></span>
                        ) : (
                          <span className="text-3xl isax-gallery-add"></span>
                        )}
                      </div>
                      <div
                        className="absolute w-full h-full bg-cover bg-center postImageAnimation"
                        style={{
                          backgroundImage: `url(${prop.field?.value})`,
                        }}
                      ></div>
                    </label>
                    {prop.field.value && (
                      <div
                        onClick={() => {
                          prop.form.setFieldValue('image', '');
                        }}
                        className="absolute top-0 bg-red-500 right-0 bg-opacity-70 hover:bg-opacity-50 backdrop-blur text-white py-2.5 px-7 rounded-tr-lg rounded-bl-lg  cursor-pointer flex items-center gap-2"
                      >
                        <span className="isax-trash text-2xl "></span>
                        <span className="text-sm">Remove Image</span>
                      </div>
                    )}
                  </div>
                </ImageUploader>
              )}
            </Field>
            <Field name="quillContent">
              {({ form }) => (
                <QuillEditor
                  style={{ transition: '.4s border-color' }}
                  className="h-[600px] border border-blue-200 hover:border-blue-300 rounded-lg "
                  setQuillContent={(quillContent) => {
                    form.getFieldHelpers('content').setValue(JSON.stringify(quillContent));
                  }}
                />
              )}
            </Field>
            <Button
              disabled={disableSubmit || values.content === ''}
              type="submit"
              className="!w-full disabled:!bg-opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
}
