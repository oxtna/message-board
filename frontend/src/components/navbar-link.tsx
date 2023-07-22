import { Link as RouterLink } from "react-router-dom";
import { Link } from "@chakra-ui/react";

type NavbarLinkProps = {
  to: string;
  children: React.ReactNode;
};

const NavbarLink: React.FC<NavbarLinkProps> = ({
  to,
  children,
}: NavbarLinkProps) => (
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

export default NavbarLink;
