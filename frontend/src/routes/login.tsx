import {
  type ActionFunction,
  Form,
  redirect,
  useActionData,
} from "react-router-dom";
import { type AuthContextData } from "../contexts/auth-context";
import { isString } from "../utils";

type LoginErrors = {
  username?: string;
  password?: string;
};

export const actionFactory =
  (authContext: AuthContextData | null): ActionFunction =>
  async ({ request }) => {
    const loginUser = authContext?.loginUser;
    if (loginUser === undefined) {
      throw new Error("Fatal error: cannot find login function");
    }

    const formData = await request.formData();
    const username = formData.get("username")?.valueOf();
    const password = formData.get("password")?.valueOf();
    if (!isString(username)) {
      return { username: "Invalid username" };
    }
    if (!isString(password)) {
      return { password: "Invalid password" };
    }

    const loggedIn = await loginUser(username, password);
    if (!loggedIn) {
      return { password: "Wrong password" };
    }

    return redirect("/home");
  };

const Login: React.FC = () => {
  const errors = useActionData() as LoginErrors | null;

  return (
    <Form method="post" id="login-form">
      <label>
        <span>Username</span>
        {errors?.username !== undefined && <span>{errors.username}</span>}
        <input aria-label="Username" type="text" name="username" />
      </label>
      <label>
        <span>Password</span>
        {errors?.password !== undefined && <span>{errors.password}</span>}
        <input aria-label="Password" type="password" name="password" />
      </label>
      <button type="submit">Login</button>
    </Form>
  );
};

export default Login;
