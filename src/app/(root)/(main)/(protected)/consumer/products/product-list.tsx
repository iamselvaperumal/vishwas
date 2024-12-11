"use client";
import Loading from "@/app/loading";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { client } from "@/server/client";
import { Link, StackPlus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  farmSize: number;
  expectedYield: number;
  harvestMonth: string;
  harvestYear: number;
  minimumPrice: number;
  availableQuantity: number;
  soilType: "clay" | "sandy" | "loamy" | "mixed";
  contractDuration?: "short-term" | "medium-term" | "long-term" | undefined;
}

interface Data {
  productList: Product[];
  name?: string;
  farmSize?: number;
  expectedYield?: number;
  harvestMonth?: string;
  harvestYear?: number;
  minimumPrice?: number;
  availableQuantity?: number;
  soilType?: "clay" | "sandy" | "loamy" | "mixed";
}

export default function Products() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddProduct = () => {
    setLoading(true);
    router.push("/farmer/products/new");
  };

  const { isLoading, isError, data, error } = useQuery<Data>({
    queryKey: ["products"],
    // @ts-ignore
    queryFn: async () => {
      try {
        const response = await client.api.v1.product.$get();

        if (!response.ok) {
          const errorData: any = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch products.");
        }

        const jsonData = await response.json();
        return jsonData;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="p-4 lg:px-8">
      <div className="flex flex-1 justify-end mb-6">
        <Button
          variant={"outline"}
          onClick={handleAddProduct}
          disabled={loading}
        >
          {!loading ? (
            <>
              <StackPlus weight="duotone" size={20} className="mr-4" />
              Add New Product
            </>
          ) : (
            <Loading />
          )}
        </Button>
      </div>
      <h1 className="text-xl font-bold mb-8">List of products</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {// @ts-ignore
          data?.productList.map((product: Product) => (
            <Card key={product.id} className="w-full">
              <CardContent className="p-0">
                <AspectRatio ratio={3 / 1.03} className="w-full h-40 relative">
                  <Image
                    src={`/static/images/${product.name}.jpg`}
                    alt={product.name}
                    fill
                    className="h-full w-full rounded-sm object-cover"
                  />
                </AspectRatio>
                <div className="p-4 pt-8">
                  <p>Product Name: {product.name}</p>
                  <p>Farm Size: {product.farmSize} acres</p>
                  <p>Expected Yield: {product.expectedYield} units</p>
                  <p>
                    Harvest: {product.harvestMonth} {product.harvestYear}
                  </p>
                  <p>Minimum Price: ${product.minimumPrice}</p>
                  <p>Available Quantity: {product.availableQuantity} units</p>
                  {product.contractDuration && (
                    <p>Contract: {product.contractDuration}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <a href="/farmer/dashboard">View Details</a>
                </Button>
                <Button variant="default" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
