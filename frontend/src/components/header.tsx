import { Link } from "react-router-dom";
import { useUser } from "../contexts/auth-context";

const Header: React.FC = () => {
  const username = useUser()?.username;

  return (
    <div>
      <Link to="/home">Home</Link>
      {username === undefined && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
      {username !== undefined && <Link to="/profile">{username}</Link>}
    </div>
  );
};

export default Header;
