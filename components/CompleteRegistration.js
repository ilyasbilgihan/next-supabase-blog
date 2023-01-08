import { Formik, Form, Field } from 'formik';

import Input from '@/components/Form/Input';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { usernameValidation } from '@/validations/user.validation';

import Button from '@/components/Form/Button';
import { useUser } from 'store/UserContext';

export default function CompleteRegistration() {
  const router = useRouter();
  const { setUser, setRegistration } = useUser();

  const checkUsername = async (username) => {
    const res = await fetch(`/api/isUserExist/${username}`);
    return await res.json();
  };

  const handleRegister = async (username) => {
    const user = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    return await user.json();
  };

  const handleSubmit = async (values) => {
    const data = registerPromise(values.username);
    await toast.promise(data, {
      loading: 'Checking Username...',
      success: (res) => {
        if (res?.error == null) {
          setUser(res.data);
          setRegistration(false);
          return 'Registration Complete!';
        } else {
          throw new Error(res.error);
        }
      },
      error: (err) => err.message,
    });
  };

  const registerPromise = async (username) => {
    const isExist = await checkUsername(username);
    if (isExist?.error) {
      return { error: isExist.error?.message || isExist.error };
    } else if (isExist.data) {
      return { error: 'Username already taken' };
    } else {
      const register = await handleRegister(username);
      if (register?.error) {
        return { error: register.error?.message || register.error };
      } else {
        return register;
      }
    }
  };

  return (
    <div className="mt-12 flex flex-col items-center gap-12">
      <h1>Complete Registration</h1>
      <Formik
        initialValues={{
          username: '',
        }}
        validationSchema={usernameValidation}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="flex w-64 items-center flex-col gap-6">
            <Field name="username">
              {(prop) => (
                <Input
                  limit={16}
                  type="text"
                  label="Username"
                  fieldProps={prop}
                  customError="Not a valid username"
                />
              )}
            </Field>

            <Button type="submit">Continue</Button>
          </Form>
        )}
      </Formik>
      <ul className="text-center">
        <li>Must be between 6 and 16 characters.</li>
        <li>Can only contain letters, numbers, underscores and dashes.</li>
        <li>Cannot start or end with an underscore or dash.</li>
        <li>Cannot contain two or more consecutive underscores or dashes.</li>
      </ul>
    </div>
  );
}
