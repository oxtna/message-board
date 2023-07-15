import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Stack, Link, Spacer, Box } from "@chakra-ui/react";
import { useUser } from "../contexts/auth-context";
import { ChatIcon } from "@chakra-ui/icons";
import type ChildrenProps from "../interfaces/children-props";

type StyledLinkProps = ChildrenProps & { to: string };

const StyledLink: React.FC<StyledLinkProps> = ({
  to,
  children,
}: StyledLinkProps) => (
  <Link
    as={RouterLink}
    to={to}
    p={3}
    color="white"
    _hover={{ color: "teal.400", bgColor: "gray.800" }}
    _focus={{ color: "teal.400" }}
  >
    {children}
  </Link>
);

const Navbar: React.FC = () => {
  const [borderOpacity, setBorderOpacity] = useState<number>(0);

  const username = useUser()?.username;

  useEffect(() => {
    const handleScroll = (): void => {
      const opacity = window.scrollY / (window.innerHeight * 0.1);
      setBorderOpacity(opacity);
    };

    window.removeEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1}
      bgColor="blackAlpha.300"
      backdropFilter="auto"
      backdropBlur="12px"
      display={{ base: "none", md: "initial" }}
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        display={{ base: "none", md: "flex" }}
        width={{ base: "full", md: "auto" }}
        columnGap={10}
        alignItems="center"
        fontWeight={600}
      >
        <ChatIcon
          boxSize={5}
          mx={3}
          color="white"
          _hover={{ color: "teal.100" }}
          transition="color 400ms ease-in-out"
        />
        <Spacer />
        <StyledLink to="/home">Home</StyledLink>
        {username === undefined && (
          <>
            <StyledLink to="/login">Login</StyledLink>
            <StyledLink to="/register">Register</StyledLink>
          </>
        )}
        {username !== undefined && (
          <StyledLink to="/profile">{username}</StyledLink>
        )}
      </Stack>
      <Box
        left={0}
        right={0}
        h={0}
        borderBottom="1px"
        borderBottomColor="teal.400"
        opacity={borderOpacity}
      />
    </Box>
  );
};

export default Navbar;
