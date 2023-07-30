import { useEffect, useState } from "react";
import { Stack, Spacer, Box } from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";
import { useAuthUser } from "../contexts/auth-context";
import NavbarLink from "./navbar-link";

const Navbar: React.FC = () => {
  const [borderOpacity, setBorderOpacity] = useState<number>(0);

  const username = useAuthUser()?.username;

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
        <NavbarLink to="/home">Home</NavbarLink>
        {username === undefined && (
          <>
            <NavbarLink to="/login">Login</NavbarLink>
            <NavbarLink to="/register">Register</NavbarLink>
          </>
        )}
        {username !== undefined && (
          <NavbarLink to="/profile">{username}</NavbarLink>
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
