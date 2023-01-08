import { Field, Form, Formik } from 'formik';
import Textarea from '@/components/Form/Textarea';
import { commentValidation } from '@/validations/comment.validation';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CommentForm({ postId, parentId = null, reply = false, onCommentAdd }) {
  const [disableSubmit, setDisableSubmit] = useState(false);

  const handleCommentCreate = async (values) => {
    const res = await fetch(`/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...values, postId, parentId }),
    });
    return await res.json();
  };

  const handleCommentSubmit = async (values, { resetForm }) => {
    setDisableSubmit(true);
    const data = handleCommentCreate(values);

    await toast.promise(data, {
      loading: 'Checking Comment...',
      success: (res) => {
        if (res?.data) {
          resetForm();
          onCommentAdd(res.data);
          return 'Comment Created!';
        } else {
          throw new Error(res.error);
        }
      },
      error: (err) => err.message,
    });
    setDisableSubmit(false);
  };

  return (
    <Formik
      initialValues={{
        content: '',
      }}
      validationSchema={commentValidation}
      onSubmit={handleCommentSubmit}
    >
      {({ values, resetForm }) => (
        <Form className="mb-4">
          <Field name="content">
            {(prop) => (
              <Textarea
                limit={512}
                label="What are your thoughts?"
                fieldProps={prop}
                rows={reply ? 3 : 4}
              />
            )}
          </Field>
          <button
            disabled={disableSubmit || values.content === ''}
            type="submit"
            className={`${
              reply ? 'bg-orange-500' : 'bg-primary'
            } transition-colors py-3 px-4 text-gray-50 text-xs rounded-xl hover:bg-opacity-90 mt-2 disabled:!bg-opacity-50 disabled:cursor-not-allowed`}
          >
            {reply ? 'Reply' : 'Add Comment'}
          </button>
        </Form>
      )}
    </Formik>
  );
}
