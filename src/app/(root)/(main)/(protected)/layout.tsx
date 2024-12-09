import SideNav from "@/components/ui/sidenav";
import { getUser } from "@/server/actions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <div className="flex">
      <SideNav user={user} />
      <main className="flex-1 pt-20 lg:pt-0 pb-16 lg:pb-0">{children}</main>
    </div>
  );
}
