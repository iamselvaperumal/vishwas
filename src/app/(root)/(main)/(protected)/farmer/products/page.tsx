"use client";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { StackPlus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Products() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleAddProduct = () => {
    setIsLoading(true);
    router.push("/farmer/products/new");
  };
  return (
    <div className="p-4 lg:px-8">
      <div className="flex flex-1 justify-end">
        <Button variant={"outline"} onClick={handleAddProduct}>
          {!isLoading ? (
            <>
              {" "}
              <StackPlus weight="duotone" size={20} className="mr-4" />
              Add New Product
            </>
          ) : (
            <Loading />
          )}
        </Button>
      </div>
    </div>
  );
}
