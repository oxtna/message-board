import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Link,
  Text,
  VStack,
  useBoolean,
} from "@chakra-ui/react";
import { ChatIcon, CloseIcon, StarIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { useRef, useCallback } from "react";
import type Message from "../interfaces/message";
import useUser from "../hooks/use-user";
import useMessages from "../hooks/use-messages";
import Comment from "./comment";
import PostAction from "./post-action";

export type PostProps = {
  message: Message;
};

const Post: React.FC<PostProps> = ({ message }: PostProps) => {
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    data: owner,
  } = useUser(message.owner);

  const commentQueryResults = useMessages(message.children ?? []);

  const [favorite, setFavorite] = useBoolean(false);
  const [commentsExpanded, setCommentsExpanded] = useBoolean(false);

  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const commentsButtonRef = useRef<HTMLButtonElement>(null);

  const onFavoriteClick = useCallback((): void => {
    setFavorite.toggle();
    favoriteButtonRef.current?.blur();
  }, [setFavorite, favoriteButtonRef]);
  const onCommentsClick = useCallback((): void => {
    setCommentsExpanded.on();
    commentsButtonRef.current?.blur();
  }, [setCommentsExpanded, commentsButtonRef]);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }
  if (isUserError) {
    throw userError;
  }

  const comments = commentQueryResults.map(
    ({ isLoading, isError, error, data: comment }, i) => {
      const keys = message.children ?? [];
      if (isLoading) {
        return <div key={keys[i]}>Loading...</div>;
      }
      if (isError) {
        throw error;
      }
      return <Comment key={comment.url} message={comment} />;
    }
  );

  // todo: add time of posting to the card header
  return (
    <Card bgColor="gray.800" color="white">
      <CardHeader px={8}>
        <Heading fontWeight={400} fontSize="lg" color="gray.500">
          <Link
            as={RouterLink}
            to={`/user/${owner?.username}`}
            borderRadius="sm"
            p={2}
            _hover={{ color: "teal.400" }}
            _focus={{ color: "teal.400" }}
          >
            {owner?.username}
          </Link>
        </Heading>
      </CardHeader>
      <CardBody px={10}>
        <Text fontWeight={400} fontSize="md" color="gray.300">
          {message.text}
        </Text>
      </CardBody>
      <CardFooter flexDirection="column" py={1}>
        <Box borderBottom="1px" borderColor="gray.600" />
        <Flex justifyContent="space-around" mt={1}>
          <PostAction onClick={onFavoriteClick} ref={favoriteButtonRef}>
            {!favorite && (
              <>
                <StarIcon mb={1.5} />
                <Text display={{ base: "none", md: "initial" }}>Favorite</Text>
              </>
            )}
            {favorite && (
              <>
                <CloseIcon mb={1} boxSize={3} />
                <Text display={{ base: "none", md: "initial" }}>
                  Unfavorite
                </Text>
              </>
            )}
          </PostAction>
          <PostAction onClick={onCommentsClick} ref={commentsButtonRef}>
            <ChatIcon mb={0.5} />
            <Text display={{ base: "none", md: "initial" }}>Comments</Text>
          </PostAction>
        </Flex>
        {commentsExpanded && (
          <VStack alignItems="flex-start" p={4} gap={5}>
            {comments}
          </VStack>
        )}
      </CardFooter>
    </Card>
  );
};

export default Post;
