import SideNav from "@/components/ui/sidenav";
import { getUser } from "@/server/actions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <SideNav user={user} />
        <div>{children}</div>
      </div>
    </>
  );
}
