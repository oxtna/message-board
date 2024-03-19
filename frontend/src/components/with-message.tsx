import { useFetcher, type FetcherWithComponents } from "react-router-dom";
import {
  useRef,
  useCallback,
  forwardRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import type Message from "../api/types/message";
import useUser from "../hooks/use-user";

export type WithMessageProps = {
  fetcher: FetcherWithComponents<unknown>;
  favorited: boolean;
  favoriteButtonRef: React.RefObject<HTMLButtonElement>;
  onFavoriteClick: () => void;
  messageID: number;
  messageTime: string;
  ownerName: string;
  text: string;
};

export type MessageProps = {
  message: Message;
};

const withMessage = (
  Component:
    | ForwardRefExoticComponent<
        WithMessageProps & RefAttributes<HTMLDivElement>
      >
    | React.FC<WithMessageProps>,
  displayName: string
): ForwardRefExoticComponent<MessageProps & RefAttributes<HTMLDivElement>> => {
  const componentWithMessage = forwardRef<HTMLDivElement, MessageProps>(
    ({ message }, ref) => {
      const fetcher = useFetcher();

      let favorited = message.favorited;

      // if the request is sent, update the UI immediately
      // and later update it again if needed
      if (fetcher.formData !== undefined) {
        favorited = fetcher.formData.get("favorited") === "false";
      }

      const favoriteButtonRef = useRef<HTMLButtonElement>(null);

      const onFavoriteClick = useCallback((): void => {
        favoriteButtonRef.current?.blur();
      }, [favoriteButtonRef]);
      const ownerID =
        message.owner === null
          ? null
          : +message.owner.slice(0, -1).split("/").slice(-1);

      const {
        isLoading: isUserLoading,
        isError: isUserError,
        error: userError,
        data: owner,
      } = useUser(ownerID);

      if (isUserLoading) {
        return <div>Loading...</div>;
      }
      if (isUserError) {
        throw userError;
      }

      let messageTime: string;
      message.time_created = new Date(message.time_created);
      const minutesAgo =
        (Date.now() - message.time_created.getTime()) / (60 * 1000);
      if (minutesAgo < 1) {
        messageTime = "now";
      } else if (minutesAgo < 60) {
        messageTime = `${Math.floor(minutesAgo)}m`;
      } else {
        const hoursAgo = minutesAgo / 60;
        if (hoursAgo < 24) {
          messageTime = `${Math.floor(hoursAgo)}h`;
        } else {
          const currentYear = new Date().getFullYear();
          const postYear = message.time_created.getFullYear();
          const postDate = message.time_created
            .toDateString()
            .split(" ")
            .slice(1, 3)
            .join(" ");
          messageTime =
            postYear === currentYear ? postDate : `${postDate}, ${postYear}`;
        }
      }

      return (
        <Component
          ref={ref}
          fetcher={fetcher}
          favorited={favorited}
          favoriteButtonRef={favoriteButtonRef}
          onFavoriteClick={onFavoriteClick}
          messageID={message.id}
          messageTime={messageTime}
          ownerName={owner.username}
          text={message.text}
        />
      );
    }
  );

  componentWithMessage.displayName = displayName;
  return componentWithMessage;
};

export default withMessage;
