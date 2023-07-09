import { useContext } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import authContext from "./contexts/auth-context";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import Home from "./routes/home";
import UserProfile from "./routes/user-profile";
import Login, { actionFactory as loginActionFactory } from "./routes/login";
import Register, { action as registerAction } from "./routes/register";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

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
          action: loginActionFactory(auth),
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
        {
          path: "profile",
          element: <UserProfile />,
        },
      ],
    },
  ]);

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;
