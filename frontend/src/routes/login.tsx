import { useContext, useState } from "react";
import {
  type ActionFunction,
  Form,
  redirect,
  useActionData,
  useNavigate,
} from "react-router-dom";
import {
  Alert,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import authContext, { type AuthContextData } from "../contexts/auth-context";
import { isString } from "../utils";

type LoginErrors = {
  detail: string;
  reason: "password" | "username" | "credentials";
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
    if (!isString(username) || username === "") {
      return { detail: "Invalid username", reason: "username" };
    }
    if (!isString(password) || password === "") {
      return { detail: "Invalid password", reason: "password" };
    }

    const loggedIn = await loginUser(username, password);
    if (!loggedIn) {
      return { detail: "Wrong credentials", reason: "credentials" };
    }

    return redirect("/home");
  };

const Login: React.FC = () => {
  const navigate = useNavigate();
  const user = useContext<AuthContextData>(authContext).user;
  const errors = useActionData() as LoginErrors | undefined;
  const [show, setShow] = useState(false);

  if (user !== null) {
    navigate("/home", { replace: true });
    return;
  }
  console.log(errors);
  return (
    <Form method="post" id="login-form" replace>
      <VStack spacing={5}>
        {errors !== undefined ? (
          <Alert status="error" variant="left-accent">
            {errors.detail}
          </Alert>
        ) : (
          <></>
        )}
        <Input
          aria-label="Username"
          type="text"
          name="username"
          placeholder="Username"
          required
          isInvalid={
            errors?.reason === "username" || errors?.reason === "credentials"
          }
          errorBorderColor="crimson"
          color="white"
        />
        <InputGroup size="md">
          <Input
            aria-label="Password"
            type={show ? "text" : "password"}
            name="password"
            placeholder="Password"
            required
            isInvalid={
              errors?.reason === "password" || errors?.reason === "credentials"
            }
            errorBorderColor="crimson"
            color="white"
          />
          <InputRightElement width="4.5rem">
            <Button
              onClick={() => {
                setShow(!show);
              }}
              h="1.75rem"
              size="sm"
              color="gray.300"
              backgroundColor="gray.700"
              _hover={{ color: "teal.400" }}
              _active={{ backgroundColor: "gray.600" }}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button
          type="submit"
          color="gray.300"
          backgroundColor="gray.700"
          _hover={{ color: "teal.400" }}
          _active={{ backgroundColor: "gray.600" }}
        >
          Login
        </Button>
      </VStack>
    </Form>
  );
};

export default Login;
