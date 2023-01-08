import Loader from './Loader';
import PostCard from './PostCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import { PropagateLoader } from 'react-spinners';
import { motion } from 'framer-motion';

const cardVariants = {
  offscreen: {
    scale: 0.95,
  },
  onscreen: {
    scale: 1,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.5,
    },
  },
};

export default function ListPostCards({ initialPosts = [], limit, apiUrl, hideAuthor = false }) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextId, setNextId] = useState();
  const [loading, setLoading] = useState(false);

  const handleInitialFetch = async () => {
    const res = await fetch(`${apiUrl}?limit=${limit}`);
    const data = await res.json();
    setPosts(data.posts);
    setNextId(data.nextId);
  };

  const fetchMorePost = async () => {
    setLoading(true);
    const res = await fetch(`${apiUrl}?limit=${limit}&cursor=${nextId}`);
    const data = await res.json();
    /* if (!data?.posts) return; */
    setPosts((posts) => [...posts, ...data.posts]);
    setNextId(data.nextId);
    setLoading(false);
  };

  useEffect(() => {
    if (initialPosts.length == 0) {
      handleInitialFetch();
    } else {
      setNextId(initialPosts.at(-1)?.id);
    }

  }, []);

  if (posts?.length) {
    return (
      <div>
        <InfiniteScroll
          scrollThreshold="0px"
          dataLength={posts.length}
          next={fetchMorePost}
          hasMore={nextId}
          className="flex flex-col gap-16 relative pb-32"
          loader={<></>}
          endMessage={<span className="text-center">No more posts to show.</span>}
        >
          {posts?.map((post) => (
            <motion.div
              key={post.id}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.4 }}
              style={{ transformOrigin: 'top center' }}
              variants={cardVariants}
            >
              <PostCard post={post} hideAuthor={hideAuthor} />
            </motion.div>
          ))}
          {loading ? (
            <PropagateLoader
              color="#9ca3af"
              className="h-16 !absolute bottom-0 drop-shadow-sm left-1/2 -translate-x-1/2"
            />
          ) : (
            <></>
          )}
        </InfiniteScroll>
      </div>
    );
  } else {
    return <Loader />;
  }
}
