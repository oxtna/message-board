import { useContext } from "react";
import authContext from "../contexts/auth-context";
import type PagedResponse from "../api/types/paged-response";
import Post from "../components/post";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import type Message from "../api/types/message";

const UserProfile: React.FC = () => {
  const username = useContext(authContext).user?.username;
  const userID = useContext(authContext).user?.userID;
  // TODO: replace this after the backend gets a better implementation
  const pageUrl = "http://localhost:8000/api/messages/";
  // UseQueryResult<PagedResponse<Message>, AxiosError>
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["messages", pageUrl],
    queryFn: async () => {
      const response = await axios.get<PagedResponse<Message>>(pageUrl);
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    throw error;
  }

  const posts = data.results.map((message) => (
    <Post key={message.url} message={message} />
  ));

  return (
    <div>
      <span>{username ?? "Profile"}</span>
      <div>{posts}</div>
    </div>
  );
};

export default UserProfile;
