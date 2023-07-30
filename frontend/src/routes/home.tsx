import { useRef, useCallback, useContext } from "react";
import { type ActionFunction, redirect, useLoaderData } from "react-router-dom";
import { type QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Flex } from "@chakra-ui/react";
import authContext, { type AuthContextData } from "../contexts/auth-context";
import Post from "../components/post";
import { isString } from "../utils";
import { favorite, getPosts, unfavorite } from "../api/api";

export const loaderFactory =
  (queryClient: QueryClient, authContext: AuthContextData) => async () => {
    const token = authContext.token ?? undefined;
    return await queryClient.fetchInfiniteQuery({
      queryKey: ["posts"],
      queryFn: async ({ pageParam = 1 }) => await getPosts(pageParam, token),
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        return allPages.length + 1;
      },
      staleTime: 30 * 1000,
    });
  };

export const actionFactory = (
  queryClient: QueryClient,
  authContext: AuthContextData
): ActionFunction => {
  return async ({ request }) => {
    const token = authContext.token ?? null;
    if (token === null) {
      return redirect("/login/");
    }

    const formData = await request.formData();
    const postID = formData.get("id")?.valueOf();
    const favorited = formData.get("favorited")?.valueOf();
    if (!isString(postID)) {
      throw new Error("post id is not a string");
    }
    if (!isString(favorited)) {
      throw new Error("favorite is not a string");
    }
    if (favorited === "false") {
      await favorite(+postID, token);
    } else if (favorited === "true") {
      await unfavorite(+postID, token);
    }

    await queryClient.invalidateQueries({ queryKey: ["messages"] });
    return {};
  };
};

const Home: React.FC = () => {
  const { token } = useContext<AuthContextData>(authContext);

  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loaderFactory>>
  >;

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    data,
  } = useInfiniteQuery(
    ["messages", token],
    async ({ pageParam = 1 }) => await getPosts(pageParam, token),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        return allPages.length + 1;
      },
      initialData,
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
          fetchNextPage().catch((error) => {
            console.error(error);
          });
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

  const messages = data?.pages.flat(1);
  const posts = messages?.map((message, i) => {
    if (i + 1 === messages.length) {
      return <Post ref={lastPostRef} key={message.id} message={message} />;
    }
    return <Post key={message.id} message={message} />;
  });

  return (
    <Flex direction="column" gap={4}>
      {posts}
    </Flex>
  );
};

export default Home;
