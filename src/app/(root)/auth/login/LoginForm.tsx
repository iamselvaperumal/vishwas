"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginSchema } from "@/validators/auth.schema";
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
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const signInForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof loginSchema>) => {
      const response = await client.api.v1.auth.login.$post({
        json: values,
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        throw new Error(errorData.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Successfully logged in");
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description:
          error.message || "Please check your credentials and try again.",
      });
      console.error("Login failed:", error);
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    mutation.mutate(values);
  }

  return (
    <>
      <Link
        href="/auth/login"
        className="absolute left-8 top-8 flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft weight="bold" size={20} />
        Home
      </Link>
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="flex h-svh w-svw items-center justify-center">
        <div className="flex min-w-[400px] flex-col gap-4">
          <h1 className="text-2xl font-bold">Sign into Vishwas</h1>
          <p className="mb-3">
            Don{"'"}t have an account?{" "}
            <Link href="/auth/register" className="text-blue-500">
              Sign up
            </Link>
            .
          </p>
          <Form {...signInForm}>
            <form
              onSubmit={signInForm.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={signInForm.control}
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
              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/auth/reset"
                      className="text-sm text-blue-500 float-right !mt-[3px]"
                    >
                      Forgot Password?
                    </Link>
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
              <Button
                type="submit"
                className="mt-4"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Loading size={24} /> : "Sign In"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-sm">
            By signing in, you agree to our{" "}
            <Link href={"#"} className="text-blue-500">
              terms
            </Link>
            , {"and "}
            <Link href={"#"} className="text-blue-500">
              privacy policy
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
