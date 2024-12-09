import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserProps } from "@/types/auth";

export default function SettingsForm({ user }: UserProps) {
  return (
    <>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-8">User Information</h1>
        <div className="grid md:grid-cols-2 gap-8 px-8">
          <div className="space-y-8">
            <div className="flex flex-col">
              <Label htmlFor="name" className="mb-4">
                Full Name
              </Label>
              <Input
                placeholder="Enter your full name"
                className="w-full"
                name="name"
                value={user?.name ?? ""}
                disabled={true}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="aadhaar" className="mb-4">
                Aadhaar Number
              </Label>
              <Input
                placeholder="Enter 12-digit Aadhaar number"
                className="w-full"
                name="aadhaar"
                value={user?.aadhaar ?? ""}
                disabled={true}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="email" className="mb-4">
                Email Address
              </Label>
              <Input
                placeholder="you@example.com"
                className="w-full"
                name="email"
                value={user?.email ?? ""}
                disabled={true}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="phone" className="mb-4">
                Phone Number
              </Label>
              <Input
                placeholder="Enter your mobile number"
                className="w-full"
                name="phone"
                value={user?.phone ?? ""}
                disabled={true}
              />
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex flex-col">
              <Label htmlFor="role" className="mb-4">
                Role
              </Label>
              <Input
                placeholder="Select Role"
                className="w-full"
                name="role"
                value={user?.role ?? ""}
                disabled={true}
              />
            </div>

            {user?.role === "farmer" && (
              <div className="flex flex-col">
                <Label htmlFor="landRegistrationNumber" className="mb-4">
                  Land Registration Number
                </Label>
                <Input
                  placeholder="Enter land registration number"
                  className="w-full"
                  name="landRegistrationNumber"
                  value={user?.landRegistrationNumber ?? ""}
                  disabled={true}
                />
              </div>
            )}

            <div className="flex flex-col">
              <Label htmlFor="address" className="mb-4">
                Role
              </Label>
              <Textarea
                placeholder="Enter your complete address"
                className={`
                          ${
                            user?.role === "farmer"
                              ? "min-h-[144px] max-h-[144px]"
                              : "min-h-[244px] max-h-[244px]"
                          }
                        `}
                name="address"
                value={user?.address ?? ""}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
