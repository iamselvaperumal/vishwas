"use client";

import Loading from "@/app/loading";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { client } from "@/server/client";
import { UserProps } from "@/types/auth";
import { productNames } from "@/utils/utils.client";
import { productSchema } from "@/validators/product.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bank, ClipboardText, Images, StackPlus } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function AddProductForm({ user }: UserProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const defaultValues = {
    name: "",
    farmSize: undefined,
    expectedYield: undefined,
    harvestMonth: "",
    harvestYear: undefined,
    minimumPrice: undefined,
    sellingMethod: undefined,
    availableQuantity: undefined,
    soilType: undefined,
    waterSource: undefined,
    fertilizerType: undefined,
    pestManagement: undefined,
    paymentMode: undefined,
    deliveryMode: undefined,
    contractDuration: undefined,
  };

  const addProductForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const sellingType = addProductForm.watch("sellingMethod");

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof productSchema>) => {
      await client.api.v1.product.$post({
        json: values,
      });
    },
    onSuccess: () => {
      toast.success("Added product successfully");
      setSelectedProduct(null);
      router.push("/farmer/products");
    },
    onError: (error: Error) => {
      toast.error("Failed to add product");
      console.error("Product addition failed:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-xl font-bold mb-8">Add a new product</h1>
      <Form {...addProductForm}>
        <form
          onSubmit={addProductForm.handleSubmit(onSubmit)}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          <div className="space-y-4">
            <AspectRatio ratio={3 / 1.03} className="w-full h-40 relative">
              {selectedProduct ? (
                <div className="flex items-center justify-center h-full w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm">
                  <Image
                    src={`/static/images/${selectedProduct}.jpg`}
                    alt={selectedProduct}
                    fill
                    className="z-20 h-full w-full rounded-sm object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm">
                  <Images size={96} className="text-zinc-600" />
                </div>
              )}
            </AspectRatio>

            <FormField
              control={addProductForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedProduct(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productNames.map((product) => (
                        <>
                          <SelectItem value={product.lname}>
                            <div className="flex items-center">
                              {product.uname}
                            </div>
                          </SelectItem>
                        </>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="farmSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Size (in acres)</FormLabel>
                  <FormControl>
                    <Input placeholder="5.27" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="expectedYield"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Yield (in KG)</FormLabel>
                  <FormControl>
                    <Input placeholder="100" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="harvestMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Month</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="february">February</SelectItem>
                      <SelectItem value="march">March</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="may">May</SelectItem>
                      <SelectItem value="june">June</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                      <SelectItem value="august">August</SelectItem>
                      <SelectItem value="september">September</SelectItem>
                      <SelectItem value="october">October</SelectItem>
                      <SelectItem value="november">November</SelectItem>
                      <SelectItem value="december">December</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <FormField
              control={addProductForm.control}
              name="harvestYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Year</FormLabel>
                  <FormControl>
                    <Input placeholder="2024" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="minimumPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Price (Per Kg/rupee)</FormLabel>
                  <FormControl>
                    <Input placeholder="32.56" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="sellingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your selling method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="direct">
                        <div className="flex items-center">
                          <Bank size={20} weight="duotone" className="mr-2" />
                          Direct
                        </div>
                      </SelectItem>
                      <SelectItem value="contract">
                        <div className="flex items-center">
                          <ClipboardText
                            size={20}
                            weight="duotone"
                            className="mr-2"
                          />
                          Contract
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {sellingType === "contract" && (
              <FormField
                control={addProductForm.control}
                name="contractDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Duration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose contract duration period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short-term">Short Term</SelectItem>
                        <SelectItem value="long-term">Long Term</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={addProductForm.control}
              name="availableQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Quantity(in Kg)</FormLabel>
                  <FormControl>
                    <Input placeholder="70" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soil Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the soil type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                      <SelectItem value="loamy">Loamy</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <FormField
              control={addProductForm.control}
              name="waterSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Source</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your water source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="borewell">Borewell</SelectItem>
                      <SelectItem value="rainwater">Rain Water</SelectItem>
                      <SelectItem value="canal">Canal</SelectItem>
                      <SelectItem value="river">River</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="fertilizerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fertilizer Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose fertilizer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="chemical">Chemical</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="pestManagement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pest Management</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose pest Management" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="chemical">Chemical</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="deliveryMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="choose type of Delivery" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pickup">Pick up</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-full mt-6 text-center">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto px-12"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loading size={24} />
              ) : (
                <>
                  <StackPlus size={24} weight="duotone" className="mr-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
