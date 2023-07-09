import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import Post from "../components/post";
import type Message from "../interfaces/message";

interface APIResponse {
  count: number;
  next: string;
  previous: string;
  results: Message[];
}

const Home: React.FC = () => {
  const { isLoading, isError, error, data } = useQuery<APIResponse, AxiosError>(
    {
      queryKey: ["messages"],
      queryFn: async () => {
        const response = await axios.get("http://localhost:8000/api/messages/");
        return response.data;
      },
    }
  );

  if (isLoading) {
    return <span>Loading...</span>;
  }
  if (isError) {
    throw error;
  }

  const posts = data?.results.map((message) => (
    <Post
      key={message.id}
      id={message.id}
      text={message.text}
      owner={message.owner}
    />
  ));

  return <div>{posts}</div>;
};

export default Home;
