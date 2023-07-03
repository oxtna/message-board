export type Action = ({ request }: { request: Request }) => Promise<unknown>;

export default Action;
