import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from 'store/UserContext';
import Loader from '@/components/Loader';
import { Field, Form, Formik } from 'formik';
import Button from '@/components/Form/Button';

import * as Yup from 'yup';
import Input from '@/components/Form/Input';
import { toast } from 'react-hot-toast';
import CustomHead from '@/components/CustomHead';

export default function Login() {
  const router = useRouter();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [userLogin, setUserLogin] = useState(false);
  const supabase = useSupabaseClient();
  const [authMode, setAuthMode] = useState(0);
  const { signIn } = useUser();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        signIn(session.user.id).then(() => {
          router.back();
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (values) => {
    setDisableSubmit(true);

    if (authMode == 0) {
      await handleLogin(values);
    } else if (authMode == 1) {
      await handleRegister(values);
    }

    setDisableSubmit(false);
  };

  const handleLogin = async (values) => {
    const data = supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    await toast.promise(data, {
      loading: 'Checking Credentials...',
      success: (res) => {
        if (res?.error == null) {
          setUserLogin(true);
          return 'Successfully logged-in';
        } else {
          throw new Error(res.error.message);
        }
      },
      error: (err) => err.message,
    });
  };

  const handleRegister = async (values) => {
    const data = supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    await toast.promise(data, {
      loading: 'Checking Credentials...',
      success: (res) => {
        if (res?.error == null) {
          if (res.data.user.identities.length > 0) {
            return 'Successfully registered! Please check your email to verify your account.';
          } else {
            throw new Error('This email is already registered. Please login.');
          }
        } else {
          throw new Error(res.error);
        }
      },
      error: (err) => err.message,
    });
  };

  return (
    <>
      <CustomHead title={`Login`} description="Login Page of Write You Want" />
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex-grow w-2/3 sm:w-1/2 lg:w-1/4 mx-auto flex flex-col justify-center">
        <h1 className="text-center mb-8">{['Login', 'Register'][authMode]}</h1>
        <Formik
          initialValues={{
            email: '',
            password: '',
            passwordConfirm: '',
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string().email('Not a valid email').required('Email Required'),
            password: Yup.string().min(6).max(25).required('Password Required'),
            passwordConfirm:
              authMode == 1
                ? Yup.string()
                    .oneOf([Yup.ref('password'), null], 'Passwords must match')
                    .required()
                : '',
          })}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="flex flex-col gap-5 items-center">
              <Field name="email">
                {(prop) => <Input type="text" label="Email" fieldProps={prop} />}
              </Field>
              <Field name="password">
                {(prop) => <Input type="password" label="Password" fieldProps={prop} />}
              </Field>
              {authMode == 1 ? (
                <Field name="passwordConfirm">
                  {(prop) => <Input type="password" label="Confirm Password" fieldProps={prop} />}
                </Field>
              ) : (
                ''
              )}
              <Button
                disabled={disableSubmit}
                type="submit"
                className="!w-full disabled:!bg-opacity-50 disabled:cursor-not-allowed"
              >
                {['Login', 'Register'][authMode]}
              </Button>
              <span
                onClick={() => {
                  if (authMode != 0) {
                    setAuthMode(0);
                  } else {
                    setAuthMode(1);
                  }
                }}
                className="select-none text-sm mt-2 hover:underline cursor-pointer"
              >
                {["Don't you have an account yet?", 'Already have an account?'][authMode]}
              </span>
            </Form>
          )}
        </Formik>
      </div>
      {userLogin ? <Loader /> : ''}
    </>
  );
}

export async function getServerSideProps(context) {
  const supabase = createServerSupabaseClient(context);

  // if session redirect
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
