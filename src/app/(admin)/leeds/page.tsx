"use client";

import axios from "axios";
import { use, useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DownloadIcon } from "lucide-react";

const badgeOptions  = [
	{
		key: "new",
		label: "new",
		color: "#007bff", // Blue
	},
	{
		key: "called",
		label: "called",
		color: "#28a745", // Green
	},
	{
		key: "rejected",
		label: "rejected",
		color: "#dc3545", // Red
	},
	{
		key: "texted",
		label: "texted",
		color: "#ffc107", // Yellow
	},
	{
		key: "follow up",
		label: "follow up",
		color: "#17a2b8", // Cyan
	},
	{
		key: "spam",
		label: "spam",
		color: "#6c757d", // Gray
	},
];

export default function LeedsPage() {
	const [leedsList, setLeedsList] = useState([]);
	const [leedsListLoading, setLeedsListLoading] = useState(false);
	const [pageCount, setPageCount] = useState(1);
	const [leedsCount, setLeedsCount] = useState(0);
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [startDate, setStartDate] = useState("2023-01-01");
	//get today's date as end date
	const today = new Date();
	const formattedToday = today.toISOString().split("T")[0];
	const [endDate, setEndDate] = useState(formattedToday);
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLeed, setSelectedLeed] = useState(null);

	const fetchLeeds = async () => {
		try {
			setLeedsListLoading(true);
			const token = localStorage.getItem("token");
			const res = await axios.get(`/api/leeds`, {
				params: {
					startDate,
					endDate,
					sortBy,
					sortOrder,
					page,
					query,
				},
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setLeedsList(res.data.leeds);
			setPageCount(res.data.pageCount);
			setLeedsCount(res.data.leedsCount);
			setSelectedLeed(res.data.leeds[0] || null);
		} catch (err) {
			console.error("Error fetching leeds:", err);
		} finally {
			setLeedsListLoading(false);
		}
	};

	useEffect(() => {
		fetchLeeds();
	}, [page, startDate, endDate, sortBy, sortOrder, query]);

	return (
		<div className="w-full p-6 relative">
			<DownloadIcon className="absolute top-4 right-4" 
			onClick={
				()=>{
					const token = localStorage.getItem("token");
					axios.get(`/api/leeds/getCSV`, {
						params: {
							startDate,
							endDate,
							query,
							sortBy,
							sortOrder,
						},
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}).then((response) => {
						const csvData = response.data;
						const blob = new Blob([csvData], { type: "text/csv" });
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = "leeds.csv";
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
					});
				}
			} />

			{selectedLeed && (
				<PopUPModal
					leed={selectedLeed}
					reload={fetchLeeds}
					isOpen={isOpen}
					setIsOpen={setIsOpen}
					setSelectedLeed={setSelectedLeed}
				/>
			)}
			<h1 className="text-2xl font-bold mb-4">Leeds Data</h1>

			{/* Filters */}
			<div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
				<div>
					<Label>Start Date</Label>
					<Input
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div>
					<Label>End Date</Label>
					<Input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
				<div>
					<Label>Sort By</Label>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger>
							<SelectValue placeholder="Sort By" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="createdAt">Created At</SelectItem>
							<SelectItem value="firstName">First Name</SelectItem>
							<SelectItem value="phoneNumber">Phone Number</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Sort Order</Label>
					<Select value={sortOrder} onValueChange={setSortOrder}>
						<SelectTrigger>
							<SelectValue placeholder="Sort Order" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="asc">Ascending</SelectItem>
							<SelectItem value="desc">Descending</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Search</Label>
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
				<div className="flex items-end">
					<Button onClick={() => fetchLeeds()}>Apply Filters</Button>
				</div>
			</div>

			{/* Table */}
			<Table>
				<TableCaption>List of collected leeds.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[150px]">First Name</TableHead>
						<TableHead>Last Name</TableHead>
						<TableHead>Phone</TableHead>
						<TableHead>Previous Site</TableHead>
						<TableHead>Time</TableHead>
						<TableHead>Badges</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{leedsListLoading ? (
						<TableRow>
							<TableCell colSpan={5}>Loading...</TableCell>
						</TableRow>
					) : leedsList.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5}>No data found.</TableCell>
						</TableRow>
					) : (
						leedsList.map((item: any) => (
							<TableRow
								key={item._id}
								onClick={() => {
									setSelectedLeed(item);
									setIsOpen(true);
								}}
							>
								<TableCell>{item.firstName}</TableCell>
								<TableCell>{item.lastName}</TableCell>
								<TableCell>{item.phoneNumber}</TableCell>
								<TableCell>{item.previousSite}</TableCell>
								<TableCell>{new Date(item.time).toLocaleString()}</TableCell>
								<TableCell>
									<BadgeContent badgeList={item.badges} />
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{/* Pagination */}
			<div className="flex justify-between items-center mt-6">
				<p>
					Showing page <strong>{page}</strong> of <strong>{pageCount}</strong>
				</p>
				<div className="space-x-2">
					<Button
						variant="outline"
						onClick={() => setPage((p) => Math.max(p - 1, 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
						disabled={page >= pageCount}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

function BadgeContent({ badgeList }: { badgeList: string[] }) {
	const [fullDetailedBadgeList, setFullDetailedBadgeList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const detailedBadges = badgeList.map((badge) => {
			const badgeData = badgeOptions .find((b) => b.key === badge);
			return badgeData ? { ...badgeData, key: badge } : null;
		});
		setFullDetailedBadgeList(detailedBadges.filter((b) => b !== null));
		setLoading(false);
	}, [badgeList]);
	return loading ? (
		<div className="flex items-center justify-center h-10">
			<div className="border-t-transparent border-solid border-4 border-blue-500 rounded-full animate-spin w-6 h-6"></div>
		</div>
	) : fullDetailedBadgeList.length === 0 ? (
		<span className="text-gray-500">No badges</span>
	) : (
		<Tooltip>
			<TooltipTrigger className="cursor-pointer">
				<TooltipContent>
					<div className="flex flex-col gap-1">
						{fullDetailedBadgeList.map((badge: any, index: number) => (
							<div
								key={index}
								className="flex items-center gap-2 text-center px-2 py-1 rounded-full cursor-pointer"
								style={{ backgroundColor: badge.color }}
							>
								<span className="text-xs text-white">{badge.label}</span>
							</div>
						))}
					</div>
				</TooltipContent>
				<div className="w-[100px] flex items-center relative h-10 ">
					{fullDetailedBadgeList.map((badge: any, index: number) => {
						return (
							<div
								key={index}
								className={`absolute   text-white cursor-pointer px-[8px] flex items-center py-[2px] rounded-full`}
								style={{
									backgroundColor: badge.color,
									left: `${index * 8}px`,
								}}
							>
								<span className="text-xs">{badge.label}</span>
							</div>
						);
					})}
				</div>
			</TooltipTrigger>
		</Tooltip>
	);
}

function PopUPModal({
	leed,
	reload,
	isOpen,
	setIsOpen,
	setSelectedLeed,
}: {
	leed: any;
	reload: () => void;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	setSelectedLeed: (leed: any) => void;
}) {
	const [selectedBadges, setSelectedBadges] = useState<string[]>(
		leed.badges || []
	);
	const [loading, setLoading] = useState(false);
	

	const handleBadgeChange = (badge: string) => {
		setSelectedBadges((prev) =>
			prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
		);
	};
	function closeModal() {
		setIsOpen(false);
		setSelectedLeed(null);
	}
	const handleSubmit = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			await axios.put(
				`/api/leeds?id=${leed._id}`,
				{ badges: selectedBadges },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			reload();
			closeModal();
		} catch (error) {
			console.error("Error updating badges:", error);
		} finally {
			setLoading(false);
		}
	};
	
	return (
		<Dialog open={isOpen} onOpenChange={(open) => {
			if (!open) {
				closeModal();
			}else {
				setIsOpen(true);
			}
		}
		}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Update Badges for {leed.firstName}</DialogTitle>
					<DialogDescription>
						Select or deselect badges for this user.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap gap-2 mt-4">
					{badgeOptions.map((badge) => {
						const isActive = selectedBadges.includes(badge.key);
						return (
							<Button
								key={badge.key}
								variant={isActive ? "default" : "outline"}
								style={{
									backgroundColor: isActive ? badge.color : undefined,
									color: isActive ? "#fff" : undefined,
									borderColor: badge.color,
								}}
								onClick={() => handleBadgeChange(badge.key)}
							>
								{badge.label}
							</Button>
						);
					})}
				</div>

				<DialogFooter className="mt-6">
					<Button onClick={handleSubmit} disabled={loading}>
						{loading ? "Updating..." : "Update Badges"}
					</Button>
					<Button variant="outline" onClick={closeModal}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
