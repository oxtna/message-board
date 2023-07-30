import { useContext } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import authContext from "./contexts/auth-context";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import Home, {
  actionFactory as homeActionFactory,
  loaderFactory as homeLoaderFactory,
} from "./routes/home";
import UserProfile from "./routes/user-profile";
import Login, { actionFactory as loginActionFactory } from "./routes/login";
import Register, { action as registerAction } from "./routes/register";
import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 10_000,
    },
  },
});

axios.interceptors.request.use((request) => {
  console.log(request);
  return request;
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
          action: homeActionFactory(queryClient, auth),
          loader: homeLoaderFactory(queryClient, auth),
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
