import { Button, HStack } from "@chakra-ui/react";
import type React from "react";
import { forwardRef } from "react";

type PostActionProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
};

const PostAction = forwardRef<HTMLButtonElement, PostActionProps>(
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

PostAction.displayName = "PostAction";

export default PostAction;
