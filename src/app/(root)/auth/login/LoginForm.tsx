"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginSchema } from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import Loading from "@/app/loading";
import { LogoWithText } from "@/components/icons/logo";
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft weight="bold" size={16} />
          Home
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl p-6 md:p-10">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <LogoWithText width={130} />
          </div>
          <h1 className="text-xl font-bold mb-1">Sign in</h1>
          <p className="text-muted-foreground">
            Don{"'"}t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              Register
            </Link>
          </p>
        </div>

        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        className="w-full"
                        {...field}
                      />
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
            </div>

            {/* Submit Section */}
            <div className="col-span-full mt-6 text-center">
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-12"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Loading size={24} /> : "Sign In"}
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
