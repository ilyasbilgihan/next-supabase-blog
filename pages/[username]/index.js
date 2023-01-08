import ListPostCards from '@/components/ListPostCards';
import { serialize, prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { useUser } from 'store/UserContext';
import { useRouter } from 'next/router';
import Modal from '@/components/Modal';
import compactNumber from '@/utils/compactNumber';
import Tabs from '@/components/Tabs';
import CustomHead from '@/components/CustomHead';
import { coverImageValidation } from '@/validations/user.validation';
import { Field, Form, Formik } from 'formik';
import ImageUploader from '@/components/Form/ImageUploader';

const LIMIT = 3;

export default function Profile({ profile }) {
  const { user, setUser, signOut } = useUser();
  const router = useRouter();

  const [followers, setFollowers] = useState(profile.followers);
  const [followings, setFollowings] = useState(profile.followings);
  const [followLoading, setFollowLoading] = useState(false);

  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingsOpen, setIsFollowingsOpen] = useState(false);

  const hasFollowed = () => followers.find((f) => f?.followerId == user?.id);

  const handleFollow = async () => {
    if (user) {
      if (!followLoading) {
        setFollowLoading(true);

        const res = await fetch(`/api/users/${profile.id}/follow`, {
          method: hasFollowed() ? 'DELETE' : 'POST',
        });
        if (hasFollowed()) {
          setFollowers(followers.filter((f) => f?.followerId !== user.id));
          setUser((prev) => {
            return {
              ...prev,
              followings: prev.followings.filter((f) => f.followingId !== profile.id),
            };
          });
        } else {
          const { data, error } = await res.json();
          if (!error) {
            setFollowers([...followers, data]);
            setUser((prev) => {
              return {
                ...prev,
                followings: [...prev.followings, data],
              };
            });
          }
        }

        setFollowLoading(false);
      }
    } else {
      toast.error('You must be logged-in to follow someone.');
    }
  };

  const [disableSubmit, setDisableSubmit] = useState(false);

  const handleCoverImageUpdate = async (values) => {
    const res = await fetch(`/api/users/${user.id}/coverImage`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    return await res.json();
  };

  const handleCoverImageSubmit = async (values) => {
    if (!disableSubmit) {
      setDisableSubmit(true);
      const data = handleCoverImageUpdate(values);

      await toast.promise(data, {
        loading: 'Checking Cover Image...',
        success: (res) => {
          if (res?.data) {
            setUser(res.data);
            router.reload();
            return 'Cover Image Updated!';
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
      <CustomHead
        title={`${profile.name || profile.username}`}
        description={`Read posts from ${profile.name || profile.username}. ${profile.bio}`}
        image={profile.image || '/profile.jpg'}
        imageAlt={profile.name || profile.username}
        type="profile"
      />
      <div className="-mx-4 sm:-mx-12 md:-mx-24 lg:-mx-[120px] xl:-mx-80">
        <Formik
          initialValues={{
            coverImage: profile.coverImage,
          }}
          validationSchema={coverImageValidation}
          onSubmit={handleCoverImageSubmit}
        >
          {({ values }) => (
            <Form>
              <div
                style={{
                  backgroundImage: `url(${values.coverImage || '/default-cover.jpg'})`, // ${values.coverImage}
                }}
                className="relative bg-center bg-cover sm:h-[320px] "
              >
                {user && user.id == profile.id ? (
                  <div className="hidden sm:flex absolute top-6 right-6 text-xl z-30">
                    {values.coverImage?.startsWith('data') ? (
                      <div className="flex gap-2">
                        <button
                          type="reset"
                          title="Discard Changes"
                          className="flex shadow hover:scale-110 cursor-pointer isax-gallery-remove p-3 rounded-full bg-red-400 text-white"
                        ></button>
                        <button
                          type="submit"
                          title="Apply Changes"
                          className="flex shadow hover:scale-110 cursor-pointer isax-gallery-tick p-3 rounded-full bg-green-400"
                        ></button>
                      </div>
                    ) : (
                      <Field name="coverImage">
                        {(prop) => (
                          <ImageUploader fieldProps={prop} maxSize={2}>
                            <label
                              htmlFor="uploader"
                              className="flex shadow hover:scale-110 cursor-pointer isax-gallery-edit p-3 rounded-full bg-amber-400"
                            ></label>
                          </ImageUploader>
                        )}
                      </Field>
                    )}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </Form>
          )}
        </Formik>

        <div className="wrapper sm:-mt-[160px] relative z-20">
          <div className="sm:shadow-[0px_-15px_15px_-15px_rgba(0,0,0,0.5)] -mx-8 grid grid-cols-1 place-items-center sm:grid-cols-4 mb-8 gap-8 p-8 bg-white rounded-tl-2xl rounded-tr-2xl">
            {user && user.id == profile.id ? (
              <div className="flex sm:hidden justify-between w-full px-4">
                <div
                  onClick={() => {
                    signOut();
                    router.reload();
                  }}
                  className="flex sm:hidden group items-center gap-2 mb-8 text-red-500 cursor-pointer"
                >
                  <span className="isax-logout text-lg"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-500 text-sm">
                    Logout
                  </span>
                </div>
                <Link
                  href={`/settings`}
                  className="flex sm:hidden group items-center gap-2 mb-8 text-primary cursor-pointer"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-500 text-sm">
                    Profile Details
                  </span>
                  <span className="isax-user-edit text-lg"></span>
                </Link>
              </div>
            ) : (
              ''
            )}
            <Image
              alt={`Profile image of ${profile.username}`}
              src={profile.image || '/profile.jpg'}
              width={192}
              height={192}
              priority={true}
              className="shadow-lg rounded-full sm:rounded-xl object-cover"
            />
            <div className="place-self-start sm:col-span-3 w-full flex flex-col gap-2 text-center items-center sm:text-start sm:items-start">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between w-full ">
                <div>
                  <h2 className="font-semibold">{profile.username}</h2>
                  <h5>{profile.name}</h5>
                </div>
                {profile.id != user?.id ? (
                  <span
                    onClick={handleFollow}
                    className={`${
                      hasFollowed()
                        ? `!bg-white !text-primary border border-primary ${
                            !followLoading ? 'hover:!text-red-600 hover:border-red-500' : ''
                          }`
                        : ''
                    } mt-2 sm:mt-0 select-none group flex items-center self-center sm:self-start text-sm h-10  px-5 bg-blue-500 cursor-pointer hover:bg-opacity-80 rounded-md text-gray-100`}
                  >
                    {followLoading ? (
                      <ClipLoader size={16} color={hasFollowed() ? '#0070f3' : '#ffffff'} />
                    ) : hasFollowed() ? (
                      <>
                        <div className="group-hover:hidden flex items-center gap-2">
                          <span className="-ml-2 isax-profile-tick text-xl"></span>
                          <span className="w-16">Following</span>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-2">
                          <span className="-ml-2 isax-profile-delete text-xl"></span>
                          <span className="w-16">Unfollow</span>
                        </div>
                      </>
                    ) : (
                      <span>Follow</span>
                    )}
                  </span>
                ) : (
                  ''
                )}
              </div>
              {profile.profession || profile.location ? (
                <div className="flex gap-4 mt-2 sm:mt-0">
                  {profile.location ? (
                    <div className="flex gap-1">
                      <span className="font-semibold isax-location"></span>
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  ) : (
                    ''
                  )}
                  {profile.profession ? (
                    <div className="flex gap-1">
                      <span className="font-semibold isax-briefcase"></span>
                      <span className="text-sm">{profile.profession}</span>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                ''
              )}
              {profile.bio ? (
                <p className="px-12 sm:px-0 line-clamp-5 sm:line-clamp-3 text-sm">{profile.bio}</p>
              ) : (
                ''
              )}
              <div className="grid grid-cols-3 divide-x-2 sm:divide-x-0 sm:flex sm:gap-4 mt-2 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:gap-2 items-center px-4 sm:px-0">
                  <b>{profile.posts.length}</b>
                  <strong>Post{profile.posts.length > 1 ? 's' : ''}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-2 items-center px-4 sm:px-0">
                  <b>{compactNumber(followers.length)}</b>
                  {user?.followings.find((f) => f.followingId == profile.id) ||
                  user?.id == profile.id ? (
                    <Modal
                      title={`Followers (${compactNumber(followers.length)})`}
                      content={
                        <>
                          {followers.length > 0 ? (
                            <>
                              <p className="mb-2">
                                Last 10 followers of{' '}
                                <span className="font-semibold">@{profile.username}</span>
                              </p>
                              <ul style={{ overflowY: 'overlay' }} className="max-h-64 -mr-2.5">
                                {followers.map((f) => {
                                  const followers = f.follower;
                                  return (
                                    <li
                                      key={followers.id}
                                      className="pl-1 first-of-type:border-t-0 border-t mr-2.5 py-2.5 flex gap-3 justify-between items-center"
                                    >
                                      <Link
                                        className="flex shrink-0 rounded-lg transition-transform duration-300 hover:scale-105 w-9 h-9 shadow overflow-hidden"
                                        href={`/${followers.username}`}
                                      >
                                        <Image
                                          alt={followers.username}
                                          src={followers?.image || '/profile.jpg'}
                                          width={36}
                                          height={36}
                                        />
                                      </Link>
                                      <div className="flex-grow">
                                        <Link
                                          href={`/${followers.username}`}
                                          className="inline-flex font-semibold transition-transform duration-300 hover:translate-x-0.5"
                                        >
                                          {followers?.name || followers.username}
                                        </Link>
                                        <p className="text-xs line-clamp-1">{followers.bio}</p>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </>
                          ) : (
                            <div>No followers yet</div>
                          )}
                        </>
                      }
                      isOpen={isFollowersOpen}
                      setIsOpen={setIsFollowersOpen}
                      buttonStyle="hidden"
                    >
                      <strong>Follower{followers.length > 1 ? 's' : ''}</strong>
                    </Modal>
                  ) : (
                    <strong>Follower{followers.length > 1 ? 's' : ''}</strong>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-2 items-center px-4 sm:px-0">
                  <b>{compactNumber(followings.length)}</b>
                  {user?.followings.find((f) => f.followingId == profile.id) ||
                  user?.id == profile.id ? (
                    <Modal
                      title={`Followings (${compactNumber(followings.length)})`}
                      content={
                        <>
                          {followings.length > 0 ? (
                            <>
                              <p className="mb-2">
                                Last 10 followings by{' '}
                                <span className="font-semibold">@{profile.username}</span>
                              </p>
                              <ul style={{ overflowY: 'overlay' }} className="max-h-64 -mr-2.5">
                                {followings.map((f) => {
                                  const following = f.following;
                                  return (
                                    <li
                                      key={following.id}
                                      className="pl-1 first-of-type:border-t-0 border-t mr-2.5 py-2.5 flex gap-3 justify-between items-center"
                                    >
                                      <Link
                                        className="flex shrink-0 rounded-lg transition-transform duration-300 hover:scale-105 w-9 h-9 shadow overflow-hidden"
                                        href={`/${following.username}`}
                                      >
                                        <Image
                                          alt={following.username}
                                          src={following?.image || '/profile.jpg'}
                                          width={36}
                                          height={36}
                                        />
                                      </Link>
                                      <div>
                                        <Link
                                          href={`/${following.username}`}
                                          className="inline-flex font-semibold transition-transform duration-300 hover:translate-x-0.5"
                                        >
                                          {following?.name || following.username}
                                        </Link>
                                        <p className="text-xs line-clamp-1">{following.bio}</p>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </>
                          ) : (
                            <div>No followings yet</div>
                          )}
                        </>
                      }
                      isOpen={isFollowingsOpen}
                      setIsOpen={setIsFollowingsOpen}
                      buttonStyle="hidden"
                    >
                      <strong>Following{followings.length > 1 ? 's' : ''}</strong>
                    </Modal>
                  ) : (
                    <strong>Following{followings.length > 1 ? 's' : ''}</strong>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <Tabs
              tabs={[
                {
                  name: 'Shared Posts',
                  icon: <span className="isax-receipt-edit font-semibold"></span>,
                  content: (
                    <>
                      {profile.posts.length ? (
                        <ListPostCards
                          hideAuthor={true}
                          limit={LIMIT}
                          apiUrl={`/api/users/${profile.id}`}
                          initialPosts={profile.posts}
                        />
                      ) : (
                        'No posts yet.'
                      )}
                    </>
                  ),
                },
                {
                  name: 'Liked Posts',
                  icon: <span className="isax-heart font-semibold"></span>,
                  content: (
                    <>
                      {profile.likedPosts.length ? (
                        <ListPostCards
                          initialPosts={profile.likedPosts.map((p) => p.post)}
                          limit={LIMIT}
                          apiUrl={`/api/likedPosts/${profile.id}`}
                        />
                      ) : (
                        'No liked posts yet.'
                      )}
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res, query }) {
  const profile = await prisma.user.findUnique({
    where: {
      username: query.username,
    },
    include: {
      posts: {
        take: LIMIT,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          owner: true,
          tags: true,
          likes: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
      likedPosts: {
        take: LIMIT,
        orderBy: {
          assignedAt: 'desc',
        },
        include: {
          post: {
            include: {
              owner: true,
              tags: true,
              likes: true,
              _count: {
                select: {
                  comments: true,
                },
              },
            },
          },
        },
      },
      followers: {
        include: {
          follower: true,
        },
        orderBy: {
          assignedAt: 'desc',
        },
        take: 10,
      },
      followings: {
        include: {
          following: true,
        },
        orderBy: {
          assignedAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!profile) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }

  return {
    props: {
      profile: serialize(profile),
    },
  };
}
