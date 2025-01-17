"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	MdDeleteForever,
	MdKeyboardArrowDown,
	MdKeyboardArrowUp,
} from "react-icons/md";
import Swal from "sweetalert2";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useProp } from "../../contexts/PropContext";
import { useUser } from "../../contexts/UserContext";
import {
	formatDate,
	formatMilitaryTime,
} from "../../helpers/utils/datetimeformat";
import {
	deleteInsulinJournal,
	getInsulinJournals,
} from "../../http/diabeticJournalAPI";

export default function GetInsulinJournalsPage() {
	const logger = require("../../../logger");
	const router = useRouter();
	const { user } = useAuth();
	const { userInfo } = useUser();
	const [insulin, setinsulin] = useState<any>(null);
	const { handlePopUp } = useProp();
	const [selectAll, setSelectAll] = useState(false);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	useEffect(() => {
		if (!userInfo) {
			logger.warn("User not found.");
			alert("User not found.");
		}
	}, [userInfo, router]);

	useEffect(() => {
		async function fetchInsulinJournals() {
			try {
				const result = await getInsulinJournals();
				logger.info("All Insulin journals entry retrieved:", result);
				setinsulin(result.data);
			} catch (error) {
				handlePopUp("error", "Error retrieving insulin journal entry:");
			}
		}
		setTimeout(() => {
			fetchInsulinJournals();
		}, 500);
	}, [user]);
	const deleteSelectedRows = async () => {
		Swal.fire({
			text: "Are you sure you want to delete this insulin journal entry?",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Delete",
		}).then(async (result: { isConfirmed: any }) => {
			if (result.isConfirmed) {
				for (const id of selectedRows) {
					const deleteresult = await deleteInsulinJournal(id);
				}

				const newData = insulin.filter(
					(item: { id: string }) => !selectedRows.includes(item.id)
				);
				setinsulin(newData);
				setSelectedRows([]);

				router.push("/getInsulinJournals");
				Swal.fire({
					title: "Deleted!",
					text: "Your insulin journal entry has been deleted.",
					icon: "success",
				});
			}
		});
	};

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedRows([]);
		} else {
			const allIds = insulin.map((item: { id: string }) => item.id);
			setSelectedRows(allIds);
		}
		setSelectAll(!selectAll);
	};

	const handleCheckboxChange = (id: string) => {
		if (selectedRows.includes(id)) {
			setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
		} else {
			setSelectedRows([...selectedRows, id]);
		}
	};
	async function deleteInsulinJournals(insulinJournalId: string) {
		Swal.fire({
			text: "Are you sure you want to delete this insulin journal entry?",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Delete",
		}).then(async (result: { isConfirmed: any }) => {
			if (result.isConfirmed) {
				const deleteresult = await deleteInsulinJournal(
					insulinJournalId
				);
				const newData =
					insulin &&
					insulin.filter(
						(item: { id: string }) => item.id != insulinJournalId
					);
				setinsulin(newData);
				router.push("/getDiabeticJournals");
				Swal.fire({
					title: "Deleted!",
					text: "Your insulin journal entry has been deleted.",
					icon: "success",
				});
			}
		});
	}

	//Order by Site
	const [ordersite, setOrderSite] = useState(false);

	const handleOrderSite = () => {
		setOrderSite(!ordersite);
		if (!ordersite) {
			const increasingOrderinsulinData = [...insulin].sort((a, b) =>
				a.bodySite.toLowerCase() < b.bodySite.toLowerCase() ? -1 : 1
			);
			setinsulin(increasingOrderinsulinData);
		} else {
			const decreasingOrderinsulinData = [...insulin].sort((a, b) =>
				a.bodySite.toLowerCase() > b.bodySite.toLowerCase() ? -1 : 1
			);
			setinsulin(decreasingOrderinsulinData);
		}
	};

	//Order by Unit
	const [orderunit, setOrderUnit] = useState(false);

	const handleOrderUnit = () => {
		setOrderUnit(!orderunit);
		if (!orderunit) {
			const increasingOrderinsulinData = [...insulin].sort(
				(a, b) => a.unit - b.unit
			);
			setinsulin(increasingOrderinsulinData);
		} else {
			const decreasingOrderinsulinData = [...insulin].sort(
				(a, b) => b.unit - a.unit
			);
			setinsulin(decreasingOrderinsulinData);
		}
	};

	//Order by DateTime
	const [orderdate, setOrderdate] = useState(false);

	const handleOrderDate = () => {
		setOrderdate(!orderdate);
		if (!orderdate) {
			const increasingOrderinsulinData = [...insulin].sort(
				(a, b) =>
					new Date(a.date.substring(0, 10) + "T" + a.time).getTime() -
					new Date(b.date.substring(0, 10) + "T" + b.time).getTime()
			);
			setinsulin(increasingOrderinsulinData);
		} else {
			const decreasingOrderinsulinData = [...insulin].sort(
				(a, b) =>
					new Date(b.date.substring(0, 10) + "T" + b.time).getTime() -
					new Date(a.date.substring(0, 10) + "T" + a.time).getTime()
			);
			setinsulin(decreasingOrderinsulinData);
		}
	};

	return (
		<div
			className="bg-eggshell min-h-screen relative flex flex-col"
			style={{ marginTop: "-6%" }}>
			<span className="flex items-baseline font-bold text-darkgrey text-[24px] mx-4 mt-4 mb-4"></span>
			{insulin && (
				<div className="rounded-3xl bg-white flex flex-col mt-1 mb-6  w-full md:max-w-[800px] md:min-h-[550px] p-4 shadow-[0_32px_64px_0_rgba(44,39,56,0.08),0_16px_32px_0_rgba(44,39,56,0.04)]">
					<label className="text-darkgrey font-bold text-[22px] mb-3">
						Insulin Dosage
					</label>
					<div className="flex justify-between items-center">
						<div>
							<Button
								type="button"
								text="Add an Entry"
								style={{ width: "120px", fontSize: "14px" }}
								onClick={() =>
									router.push(`/createInsulinJournal`)
								}
							/>
						</div>
					</div>
					<br></br>

					<div
						className="flex"
						style={{ justifyContent: "space-between" }}>
						<div className="flex-2" style={{ marginRight: "2%" }}>
							<div className="font-sans  text-darkgrey font-bold text-[18px] text-center">
								Date/Time
								<button
									onClick={handleOrderDate}
									aria-label="orderDate">
									{orderdate ? (
										<MdKeyboardArrowUp className="inline-block text-lg text-darkgrey" />
									) : (
										<MdKeyboardArrowDown className="inline-block text-lg text-darkgrey" />
									)}
								</button>
							</div>
						</div>
						<div className="flex-2" style={{ marginRight: "5%" }}>
							<div className="font-sans  text-darkgrey font-bold text-[18px] text-center">
								Units
								<button
									onClick={handleOrderUnit}
									aria-label="orderUnit">
									{orderunit ? (
										<MdKeyboardArrowUp className="inline-block text-lg text-darkgrey" />
									) : (
										<MdKeyboardArrowDown className="inline-block text-lg text-darkgrey" />
									)}
								</button>
							</div>
						</div>
						<div className="flex-2" style={{ marginRight: "20%" }}>
							<div className="font-sans  text-darkgrey font-bold text-[18px] text-center">
								Site
								<button
									onClick={handleOrderSite}
									aria-label="orderSite">
									{ordersite ? (
										<MdKeyboardArrowUp className="inline-block text-lg text-darkgrey" />
									) : (
										<MdKeyboardArrowDown className="inline-block text-lg text-darkgrey" />
									)}
								</button>
							</div>
						</div>
						<div
							className="flex-2 mt-2 mr-2"
							style={{ display: "flex", alignItems: "center" }}>
							<div style={{ marginLeft: "auto" }}>
								<input
									type="checkbox"
									checked={selectAll}
									onChange={handleSelectAll}
								/>
							</div>
						</div>
					</div>

					{insulin.map((item: any, index: number) => (
						<div
							key={item.insulinJournalId}
							className={`flex justify-between items-left mt-3`}
							style={{
								backgroundColor:
									index % 2 === 0 ? "white" : "#DBE2EA",
							}}
							data-testid="insulin-entry"
							onClick={() =>
								router.push(
									`/getDiabeticJournals/getInsulinJournals/${item.id}`
								)
							}>
							<div className="flex-1">
								<p className="font-sans font-medium text-darkgrey text-[14px]">
									{`${formatDate(
										item.date
									)} ${formatMilitaryTime(item.time)}`}
								</p>
							</div>
							<div className="flex-1">
								<p className="font-sans ml-4 font-medium text-darkgrey text-[14px]">
									{item.unit}
								</p>
							</div>
							<div className="flex-1">
								<p className="font-sans ml-15 font-medium text-darkgrey text-[14px]">
									{item.bodySite}
								</p>
							</div>

							<div
								className="flex icons"
								style={{
									marginLeft: "5px",
									marginRight: "5px",
									marginTop: "-2%",
								}}>
								<div className="icon">
									<MdDeleteForever
										style={{
											color: "var(--Red, #FF7171)",
											width: "25px",
											height: "30px",
										}}
										onClick={(event) => {
											event.stopPropagation();
											deleteInsulinJournals(item.id);
										}}
									/>
								</div>
								<div className="flex-1 mt-1">
									<input
										type="checkbox"
										checked={selectedRows.includes(item.id)}
										onClick={(event) => {
											event.stopPropagation();
											handleCheckboxChange(item.id);
										}}
									/>
								</div>
							</div>
						</div>
					))}
					{selectedRows.length > 0 && (
						<div className="mt-5 pb-4 self-center">
							<Button
								type="button"
								text="Delete Selected Rows"
								style={{
									width: "120px",
									fontSize: "14px",
									padding: "1px 10px",
								}}
								onClick={deleteSelectedRows}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
