import { Outlet } from "react-router-dom";
import Header from "../components/header";

const Root: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Root;
