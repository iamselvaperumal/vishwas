import { products, transactions, users } from "@/db/schema";

export type PurchaseRequestData = {
  listingId: typeof products.id;
  sellerId: typeof users.id;
  buyerId: typeof users.id;
  quantity: string;
  totalPrice: string;
  status?: typeof transactions.status;
  buyerMessage?: string;
  farmerNote?: string;
};
