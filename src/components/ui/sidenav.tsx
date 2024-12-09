"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Analytics, Patient, Settings } from "../icons/nav-icons";

export function SideNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string | undefined) => pathname === path;

  const mainMenu = [
    {
      title: "Patients",
      path: "/",
      icon: <Patient width={24} height={24} />,
    },
    {
      title: "Analytics",
      path: "/analytics",
      icon: <Analytics width={24} height={24} />,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings width={24} height={24} />,
    },
  ];

  return <>Hello</>;
}
