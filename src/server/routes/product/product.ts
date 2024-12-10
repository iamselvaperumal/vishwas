import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import db from "@/db";
import { products } from "@/db/schema";
import type { ContextVariables } from "@/types/hono";
import {
  contractDurationEnum,
  deliveryModeEnum,
  fertilizerTypeEnum,
  paymentModeEnum,
  pestManagementEnum,
  productSchema,
  sellingMethodEnum,
  soilTypeEnum,
  waterSourceEnum,
} from "@/validators/product.validator";
import { desc, eq } from "drizzle-orm";

export const product = new OpenAPIHono<{
  Variables: ContextVariables;
}>()
  .openapi(
    createRoute({
      method: "post",
      path: "/product",
      tags: ["Products"],
      summary: "Add new product",
      request: {
        body: {
          description: "Product Data",
          content: {
            "application/json": {
              schema: productSchema.openapi("Add Product Request"),
            },
          },
          required: true,
        },
      },
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: z
                .object({
                  message: z.string(),
                })
                .openapi("Add Product Response"),
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: z
                .object({
                  message: z.string(),
                })
                .openapi("Unauthorized Response"),
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: z
                .object({
                  message: z.string(),
                  error: z.string().optional(),
                })
                .openapi("Error Response"),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const user = c.get("user");
        if (!user) return c.json({ message: "Unauthorized" }, 401);

        const productData = c.req.valid("json");

        const formattedProductData = {
          ...productData,
          farmSize: productData.farmSize.toString(),
          minimumPrice: productData.minimumPrice.toString(),
          availableQuantity: productData.availableQuantity.toString(),
          expectedYield: productData.expectedYield?.toString(),
        };

        await db.insert(products).values({
          ...formattedProductData,
          userId: user.id,
        });

        return c.json({ message: "Product added successfully" }, 200);
      } catch (error) {
        console.error("Error adding product:", error);
        return c.json(
          {
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : undefined,
          },
          500
        );
      }
    }
  )

  .openapi(
    createRoute({
      method: "get",
      path: "/product",
      tags: ["Products"],
      summary: "Get all products",
      responses: {
        200: {
          description: "successfully retrieved all products",
          content: {
            "application/json": {
              schema: productSchema.openapi("Get all products response"),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Internal Server Error",
        },
      },
    }),
    async (c) => {
      try {
        const user = c.get("user")!;
        if (!user) return c.json({ message: "Unauthorized" }, 401);

        const productList = await db.query.products.findMany({
          where: eq(products.userId, user.id),
          orderBy: desc(products.createdAt),
        });

        return c.json({ productList }, 200);
      } catch (error) {
        console.error("Error adding product:", error);
        return c.json(
          {
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : undefined,
          },
          500
        );
      }
    }
  )

  .openapi(
    createRoute({
      method: "get",
      path: "/product/{id}",
      tags: ["Products"],
      summary: "Get product by id",
      request: {
        params: z.object({
          id: z
            .string()
            .uuid()
            .min(1, {
              message: "ID required to get the product",
            })
            .openapi({
              param: {
                name: "id",
                in: "path",
              },
              example: "d4e5f6a7-b8c9-4d01-9e23-456f78901234",
            }),
        }),
        required: true,
      },
      responses: {
        200: {
          description: "successfully retrieved the product",
          content: {
            "application/json": {
              schema: productSchema.openapi("Get product response"),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Internal Server Error",
        },
      },
    }),
    async (c) => {
      try {
        const user = c.get("user")!;
        if (!user) return c.json({ message: "Unauthorized" }, 401);

        const { id } = c.req.valid("param");

        const existingProduct = await db.query.products.findFirst({
          where: eq(products.id, id),
        });

        if (!existingProduct) {
          return c.json({ error: "Product not found" }, 404);
        }

        return c.json({ existingProduct }, 200);
      } catch (error) {
        console.error("Error adding product:", error);
        return c.json(
          {
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : undefined,
          },
          500
        );
      }
    }
  )

  .openapi(
    createRoute({
      method: "patch",
      path: "/product/{id}",
      tags: ["Products"],
      summary: "Update product by id",
      request: {
        params: z.object({
          id: z
            .string()
            .uuid()
            .min(1, {
              message: "ID required to update the product",
            })
            .openapi({
              param: {
                name: "id",
                in: "path",
              },
              example: "d4e5f6a7-b8c9-4d01-9e23-456f78901234",
            }),
        }),
        body: {
          description: "Updated product details",
          content: {
            "application/json": {
              schema: z.object({
                name: z.string().nullable(),
                farmSize: z.number().positive().nullable(),
                expectedYield: z.number().positive().optional().nullable(),
                harvestMonth: z.string().optional().nullable(),
                harvestYear: z.number().int().optional().nullable(),
                minimumPrice: z.number().positive().nullable(),
                contractDuration: contractDurationEnum.optional().nullable(),
                availableQuantity: z.number().positive().nullable(),
                soilType: soilTypeEnum.nullable(),
                waterSource: waterSourceEnum.nullable(),
                fertilizerType: fertilizerTypeEnum.nullable(),
                pestManagement: pestManagementEnum.nullable(),
                paymentMode: paymentModeEnum.nullable(),
                deliveryMode: deliveryModeEnum.nullable(),
                sellingMethod: sellingMethodEnum.nullable(),
                status: z.string().default("active"),
              }),
            },
          },
        },
        required: true,
      },
      responses: {
        200: {
          description: "successfully retrieved the product",
          content: {
            "application/json": {
              schema: productSchema
                .extend({
                  message: z.string(),
                })
                .openapi("Get product response"),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Internal Server Error",
        },
      },
    }),
    async (c) => {
      try {
        const user = c.get("user")!;
        if (!user) return c.json({ message: "Unauthorized" }, 401);

        const { id } = c.req.valid("param");

        const productData = c.req.valid("json");

        const existingProduct = await db.query.products.findFirst({
          where: eq(products.id, id),
        });

        if (!existingProduct) {
          return c.json({ error: "Product not found" }, 404);
        }

        const updatedProductInfo = await db
          .update(products)
          .set({
            ...existingProduct,
            name: productData.name || existingProduct.name,
            farmSize:
              productData.farmSize?.toString() || existingProduct.farmSize,
            expectedYield:
              productData.expectedYield?.toString() ||
              existingProduct.expectedYield,
            harvestMonth:
              productData.harvestMonth || existingProduct.harvestMonth,
            harvestYear: productData.harvestYear || existingProduct.harvestYear,
            minimumPrice:
              productData.minimumPrice?.toString() ||
              existingProduct.minimumPrice,
            contractDuration:
              productData.contractDuration || existingProduct.contractDuration,
            availableQuantity:
              productData.availableQuantity?.toString() ||
              existingProduct.availableQuantity,
            soilType: productData.soilType || existingProduct.soilType,
            waterSource: productData.waterSource || existingProduct.waterSource,
            fertilizerType:
              productData.fertilizerType || existingProduct.fertilizerType,
            pestManagement:
              productData.pestManagement || existingProduct.pestManagement,
            paymentMode: productData.paymentMode || existingProduct.paymentMode,
            deliveryMode:
              productData.deliveryMode || existingProduct.deliveryMode,
            sellingMethod:
              productData.sellingMethod || existingProduct.sellingMethod,
            status: productData.status || existingProduct.status,
          })
          .where(eq(products.id, id))
          .returning({
            id: products.id,
            name: products.name,
            farmSize: products.farmSize,
            expectedYield: products.expectedYield,
            harvestMonth: products.harvestMonth,
            harvestYear: products.harvestYear,
            minimumPrice: products.minimumPrice,
            contractDuration: products.contractDuration,
            availableQuantity: products.availableQuantity,
            soilType: products.soilType,
            waterSource: products.waterSource,
            fertilizerType: products.fertilizerType,
            pestManagement: products.pestManagement,
            paymentMode: products.paymentMode,
            deliveryMode: products.deliveryMode,
            sellingMethod: products.sellingMethod,
            status: products.status,
          });

        return c.json({
          message: "Product updated successfully",
          ...updatedProductInfo[0],
        });
      } catch (error) {
        console.error("Error adding product:", error);
        return c.json(
          {
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : undefined,
          },
          500
        );
      }
    }
  )

  .openapi(
    createRoute({
      method: "delete",
      path: "/product/{id}",
      tags: ["Products"],
      summary: "Delete product by id",
      request: {
        params: z.object({
          id: z
            .string()
            .uuid()
            .min(1, {
              message: "ID required to delete the product",
            })
            .openapi({
              param: {
                name: "id",
                in: "path",
              },
              example: "d4e5f6a7-b8c9-4d01-9e23-456f78901234",
            }),
        }),
        required: true,
      },
      responses: {
        200: {
          description: "successfully retrieved the product",
          content: {
            "application/json": {
              schema: z
                .object({
                  message: z.string(),
                })
                .openapi("Delete product response"),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Internal Server Error",
        },
      },
    }),
    async (c) => {
      try {
        const user = c.get("user")!;
        if (!user) return c.json({ message: "Unauthorized" }, 401);

        const { id } = c.req.valid("param");

        const existingProduct = await db.query.products.findFirst({
          where: eq(products.id, id),
        });

        if (!existingProduct) {
          return c.json({ error: "Product not found" }, 404);
        }

        await db.delete(products).where(eq(products.id, id));

        return c.json({ message: "Product deleted successfully" }, 200);
      } catch (error) {
        console.error("Error adding product:", error);
        return c.json(
          {
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : undefined,
          },
          500
        );
      }
    }
  );
