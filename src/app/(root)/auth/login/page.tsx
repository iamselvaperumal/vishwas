import { getUser } from "@/utils/utils.server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function Login() {
  const user = await getUser();
  if (user) {
    return redirect("/");
  }

  return (
    <>
      <LoginForm />
    </>
  );
}
