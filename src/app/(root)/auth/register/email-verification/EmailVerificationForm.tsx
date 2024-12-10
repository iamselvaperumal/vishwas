"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { verificationCodeSchema } from "@/validators/auth.validator";
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
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { client } from "@/server/client";
import { ArrowLeft } from "@phosphor-icons/react";

export default function EmailVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailVerificationForm = useForm<z.infer<typeof verificationCodeSchema>>(
    {
      resolver: zodResolver(verificationCodeSchema),
      defaultValues: {
        verificationCode: "",
      },
    }
  );

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof verificationCodeSchema>) => {
      const response = await client.api.v1.auth.register["verify-code"].$post({
        json: {
          verificationCode: values.verificationCode,
          email: email!,
        },
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        throw new Error(errorData.message! || "Verification failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Registration completed successfully", {
        description: email,
        action: {
          label: "OK",
          onClick: () => console.log("Verification acknowledged"),
        },
      });
      router.push("/");
    },
    onError: (error: Error) => {
      console.error("Registration failed:", error);
      toast.error("Verification failed", {
        description: error.message || "Please check your code and try again.",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: z.infer<typeof verificationCodeSchema>) {
    setIsSubmitting(true);
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
        <ArrowLeft weight="bold" size={16} />
        Home
      </Link>
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="flex h-svh w-svw items-center justify-center">
        <div className="flex min-w-[400px] flex-col gap-4">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="mb-3 max-w-[400px]">
            Please enter the verification code sent to your email.
            <p className="text-blue-500">{email}</p>
          </p>
          <Form {...emailVerificationForm}>
            <form
              onSubmit={emailVerificationForm.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={emailVerificationForm.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="w-[3.8rem] h-14 text-xl"
                          />
                          <InputOTPSlot
                            index={1}
                            className="w-[3.8rem] h-14 text-xl"
                          />
                          <InputOTPSlot
                            index={2}
                            className="w-[3.8rem] h-14 text-xl"
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={3}
                            className="w-[3.8rem] h-14 text-xl"
                          />
                          <InputOTPSlot
                            index={4}
                            className="w-[3.8rem] h-14 text-xl"
                          />
                          <InputOTPSlot
                            index={5}
                            className="w-[3.8rem] h-14 text-xl"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-4" disabled={isSubmitting}>
                {isSubmitting ? <Loading size={24} /> : "Verify"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
