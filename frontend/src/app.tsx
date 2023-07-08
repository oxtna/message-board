import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import Home from "./routes/home";
import Login, { action as loginAction } from "./routes/login";
import Register, { action as registerAction } from "./routes/register";
import authContext from "./contexts/auth-context";
import { useContext } from "react";

const App: React.FC = () => {
  const auth = useContext(authContext);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Navigate to="/home" /> },
        {
          path: "login",
          action: loginAction(auth),
          element: <Login />,
        },
        {
          path: "register",
          action: registerAction,
          element: <Register />,
        },
        {
          path: "home",
          element: <Home />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
