// react icon
import { GoLinkExternal } from "react-icons/go";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { TbXboxX } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";

import { useState } from 'react'

// react router
import { useNavigate } from "react-router-dom";

// css
import '../../styles/admin/ReportEvaluation.css'

// shadcn components
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

const sampleReports = [
  { date: "30-Jan-26", cerealtype: 'PD1350', reportType: "Statement of Receipt", whse: "Warehouse 1", status: "Pending"},
  { date: "31-Jan-26", cerealtype: 'WD1G50', reportType: "Statement of Receipt", whse: "Warehouse 2", status: "Approved"},
  { date: "29-Jan-26", cerealtype: 'PD1350', reportType: "Statement of Issue", whse: "Warehouse 1", status: "Pending"},
  { date: "28-Jan-26",  cerealtype: 'WD1G50', reportType: "Statement of Issue", whse: "Warehouse 2", status: "Rejected"},
]

export default function ReportEvaluation() {
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type")
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // selected report
  const [selectedReport, setSelectedReport] = useState(null)

  // approve modal
  const [approveOpen, setApproveOpen] = useState(false)

  // reject dialog + success modal
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectSuccessOpen, setRejectSuccessOpen] = useState(false)

  // handlers
  const handleApprove = (report) => {
    setSelectedReport(report)
    setApproveOpen(true)
  }

  const handleRejectOpen = (report) => {
    setSelectedReport(report)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const handleRejectSubmit = async () => {
    // TODO: connect to backend
    // await api.patch(`/api/reports/${selectedReport.id}/`, { status: 'Rejected', reason: rejectReason })
    setRejectDialogOpen(false)
    setRejectSuccessOpen(true)
  }

  const filterReports = sampleReports.filter(r => {
    const matchSearch =
      r.reportType.toLowerCase().includes(search.toLowerCase()) ||
      r.cerealtype.includes(search) ||
      r.whse.toLowerCase().includes(search.toLowerCase())
    const matchStatus = selectedStatus === "All Status" || r.status === selectedStatus
    const matchCerealType = selectedCerealType === "All Cereal Type" || r.cerealtype === selectedCerealType
    const matchWarehouse = selectedWarehouse === "All Warehouses" || r.whse === selectedWarehouse
    return matchSearch && matchStatus && matchCerealType && matchWarehouse
  });

  const getStatusStyle = (status) => {
    const base = {
      padding: "6px 14px",
      borderRadius: "20px",
      fontWeight: "600",
      fontSize: "13px",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      width: "100px",
      textAlign: 'center',
      justifyContent: "center", 
    }
    if (status === "Pending") return { ...base, backgroundColor: "#F0E48B", color: "#856404", border: "1px solid #FFE08A" }
    if (status === "Approved") return { ...base, backgroundColor: "#8BF093", color: "#155724", border: "1px solid #90EE90" }
    if (status === "Rejected") return { ...base, backgroundColor: "#FF595C", color: "#721C24", border: "1px solid #F5A0A0" }
    return base
  }

  // routes for view
  const reportRoutes = {
    "Statement of Receipt": "/admin/evaluation/receipt",
    "Statement of Issue": "/admin/evaluation/issue",
  }

  return (
    <>
      <div className="bg-white m-7.5 flex flex-col h-full">
        <div className='flex justify-between font-medium w-150 pt-2.5 pl-4 text-[#2D317F]'>
          <div className="flex gap-4">
            <label>Total Reports:</label>
            <p className="m-0 font-bold">{sampleReports.length}</p>
          </div>
          <div className="flex gap-4">
            <label>Pending: </label>
            <p className="pending-report">{sampleReports.filter(r => r.status === "Pending").length}</p>
            <label>Approved: </label>
            <p className="approved-report">{sampleReports.filter(r => r.status === "Approved").length}</p>
            <label>Rejected: </label>
            <p className="rejected-report">{sampleReports.filter(r => r.status === "Rejected").length}</p>
          </div>
        </div>

        <div className="flex justify-between items-center h-auto mt-5 mb-4 mx-4 text-[#2D317F] gap-3 flex-wrap w-[63%]">
          <div className="bg-[#2D317F] rounded-2xl py-1.5 px-5 flex items-center gap-2">
            <Input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search report"
              className="border-0 bg-transparent w-[330px] text-white font-medium text-base placeholder:text-white"
            />
            <FaSearch className="text-white shrink" size={20}/>
          </div>

          <div className="flex gap-2.5 items-center flex-wrap">
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
              <SelectTrigger className="inline-flex items-center justify-between gap-2.5 border-[#999] rounded-lg bg-white py-5 px-3.5 text-[#2D317F] font-semibold text-sm w-35 min-w-0 cursor-pointer ml-0 whitespace-nowrap transition-colors duration-200">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Status">All Status</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Pending">Pending</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Approved">Approved</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCerealType} onValueChange={(v) => setSelectedCerealType(v)}>
              <SelectTrigger className="inline-flex items-center justify-between gap-2.5 border-[#999] rounded-lg bg-white py-5 px-3.5 text-[#2D317F] font-semibold text-sm w-42 min-w-0 cursor-pointer ml-0 whitespace-nowrap transition-colors duration-200">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Cereal Type">All Cereal Type</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="WD1G50">Rice</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="PD1350">Palay</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedWarehouse} onValueChange={(v) => setSelectedWarehouse(v)}>
              <SelectTrigger className="inline-flex items-center justify-between gap-2.5 border-[#999] rounded-lg bg-white py-5 px-3.5 text-[#2D317F] font-semibold text-sm w-45 min-w-0 cursor-pointer ml-0 whitespace-nowrap transition-colors duration-200">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Warehouses">All Warehouses</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Warehouse 1">Warehouse 1</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Warehouse 2">Warehouse 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader className='text-center'>
              <TableRow className='bg-[#E2EBFF]'>
                <TableHead className='text-[#2D317F] font-bold py-3 text-center'>Date</TableHead>
                <TableHead className='text-[#2D317F] font-bold py-3 text-center'>Cereal Type</TableHead>
                <TableHead className='text-[#2D317F] font-bold py-3 text-center'>Report Type</TableHead>
                <TableHead className='text-[#2D317F] font-bold py-3 text-center'>Warehouse</TableHead>
                <TableHead className='text-[#2D317F] font-bold py-3 text-center'>Status</TableHead>
                <TableHead className='text-[#2D317F] font-bold py-3 text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className='text-center'>{report.date}</TableCell>
                  <TableCell className='text-center'>{report.cerealtype}</TableCell>
                  <TableCell className='text-center'>{report.reportType}</TableCell>
                  <TableCell className='text-center'>{report.whse}</TableCell>
                  <TableCell className='text-center'>
                    <span style={getStatusStyle(report.status)}>{report.status}</span>
                  </TableCell>
                  <TableCell className='text-center px-0 !w-100'>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="rounded-xl bg-transparent py-1.5 px-3.5 text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap transition ease-in-out duration-300 view-report-eval "
                        onClick={() => navigate(reportRoutes[report.reportType] ?? "/admin/evaluation")}
                      >
                        <GoLinkExternal size={15}/> View
                      </button>
                      <button
                        className="rounded-xl bg-transparent py-1.5 px-3.5 text-sm inline-flex items-center gap-2 whitespace-nowrap transition ease-in-out duration-300 approve-report-eval disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                        onClick={() => handleApprove(report)}
                        disabled={report.status === "Approved" || report.status === "Rejected"}
                      >
                        <IoMdCheckmarkCircleOutline size={20} color={"green"}/> Approve
                      </button>
                      <button
                        className="rounded-xl bg-transparent py-1.5 px-3.5 text-sm inline-flex items-center gap-2 whitespace-nowrap transition ease-in-out duration-300 reject-report-eval disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                        onClick={() => handleRejectOpen(report)}
                        disabled={report.status === "Approved" || report.status === "Rejected"}
                      >
                        X
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* approve modal */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0'>
          <div className='h-7 bg-[#3E7A43] rounded-t-lg'></div>
          <AlertDialogHeader className='p-5 text-center items-center pb-4'>
            <div className="rounded-full px-5 py-5 bg-[#3E7A43]">
              <FaCheck color={'white'} size={60} />
            </div>
            <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>Success!</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Report <span className="font-bold">{selectedReport?.id}</span> has been approved!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
            <button
              onClick={() => setApproveOpen(false)}
              className='bg-[#3E7A43] text-white px-7 py-2.5 rounded-md text-sm font-medium mb-4 !-mt-8'
            >
              Done
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* reject modal */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className='pt-0 px-0 pb-0 overflow-hidden !max-w-lg bg-[#E6EEF6] [&>button]:hidden'>
          <div className='h-7 bg-[#BB2325]'></div>
          <DialogHeader className='p-5 text-center items-center pb-2'>
            <div className="rounded-full p-5 bg-[#BB2325] w-fit">
              <TbXboxX size={60} color='white' />
            </div>
            <DialogTitle className='font-bold text-[#BB2325] text-2xl mt-2'>Reject Report?</DialogTitle>
            <DialogDescription className='text-sm text-gray-600 px-2'>
              Please give the reason why you've rejected report <span className="font-bold">{selectedReport?.id}</span>:
            </DialogDescription>
          </DialogHeader>
          <div className='px-6 pb-2'>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Type your reason here..."
              className="w-full border bg-white rounded-md p-3 text-sm resize-none h-28 focus:outline-none focus:border-[#BB2325]"
            />
          </div>
          <DialogFooter className='p-10 !-mt-7 flex flex-row gap-3 bg-[#E6EEF6] border-0'>
            <button
              onClick={() => setRejectDialogOpen(false)}
              className='px-6 py-2 rounded-md text-sm font-medium bg-[#D9D9D9] text-[#5B5B5B]'
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
              className='px-6 py-2 rounded-md text-sm font-medium bg-[#BB2325] text-white disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Reject
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* success modal for reject */}
      <AlertDialog open={rejectSuccessOpen} onOpenChange={setRejectSuccessOpen}>
        <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0'>
          <div className='h-7 bg-[#3E7A43] rounded-t-lg'></div>
          <AlertDialogHeader className='p-5 text-center items-center pb-4'>
            <div className="rounded-full px-5 py-5 bg-[#3E7A43]">
              <FaCheck color={'white'} size={60} />
            </div>
            <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>Success!</AlertDialogTitle>
            <AlertDialogDescription className="text-sm px-2">
              Report <span className="font-bold">{selectedReport?.id}</span> has been rejected!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
            <button
              onClick={() => setRejectSuccessOpen(false)}
              className='bg-[#3E7A43] text-white px-7 py-2.5 rounded-md text-sm font-medium mb-4 !-mt-8'
            >
              Done
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}