import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import type Message from "../interfaces/message";
import type User from "../interfaces/user";

const Post: React.FC<Message> = ({ text, owner: ownerUrl }: Message) => {
  const {
    isLoading,
    isError,
    error,
    data: owner,
  } = useQuery<User, AxiosError>({
    queryKey: ["users", ownerUrl],
    queryFn: async () => {
      const response = await axios.get(ownerUrl);
      return response.data;
    },
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }
  if (isError) {
    throw error;
  }

  return (
    <div>
      <a>{owner?.username}</a>
      <span>{text}</span>
      <a>comments</a>
    </div>
  );
};

export default Post;
