import { useEffect, useState } from "react";
import type Message from "../interfaces/message";
import type User from "../interfaces/user";
import { fetchData } from "../utils";

const Post: React.FC<Message> = ({ text, owner: ownerUrl }: Message) => {
  const [owner, setOwner] = useState<User>();

  useEffect(() => {
    fetchData<User>(new URL(ownerUrl))
      .then((owner) => {
        setOwner(owner);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <a>{owner?.username}</a>
      <span>{text}</span>
      <a>comments</a>
      <button>like button {/* todo later */}</button>
    </div>
  );
};

export default Post;
