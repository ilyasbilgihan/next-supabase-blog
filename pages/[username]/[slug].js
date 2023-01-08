import { serialize, prisma } from '@/lib/prisma';

import { Formik, Form, Field } from 'formik';

import Textarea from '@/components/Form/Textarea';
import InputTag from '@/components/Form/InputTag';
import QuillEditor from '@/components/QuillEditor';
import { postValidation } from '@/validations/post.validation';

import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import ImageUploader from '@/components/Form/ImageUploader';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from 'store/UserContext';
import Modal from '@/components/Modal';
import { ClipLoader } from 'react-spinners';
import Comment from '@/components/Comment';
import CommentForm from '@/components/CommentForm';
import readableDate from '@/utils/readableDate';
import compactNumber from '@/utils/compactNumber';

import CustomHead from '@/components/CustomHead';
import PageHeading from '@/components/PageHeading';

export default function Post({ post: postFromProp }) {
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [post, setPost] = useState(postFromProp);
  const [editMode, setEditMode] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  let [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [likes, setLikes] = useState(post.likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const hasLiked = () => likes?.find((l) => l?.likerId == user?.id);
  const hasBookmarked = () => user?.bookmarks?.find((b) => b?.postId == post.id);

  const handleLike = async () => {
    if (user) {
      if (!likeLoading) {
        setLikeLoading(true);

        const res = await fetch(`/api/posts/${post.id}/like`, {
          method: hasLiked() ? 'DELETE' : 'POST',
        });
        if (hasLiked()) {
          setLikes(likes.filter((l) => l?.likerId !== user.id));
        } else {
          const { data } = await res.json();
          setLikes([...likes, data]);
        }

        setLikeLoading(false);
      }
    } else {
      toast.error('You must be logged-in to like a post');
    }
  };
  const handleBookmark = async () => {
    if (user) {
      if (!bookmarkLoading) {
        setBookmarkLoading(true);

        const res = await fetch(`/api/posts/${post.id}/bookmark`, {
          method: hasBookmarked() ? 'DELETE' : 'POST',
        });
        if (hasBookmarked()) {
          setUser({ ...user, bookmarks: user.bookmarks?.filter((b) => b?.postId !== post.id) });
        } else {
          const { data } = await res.json();
          setUser({ ...user, bookmarks: [...user.bookmarks, data] });
        }

        setBookmarkLoading(false);
      }
    } else {
      toast.error('You must be logged-in to bookmark a post');
    }
  };

  const handlePostUpdate = async (values) => {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    return await res.json();
  };

  const handleSubmit = async (values) => {
    setDisableSubmit(true);
    const data = handlePostUpdate(values);

    await toast.promise(data, {
      loading: 'Checking Fields...',
      success: (res) => {
        if (res?.data) {
          router.reload();
          return 'Post Updated!';
        } else {
          throw new Error(res.error);
        }
      },
      error: (err) => err.message,
    });
    setDisableSubmit(false);
  };

  const handlePostDelete = async () => {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'DELETE',
    });
    return await res.json();
  };

  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteLoading) {
      setDeleteLoading(true);

      const data = handlePostDelete();

      await toast.promise(data, {
        loading: 'Deleting...',
        success: (res) => {
          if (res?.data) {
            router.reload();
            return 'Post Deleted!';
          } else {
            throw new Error(res.error);
          }
        },
        error: (err) => err.message,
      });

      setDeleteLoading(false);
    }
  };

  const hasChanges = (newValues) => {
    const oldValues = {
      description: post.description,
      image: post.image,
      tags: post.tags,
      content: post.content,
    };
    let diffCount = 0;
    Object.keys(oldValues).forEach((key) => {
      if (oldValues[key] != newValues[key]) {
        diffCount++;
      }
    });
    return diffCount > 0;
  };

  return (
    <>
      <CustomHead
        title={`${postFromProp.title}`}
        description={postFromProp.description}
        author={{ name: postFromProp.owner?.name, username: postFromProp.owner?.username }}
        keywords={postFromProp.tags.map((t) => t.name)}
        image={postFromProp.image}
        imageAlt={postFromProp.title}
        type="article"
      />
      <div className="pt-12">
        <h1 className="font-semibold mb-2 text-gray-600">{post.title}</h1>
        <div className="mb-4 text-gray-500 flex justify-between items-center">
          <div title="Publish Date" className="flex items-center gap-2">
            <span className="text-lg isax-calendar-2"></span>
            <span className="text-sm">{readableDate(post.createdAt)}</span>
          </div>
          {post.createdAt != post.updatedAt && (
            <div title="Update Date" className="flex items-center gap-2">
              <span className="text-lg isax-calendar-edit"></span>
              <span className="text-sm">{readableDate(post.updatedAt)}</span>
            </div>
          )}
        </div>
        <Formik
          initialValues={{
            title: post.title,
            description: post.description,
            image: post.image,
            tags: post.tags,
            content: post.content,
            ownerId: post.ownerId,
          }}
          validationSchema={postValidation}
          onSubmit={handleSubmit}
        >
          {({ values, resetForm }) => (
            <Form className="flex flex-col gap-4">
              {editMode ? (
                <Field name="description">
                  {(prop) => (
                    <Textarea limit={255} label="Post Description" fieldProps={prop} rows={4} />
                  )}
                </Field>
              ) : (
                <p>{values.description}</p>
              )}
              <Field name="image">
                {(prop) => (
                  <ImageUploader fieldProps={prop} maxSize={2}>
                    <div className="relative select-none">
                      <div
                        className={`text-4xl shadow-lg relative overflow-hidden duration-500 flex w-full h-56 sm:h-80 rounded-lg items-center justify-center`}
                      >
                        {editMode ? (
                          <label
                            htmlFor={editMode ? 'uploader' : ''}
                            style={{ transition: '0.4s background' }}
                            className="absolute z-10 cursor-pointer bg-gray-800 hover:bg-opacity-50 bg-opacity-80 text-gray-100 w-16 h-16 flex items-center justify-center rounded-full"
                          >
                            <span className="text-3xl isax-gallery-edit"></span>
                          </label>
                        ) : (
                          ''
                        )}
                        <div
                          className="absolute w-full h-full bg-cover bg-center postImageAnimation"
                          style={{
                            backgroundImage: `url(${prop.field?.value})`,
                          }}
                        ></div>
                      </div>
                      {prop.field.value != post.image && (
                        <div
                          style={{ transition: '0.4s background' }}
                          onClick={() => {
                            prop.form.setFieldValue('image', post.image);
                          }}
                          className="absolute top-0 bg-red-500 right-0 bg-opacity-70 hover:bg-opacity-50 backdrop-blur text-white py-2.5 px-7 rounded-tr-lg rounded-bl-lg  cursor-pointer flex items-center gap-2"
                        >
                          <span className="isax-rotate-left text-2xl"></span>
                          <span className="text-sm">Restore Image</span>
                        </div>
                      )}
                    </div>
                  </ImageUploader>
                )}
              </Field>
              <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between">
                {editMode ? (
                  <Field name="tags">
                    {(prop) => (
                      <InputTag limit={5} label="Tags (use Enter or Comma)" fieldProps={prop} />
                    )}
                  </Field>
                ) : (
                  <ul className="flex gap-2 flex-wrap items-center">
                    {values?.tags?.map((tag) => {
                      return (
                        <li key={tag.slug}>
                          <Link
                            href={`/tag/${tag.slug}`}
                            className="flex text-sm hover:bg-gray-100 bg-gray-50 items-center py-1.5 px-3 border rounded-xl"
                          >
                            {tag.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="select-none flex justify-between sm:justify-start gap-4 text-[15px]">
                  <div className="flex gap-4">
                    <div className="flex gap-1 items-center">
                      {likeLoading ? (
                        <ClipLoader size={16} color={hasLiked() ? '#dd2b2a' : '#4d4d4d'} />
                      ) : (
                        <span className={hasLiked() ? 'text-red-600' : '#4d4d4d'}>
                          {compactNumber(likes.length || 0)}
                        </span>
                      )}
                      <span
                        onClick={handleLike}
                        className={`${
                          hasLiked() ? 'bg-red-50 text-red-600' : ''
                        } isax-heart text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-red-600`}
                      ></span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span href="#comments">{compactNumber(post._count.comments || 0)}</span>
                      <a
                        href="#comments"
                        className="isax-messages-3 text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600"
                      ></a>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div
                      onClick={handleBookmark}
                      className={`${
                        hasBookmarked() ? 'bg-yellow-50 text-yellow-600' : ''
                      } text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center hover:bg-yellow-50 hover:text-yellow-600`}
                    >
                      {bookmarkLoading ? (
                        <ClipLoader size={16} color={hasBookmarked() ? '#ca8a04' : '#4d4d4d'} />
                      ) : (
                        <span className="isax-archive-add"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-8">
                <Image
                  loading="lazy"
                  className="rounded-full shadow-md"
                  alt={post?.owner.name || post?.owner.username}
                  src={post?.owner?.image || '/profile.jpg'}
                  width="56"
                  height="56"
                ></Image>
                <div className="flex flex-col">
                  <Link
                    href={`/${post.owner.username}`}
                    className="text-sm font-semibold hover:translate-x-1 transition-transform duration-500"
                    title={post?.owner.username}
                  >
                    {post?.owner.name || post?.owner.username}
                  </Link>
                  <span className="text-xs">{post?.owner.profession}</span>
                </div>
              </div>
              <Field name="quillContent">
                {({ form }) => (
                  <QuillEditor
                    readOnly={!editMode}
                    value={JSON.parse(values.content)}
                    style={{ transition: '.4s border-color' }}
                    className={
                      editMode
                        ? 'min-h-[600px] border border-blue-200 hover:border-blue-300 rounded-lg'
                        : 'pb-40'
                    }
                    setQuillContent={(quillContent) => {
                      form.setFieldValue('content', JSON.stringify(quillContent));
                    }}
                  />
                )}
              </Field>
              {user?.id == post.ownerId ? (
                <div className="fixed z-20  top-28 right-0 flex flex-col gap-2 items-end">
                  <Modal
                    title="Confirm Delete"
                    content={<p>Are you sure you want to delete this post?</p>}
                    buttonText="Yes, delete"
                    isOpen={isDeleteOpen}
                    setIsOpen={setIsDeleteOpen}
                    buttonStyle="bg-red-500 hover:bg-red-400 text-gray-100"
                    handler={() => {
                      handleDelete();
                    }}
                  >
                    <div
                      style={{ transition: '0.4s all' }}
                      className={`bg-rose-600 hover:bg-red-500 hover:translate-x-0 translate-x-[calc(100%-3rem)] text-white select-none flex items-center cursor-pointer shadow-md rounded-tl-lg rounded-bl-lg`}
                    >
                      <span className="text-2xl isax-trash w-12 h-12 flex items-center justify-center"></span>
                      <div className="whitespace-nowrap pr-4 text-sm">Delete Post</div>
                    </div>
                  </Modal>
                  <div
                    onClick={() => setEditMode(!editMode)}
                    style={{ transition: '0.4s all' }}
                    className={`${
                      editMode
                        ? ' bg-sky-500 text-white hover:bg-sky-400'
                        : 'bg-amber-300 hover:bg-amber-200'
                    } select-none flex  items-center hover:translate-x-0 translate-x-[calc(100%-3rem)] cursor-pointer shadow-md rounded-tl-lg rounded-bl-lg`}
                  >
                    {editMode ? (
                      <span className="text-2xl isax-eye w-12 h-12 flex items-center justify-center"></span>
                    ) : (
                      <span className="text-2xl isax-edit-2 w-12 h-12 flex items-center justify-center"></span>
                    )}
                    <div className="whitespace-nowrap pr-4 text-sm">
                      {editMode ? 'Live Preview' : 'Edit Post'}
                    </div>
                  </div>
                  {editMode && hasChanges(values) ? (
                    <>
                      <div
                        onClick={() => {
                          resetForm();
                        }}
                        style={{ transition: '0.4s all' }}
                        className={`bg-gray-600 hover:bg-gray-500 hover:translate-x-0 translate-x-[calc(100%-3rem)] text-white select-none flex items-center cursor-pointer shadow-md rounded-tl-lg rounded-bl-lg`}
                      >
                        <span className="text-2xl isax-rotate-left w-12 h-12 flex items-center justify-center"></span>
                        <div className="whitespace-nowrap pr-4 text-sm">Reset Changes</div>
                      </div>
                      <button
                        type="submit"
                        disabled={disableSubmit}
                        style={{ transition: '0.4s all' }}
                        className={`bg-teal-400 hover:bg-teal-300 disabled:bg-opacity-50 hover:translate-x-0 translate-x-[calc(100%-3rem)] disabled:pointer-events-none select-none flex items-center cursor-pointer shadow-md rounded-tl-lg rounded-bl-lg`}
                      >
                        <span className="text-2xl isax-tick-circle w-12 h-12 flex items-center justify-center"></span>
                        <div className="whitespace-nowrap pr-4 text-sm">Save Changes</div>
                      </button>
                    </>
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                ''
              )}
            </Form>
          )}
        </Formik>
        <div>
          <PageHeading
            title={`Comments (${compactNumber(post._count.comments)})`}
            icon="isax-messages-3"
            color="bg-rose-50 text-rose-700"
          />
          {user ? (
            <CommentForm
              postId={post.id}
              onCommentAdd={(comment) => {
                setPost({
                  ...post,
                  comments: [comment, ...post.comments],
                  _count: { ...post._count, comments: post._count.comments + 1 },
                });
              }}
            />
          ) : (
            'Please login to make a comment.'
          )}
          <div id="comments" className="comments mt-8">
            {post.comments.length > 0
              ? post.comments?.map((comment) => {
                  return (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                      updateCommentCount={(delta) => {
                        setPost((prev) => {
                          return {
                            ...prev,
                            _count: { ...prev._count, comments: prev._count.comments + delta },
                          };
                        });
                      }}
                      deleteFromParent={async (deletedId) => {
                        setPost((prev) => {
                          return {
                            ...prev,
                            comments: prev.comments.filter((c) => c.id != deletedId),
                            _count: { ...prev._count, comments: prev._count.comments - 1 },
                          };
                        });
                      }}
                    />
                  );
                })
              : 'No comments found, be the first!'}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res, query }) {
  const user = await prisma.user.findUnique({
    where: {
      username: query.username,
    },
    include: {
      posts: {
        where: {
          slug: query.slug,
        },
        include: {
          owner: true,
          tags: true,
          likes: true,
          comments: {
            where: {
              parentId: null,
            },
            include: {
              history: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
              owner: true,
              reactions: true,
              _count: {
                select: { replies: true },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      },
    },
  });

  if (!user || !user.posts[0]) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      post: serialize(user.posts[0]),
    },
  };
}
