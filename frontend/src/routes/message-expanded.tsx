import { useContext } from "react";
import { Input, VStack } from "@chakra-ui/react";
import {
  type LoaderFunctionArgs,
  type ActionFunction,
  useParams,
  useLoaderData,
  redirect,
  Navigate,
  Form,
} from "react-router-dom";
import { type QueryClient, useQuery, useQueries } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getMessage } from "../api/api";
import authContext, { type AuthContextData } from "../contexts/auth-context";
import { favoriteActionFactory, commentActionFactory } from "../actions";
import Post from "../components/post";
import Comment from "../components/comment";

export const loaderFactory =
  (queryClient: QueryClient, authContext: AuthContextData) =>
  async ({ params }: LoaderFunctionArgs) => {
    if (params.messageID === undefined) {
      throw new Error("Message not found");
    }
    const id = +params.messageID;
    const user = authContext.getUser();

    return await queryClient.ensureQueryData({
      queryKey: ["messages", id, user],
      queryFn: async () => {
        try {
          return await getMessage(id);
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 403) {
            return redirect(`/message/${id}`);
          }
          throw error;
        }
      },
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
    } else if (intent === "comment") {
      const commentAction = commentActionFactory(queryClient, authContext);
      return await commentAction(formData);
    }
  };

const MessageExpanded: React.FC = () => {
  const params = useParams();
  if (params.messageID === undefined) {
    throw new Error("Message not found");
  }

  const id = +params.messageID;

  const user = useContext(authContext).getUser();

  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loaderFactory>>
  >;

  const { isError, error, isLoading, data } = useQuery({
    queryKey: ["messages", id, user],
    queryFn: async () => {
      try {
        const posts = await getMessage(id);
        return posts;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          return redirect(`/message/${id}`);
        }
        throw error;
      }
    },
    initialData,
  });

  const commentIDs =
    data instanceof Response
      ? []
      : data.children.map((url) => +url.slice(0, -1).split("/").slice(-1));

  const commentQueryResults = useQueries({
    queries: commentIDs.map((id) => ({
      queryKey: ["messages", user?.username, id],
      queryFn: async () => await getMessage(id),
    })),
  });

  const comments = commentQueryResults.map(
    ({ isLoading, isError, error, data: comment }, i) => {
      if (isLoading) {
        return <div key={commentIDs[i]}>Loading...</div>;
      }
      if (isError) {
        throw error;
      }
      return <Comment key={comment.url} message={comment} />;
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    throw error;
  }

  if (data instanceof Response) {
    return <Navigate to={data.url} />;
  }

  return (
    <>
      <Post message={data} />
      <Form>
        <Input my={4} placeholder="Your comment..." color="white" />
      </Form>
      <VStack>{comments}</VStack>
    </>
  );
};

export default MessageExpanded;
