type Message = {
  url: string;
  id: number;
  text: string;
  created: Date;
  owner: string;
  parent: string | null;
  children: string[];
  favorite_count: number;
  favorited: boolean;
};

export default Message;
