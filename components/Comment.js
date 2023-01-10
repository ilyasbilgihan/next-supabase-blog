import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useCollapse from 'react-collapsed';
import CommentForm from './CommentForm';
import { Field, Form, Formik } from 'formik';
import { commentValidation } from '@/validations/comment.validation';
import Textarea from './Form/Textarea';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { useUser } from 'store/UserContext';
import { BeatLoader, ClipLoader } from 'react-spinners';
import Dropdown from './Dropdown';
import fromNow from '@/utils/fromNow';
import readableDate from '@/utils/readableDate';
import { diffWordsWithSpace, convertChangesToXML } from 'diff';
import Drawer from './Drawer';
import Collapse from './Collapse';
import compactNumber from '@/utils/compactNumber';

export default function Comment({ comment, postId, updateCommentCount, deleteFromParent }) {
  const [openHistory, setOpenHistory] = useState(false);
  const highlightChanges = (oldContent, newContent) => {
    const changes = diffWordsWithSpace(oldContent, newContent);
    return convertChangesToXML(changes);
  };

  const {
    getCollapseProps: formCollapseProps,
    getToggleProps: formToggleProps,
    isExpanded: formIsExpanded,
    setExpanded: setFormIsExpanded,
  } = useCollapse();
  const {
    getCollapseProps: replyCollapseProps,
    getToggleProps: replyToggleProps,
    isExpanded: replyIsExpanded,
    setExpanded: setReplyIsExpanded,
  } = useCollapse();

  const [currentComment, setCurrentComment] = useState(comment);

  const [replies, setReplies] = useState(null);
  const [repliesLoading, setRepliesLoading] = useState(false);

  const { user } = useUser();

  const [editComment, setEditComment] = useState(false);
  const dropdownItems = [
    {
      name: `${editComment ? 'Preview' : 'Edit'} Comment`,
      icon: editComment ? (
        <span className="isax-eye text-2xl"></span>
      ) : (
        <span className="isax-edit-2 text-2xl"></span>
      ),
    },
    {
      name: 'Delete Comment',
      color: 'danger',
      withDivider: true,
      icon: <span className="isax-trash text-2xl"></span>,
    },
  ];

  let [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [disableSubmit, setDisableSubmit] = useState(false);

  const handleFetchReplies = async (parentId) => {
    if (!repliesLoading && !replies) {
      setRepliesLoading(true);
      const res = await fetch(`/api/comments/${parentId}`);
      const data = await res.json();

      if (data?.data) {
        setReplies(data.data);
      } else {
        toast.error(data.error);
      }
      setRepliesLoading(false);
    }
  };

  const onReplyAdd = async (reply) => {
    setCurrentComment({
      ...currentComment,
      _count: { replies: currentComment._count.replies + 1 },
    });
    await handleFetchReplies(currentComment.id);
    setReplies([reply, ...(replies || [])]);

    setFormIsExpanded(false);
    setReplyIsExpanded(true);
    updateCommentCount(1);
  };

  const handleCommentEdit = async (values) => {
    const res = await fetch(`/api/comments/${currentComment.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    return await res.json();
  };

  const handleSubmitEditComment = async (values, { resetForm, setFieldValue }) => {
    if (!disableSubmit && values.content.trim()) {
      setDisableSubmit(true);
      const data = handleCommentEdit(values);

      await toast.promise(data, {
        loading: 'Checking Changes...',
        success: (res) => {
          if (res?.data) {
            resetForm();
            setEditComment(false);
            setFieldValue('content', res.data.content);
            setCurrentComment({
              ...currentComment,
              ...res.data,
            });
            return 'Comment Edited!';
          } else {
            throw new Error(res.error);
          }
        },
        error: (err) => err.message,
      });
      setDisableSubmit(false);
    }
  };

  const handleCommentDelete = async () => {
    const res = await fetch(`/api/comments/${currentComment.id}`, {
      method: 'DELETE',
    });
    return await res.json();
  };

  const handleDeleteConfirm = async () => {
    if (!disableSubmit) {
      setDisableSubmit(true);
      const data = handleCommentDelete();

      await toast.promise(data, {
        loading: 'Deleting Comment...',
        success: (res) => {
          if (res?.data) {
            setCurrentComment(res.data);

            if (res.data.owner.id != 'anonymous') {
              deleteFromParent(res.data.id);
            }

            return 'Comment Deleted!';
          } else {
            throw new Error(res.error);
          }
        },
        error: (err) => err.message,
      });
      setDisableSubmit(false);
    }
  };

  const [reactionLoading, setReactionLoading] = useState(false);

  const handleReaction = async (amount) => {
    if (!user) {
      toast.error('You must be logged-in to make a comment reaction');
      return;
    }

    if (!reactionLoading) {
      setReactionLoading(true);
      const res = await fetch(`/api/comments/${currentComment.id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: hasReacted() == amount ? 0 : amount }),
      });
      let { data } = await res.json();

      let tmp = currentComment.reactions.map((r) => {
        if (r.reacterId == data.reacterId) {
          r.value = data.value;
        }
        return r;
      });
      if (!tmp.find((r) => r.reacterId == data.reacterId)) {
        tmp.push(data);
      }

      setCurrentComment({ ...currentComment, reactions: tmp });
      setReactionLoading(false);
    }
  };

  const hasReacted = () => {
    return currentComment.reactions.find((r) => r?.reacterId == user?.id)?.value || 0;
  };

  return (
    <>
      <div className="comment">
        <div className="flex items-center gap-2">
          {currentComment.owner.id != 'anonymous' ? (
            <Link href={`/${currentComment.owner.username}`}>
              <Image
                alt={`Profile image of ${currentComment.owner.username}`}
                className="rounded-md shadow overflow-hidden"
                src={currentComment.owner.image || '/profile.jpg'}
                width={32}
                height={32}
              />
            </Link>
          ) : (
            <div className="h-8"></div>
          )}
          <Link
            href={`/${currentComment.owner.username}`}
            className="transition-transform duration-500 hover:translate-x-1 text-sm font-semibold"
          >
            {currentComment.owner.name || currentComment.owner.username}
          </Link>
          {currentComment.owner.id != 'anonymous' ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
                <time title={readableDate(currentComment.createdAt)}>
                  sent {fromNow(currentComment.createdAt)}
                </time>
                {currentComment.createdAt != currentComment.updatedAt ? (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <time title={readableDate(currentComment.updatedAt)}>
                      <span
                        onClick={() => (user ? setOpenHistory(true) : '')}
                        className={`${user ? 'underline cursor-pointer select-none' : ''} `}
                      >
                        edited
                      </span>{' '}
                      {fromNow(currentComment.updatedAt)}
                    </time>
                  </>
                ) : (
                  ''
                )}
              </div>
              {user?.id == currentComment.owner.id ? (
                <>
                  <Dropdown
                    items={dropdownItems}
                    className="origin-top-left !top-1 z-20 !left-0 !scale-75"
                    handler={(target) => {
                      switch (target) {
                        case 'Edit Comment':
                          setEditComment(true);
                          break;
                        case 'Preview Comment':
                          setEditComment(false);
                          break;
                        case 'Delete Comment':
                          setIsDeleteOpen(true);
                          break;
                        default:
                          break;
                      }
                    }}
                  >
                    <div className="group flex items-center gap-0.5 aspect-square rounded-full p-1">
                      <span className="w-1 h-1 bg-gray-500 group-hover:bg-gray-400 transition-colors rounded-full"></span>
                      <span className="w-1 h-1 bg-gray-500 group-hover:bg-gray-400 transition-colors rounded-full"></span>
                      <span className="w-1 h-1 bg-gray-500 group-hover:bg-gray-400 transition-colors rounded-full"></span>
                    </div>
                  </Dropdown>
                </>
              ) : (
                ''
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400 ">Unknown</span>
          )}
        </div>
        <div className="content flex gap-2">
          <div className="line-container w-8 flex justify-center py-2 shrink-0">
            <span
              style={{ transition: '0.4s background-color' }}
              className="line w-0.5 bg-gray-300 rounded"
            ></span>
          </div>
          <div className="flex flex-col w-full">
            <Formik
              initialValues={{
                content: currentComment.content,
              }}
              validationSchema={commentValidation}
              onSubmit={handleSubmitEditComment}
            >
              {({ values }) => (
                <Form className="">
                  {editComment ? (
                    <div className="mt-4 mb-2">
                      <Field name="content">
                        {(prop) => (
                          <Textarea
                            limit={255}
                            label="What are your thoughts?"
                            fieldProps={prop}
                            rows={6}
                          />
                        )}
                      </Field>
                      <button
                        disabled={disableSubmit || values.content === ''}
                        type="submit"
                        className="transition-colors py-3 px-4 text-gray-50 text-xs rounded-xl bg-teal-500 hover:bg-opacity-90 mt-2 disabled:!bg-opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply Changes
                      </button>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`${
                          currentComment.owner.id == 'anonymous' ? 'line-through text-xs' : ''
                        } whitespace-pre-line text-sm py-2 text-gray-600`}
                      >
                        {currentComment.owner.id == 'anonymous'
                          ? 'Deleted Content'
                          : values.content}
                      </p>
                    </>
                  )}
                </Form>
              )}
            </Formik>
            <div className="flex gap-2 items-center text-xl mb-2">
              {currentComment.owner.id != 'anonymous' ? (
                <div className="flex gap-3 items-center ">
                  <span
                    onClick={() => handleReaction(1)}
                    className={`${
                      hasReacted() == 1 ? 'bg-green-50 text-green-700' : ''
                    } select-none isax-arrow-up-2 cursor-pointer p-1.5 hover:bg-green-50 hover:text-green-700 rounded-full`}
                  ></span>
                  <span className="text-sm text-center">
                    {compactNumber(
                      currentComment.reactions.reduce((acc, curr) => (acc += curr.value), 0),
                    )}
                  </span>
                  <span
                    onClick={() => handleReaction(-1)}
                    className={`${
                      hasReacted() == -1 ? 'bg-red-50 text-red-700' : ''
                    } select-none isax-arrow-down-2 cursor-pointer p-1.5 hover:bg-red-50 hover:text-red-700 rounded-full`}
                  ></span>
                </div>
              ) : (
                ''
              )}
              {currentComment.owner.id != 'anonymous' && user ? (
                <span
                  {...formToggleProps()}
                  className="select-none text-sm font-semibold cursor-pointer"
                >
                  Reply
                </span>
              ) : (
                ''
              )}
            </div>
            <div {...formCollapseProps()}>
              <div className="mt-2">
                <CommentForm
                  postId={postId}
                  parentId={currentComment.id}
                  reply
                  onCommentAdd={onReplyAdd}
                />
              </div>
            </div>
            {currentComment._count.replies > 0 ? (
              <div>
                <button
                  {...replyToggleProps()}
                  className="mb-2 text-sm transition-colors text-orange-500 hover:text-orange-700 cursor-pointer select-none"
                >
                  <span
                    onClick={() => {
                      handleFetchReplies(currentComment.id);
                    }}
                  >
                    {replyIsExpanded ? 'Hide Replies' : 'Show Replies'}
                  </span>
                </button>
                <div className="replies" {...replyCollapseProps()}>
                  {repliesLoading ? (
                    <>
                      <BeatLoader color="#c2410c" size={8} />
                    </>
                  ) : (
                    replies?.map((reply) => {
                      return (
                        <Comment
                          key={reply.id}
                          comment={reply}
                          postId={postId}
                          updateCommentCount={updateCommentCount}
                          deleteFromParent={async (deletedId) => {
                            // setReplyIsExpanded(false);
                            setCurrentComment({
                              ...currentComment,
                              _count: { replies: currentComment._count.replies - 1 },
                            });
                            updateCommentCount(-1);
                            setReplies(replies.filter((r) => r.id != deletedId));
                            if (currentComment.owner.id == 'anonymous') {
                              if (replies.length == 1) {
                                await handleCommentDelete();
                                deleteFromParent(currentComment.id);
                              }
                            }
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
        <Modal
          title="Confirm Delete"
          content={
            <>
              <div>Are you sure you want to delete the following comment?</div>
              <p className="border-t pt-4 mt-4 text-xs text-gray-400 whitespace-pre-line line-clamp-6">
                {currentComment?.history?.at(-1).content}
              </p>
            </>
          }
          buttonText="Yes, delete comment"
          buttonStyle="bg-red-500 text-white"
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          handler={handleDeleteConfirm}
        />
        <Drawer
          title="Comment Edit History"
          open={openHistory}
          setOpen={setOpenHistory}
          content={
            <>
              <div className="flex gap-4">
                <div>
                  <Link
                    href={`/${currentComment.owner.username}`}
                    className="flex w-24 lg:w-28 xl:w-[136px] shadow-md rounded-lg overflow-hidden"
                  >
                    <Image
                      src={currentComment.owner.image || '/profile.jpg'}
                      width={136}
                      height={136}
                      alt={`Profile image of ${currentComment.owner.username}`}
                    />
                  </Link>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <h2 className="transition-transform duration-500 hover:translate-x-1 font-semibold text-gray-700">
                        <Link href={`/${currentComment.owner.username}`}>
                          {currentComment.owner.username}
                        </Link>
                      </h2>
                      <h5>{currentComment.owner.name}</h5>
                    </div>
                  </div>
                  {currentComment.owner.profession || currentComment.owner.location ? (
                    <div className="flex gap-4 mt-0">
                      {currentComment.owner.location ? (
                        <div className="flex gap-1 items-center">
                          <span className="font-semibold isax-location"></span>
                          <span className="text-sm">{currentComment.owner.location}</span>
                        </div>
                      ) : (
                        ''
                      )}
                      {currentComment.owner.profession ? (
                        <div className="flex gap-1 items-center">
                          <span className="font-semibold isax-briefcase"></span>
                          <span className="text-sm">{currentComment.owner.profession}</span>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  ) : (
                    ''
                  )}
                  {currentComment.owner.bio ? (
                    <p className="px-0 line-clamp-5 xl:line-clamp-2  text-sm">
                      {currentComment.owner.bio}
                    </p>
                  ) : (
                    ''
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 mt-6 border-t pt-6 gap-y-2 gap-x-8">
                {currentComment.history?.map((item, index) => {
                  return (
                    <div key={item.createdAt} className="flex flex-col">
                      <Collapse
                        button={
                          <div className="hover:text-gray-400 transition-colors duration-100 flex pb-2 border-b w-full flex-col items-start">
                            <h5 className="font-semibold">
                              {index == 0
                                ? 'Initial'
                                : index == currentComment.history.length - 1
                                ? 'Current'
                                : `Edit #${index}`}
                            </h5>
                            <div>
                              <span className="text-sm">{readableDate(item.createdAt)}</span>
                              <span className="ml-2 text-xs">({fromNow(item.createdAt)})</span>
                            </div>
                          </div>
                        }
                        content={
                          <p
                            className={`whitespace-pre-line text-sm py-2 text-gray-600`}
                            dangerouslySetInnerHTML={{
                              __html:
                                index == 0
                                  ? currentComment.history[0].content
                                  : highlightChanges(
                                      currentComment.history[index - 1]?.content,
                                      currentComment.history[index]?.content,
                                    ),
                            }}
                          ></p>
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </>
          }
        />
      </div>
    </>
  );
}
