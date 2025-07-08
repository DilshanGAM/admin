"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleLogin = async () => {
		setLoading(true);
		const data = {
			email,
			password,
		};
		try {

			const response = await axios.post("/api/auth", data);
            console.log("Login response:", response.data);
            localStorage.setItem("token", response.data.token);
            toast.success("Login successful!");
            router.push("/");

		} catch (error:any) {
			console.error("Login error:", error);
			setLoading(false);
            toast.error(error.response?.data?.message || "Login failed. Please try again.");
            
		}
	};



	const handleKeyPress = (e: any) => {
		if (e.key === "Enter") {
			handleLogin();
		}
	};

	return (
		<div className="min-h-screen ">
			<main className="flex min-h-screen">
				<div className="w-full hidden md:flex  md:w-1/2 md:ml-auto  items-center justify-center p-6 bg-gradient-to-b from-[#41167C] to-[#001840] ">
					{/* Card wrapper with responsive positioning */}
					<img
						src={"/logo-main.png"}
						alt="Banner"
						className="hidden md:block  w-2/3"
					/>
				</div>
				<div className="w-full md:w-1/2 md:ml-auto flex items-center justify-center p-6 bg-white">
					{/* Card wrapper with responsive positioning */}
					<div className="w-full max-w-md">
						<div className=" flex flex-col items-center justify-center">
							<img
								src={"/logo-main.png"}
								alt="Banner"
								className="md:hidden block w-[130px]"
							/>
						</div>
						<Card className="  ">
							<CardHeader>
								<h2 className="text-2xl font-extrabold text-[#7B1BFF]">
									Log In{" "}
								</h2>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="relative">
										<Input
											type="email"
											placeholder="Enter Email"
											className="pl-10 h-[45px] bg-white/50 border-[#7B1BFF]  focus:bg-white/70 transition-colors"
											onChange={(e) => setEmail(e.target.value)}
											onKeyPress={handleKeyPress}
										/>
										<div className="absolute left-3 top-1/2 -translate-y-1/2">
											<Mail className="h-5 w-5 text-[#7B1BFF]" />
										</div>
									</div>

									<div className="relative">
										<Input
											type="password"
											placeholder="Enter Password"
											className="pl-10 h-[45px] bg-white/50 border-[#7B1BFF]  focus:bg-white/70 transition-colors"
											onChange={(e) => setPassword(e.target.value)}
											onKeyPress={handleKeyPress}
										/>
										<div className="absolute left-3 top-1/2 -translate-y-1/2">
											<Lock className="h-5 w-5 text-[#7B1BFF]" />
										</div>
									</div>

									<div className="text-right opacity-0">
										<a
											href="#"
											className="text-[#7B1BFF] text-sm hover:underline"
										>
											Forgot Password?
										</a>
									</div>

									<Button
										onClick={handleLogin}
										className="w-full h-[40px] bg-[#7B1BFF] hover:bg-[#4702A5] text-white  transition-colors"
										disabled={loading}
									>
										{loading ? "Logging in..." : "Login"}
									</Button>

									{/* <Button
                    onClick={handleLoginStudent}
                    className="w-full h-[40px] bg-[#7B1BFF] hover:bg-[#4702A5] text-white  transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login as Student"}
                  </Button>

                  <Button
                    onClick={handleLoginAdmin}
                    className="w-full h-[40px] bg-[#7B1BFF] hover:bg-[#4702A5] text-white  transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login as Admin"}
                  </Button> */}

									<div className="relative mt-6 text-center">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-orange-200"></div>
										</div>
										<div className="relative">
											<span className="bg-white/20 px-4 text-sm text-[#7B1BFF] backdrop-blur-md">
												OR
											</span>
										</div>
									</div>

									<div className="text-center space-y-2">
										{/* <p className="text-[#7B1BFF] text-sm">Don't have an account?</p> */}
										<Link href="/register">
											<Button
												variant="outline"
												className="w-full h-[40px] border-[#7B1BFF] text-[#7B1BFF] hover:bg-[#7B1BFF] hover:text-white transition-colors"
											>
												Register
											</Button>
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			<footer className="fixed bottom-4 w-full text-center text-gray-600"></footer>
		</div>
	);
}
