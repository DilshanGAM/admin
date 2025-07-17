"use client";

import axios from "axios";
import { use, useEffect, useState } from "react";
import { FaPhoneSquareAlt, FaWhatsappSquare } from "react-icons/fa";
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
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";

const badgeOptions = [
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
	const [leedsListLoading, setLeedsListLoading] = useState(true);
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
	const [badgeList, setBadgeList] = useState<string[]>([]);
	const [leedsSelectionList, setLeedsSelectionList] = useState<boolean[]>([]);
	const [leedsSelectionAll, setLeedsSelectionAll] = useState(false);

	const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
	const fetchLeeds = async () => {
		try {
			
			const token = localStorage.getItem("token");
			const res = await axios.get(`/api/leeds`, {
				params: {
					startDate,
					endDate,
					sortBy,
					sortOrder,
					page,
					query,
					badgeList: badgeList.join(","),
				},
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setLeedsList(res.data.leeds);
			setPageCount(res.data.pageCount);
			setLeedsCount(res.data.leedsCount);
			setSelectedLeed(res.data.leeds[0] || null);
			setLeedsSelectionList(new Array(res.data.leeds.length).fill(false));
		} catch (err) {
			console.error("Error fetching leeds:", err);
		} finally {
			setLeedsListLoading(false);
		}
	};

	function downloadCsvOfSelectedLeeds() {
		const selectedLeeds = leedsList.filter(
			(_, index) => leedsSelectionList[index]
		);
		if (selectedLeeds.length === 0) {
			alert("No leeds selected for download.");
			return;
		}
		const csvHeader = [
			"First Name",
			"Last Name",
			"Phone Number",
			"Time",
			"Previous Site",
		];
		const csvRows = selectedLeeds.map((l: any) => [
			l.firstName,
			l.lastName,
			l.phoneNumber,
			new Date(l.time).toISOString(),
			l.previousSite,
		]);
		const csvString = [csvHeader, ...csvRows]
			.map((row) => row.join(","))
			.join("\n");
		const blob = new Blob([csvString], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "leeds.csv";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	useEffect(() => {
		if(leedsListLoading){
			fetchLeeds();
		}
		
	}, [page, startDate, endDate, sortBy, sortOrder, query , leedsListLoading]);

	return (
		<div className="w-full p-6 relative">
			<BulkUpdateModal
				leedsList={leedsList}
				leedSelectionList={leedsSelectionList}
				setLeedsSelectionList={setLeedsSelectionList}
				setIsOpen={setIsBulkUpdateModalOpen}
				isOpen={isBulkUpdateModalOpen}
				setLeedsListLoading={setLeedsListLoading}
			/>
			<DownloadIcon
				className="absolute top-4 right-4"
				onClick={() => {
					const token = localStorage.getItem("token");
					axios
						.get(`/api/leeds/getCSV`, {
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
						})
						.then((response) => {
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
				}}
			/>

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
			<div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 ">
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
					<Label>Date range</Label>
					<Select
						defaultValue="3000"
						// onValueChange={setSortBy}
						onValueChange={(value) => {
							const days = parseInt(value, 10);
							const today = new Date();
							const start = new Date(today);
							start.setDate(today.getDate() - days);
							setStartDate(start.toISOString().split("T")[0]);
							setEndDate(today.toISOString().split("T")[0]);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder="Date range" />
						</SelectTrigger>
						{/* <SelectContent>
							<SelectItem value="createdAt">Created At</SelectItem>
							<SelectItem value="firstName">First Name</SelectItem>
							<SelectItem value="phoneNumber">Phone Number</SelectItem>
						</SelectContent> */}
						{/* Last 30 days, Last 7 days, Today, Yesterday and Today, Last 100 days, Last 14 days (On click the date range should be changed) */}
						<SelectContent>
							<SelectItem value={"3000"}>All Time</SelectItem>
							<SelectItem value={"30"}>Last 30 days</SelectItem>
							<SelectItem value={"7"}>Last 7 days</SelectItem>
							<SelectItem value={"0"}>Today</SelectItem>
							<SelectItem value={"1"}>Yesterday and Today</SelectItem>
							<SelectItem value={"100"}>Last 100 days</SelectItem>
							<SelectItem value={"14"}>Last 14 days</SelectItem>
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
					{/* <Label>Badges</Label>
					<BadgeSelector
						badgeList={badgeList}
						setBadgeList={setBadgeList}
					/> */}
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

			<div className="flex justify-between items-center mb-4">
				<BadgeSelector badgeList={badgeList} setBadgeList={setBadgeList} setLeedsListLoading={setLeedsListLoading} />
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => {
							setIsBulkUpdateModalOpen(true);
						}}
						disabled={!leedsSelectionList.some((selected) => selected)}
					>
						Bulk Update
					</Button>
					<Button		
						variant="outline"
						onClick={downloadCsvOfSelectedLeeds}
						disabled={!leedsSelectionList.some((selected) => selected)}
					>
						Download Leeds
					</Button>
					{/* copy phone selected phone numbers using , as a seperator */}
					<Button
						variant="outline"
						onClick={() => {
							const selectedNumbers = leedsList
								.filter((_, index) => leedsSelectionList[index])
								.map((item: any) => item.phoneNumber)
								.join(",");
							navigator.clipboard.writeText(selectedNumbers);
							toast.success("Selected phone numbers copied to clipboard.");
						}}
						disabled={!leedsSelectionList.some((selected) => selected)}
					>
						Copy Numbers
					</Button>
				</div>
			</div>

			{/* Table */}
			<Table>
				<TableCaption>List of collected leeds.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[150px]">
							{/* <Switch
								checked={leedsSelectionList.every((item) => item)}
								onCheckedChange={(checked) => {
									setLeedsSelectionList(
										new Array(leedsList.length).fill(checked)
									);
								}}
							/> */}
							<Checkbox
								checked={leedsSelectionList.every((item) => item)}
								onCheckedChange={(checked) => {
									setLeedsSelectionList(
										new Array(leedsList.length).fill(checked)
									);
								}}
							/>
						</TableHead>
						<TableHead className="w-[150px]">First Name</TableHead>
						<TableHead>Last Name</TableHead>
						<TableHead>Phone</TableHead>
						<TableHead>Connect</TableHead>
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
						leedsList.map((item: any, index: number) => (
							<TableRow key={item._id}>
								<TableCell>
									{/* <Switch
										checked={leedsSelectionList[index]}
										onCheckedChange={(checked) => {
											const newSelection = [...leedsSelectionList];
											newSelection[index] = checked;
											setLeedsSelectionList(newSelection);
										}}
									/> */}
									<Checkbox
										checked={leedsSelectionList[index]}
										onCheckedChange={(checked : boolean) => {
											const newSelection = [...leedsSelectionList];
											newSelection[index] = checked;
											setLeedsSelectionList(newSelection);
										}}
									/>
								</TableCell>
								<TableCell>{item.firstName}</TableCell>
								<TableCell>{item.lastName}</TableCell>
								<TableCell>{item.phoneNumber}</TableCell>
								<TableCell className="flex items-center gap-2">
									<FaWhatsappSquare
										className="text-green-500 cursor-pointer text-3xl"
										onClick={() => {
											window.open(
												`https://wa.me/${item.phoneNumber}`,
												"_blank"
											);
										}}
									/>
									<FaPhoneSquareAlt
										className="text-blue-500 cursor-pointer text-3xl"
										onClick={() => {
											window.open(`tel:${item.phoneNumber}`, "_self");
										}}
									/>
								</TableCell>
								<TableCell>{new Date(item.time).toLocaleString()}</TableCell>
								<TableCell
									onClick={() => {
										setSelectedLeed(item);
										setIsOpen(true);
									}}
								>
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
			const badgeData = badgeOptions.find((b) => b.key === badge);
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
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					closeModal();
				} else {
					setIsOpen(true);
				}
			}}
		>
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
					<Button variant="outline" onClick={closeModal}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function BadgeSelector({
	badgeList,
	setBadgeList,
	setLeedsListLoading
	
}: {
	badgeList: string[];
	setBadgeList: (badges: string[]) => void;
	setLeedsListLoading?: (loading: boolean) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2">
			{badgeOptions.map((badge) => (
				<Button
					key={badge.key}
					variant={badgeList.includes(badge.key) ? "default" : "outline"}
					style={{
						backgroundColor: badgeList.includes(badge.key)
							? badge.color
							: undefined,
						color: badgeList.includes(badge.key) ? "#fff" : undefined,
						borderColor: badge.color,
					}}
					onClick={() => {
						const newBadges = badgeList.includes(badge.key)
							? badgeList.filter((b) => b !== badge.key)
							: [...badgeList, badge.key];
						setBadgeList(newBadges);
						if (setLeedsListLoading) {
							setLeedsListLoading(true);
						}
					}}
				>
					{badge.label}
				</Button>
			))}
		</div>
	);
}

function BulkUpdateModal({
	leedsList,
	leedSelectionList,
	setLeedsSelectionList,
	setIsOpen,
	isOpen,
	setLeedsListLoading,
}
: {
	leedsList: any[];
	leedSelectionList: boolean[];
	setLeedsSelectionList: (list: boolean[]) => void;
	setIsOpen: (open: boolean) => void;
	isOpen: boolean;
	setLeedsListLoading: (loading: boolean) => void;
}) {
	const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const handleBadgeChange = (badge: string) => {
		setSelectedBadges((prev) =>
			prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
		);
	};
	const handleSubmit = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const selectedLeeds = leedsList.filter(
				(_, index) => leedSelectionList[index]
			);
			await axios.put(
				`/api/leeds/bulkBadgeUpdate`,
				{
					ids: selectedLeeds.map((l) => l._id),
					badges: selectedBadges,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			toast.success("Badges updated successfully!");
			setLeedsListLoading(true);
			setIsOpen(false);
		} catch (error) {
			console.error("Error updating badges:", error);
			toast.error("Failed to update badges.");
		} finally {
			setLoading(false);
		}
	};
	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Update Badges for selected leeds</DialogTitle>
					<DialogDescription>
						Select or deselect badges for these users.
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
								onClick={
									() => handleBadgeChange(badge.key)
								}
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
					<Button variant="outline" onClick={()=>{
						setIsOpen(false);
						setLeedsSelectionList(new Array(leedsList.length).fill(false));
					}}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
