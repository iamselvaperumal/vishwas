"use client";
import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.productList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 lg:px-8">
      <h1 className="text-xl font-bold mb-8">List of Products</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Card key={product.id} className="w-full">
            <CardContent className="p-0">
              <AspectRatio ratio={3 / 1.03} className="w-full h-40 relative">
                <img
                  src={`/static/images/${product.name}.jpg`}
                  alt={product.name}
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
                View Details
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
