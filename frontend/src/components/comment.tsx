import { useCallback, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Heading,
  Input,
  Link,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { ChatIcon, CloseIcon, StarIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useFetcher } from "react-router-dom";
import type Message from "../api/types/message";
import useUser from "../hooks/use-user";

export type CommentProps = { message: Message };

export const Comment: React.FC<CommentProps> = ({ message }: CommentProps) => {
  const ownerID = +message.owner.slice(0, -1).split("/").slice(-1);
  const { isLoading, isError, error, data: owner } = useUser(ownerID);

  const fetcher = useFetcher();
  let favorited = message.favorited;
  if (fetcher.formData !== undefined) {
    favorited = fetcher.formData.get("favorited") === "false";
  }

  const favoriteButtonRef = useRef<HTMLButtonElement>(null);

  const onFavoriteClick = useCallback((): void => {
    favoriteButtonRef.current?.blur();
  }, [favoriteButtonRef]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    throw error;
  }

  let commentTime: string;
  const minutesAgo = (Date.now() - message.created.getTime()) / (60 * 1000);
  if (minutesAgo < 1) {
    commentTime = "now";
  } else if (minutesAgo < 60) {
    commentTime = `${Math.floor(minutesAgo)}m`;
  } else {
    const hoursAgo = minutesAgo / 60;
    if (hoursAgo < 24) {
      commentTime = `${Math.floor(hoursAgo)}h`;
    } else {
      const currentYear = new Date().getFullYear();
      const postYear = message.created.getFullYear();
      const postDate = message.created
        .toDateString()
        .split(" ")
        .slice(1, 3)
        .join(" ");
      commentTime =
        postYear === currentYear ? postDate : `${postDate}, ${postYear}`;
    }
  }

  return (
    <Card as="div" bgColor="gray.900" color="white" width="80%">
      <CardHeader px={6} pb={2}>
        <HStack>
          <Heading fontWeight={400} fontSize="md" color="gray.500">
            <Link
              as={RouterLink}
              to={`/user/${owner.username}`}
              borderRadius="sm"
              px={1}
              _hover={{ color: "teal.400" }}
              _focus={{ color: "teal.400" }}
            >
              {owner.username}
            </Link>
          </Heading>
          <Spacer />
          <Heading fontWeight={400} fontSize="md" color="gray.500">
            {commentTime}
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody py={2}>
        <Text fontWeight={400} fontSize="md" color="gray.300" px={1}>
          {message.text}
        </Text>
      </CardBody>
      <CardFooter
        py={1}
        px={4}
        h={12}
        justifyContent="space-around"
        alignItems="center"
      >
        <fetcher.Form method="post" style={{ height: "100%" }}>
          <Button
            ref={favoriteButtonRef}
            onClick={onFavoriteClick}
            type="submit"
            name="intent"
            value="favorite"
            fontWeight={400}
            color="white"
            bgColor="gray.900"
            fontSize="sm"
            height="100%"
            borderRadius="md"
            alignItems="center"
            _hover={{ bgColor: "gray.700" }}
            _focus={{ bgColor: "gray.700" }}
          >
            <HStack justifyContent="space-between">
              {favorited ? (
                <>
                  <CloseIcon mb={1} boxSize={3} />
                  <Text display={{ base: "none", md: "initial" }}>
                    Unfavorite
                  </Text>
                </>
              ) : (
                <>
                  <StarIcon mb={1.5} />
                  <Text display={{ base: "none", md: "initial" }}>
                    Favorite
                  </Text>
                </>
              )}
            </HStack>
          </Button>
          <Input
            type="hidden"
            name="favorited"
            value={favorited ? "true" : "false"}
            readOnly
          />
          <Input type="hidden" name="id" value={message.id} readOnly />
        </fetcher.Form>
        <Link
          as={RouterLink}
          to={`/message/${message.id}`}
          color="white"
          bgColor="gray.900"
          fontWeight={400}
          fontSize="sm"
          borderRadius="md"
          height="100%"
          px={4}
          display="inline-flex"
          alignItems="center"
          _hover={{ bgColor: "gray.700" }}
          _focus={{ bgColor: "gray.700" }}
        >
          <HStack justifyContent="space-between">
            <ChatIcon mb={0.5} />
            <Text display={{ base: "none", md: "initial" }}>Comments</Text>
          </HStack>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default Comment;
