export type Message = {
  url: string;
  created: Date;
  text: string;
  owner: string;
  parent?: string | null;
  children?: string[];
  favorite_count?: number;
};

export default Message;
