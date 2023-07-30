import { useContext } from "react";
import authContext from "../contexts/auth-context";
import usePagedMessages from "../hooks/use-paged-messages";
import Post from "../components/post";

const UserProfile: React.FC = () => {
  const username = useContext(authContext).user?.username;
  const { isLoading, isError, error, data } = usePagedMessages();

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
    <div>
      <span>{username ?? "Profile"}</span>
      <div>{posts}</div>
    </div>
  );
};

export default UserProfile;
