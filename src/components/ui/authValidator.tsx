"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthValidator({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(()=>{
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            axios.get("/api/auth", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    setLoading(false);
                } else {
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            })
            .catch((err) => {
                console.error("Error validating auth:", err);
                localStorage.removeItem("token");
                router.push("/login");
            })
        }
    },[])
    return loading ? (
        <div className="flex items-center justify-center h-screen">
            <div className="border-t-transparent border-solid border-4 border-blue-500 rounded-full animate-spin w-16 h-16"></div>
        </div>
            ) : (
                <>{children}</>
            );
}