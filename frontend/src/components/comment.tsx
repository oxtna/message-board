import { forwardRef } from "react";
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
import { Link as RouterLink } from "react-router-dom";
import withMessage, { type WithMessageProps } from "./with-message";

const CommentRender = forwardRef<HTMLDivElement, WithMessageProps>(
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
    _
  ) => {
    return (
      <Card as="div" bgColor="gray.900" color="white" width="80%">
        <CardHeader px={6} pb={2}>
          <HStack>
            <Heading fontWeight={400} fontSize="md" color="gray.500">
              <Link
                as={RouterLink}
                to={`/user/${ownerName}`}
                borderRadius="sm"
                px={1}
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
        <CardBody py={2}>
          <Text fontWeight={400} fontSize="md" color="gray.300" px={1}>
            {text}
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
            <Input type="hidden" name="id" value={messageID} readOnly />
          </fetcher.Form>
          <Link
            as={RouterLink}
            to={`/message/${messageID}`}
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
  }
);

CommentRender.displayName = "CommentRender";

const Comment = withMessage(CommentRender, "Comment");

export default Comment;
