import { redirect } from "next/navigation";

import { getUser } from "@/utils/utils.server";

import EmailVerificationForm from "./EmailVerificationForm";

export default async function EmailVerification() {
  const user = await getUser();
  if (user?.emailVerified || user) {
    redirect("/");
  }
  return (
    <>
      <EmailVerificationForm />
    </>
  );
}
