import Loading from "@/app/loading";
import { getUser } from "@/server/actions";
import { Suspense } from "react";
import AddProductForm from "./add-product";

export default async function AddNewProduct() {
  const user = await getUser();
  return (
    <>
      <Suspense fallback={<Loading showText={true} />}>
        <AddProductForm user={user} />
      </Suspense>
    </>
  );
}
