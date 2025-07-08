"use client";

import axios from "axios";
import { useEffect, useState } from "react";
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

export default function LeedsPage() {
	const [leedsList, setLeedsList] = useState([]);
	const [leedsListLoading, setLeedsListLoading] = useState(false);
	const [pageCount, setPageCount] = useState(1);
	const [leedsCount, setLeedsCount] = useState(0);
	const [page, setPage] = useState(1);
	const [startDate, setStartDate] = useState("2023-01-01");
	//get today's date as end date
	const today = new Date();
	const formattedToday = today.toISOString().split("T")[0];
	const [endDate, setEndDate] = useState(formattedToday);
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");

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
				},
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setLeedsList(res.data.leeds);
			setPageCount(res.data.pageCount);
			setLeedsCount(res.data.leedsCount);
		} catch (err) {
			console.error("Error fetching leeds:", err);
		} finally {
			setLeedsListLoading(false);
		}
	};

	useEffect(() => {
		fetchLeeds();
	}, [page, startDate, endDate, sortBy, sortOrder]);

	return (
		<div className="w-full p-6">
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
							<TableRow key={item._id}>
								<TableCell>{item.firstName}</TableCell>
								<TableCell>{item.lastName}</TableCell>
								<TableCell>{item.phoneNumber}</TableCell>
								<TableCell>{item.previousSite}</TableCell>
								<TableCell>{new Date(item.time).toLocaleString()}</TableCell>
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
