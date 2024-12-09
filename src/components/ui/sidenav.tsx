"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoWithText } from "../icons/logo";
import {
  Dashboard,
  Logout,
  Moon,
  Order,
  Product,
  Settings,
  Sun,
} from "../icons/nav-icons";

import { UserProps } from "@/types/auth";
import { Button } from "./button";

export default function SideNav({ user }: UserProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string | undefined) => pathname === path;

  const farmerMenu = [
    {
      name: "Dashboard",
      path: "/farmer/dashboard",
      icon: <Dashboard width={24} height={24} />,
    },
    {
      name: "Products",
      path: "/farmer/products",
      icon: <Product width={24} height={24} />,
    },
    {
      name: "Orders",
      path: "/farmer/orders",
      icon: <Order width={24} height={24} />,
    },
    {
      name: "Settings",
      path: "/farmer/settings",
      icon: <Settings width={24} height={24} />,
    },
  ];

  const consumerMenu = [
    {
      name: "Dashboard",
      path: "/consumer/dashboard",
      icon: <Dashboard width={24} height={24} />,
    },
    {
      name: "Products",
      path: "/consumer/products",
      icon: <Product width={24} height={24} />,
    },
    {
      name: "Orders",
      path: "/consumer/orders",
      icon: <Order width={24} height={24} />,
    },
    {
      name: "Settings",
      path: "/consumer/settings",
      icon: <Settings width={24} height={24} />,
    },
  ];

  return (
    <>
      <div className="flex flex-col h-screen w-[250px] border-t lg:border-r p-4">
        <Link href={"/"} className="mb-8 ">
          <LogoWithText width={110} className="hidden lg:inline" />
        </Link>
        <nav className="flex flex-col flex-1 text-sm gap-8 py-3">
          {mounted &&
            (user?.role === "farmer" ? farmerMenu : consumerMenu).map(
              (menu, index) => (
                <>
                  <Link
                    href={{ pathname: menu.path }}
                    key={index}
                    className={`flex flex-row items-center dark:fill-zinc-300 dark:text-zinc-300 dark:hover:fill-green-500 dark:hover:text-green-500 hover:text-green-600 hover:fill-green-600 ${
                      isActive(menu?.path)
                        ? "fill-green-600 text-green-600 dark:fill-green-500 dark:text-green-500"
                        : "fill-zinc-700 text-zinc-700 dark:fill-zinc-300 dark:text-zinc-300"
                    }`}
                  >
                    <span className="mr-4">{menu?.icon}</span>
                    <span>{menu?.name}</span>
                    <span className="sr-only">{menu?.name}</span>
                  </Link>
                </>
              )
            )}
        </nav>
        <nav className="flex flex-col text-sm gap-8 py-3 mb-8">
          {mounted && (
            <>
              {theme === "dark" ? (
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className="flex flex-row items-center  
                      fill-zinc-700  dark:fill-zinc-300 dark:hover:fill-green-500 hover:fill-green-600 hover:text-green-500"
                >
                  <Sun width={24} height={24} className="mr-4" />
                  Light Mode
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className="flex flex-row items-center  fill-zinc-700  dark:fill-zinc-300 dark:hover:fill-green-500 hover:fill-green-500 hover:text-green-500"
                >
                  <Moon width={24} height={24} />
                </button>
              )}
              <Button
                variant={"ghost"}
                className="flex flex-row items-center  fill-zinc-700  dark:fill-zinc-300 dark:hover:fill-green-500 hover:fill-green-600 justify-start pl-0"
              >
                <Logout width={24} height={24} className="mr-4" />
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
