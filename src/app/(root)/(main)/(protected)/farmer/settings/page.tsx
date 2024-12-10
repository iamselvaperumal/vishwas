import Loading from "@/app/loading";
import { getUser } from "@/server/actions";
import { Suspense } from "react";
import SettingsForm from "./settings-form";

export default async function Settings() {
  const user = await getUser();
  return (
    <>
      <Suspense fallback={<Loading showText={true} />}>
        <SettingsForm user={user} />
      </Suspense>
    </>
  );
}
