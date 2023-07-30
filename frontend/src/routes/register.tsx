import {
  type ActionFunction,
  Form,
  redirect,
  useActionData,
} from "react-router-dom";
import { register } from "../api/api";
import { isString, isEmail } from "../utils";

type RegisterErrors = {
  username?: string;
  email?: string;
  password?: string;
  passwordRepeat?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username")?.valueOf();
  const email = formData.get("email")?.valueOf();
  const password = formData.get("password")?.valueOf();
  const passwordRepeat = formData.get("password_repeat")?.valueOf();
  if (!isString(username) || /^\s*$/.test(username)) {
    return { username: "Invalid username" };
  }
  if (!isString(email) || !isEmail(email)) {
    return { email: "Invalid email" };
  }
  if (!isString(password)) {
    return { password: "Invalid password" };
  }
  if (password.length < 8) {
    return { password: "Password is too short" };
  }
  if (!isString(passwordRepeat) || password !== passwordRepeat) {
    return { passwordRepeat: "Passwords do not match" };
  }

  const response = await register(username, email, password, passwordRepeat);

  if (response.error !== undefined) {
    const errors = Object.fromEntries(
      Object.entries(response.error).map(([key, value]) => [key, value[0]])
    );
    return errors;
  }

  return redirect("/login");
};

const Register: React.FC = () => {
  const errors = useActionData() as RegisterErrors | null;

  return (
    <Form method="post" id="register-form">
      <label>
        <span>Username</span>
        {errors?.username !== undefined && <span>{errors.username}</span>}
        <input aria-label="Username" type="text" name="username" />
      </label>
      <label>
        <span>Email</span>
        {errors?.email !== undefined && <span>{errors.email}</span>}
        <input aria-label="Email" type="email" name="email" />
      </label>
      <label>
        <span>Password</span>
        {errors?.password !== undefined && <span>{errors.password}</span>}
        <input aria-label="Password" type="password" name="password" />
      </label>
      <label>
        <span>Password repeat</span>
        {errors?.passwordRepeat !== undefined && (
          <span>{errors.passwordRepeat}</span>
        )}
        <input
          aria-label="Password repeat"
          type="password"
          name="password_repeat"
        />
      </label>
      <button type="submit">Register</button>
    </Form>
  );
};

export default Register;
