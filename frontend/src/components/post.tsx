import { forwardRef } from "react";
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
import { Link as RouterLink } from "react-router-dom";
import withMessage, { type WithMessageProps } from "./with-message";

const PostRender = forwardRef<HTMLDivElement, WithMessageProps>(
  (
    {
      fetcher,
      favorited,
      favoriteButtonRef,
      onFavoriteClick,
      messageID,
      messageTime,
      ownerName,
      text,
    },
    ref
  ) => {
    return (
      <Card ref={ref} as="div" bgColor="gray.800" color="white">
        <CardHeader px={8}>
          <HStack>
            <Heading fontWeight={400} fontSize="lg" color="gray.500">
              <Link
                as={RouterLink}
                to={`/user/${ownerName}`}
                borderRadius="sm"
                p={2}
                _hover={{ color: "teal.400" }}
                _focus={{ color: "teal.400" }}
              >
                {ownerName}
              </Link>
            </Heading>
            <Spacer />
            <Heading fontWeight={400} fontSize="md" color="gray.500">
              {messageTime}
            </Heading>
          </HStack>
        </CardHeader>
        <CardBody px={10}>
          <Text fontWeight={400} fontSize="md" color="gray.300">
            {text}
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
              <Input type="hidden" name="id" value={messageID} readOnly />
            </fetcher.Form>
            <Link
              as={RouterLink}
              to={`/message/${messageID}`}
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
  }
);

PostRender.displayName = "PostRender";

const Post = withMessage(PostRender, "Post");

export default Post;
