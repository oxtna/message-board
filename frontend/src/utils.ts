export function isString(object: unknown): object is string {
  return typeof object === "string";
}

export function isEmail(text: string): boolean {
  // crazy regex copied from Angular.js
  return /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/.test(
    text
  );
}

export async function fetchData<Type>(url: URL): Promise<Type> {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (response.status !== 200) {
    throw new Error("Cannot fetch the specified data");
  }
  const data: Type = await response.json();
  return data;
}
