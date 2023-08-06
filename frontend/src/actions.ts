import { type QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router-dom";
import { type AuthContextData } from "./contexts/auth-context";
import { favorite, unfavorite } from "./api/api";
import { isString } from "./utils";

export const favoriteActionFactory =
  (queryClient: QueryClient, authContext: AuthContextData) =>
  async (formData: FormData) => {
    const user = authContext.getUser();
    if (user === null) {
      return redirect("/login");
    }

    const postID = formData.get("id")?.valueOf();
    const favorited = formData.get("favorited")?.valueOf();
    if (!isString(postID)) {
      throw new Error("post id is not a string");
    }
    if (!isString(favorited)) {
      throw new Error("favorite is not a string");
    }
    let result: Awaited<ReturnType<typeof favorite>>;
    if (favorited === "false") {
      result = await favorite(+postID);
    } else if (favorited === "true") {
      result = await unfavorite(+postID);
    } else {
      throw new Error(
        'Invalid form value: favorited must be either "false" or "true"'
      );
    }
    if (result.error !== undefined) {
      throw new Error(result.error.detail);
    }
    await queryClient.invalidateQueries({ queryKey: ["messages"] });
    return null;
  };

export const commentActionFactory =
  (queryClient: QueryClient, authContext: AuthContextData) =>
  async (formData: FormData) => {
    // todo
    return null;
  };
