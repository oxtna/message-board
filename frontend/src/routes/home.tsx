import { useEffect, useState } from "react";
import Post from "../components/post";
import type Message from "../interfaces/message";
import { fetchData } from "../utils";

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchData<{
      count: number;
      next: string;
      previous: string;
      results: Message[];
    }>(new URL("http://localhost:8000/api/messages/"))
      .then((fetchedMessages) => {
        setMessages(fetchedMessages.results);
      })
      .catch(console.error);
  }, []);

  const posts = messages.map((message) => (
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
