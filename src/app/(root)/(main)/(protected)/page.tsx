import Loading from "@/app/loading";
import { getUser } from "@/server/actions";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
  const user = await getUser();

  if (user?.role === "farmer") {
    redirect("/farmer");
  } else if (user?.role === "consumer") {
    redirect("/consumer");
  }

  return (
    <>
      <div className="flex w-screen h-screen justify-center items-center">
        <Suspense
          fallback={
            <Loading
              size={36}
              className="flex w-screen h-screen justify-center items-center"
            />
          }
        >
          <Loading size={36} />
        </Suspense>
      </div>
    </>
  );
}
