import React, { useState } from "react";
import { GoLinkExternal } from "react-icons/go";
import { TbProgress } from "react-icons/tb";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import { ClipboardList } from "lucide-react"

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// react
import { Navigate, useNavigate } from "react-router-dom";

const reportsData = [
  { id: "R-001", date: "31-Jan-26", reportType: "Statement of Issuance",  cereal: "WD1G50", status: "Pending"  },
  { id: "R-002", date: "31-Jan-26", reportType: "Statement of Receipts",  cereal: "PD1350", status: "Rejected" },
  { id: "R-003", date: "31-Jan-26", reportType: "Statement of Issuance",  cereal: "WD1G50", status: "Approved" },
];

const getStatusStyle = (status) => {
  const base = "px-3 py-1.5 rounded-full font-semibold text-[13px] inline-flex items-center gap-1.5 min-w-[110px] justify-center";
  if (status === "Pending")  return `${base} bg-[#F0E48B] text-[#856404]`;
  if (status === "Approved") return `${base} bg-[#8BF093] text-[#155724]`;
  if (status === "Rejected") return `${base} bg-[#FF595C] text-[#721c24]`;
  return base;
};

const getStatusIcon = (status) => {
  if (status === "Pending")  return <TbProgress size={15} />;
  if (status === "Approved") return <FaRegCircleCheck size={15} />;
  if (status === "Rejected") return <MdOutlineCancel size={15} />;
  return null;
};

export default function ReportStatus() {
  const navigate = useNavigate();

  // us
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type");
  const [selectedReportType, setSelectedReportType] = useState("All Report Type");
  const [selectedStatus, setSelectedStatus]         = useState("All Status");

  const [selectedReport, setSelectedReport] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredReports = reportsData.filter((report) => {
    const matchCereal = selectedCerealType === "All Cereal Type" || report.cereal === selectedCerealType;
    const matchReport = selectedReportType === "All Report Type" || report.reportType === selectedReportType;
    const matchStatus = selectedStatus      === "All Status"     || report.status    === selectedStatus;
    return matchCereal && matchReport && matchStatus;
  });

  const handleView = (report) => {
    setSelectedReport(report);
    if (report.status === "Rejected") {
      setShowRejectModal(true);
    } else {
      // for approved and pending later on
    }
  };

  return (
    <div className="m-7.5 flex flex-col h-[calc(100vh-160px)]">

      {/* Filters */}
      <div className="flex justify-end gap-2.5 py-2.5 mb-4">
        <Select value={selectedCerealType} onValueChange={(v) => setSelectedCerealType(v)}>
          <SelectTrigger className="inline-flex items-center justify-between gap-2.5 border-[#999] rounded-lg bg-white py-5 px-3.5 text-[#2D317F] font-semibold text-sm w-42 cursor-pointer whitespace-nowrap">
            <SelectValue placeholder="All Cereal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="p-2 text-[#2D317F]" value="All Cereal Type">All Cereal Type</SelectItem>
            <SelectItem className="p-2 text-[#2D317F]" value="WD1G50">Rice</SelectItem>
            <SelectItem className="p-2 text-[#2D317F]" value="PD1350">Palay</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedReportType} onValueChange={(v) => setSelectedReportType(v)}>
          <SelectTrigger className="inline-flex items-center justify-between gap-2.5 border-[#999] rounded-lg bg-white py-5 px-3.5 text-[#2D317F] font-semibold text-sm w-45 min-w-0 cursor-pointer whitespace-nowrap">
            <SelectValue placeholder="All Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="p-2 text-[#2D317F]" value="All Report Type">All Report Type</SelectItem>
            <SelectItem className="p-2 text-[#2D317F]" value="Statement of Issuance">Statement of Issuance</SelectItem>
            <SelectItem className="p-2 text-[#2D317F]" value="Statement of Receipts">Statement of Receipts</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
          <SelectTrigger className="inline-flex items-center justify-between gap-2.5 border-[#999] rounded-lg bg-white py-5 px-3.5 text-[#2D317F] font-semibold text-sm w-32 min-w-0 cursor-pointer whitespace-nowrap">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="p-2 text-[#2D317F]" value="All Status">All Status</SelectItem>
            <SelectItem className="p-2 text-[#2D317F]" value="Approved">Approved</SelectItem>
            <SelectItem className="p-2 text-[#2D317F]" value="Rejected">Rejected</SelectItem>
            <SelectItem className="p-2 text-[#2D317F]" value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#E2EBFF] hover:bg-[#E2EBFF]">
              <TableHead className="text-[#2D317F] font-bold text-center h-[50px]">Date</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-[50px]">Report ID</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-[50px]">Report Type</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-[50px]">Cereal Type</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-[50px]">Status</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-[#2D317F] font-medium">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id} className="text-[#2D317F] font-medium border-b border-gray-200 h-[50px]">
                  <TableCell className="text-center">{report.date}</TableCell>
                  <TableCell className="text-center">{report.id}</TableCell>
                  <TableCell className="text-center">{report.reportType}</TableCell>
                  <TableCell className="text-center">{report.cereal}</TableCell>
                  <TableCell className="text-center">
                    <span className={getStatusStyle(report.status)}>
                      {getStatusIcon(report.status)}
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleView(report)}
                        className="border border-[#2D317F] bg-white text-[#2D317F] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#2D317F] hover:text-white"
                      >
                        <GoLinkExternal size={15} />
                        View
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal*/}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="pt-0 px-0 pb-0 overflow-hidden !max-w-[500px] [&>button]:hidden bg-[#E6EEF6]">
          <div className="bg-[#BB2325] h-8 rounded-t-lg" />
          <div className="px-5 pb-5">
            <DialogHeader className="mb-3 flex flex-col items-center">
              <div className="w-[90px] h-[90px] flex items-center justify-center bg-[#D9D9D9] rounded-full">
                <ClipboardList color={"#BB2325"} size={45}/>
              </div>
              <DialogTitle className="text-[#BB2325] font-extrabold text-center mt-2 mb-2 text-2xl">Reason for Rejection</DialogTitle>
            </DialogHeader>
            <div className="mx-6">
              <Textarea
                className='bg-white !py-24'
                value={rejectionReason}
                readOnly

              /> {/* get the reason later on from admin*/}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowRejectModal(false)}
                className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm w-20 bg-[#D9D9D9] text-[#919191] font-bold"
              >
                Back
              </button>
              <button
                onClick={() => navigate(`/whse/create/`)}
                className="bg-[#BB2325] text-white font-bold px-4 py-1.5 rounded-lg text-sm w-20"
              >
                Edit
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}