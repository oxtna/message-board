export interface Message {
  id: number;
  text: string;
  owner: string;
  // parent: string;
  // children: string[];  // todo: rename this in front and backend so that it doesn't conflict with React
}

export default Message;
