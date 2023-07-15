import { Heading, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import type Message from "../interfaces/message";

const Comment: React.FC<Message> = ({ text, owner: ownerUrl }: Message) => {
  // placeholder
  const owner = { username: ownerUrl };

  return (
    <VStack alignItems="left" gap={0}>
      <Heading fontWeight={400} fontSize="md" color="gray.500">
        <Link
          as={RouterLink}
          to={`/user/${owner?.username}`}
          borderRadius="sm"
          px={1}
          _hover={{ color: "teal.400" }}
          _focus={{ color: "teal.400" }}
        >
          {owner?.username}
        </Link>
      </Heading>
      <Text fontWeight={400} fontSize="md" color="gray.300" px={1}>
        {text}
      </Text>
    </VStack>
  );
};

export default Comment;
