import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../contexts/auth-context";

const Header: React.FC = () => {
  const username = useContext(AuthContext)?.user?.username;

  return (
    <div>
      <Link to={"/"}>Home</Link>
      {username === undefined && (
        <>
          <Link to={"login"}>Login</Link>
          <Link to={"register"}>Register</Link>
        </>
      )}
      {username !== undefined && <span> | {username}</span>}
    </div>
  );
};

export default Header;
