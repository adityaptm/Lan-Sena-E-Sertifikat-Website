"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, []);

  return null;
}
