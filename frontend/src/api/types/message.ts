type Message = {
  url: string;
  id: number;
  text: string;
  time_created: string | Date;
  owner: string | null;
  parent: string | null;
  children: string[];
  favorite_count: number;
  favorited: boolean;
};

export default Message;
