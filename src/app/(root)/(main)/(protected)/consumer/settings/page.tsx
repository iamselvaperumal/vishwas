import { getUser } from "@/server/actions";
import SettingsForm from "./settings-form";

export default async function Settings() {
  const user = await getUser();
  return (
    <>
      <SettingsForm user={user} />
    </>
  );
}
