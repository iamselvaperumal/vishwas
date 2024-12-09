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

import Loading from "@/app/loading";
import { logout } from "@/server/actions";
import { UserProps } from "@/types/auth";
import { Button } from "./button";

export default function SideNav({ user }: UserProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const menu = user?.role === "farmer" ? farmerMenu : consumerMenu;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-[250px] border-t border-r p-4">
        <Link href={"/"} className="mb-8">
          <LogoWithText width={110} className="inline" />
        </Link>
        <nav className="flex flex-col flex-1 text-sm gap-8 py-3">
          {mounted &&
            menu.map((menu, index) => (
              <Link
                href={menu.path}
                key={index}
                className={`
                flex flex-row items-center 
                transition-colors duration-200 
                ${
                  isActive(menu.path)
                    ? "text-green-600 dark:text-green-500 fill-green-600 dark:fill-green-500 font-bold"
                    : "text-zinc-800 dark:text-zinc-300 fill-zinc-800 dark:fill-zinc-300"
                }
                hover:text-green-600 dark:hover:text-green-500 
                hover:fill-green-600 dark:hover:fill-green-500
              `}
              >
                <span className="mr-4">{menu.icon}</span>
                <span>{menu.name}</span>
              </Link>
            ))}
        </nav>
        <nav className="flex flex-col text-sm gap-8 py-3 mb-8">
          {mounted && (
            <>
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="
                  flex flex-row items-center 
                  text-zinc-800 dark:text-zinc-300
                  fill-zinc-800 dark:fill-zinc-300
                  hover:text-green-600 dark:hover:text-green-500
                  hover:fill-green-600 dark:hover:fill-green-500
                  transition-colors duration-200
                "
              >
                {theme === "dark" ? (
                  <>
                    <Sun width={24} height={24} className="mr-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon width={24} height={24} className="mr-4" />
                    Dark Mode
                  </>
                )}
              </button>
              <Button
                variant="ghost"
                className="
                  flex flex-row items-center 
                  text-zinc-800 dark:text-zinc-300
                  fill-zinc-800 dark:fill-zinc-300
                  hover:text-green-600 dark:hover:text-green-500
                  hover:fill-green-600 dark:hover:fill-green-500
                  hover:bg-transparent 
                  justify-start pl-0
                  transition-colors duration-200
                "
                onClick={async () => {
                  setLoading(true);
                  await logout();
                  setLoading(false);
                }}
              >
                {loading ? (
                  <Loading />
                ) : (
                  <>
                    <Logout width={24} height={24} className="mr-4" />
                    Logout
                  </>
                )}
              </Button>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 lg:hidden z-50 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <Link href="/" className="flex items-center">
            <LogoWithText width={110} />
          </Link>
          <div className="flex items-center space-x-10">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="
                flex items-center 
                text-zinc-800 dark:text-zinc-300
                fill-zinc-800 dark:fill-zinc-300
                hover:text-green-600 dark:hover:text-green-500
                hover:fill-green-600 dark:hover:fill-green-500
                transition-colors duration-200
              "
            >
              {theme === "dark" ? (
                <Sun width={24} height={24} />
              ) : (
                <Moon width={24} height={24} />
              )}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="
                text-zinc-800 dark:text-zinc-300
                fill-zinc-800 dark:fill-zinc-300
                hover:text-green-600 dark:hover:text-green-500
                hover:fill-green-600 dark:hover:fill-green-500
                transition-colors duration-200 hover:bg-transparent !mr-2
              "
              onClick={async () => {
                setLoading(true);
                await logout();
                setLoading(false);
              }}
            >
              {loading ? <Loading /> : <Logout width={24} height={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 mt-16">
        <div className="bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 shadow-lg">
          <div className="grid grid-cols-4 py-2">
            {mounted &&
              menu.map((menu, index) => (
                <Link
                  href={menu.path}
                  key={index}
                  className={`
                  flex flex-col items-center justify-center 
                  py-2 
                  transition-colors duration-200 
                  ${
                    isActive(menu.path)
                      ? "text-green-600 dark:text-green-500 fill-green-600 dark:fill-green-500 font-bold"
                      : "text-zinc-800 dark:text-zinc-300 fill-zinc-800 dark:fill-zinc-300"
                  }
                  hover:text-green-600 dark:hover:text-green-500 
                  hover:fill-green-600 dark:hover:fill-green-500
                `}
                >
                  {menu.icon}
                  <span className="text-xs mt-1">{menu.name}</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
