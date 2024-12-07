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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/server/client";
import { RegistrationStatus } from "@/types/auth";
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  HandCoins,
  Tractor,
} from "@phosphor-icons/react";
import { toast } from "sonner";

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
    onSuccess: async (response, variables) => {
      const result: any = await response.json();

      switch (result.status) {
        case RegistrationStatus.SUCCESS:
          const encodedEmail = encodeURIComponent(variables.email);
          router.push(
            `/auth/register/email-verification?email=${encodedEmail}`
          );
          break;

        case RegistrationStatus.EMAIL_ALREADY_VERIFIED:
          toast.error("This email is already verified. Please login.");
          break;

        case RegistrationStatus.EMAIL_ALREADY_REGISTERED:
          toast.error(
            "Email is already registered. Try logging in or use a different email."
          );
          break;

        case RegistrationStatus.PHONE_ALREADY_REGISTERED:
          toast.error("This phone number is already in use.");
          break;

        case RegistrationStatus.AADHAAR_ALREADY_REGISTERED:
          toast.error("This Aadhaar number is already registered.");
          break;

        case RegistrationStatus.LAND_REGISTRATION_ALREADY_USED:
          toast.error("This land registration number is already in use.");
          break;

        case RegistrationStatus.EMAIL_SEND_FAILED:
          toast.error(
            "Failed to send verification email. Please try again later."
          );
          break;

        default:
          toast.error("An unexpected error occurred. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof registrationSchema>) {
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

      <div className="w-full max-w-6xl p-6 md:p-10">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <LogoWithText width={130} />
          </div>
          <h1 className="text-xl font-bold mb-1">Create your account</h1>
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <Form {...signUpForm}>
          <form
            onSubmit={signUpForm.handleSubmit(onSubmit)}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* First Column */}
            <div className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="aadhaar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 12-digit Aadhaar number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
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
                control={signUpForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your mobile number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your role" />
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
            </div>

            {/* Second Column */}
            <div className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="landRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land Registration Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter land registration number"
                        {...field}
                      />
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
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your complete address"
                        className="min-h-[128px] max-h-[128px]"
                        {...field}
                      />
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
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Eye size={20} />
                          ) : (
                            <EyeSlash size={20} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        {...field}
                      />
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
                {mutation.isPending ? <Loading size={24} /> : "Create Account"}
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                By signing up, you agree to our{" "}
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
