"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Products() {
  const router = useRouter();
  const handleAddProduct = () => {
    router.push("/farmer/products/new");
  };
  return (
    <div className="p-4 lg:px-8">
      <div className="flex flex-1 justify-end">
        <Button variant={"outline"} onClick={handleAddProduct}>
          Add New Product
        </Button>
      </div>
    </div>
  );
}
