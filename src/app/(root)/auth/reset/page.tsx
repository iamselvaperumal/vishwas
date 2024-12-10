"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { resetSchema } from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import Loading from "@/app/loading";
import { ThemeToggle } from "@/components/theme/toggle";
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
import { client } from "@/server/client";
import { ArrowLeft } from "@phosphor-icons/react";

export default function VerifyEmail() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof resetSchema>) => {
      const response = await client.api.v1.auth["reset-password"].verify.$post({
        json: values,
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        toast.error(errorData?.message || "User not found. Please Sign up.");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Password reset email sent successfully");
      router.push("/auth/login");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      // Error is handled in mutation.onError, no need to do anything here
    }
  }

  return (
    <>
      <Link
        href="/auth/login"
        className="absolute left-8 top-8 flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft weight="bold" size={16} />
        Home
      </Link>
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="flex h-svh w-svw items-center justify-center">
        <div className="flex min-w-[400px] flex-col gap-4">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="mb-3 max-w-[400px]">
            Enter the email address associated with your account and we will
            send you an email with instructions to reset your password.
          </p>
          <Form {...resetForm}>
            <form
              onSubmit={resetForm.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className=" mt-4"
                disabled={mutation.isPaused}
              >
                {mutation.isPending ? (
                  <Loading size={24} />
                ) : (
                  "Send password reset email"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
