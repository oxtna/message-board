import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Input,
  Link,
  Text,
  Spacer,
} from "@chakra-ui/react";
import { ChatIcon, CloseIcon, StarIcon } from "@chakra-ui/icons";
import { useFetcher, Link as RouterLink } from "react-router-dom";
import { useRef, useCallback, forwardRef } from "react";
import type Message from "../api/types/message";
import useUser from "../hooks/use-user";

export type PostProps = {
  message: Message;
};

const Post = forwardRef<HTMLDivElement, PostProps>(({ message }, ref) => {
  const fetcher = useFetcher();

  let favorited = message.favorited;

  // if the request is sent, update the UI immediately
  // and later update it again if needed
  if (fetcher.formData !== undefined) {
    favorited = fetcher.formData.get("favorited") === "false";
  }

  const ownerID = +message.owner.slice(0, -1).split("/").slice(-1);
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    data: owner,
  } = useUser(ownerID);

  const favoriteButtonRef = useRef<HTMLButtonElement>(null);

  const onFavoriteClick = useCallback((): void => {
    favoriteButtonRef.current?.blur();
  }, [favoriteButtonRef]);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }
  if (isUserError) {
    throw userError;
  }

  let postTime: string;
  const minutesAgo = (Date.now() - message.created.getTime()) / (60 * 1000);
  if (minutesAgo < 1) {
    postTime = "now";
  } else if (minutesAgo < 60) {
    postTime = `${Math.floor(minutesAgo)}m`;
  } else {
    const hoursAgo = minutesAgo / 60;
    if (hoursAgo < 24) {
      postTime = `${Math.floor(hoursAgo)}h`;
    } else {
      const currentYear = new Date().getFullYear();
      const postYear = message.created.getFullYear();
      const postDate = message.created
        .toDateString()
        .split(" ")
        .slice(1, 3)
        .join(" ");
      postTime =
        postYear === currentYear ? postDate : `${postDate}, ${postYear}`;
    }
  }

  return (
    <Card ref={ref} as="div" bgColor="gray.800" color="white">
      <CardHeader px={8}>
        <HStack>
          <Heading fontWeight={400} fontSize="lg" color="gray.500">
            <Link
              as={RouterLink}
              to={`/user/${owner.username}`}
              borderRadius="sm"
              p={2}
              _hover={{ color: "teal.400" }}
              _focus={{ color: "teal.400" }}
            >
              {owner.username}
            </Link>
          </Heading>
          <Spacer />
          <Heading fontWeight={400} fontSize="md" color="gray.500">
            {postTime}
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody px={10}>
        <Text fontWeight={400} fontSize="md" color="gray.300">
          {message.text}
        </Text>
      </CardBody>
      <CardFooter flexDirection="column" py={1}>
        <Box borderBottom="1px" borderColor="gray.600" />
        <Flex justifyContent="space-around" mt={1}>
          <fetcher.Form method="post">
            <Button
              ref={favoriteButtonRef}
              onClick={onFavoriteClick}
              type="submit"
              name="intent"
              value="favorite"
              fontWeight={400}
              color="white"
              bgColor="gray.800"
              height="100%"
              borderRadius="md"
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
            fontWeight={400}
            color="white"
            bgColor="gray.800"
            p={4}
            borderRadius="md"
            _hover={{ bgColor: "gray.700" }}
            _focus={{ bgColor: "gray.700" }}
          >
            <HStack justifyContent="space-between">
              <ChatIcon mb={0.5} />
              <Text display={{ base: "none", md: "initial" }}>Comments</Text>
            </HStack>
          </Link>
        </Flex>
      </CardFooter>
    </Card>
  );
});

Post.displayName = "Post";

export default Post;
