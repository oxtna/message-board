import { Heading, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type Message from "../api/types/message";
import useUser from "../hooks/use-user";

export type CommentProps = { message: Message };

export const Comment: React.FC<CommentProps> = ({ message }: CommentProps) => {
  const { isLoading, isError, error, data: owner } = useUser(message.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    throw error;
  }

  return (
    <VStack alignItems="left" gap={0}>
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
      <Text fontWeight={400} fontSize="md" color="gray.300" px={1}>
        {message.text}
      </Text>
    </VStack>
  );
};

export default Comment;
