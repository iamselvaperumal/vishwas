"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { resetPasswordSchema } from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";

export default function UpdatePassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: typeof token,
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof resetPasswordSchema>) => {
      const response = await client.api.v1.auth["reset-password"].update.$put({
        json: {
          token: token as string,
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      return response.json();
    },

    onSuccess: () => {
      toast.success("Password updated successfully");
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      console.error("Failed to update password:", error);
      toast.error("Failed to update password");
    },
    onSettled: () => {
      // setIsSubmitting(false)
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      // Error is handled in mutation.onError, no need to do anything here
    }
  }

  return (
    <>
      <Link
        href="/"
        className="absolute left-8 top-8 flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft size={16} weight="bold" />
        Home
      </Link>
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="flex h-svh w-svw items-center justify-center">
        <div className="flex min-w-[400px] flex-col gap-4">
          <h1 className="text-2xl font-bold">New Password</h1>
          <Form {...resetPasswordForm}>
            <form
              onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-[44px] -translate-y-1/2 transform"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Eye size={20} />
                          ) : (
                            <EyeSlash size={20} />
                          )}
                        </button>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          {...field}
                        />
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-4">
                Update password
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
