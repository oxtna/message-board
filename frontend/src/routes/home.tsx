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
import { isString } from "../utils";
import { favorite, getPosts, unfavorite } from "../api/api";
import type Message from "../api/types/message";
import { isAxiosError } from "axios";

export const loaderFactory =
  (queryClient: QueryClient, authContext: AuthContextData) => async () => {
    let token = authContext.getToken();
    return await queryClient.fetchInfiniteQuery({
      queryKey: ["posts", token],
      queryFn: async ({ pageParam = 1 }) => {
        try {
          const posts = await getPosts(pageParam, token ?? undefined);
          return posts;
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 403) {
            const isRefreshed = await authContext.refreshToken();
            if (!isRefreshed) {
              return redirect("/home");
            }
            token = authContext.getToken();
            return await getPosts(pageParam, token ?? undefined);
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

export const actionFactory = (
  queryClient: QueryClient,
  authContext: AuthContextData
): ActionFunction => {
  return async ({ request }) => {
    const token = authContext.getToken();
    if (token === null) {
      return redirect("/login");
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
    let result: Awaited<ReturnType<typeof favorite>>;
    if (favorited === "false") {
      result = await favorite(+postID, token);
    } else if (favorited === "true") {
      result = await unfavorite(+postID, token);
    } else {
      throw new Error(
        'Invalid form value: favorited must be either "false" or "true"'
      );
    }
    if (result.error !== undefined) {
      throw new Error(result.error.detail);
    }
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
    return {};
  };
};

const Home: React.FC = () => {
  const { getToken, refreshToken } = useContext<AuthContextData>(authContext);

  let token = getToken();

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
    ["posts", token],
    async ({ pageParam = 1 }) => {
      try {
        const posts = await getPosts(pageParam, token ?? undefined);
        return posts;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          const isRefreshed = await refreshToken();
          if (!isRefreshed) {
            navigate("/home");
            return [];
          }
          token = getToken();
          return await getPosts(pageParam, token ?? undefined);
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
