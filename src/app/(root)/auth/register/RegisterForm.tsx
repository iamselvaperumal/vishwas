"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registrationSchema } from "@/validators/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const signUpForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof registrationSchema>) =>
      await client.api.v1.auth.register["send-verification-code"].$post({
        json: values,
      }),
    onSuccess: (_, variables) => {
      const encodedEmail = encodeURIComponent(variables.email);
      router.push(`/auth/register/email-verification?email=${encodedEmail}`);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof registrationSchema>) {
    mutation.mutate(values);
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
          <h1 className="text-2xl font-bold">Create your Vishwas account</h1>
          <p className="mb-3">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500">
              Sign in
            </Link>
            .
          </p>
          <Form {...signUpForm}>
            <form
              onSubmit={signUpForm.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={signUpForm.control}
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
                control={signUpForm.control}
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
                control={signUpForm.control}
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
              <Button
                type="submit"
                className="mt-4"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Loading size={24} /> : "Sign Up"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-sm">
            By signing up, you agree to our{" "}
            <Link href={`#`} className="text-blue-500">
              terms
            </Link>
            , {"and "}
            <Link href={`#`} className="text-blue-500">
              privacy policy
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
