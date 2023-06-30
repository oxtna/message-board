import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import Login, { action as loginAction } from "./routes/login";
import Register, { action as registerAction } from "./routes/register";
import AuthContext from "./contexts/auth-context";
import { useContext } from "react";

const App: React.FC = () => {
  const authContext = useContext(AuthContext);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "login",
          action: loginAction(authContext),
          element: <Login />,
        },
        {
          path: "register",
          action: registerAction,
          element: <Register />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
