import { Flex } from "@chakra-ui/react";
import useMessages from "../hooks/use-messages";
import Post from "../components/post";

const Home: React.FC = () => {
  const { isLoading, isError, error, data } = useMessages();

  if (isLoading) {
    return <span>Loading...</span>;
  }
  if (isError) {
    throw error;
  }

  const posts = data.results.map((message) => (
    <Post
      key={message.id}
      id={message.id}
      text={message.text}
      owner={message.owner}
    />
  ));

  return (
    <Flex direction="column" gap={4}>
      {posts}
    </Flex>
  );
};

export default Home;
