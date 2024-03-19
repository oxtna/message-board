import { useRef, useCallback, useContext } from "react";
import { type ActionFunction, redirect, useLoaderData } from "react-router-dom";
import { type QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Flex } from "@chakra-ui/react";
import authContext, { type AuthContextData } from "../contexts/auth-context";
import Post from "../components/post";
import { getData } from "../api/api";
import type Message from "../api/types/message";
import { isAxiosError } from "axios";
import { favoriteActionFactory } from "../actions";
import type PagedResponse from "../api/types/paged-response";

// adding `LoaderFunction` return type causes type mismatches here
export const loaderFactory =
  (queryClient: QueryClient, authContext: AuthContextData) => async () => {
    const user = authContext.getUser();
    return await queryClient.fetchInfiniteQuery({
      queryKey: ["messages", user?.username],
      queryFn: async ({ pageParam = "" }) => {
        pageParam =
          pageParam === ""
            ? "http://localhost:8000/api/messages/?posts=true"
            : pageParam;
        try {
          return await getData<PagedResponse<Message>>(pageParam);
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 403) {
            return redirect("/home");
          }
          throw error;
        }
      },
      getNextPageParam: (lastPage, _) => {
        if (lastPage instanceof Response) {
          return undefined;
        }
        if (lastPage.next === null) {
          return undefined;
        }
        return lastPage.next;
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
    async ({ pageParam = "" }) => {
      pageParam =
        pageParam === ""
          ? "http://localhost:8000/api/messages/?posts=true"
          : pageParam;
      try {
        return await getData<PagedResponse<Message>>(pageParam);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          return redirect("/home");
        }
        throw error;
      }
    },
    {
      getNextPageParam: (lastPage, _) => {
        if (lastPage instanceof Response) {
          return undefined;
        }
        if (lastPage.next === null) {
          return undefined;
        }
        return lastPage.next;
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
    .filter(
      (value): value is PagedResponse<Message> => !(value instanceof Response)
    )
    .map((pagedMessages) => pagedMessages.results)
    .flat(1);

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
