import { Form, redirect, useActionData } from "react-router-dom";
import type { AuthContextData } from "../contexts/auth-context";
import type Action from "../interfaces/action";

interface LoginErrors {
  username?: string;
  password?: string;
}

function isString(object: unknown): object is string {
  return typeof object === "string";
}

export const action =
  (authContext: AuthContextData | null): Action =>
  async ({ request }) => {
    const loginUser = authContext?.loginUser;
    if (loginUser === undefined) {
      throw new Error("Fatal error: cannot find login function");
    }

    const formData = await request.formData();
    const username = formData.get("username")?.valueOf();
    const password = formData.get("password")?.valueOf();
    if (isString(username) && isString(password)) {
      // todo: add username and password validation here and return LoginErrors if necessary
      const loggedIn = await loginUser(username, password);
      if (loggedIn) {
        return redirect("/");
      }
    }

    return {
      username: "Invalid credentials",
    };
  };

const Login: React.FC = () => {
  const errors = useActionData() as LoginErrors | null;

  return (
    <Form method="post" id="login-form">
      <label>
        <span>Username</span>
        {errors?.username != null && <span>{errors.username}</span>}
        <input aria-label="Username" type="text" name="username" />
      </label>
      <label>
        <span>Password</span>
        {errors?.password != null && <span>{errors.password}</span>}
        <input aria-label="Password" type="password" name="password" />
      </label>
      <button type="submit">Login</button>
    </Form>
  );
};

export default Login;
