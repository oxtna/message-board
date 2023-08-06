import { useRef, useCallback, useContext } from "react";
import {
  type ActionFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { type QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Flex } from "@chakra-ui/react";
import authContext, { type AuthContextData } from "../contexts/auth-context";
import Post from "../components/post";
import { getPosts } from "../api/api";
import type Message from "../api/types/message";
import { isAxiosError } from "axios";
import { favoriteActionFactory } from "../actions";

// adding `LoaderFunction` return type causes type mismatches here
export const loaderFactory =
  (queryClient: QueryClient, authContext: AuthContextData) => async () => {
    const user = authContext.getUser();
    return await queryClient.fetchInfiniteQuery({
      queryKey: ["messages", user?.username],
      queryFn: async ({ pageParam = 1 }) => {
        try {
          return await getPosts(pageParam);
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 403) {
            return redirect("/home");
          }
          throw error;
        }
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage instanceof Response) {
          return undefined;
        }
        if (lastPage.length === 0) {
          return undefined;
        }
        return allPages.length + 1;
      },
      staleTime: 30 * 1000,
    });
  };

export const actionFactory =
  (queryClient: QueryClient, authContext: AuthContextData): ActionFunction =>
  async (args) => {
    const formData = await args.request.formData();
    const intent = formData.get("intent");
    if (intent === null) {
      throw new Error("Intent cannot be null");
    }

    if (intent === "favorite") {
      const favoriteAction = favoriteActionFactory(queryClient, authContext);
      return await favoriteAction(formData);
    }
  };

const Home: React.FC = () => {
  const user = useContext<AuthContextData>(authContext).getUser();

  const navigate = useNavigate();

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
    ["messages", user?.username],
    async ({ pageParam = 1 }) => {
      try {
        const posts = await getPosts(pageParam);
        return posts;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          navigate("/home");
          return [];
        }
        throw error;
      }
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage instanceof Response) {
          return undefined;
        }
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

  const messages = data?.pages
    .flat(1)
    .filter((value): value is Message => !(value instanceof Response));

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
