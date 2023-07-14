import { Outlet } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import Navbar from "../components/navbar";

const Root: React.FC = () => {
  return (
    <Box bg="black" pt={3} fontWeight={400}>
      <Container maxW="container.md">
        <Navbar />
        <Box as="main" px={{ base: 16, md: 32 }} mt={6}>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};

export default Root;
