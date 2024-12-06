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
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/server/client";
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  HandCoins,
  Tractor,
} from "@phosphor-icons/react";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const signUpForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      aadhaar: "",
      landRegistrationNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
      role: undefined,
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
      <div className="flex w-full justify-center py-[150px]">
        <div className="flex min-w-[650px] flex-col gap-4">
          <h1 className="text-3xl font-black">Create your Vishwas account</h1>
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
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={signUpForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tamil" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={signUpForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="farmer">
                          <div className="flex items-center">
                            <Tractor
                              size={20}
                              weight="duotone"
                              className="mr-2"
                            />
                            Farmer
                          </div>
                        </SelectItem>
                        <SelectItem value="consumer">
                          <div className="flex items-center">
                            <HandCoins
                              size={20}
                              weight="duotone"
                              className="mr-2"
                            />
                            Consumer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
                    </FormControl>
                    <FormDescription>
                      Do not add +91 in beginning
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="aadhaar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar ID</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="landRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="TN/SALEM/0123/A/1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`123 , Gandhi Road, Anna Nagar, 
Salem, Tamil Nadu 636005`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
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
                </div>
                <div className="col-span-6">
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
                </div>
              </div>
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
