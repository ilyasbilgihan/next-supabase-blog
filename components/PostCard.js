import Link from 'next/link';
import Image from 'next/image';
import useIntersection from 'hooks/useIntersection';
import { useUser } from 'store/UserContext';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { ClipLoader } from 'react-spinners';
import compactNumber from '@/utils/compactNumber';

export default function PostCard({ post, hideAuthor }) {
  const [isIntersecting, ref] = useIntersection();
  const { user, setUser } = useUser();
  const [likes, setLikes] = useState(post.likes);
  const [likeLoading, setLikeLoading] = useState(false);

  const hasLiked = () => likes.find((l) => l.likerId == user?.id);

  const handleLike = async () => {
    if (user) {
      if (!likeLoading) {
        setLikeLoading(true);

        const res = await fetch(`/api/posts/${post.id}/like`, {
          method: hasLiked() ? 'DELETE' : 'POST',
        });
        if (hasLiked()) {
          setLikes(likes.filter((l) => l.likerId !== user.id));
          setUser({ ...user, likedPosts: user.likedPosts?.filter((l) => l?.postId !== post.id) });
        } else {
          const { data } = await res.json();
          setLikes([...likes, data]);
          setUser({ ...user, likedPosts: [...user.likedPosts, data] });
        }

        setLikeLoading(false);
      }
    } else {
      toast.error('You must be logged-in to like a post.');
    }
  };

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 self-start flex-1 flex-col">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-sm">
              <span className="isax-clock"></span>
              <span>
                {new Date(post.createdAt).toLocaleDateString('en-UK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {!hideAuthor ? (
              <div className="flex justify-start">
                <Link
                  href={`/${post?.owner.username}`}
                  className="hidden md:flex hover:gap-3 transition-all duration-500 gap-2 items-center"
                  title={post?.owner.username}
                >
                  <Image
                    loading="lazy"
                    className="rounded-full shadow-md"
                    alt={post?.owner.name || post?.owner.username}
                    src={post?.owner?.image || '/profile.jpg'}
                    width="28"
                    height="28"
                  ></Image>
                  <span className="text-sm font-semibold">
                    {post?.owner.name || post?.owner.username}
                  </span>
                </Link>
              </div>
            ) : (
              ''
            )}
          </div>
          <h3 className="[&:has(.title:hover)]:translate-x-2 transition-transform duration-500 text-2xl font-semibold line-clamp-2 sm:line-clamp-1 ">
            <Link className="title" href={`/${post?.owner.username}/${post?.slug}`}>
              {post?.title}
            </Link>
          </h3>
          <p className="line-clamp-3 sm:line-clamp-4 leading-relaxed">{post?.description}</p>
        </div>
        {isIntersecting ? (
          <Link
            href={`/${post?.owner.username}/${post?.slug}`}
            style={{
              backgroundImage: `url(${post?.image || '/bridge.jpg'})`,
            }}
            className="sm:mt-7 shadow-lg postImageAnimation flex sm:w-auto h-[180px] sm:h-[144px] md:h-[180px] sm:aspect-[5/3] rounded-xl sm:rounded-lg"
          ></Link>
        ) : (
          ''
        )}
      </div>

      <div className="flex px-2 sm:px-0 justify-between">
        {!hideAuthor ? (
          <Link
            href={`/${post?.owner.username}`}
            className="md:hidden hover:gap-3 transition-all duration-500 flex gap-2 items-center"
            title={post?.owner.username}
          >
            <Image
              loading="lazy"
              className="rounded-full shadow-md"
              alt={post?.owner.name || post?.owner.username}
              src={post?.owner?.image || '/profile.jpg'}
              width="28"
              height="28"
            ></Image>
            <span className="text-sm font-semibold">
              {post?.owner.name || post?.owner.username}
            </span>
          </Link>
        ) : (
          ''
        )}
        <ul className="hidden md:flex gap-2 flex-wrap ">
          {post?.tags?.map((tag) => {
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
        <div className="text-[15px] items-start shrink-0 sm:gap-0 sm:w-[calc(144px*5/3)] md:w-[calc(180px*5/3)] flex">
          <div className="flex flex-1 gap-1 items-center justify-end pr-5">
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
          <div className="flex flex-1 gap-1 items-center pl-5">
            <Link
              href={`/${post?.owner.username}/${post?.slug}`}
              className="isax-messages-3 text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600"
            ></Link>
            <span>{compactNumber(post._count?.comments || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
