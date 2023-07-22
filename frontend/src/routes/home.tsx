import { Flex } from "@chakra-ui/react";
import usePagedMessages from "../hooks/use-paged-messages";
import Post from "../components/post";

const Home: React.FC = () => {
  const { isLoading, isError, error, data } = usePagedMessages();
  // todo: after scrolling down enough get next page of messages

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    throw error;
  }

  const posts = data.messages.map((message) => (
    <Post key={message.url} message={message} />
  ));

  return (
    <Flex direction="column" gap={4}>
      {posts}
    </Flex>
  );
};

export default Home;
