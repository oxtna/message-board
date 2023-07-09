import { useContext } from "react";
import useMessages from "../hooks/use-messages";
import Post from "../components/post";
import authContext from "../contexts/auth-context";

const UserProfile: React.FC = () => {
  const username = useContext(authContext)?.user?.username;
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
    <div>
      <span>{username ?? "Profile"}</span>
      <div>{posts}</div>
    </div>
  );
};

export default UserProfile;
