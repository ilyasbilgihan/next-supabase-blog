import { Formik, Form, Field } from 'formik';

import Input from '@/components/Form/Input';
import Textarea from '@/components/Form/Textarea';

import { userDetailsValidation } from '@/validations/user.validation';
import { toast } from 'react-hot-toast';
import Button from '@/components/Form/Button';
import { useState } from 'react';
import { useUser } from 'store/UserContext';
import Loader from '@/components/Loader';
import ImageUploader from '@/components/Form/ImageUploader';
import PageHeading from '@/components/PageHeading';
import Link from 'next/link';
import CustomHead from '@/components/CustomHead';

export default function Settings() {
  const [disableSubmit, setDisableSubmit] = useState(false);
  const { user, setUser } = useUser();

  const handleProfileUpdate = async (values) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
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
      const data = handleProfileUpdate(values);

      await toast.promise(data, {
        loading: 'Checking Fields...',
        success: (res) => {
          if (res?.data) {
            setUser(res.data);
            return 'Profile Updated!';
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
      <CustomHead title={`Profile Details`} />
      <PageHeading
        title="Profile Details"
        icon="isax-user-edit"
        color="bg-gray-100 text-gray-700"
      />
      {user ? (
        <Formik
          initialValues={{
            image: user.image || '',
            name: user.name || '',
            location: user.location || '',
            profession: user.profession || '',
            bio: user.bio || '',
          }}
          validationSchema={userDetailsValidation}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="flex flex-col gap-6">
              <Field name="image">
                {(prop) => (
                  <>
                    <ImageUploader label="Profile Image" fieldProps={prop} maxSize={1} square>
                      <div className="flex gap-2 items-center">
                        <label
                          htmlFor="uploader"
                          className="group text-4xl cursor-pointer text-gray-500 hover:text-gray-700 relative ring-offset-2 hover:ring-blue-300 ring-blue-200 ring-1 overflow-hidden hover:border-blue-300 duration-500 flex w-32 h-32 rounded-full items-center justify-center"
                        >
                          <div
                            style={{ transition: '0.4s background' }}
                            className="absolute z-10 cursor-pointer w-10 h-10 flex group-hover:bg-opacity-0 bg-gray-600 bg-opacity-80 items-center justify-center rounded-xl"
                          >
                            <span
                              style={{ transition: '0.4s opacity' }}
                              className="isax-image text-2xl text-white group-hover:opacity-0 "
                            ></span>
                          </div>
                          <div
                            className="w-full h-full bg-cover bg-center postImageAnimation"
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
                            className="text-red-500 select-none cursor-pointer flex items-center gap-1"
                          >
                            <span className="isax-trash text-2xl "></span>
                            <span className="text-sm">Remove Image</span>
                          </div>
                        )}
                      </div>
                    </ImageUploader>
                  </>
                )}
              </Field>
              <Field name="name">
                {(prop) => <Input limit={25} type="text" label="Name" fieldProps={prop} />}
              </Field>
              <Field name="location">
                {(prop) => <Input limit={25} type="text" label="Location" fieldProps={prop} />}
              </Field>
              <Field name="profession">
                {(prop) => <Input limit={25} type="text" label="Profession" fieldProps={prop} />}
              </Field>
              <Field name="bio">
                {(prop) => (
                  <Textarea
                    limit={255}
                    label="Type something about you"
                    fieldProps={prop}
                    rows={4}
                  />
                )}
              </Field>
              <Button
                disabled={disableSubmit}
                type="submit"
                className="!w-full disabled:!bg-opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </Button>
            </Form>
          )}
        </Formik>
      ) : (
        <Loader />
      )}
    </>
  );
}
