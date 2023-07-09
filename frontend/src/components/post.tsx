import useUser from "../hooks/use-user";
import type Message from "../interfaces/message";

const Post: React.FC<Message> = ({ text, owner: ownerUrl }: Message) => {
  const { isLoading, isError, error, data: owner } = useUser(ownerUrl);

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
