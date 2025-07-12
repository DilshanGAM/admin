"use client";

import axios from "axios";
import {
	MenuIcon,
	LayoutDashboard,
	Users,
	FileText,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function isCorrectPath(path: String, href: string): boolean {
	return path === href;
}

export default function NavigationBar() {
	const [status, setStatus] = useState<"starting" | "opening" | "closing">(
		"starting"
	);
	const path = usePathname();
	console.log("Current path:", path);
	useEffect(
		()=>{
	
		},[]
	)

	// Determine the current width class
	const widthClass =
		status === "starting"
			? "w-[274px]"
			: status === "closing"
			? "w-[52px]"
			: "w-[274px]"; // reopening

	return (
		<div
			className={`
				${widthClass} 
				transition-all duration-500 ease-in-out overflow-x-hidden
				shrink-0 h-screen relative flex flex-col bg-white border-r
				
			`}
		>
			<div className="flex flex-row justify-center items-center h-[90px] relative ">
				<img
					src="/logo.png"
					alt="Logo"
					className={`h-full object-cover cursor-pointer transition-all duration-300 ${
						status === "closing" ? "w-0 opacity-0" : "w-[200px] opacity-100"
					}`}
				/>

				<MenuIcon
					className="w-6 h-6   cursor-pointer text-science-blue  "
					onClick={() => {
						if (status === "starting" || status === "opening") {
							setStatus("closing");
						} else {
							setStatus("opening");
						}
					}}
				/>
			</div>
			<SidebarLink
				href="/"
				label="Dashboard"
				icon={<LayoutDashboard className="w-5 h-5" />}
				collapsed={status === "closing"}
				isSelected={isCorrectPath(path, "/")}
			/>
			<SidebarLink
				href="/users"
				label="Users"
				icon={<Users className="w-5 h-5" />}
				collapsed={status === "closing"}
				isSelected={isCorrectPath(path, "/users")}
			/>
			<SidebarLink
				href="/leeds"
				label="leeds"
				icon={<FileText className="w-5 h-5" />}
				collapsed={status === "closing"}
				isSelected={isCorrectPath(path, "/leeds")}
			/>
			<SidebarLink
				href="/settings"
				label="Settings"
				icon={<Settings className="w-5 h-5" />}
				collapsed={status === "closing"}
				isSelected={isCorrectPath(path, "/settings")}
			/>
		</div>
	);
}
function SidebarLink({
	href,
	label,
	icon,
	collapsed,
	isSelected,
}: {
	href: string;
	label: string;
	icon: React.ReactNode;
	collapsed: boolean;
	isSelected?: boolean;
}) {
	return (
		<Link
			href={href}
			className={`w-full flex h-[44px] ${!collapsed?" pl-[35px] ":" justify-center "} py-[12px] gap-[15px] hover:bg-[#861DFF10] ${
				isSelected ? "text-artyclick-purple" : ""
			}`}
		>
			{icon}
			{!collapsed&&<span className={` text-sm  transition-all duration-300`}>{label}</span>}
		</Link>
	);
}
