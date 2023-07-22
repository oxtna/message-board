import { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Flex } from "@chakra-ui/react";
import type Message from "../interfaces/message";
import Post from "../components/post";
import axios from "axios";

const Home: React.FC = () => {
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    data,
  } = useInfiniteQuery(
    ["messages"],
    async ({ pageParam = "http://localhost:8000/api/messages/" }) => {
      const response = await axios.get<{
        next: string | null;
        results: Message[];
      }>(pageParam);
      response.data.results.forEach((message) => {
        message.created = new Date(message.created);
      });
      return response.data;
    },
    {
      getNextPageParam: (lastPage, _) => {
        return lastPage.next ?? undefined;
      },
    }
  );

  const observer = useRef<IntersectionObserver>();

  const lastPostRef = useCallback(
    (post: HTMLDivElement | null) => {
      if (isFetchingNextPage) {
        return;
      }
      if (observer.current !== undefined) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((posts) => {
        if (posts[0].isIntersecting && (hasNextPage ?? false)) {
          fetchNextPage().catch(console.error);
        }
      });
      if (post !== null) {
        observer.current.observe(post);
      }
    },
    [fetchNextPage, isFetchingNextPage, hasNextPage]
  );

  if (isError) {
    throw error;
  }

  const messages = data?.pages.map(({ results }) => results).flat(1);
  const posts = messages?.map((message, i) => {
    if (i + 1 === messages.length) {
      return <Post ref={lastPostRef} key={message.url} message={message} />;
    }
    return <Post key={message.url} message={message} />;
  });

  return (
    <Flex direction="column" gap={4}>
      {posts}
    </Flex>
  );
};

export default Home;
