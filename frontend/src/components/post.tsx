import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  HStack,
  Heading,
  Link,
  Text,
  VStack,
  useBoolean,
} from "@chakra-ui/react";
import { ChatIcon, CloseIcon, StarIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { useRef, forwardRef } from "react";
import useUser from "../hooks/use-user";
import type Message from "../interfaces/message";
import type ChildrenProps from "../interfaces/children-props";
import Comment from "./comment";

type PostActionButtonProps = ChildrenProps & {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const PostActionButton = forwardRef<HTMLButtonElement, PostActionButtonProps>(
  ({ children, onClick }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        fontWeight={400}
        color="white"
        bgColor="gray.800"
        p={4}
        borderRadius="md"
        _hover={{ bgColor: "gray.700" }}
        _focus={{ bgColor: "gray.700" }}
      >
        <HStack justifyContent="space-between">{children}</HStack>
      </Button>
    );
  }
);

PostActionButton.displayName = "PostActionButton";

const Post: React.FC<Message> = ({ text, owner: ownerUrl }: Message) => {
  const { isLoading, isError, error, data: owner } = useUser(ownerUrl);

  const [favorite, setFavorite] = useBoolean(false);
  const [commentsExpanded, setCommentsExpanded] = useBoolean(false);

  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const commentsButtonRef = useRef<HTMLButtonElement>(null);

  const onFavoriteClick = (): void => {
    setFavorite.toggle();
    favoriteButtonRef.current?.blur();
  };
  const onCommentsClick = (): void => {
    setCommentsExpanded.on();
    commentsButtonRef.current?.blur();
  };

  if (isLoading) {
    return <span>Loading...</span>;
  }
  if (isError) {
    throw error;
  }

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
          {text}
        </Text>
      </CardBody>
      <CardFooter flexDirection="column" py={1}>
        <Box borderBottom="1px" borderColor="gray.600" />
        <Flex justifyContent="space-around" mt={1}>
          <PostActionButton onClick={onFavoriteClick} ref={favoriteButtonRef}>
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
          </PostActionButton>
          <PostActionButton onClick={onCommentsClick} ref={commentsButtonRef}>
            <ChatIcon mb={0.5} />
            <Text display={{ base: "none", md: "initial" }}>Comments</Text>
          </PostActionButton>
        </Flex>
        {commentsExpanded && (
          <VStack alignItems="flex-start" p={4} gap={5}>
            <Comment
              id={1}
              text="comment placeholder 1"
              owner="someone"
            ></Comment>
            <Comment
              id={2}
              text="comment placeholder 2"
              owner="somebody"
            ></Comment>
            <Comment
              id={3}
              text="comment placeholder 3"
              owner="someone"
            ></Comment>
          </VStack>
        )}
      </CardFooter>
    </Card>
  );
};

export default Post;
