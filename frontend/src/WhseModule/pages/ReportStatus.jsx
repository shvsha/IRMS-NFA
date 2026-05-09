import { useState, useEffect } from "react";
import { GoLinkExternal } from "react-icons/go";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import Header from '../../components/Header';
import { useNavigate } from "react-router-dom";

// for notif
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getNotifRoute } from "@/utils/getNotifRoute";
import { useUnreadCount } from "@/hooks/useUnreadCount";

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"

// api
import api from "@/api/axios";

const CEREAL_LABEL = { WD1G50: "Palay", PD1350: "Rice" };

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).replace(/ /g, "-");
};

const getStatusStyle = (status) => {
  const base = "px-3 py-1.5 rounded-full font-semibold text-[13px] inline-flex items-center gap-1.5 min-w-[110px] justify-center";
  if (status === "Pending")  return `${base} bg-[#F0E48B] text-[#856404]`;
  if (status === "Approved") return `${base} bg-[#8BF093] text-[#155724]`;
  if (status === "Rejected") return `${base} bg-[#FF595C] text-[#721c24]`;
  return base;
};

const getStatusIcon = (status) => {
  if (status === "Pending") return (
    <div className="w-3 h-3 border-2 border-[#856404] border-t-transparent rounded-full animate-spin flex-shrink-0" />
  );
  if (status === "Approved") return <FaRegCircleCheck size={15} />;
  if (status === "Rejected") return <MdOutlineCancel size={15} />;
  return null;
};

// Route map — matches the routes in ReportEvaluation
const REPORT_ROUTES = {
  "Statement of Receipts": "/whse/status/receipt",
  "Statement of Issuance": "/whse/status/issue",
}

export default function ReportStatus() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const navigate = useNavigate();

  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type");
  const [selectedReportType, setSelectedReportType] = useState("All Report Type");
  const [selectedStatus, setSelectedStatus]         = useState("All Status");

  // Reject reason dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason]         = useState("");
  const [selectedReport, setSelectedReport]     = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [wsrRes, wsiRes] = await Promise.all([
          api.get("/reports/wsr-reports/"),
          api.get("/reports/wsi-reports/"),
        ]);

        const wsrMapped = wsrRes.data
        .filter(r => r.Evaluation !== 'Archive') 
        .map((r) => ({
          id:          r.wsr_report_id,
          _type:       "WSR",
          reportId:    `R-${String(r.stockbook).padStart(3, "0")}`,
          stockbookId: r.stockbook,
          date:        formatDate(r.stockbook_date),
          reportType:  "Statement of Receipts",
          cereal:      r.stockbook_cereal ?? "—",
          status:      r.Evaluation ?? "Pending",
          reason:      r.Reason ?? "",
        }));

        const wsiMapped = wsiRes.data
        .filter(r => r.Evaluation !== 'Archive') 
        .map((r) => ({
          id:          r.wsi_report_id,
          _type:       "WSI",
          reportId:    `R-${String(r.stockbook).padStart(3, "0")}`,
          stockbookId: r.stockbook,
          date:        formatDate(r.stockbook_date),
          reportType:  "Statement of Issuance",
          cereal:      r.stockbook_cereal ?? "—",
          status:      r.Evaluation ?? "Pending",
          reason:      r.Reason ?? "",
        }));

        setReports([...wsrMapped, ...wsiMapped].sort((a, b) => b.id - a.id))
      } catch (err) {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleView = (report) => {
    const route = REPORT_ROUTES[report.reportType];
    if (!route) return;
    navigate(route, {
      state: {
        reportId:    report.id,
        reportType:  report._type,
        stockbookId: report.stockbookId,
        pageTitle:   'Report Status',
      },
    });
  };

  const handleViewReason = (report) => {
    setSelectedReport(report);
    setRejectReason(report.reason || "No reason provided.");
    setRejectDialogOpen(true);
  };

  const handleEditRejected = () => {
    if (!selectedReport) return;
    setRejectDialogOpen(false);
    navigate(`/whse/create/${selectedReport.stockbookId}`, {
      state: {
        mode:         'edit',
        rejectedType: selectedReport._type, // 'WSR' or 'WSI'
      },
    });
  };

  // filters
  const filteredReports = reports.filter((r) => {
    const matchCereal = selectedCerealType === "All Cereal Type" || r.cereal     === selectedCerealType;
    const matchReport = selectedReportType === "All Report Type" || r.reportType === selectedReportType;
    const matchStatus = selectedStatus     === "All Status"      || r.status     === selectedStatus;
    return matchCereal && matchReport && matchStatus;
  });

  return (
    <>
      <Header
        pageTitle="Report Status"
        unreadCount={unreadCount}
        notifTo={notifRoute}
        userName={userName}
      />

      <div className="bg-[#F5F9F9] mx-4 my-4 pb-50 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] border border-black/10 rounded-lg !min-h-[650px]">

        {/* Filters */}
        <div className="flex justify-end gap-3 pt-2 pb-3 mx-3">
          <Select value={selectedCerealType} onValueChange={setSelectedCerealType}>
            <SelectTrigger className="w-40 bg-white border-gray-300 py-5.5 font-semibold text-[#2D317F] rounded-md shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <SelectValue placeholder="All Cereal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="p-2" value="All Cereal Type">All Cereal Type</SelectItem>
              <SelectItem className="p-2" value="WD1G50">Palay</SelectItem>
              <SelectItem className="p-2" value="PD1350">Rice</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-52 bg-white border-gray-300 py-5.5 font-semibold text-[#2D317F] rounded-md shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <SelectValue placeholder="All Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="p-2" value="All Report Type">All Report Type</SelectItem>
              <SelectItem className="p-2" value="Statement of Issuance">Statement of Issuance</SelectItem>
              <SelectItem className="p-2" value="Statement of Receipts">Statement of Receipts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-36 bg-white border-gray-300 py-5.5 font-semibold text-[#2D317F] rounded-md shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="p-2" value="All Status">All Status</SelectItem>
              <SelectItem className="p-2" value="Approved">Approved</SelectItem>
              <SelectItem className="p-2" value="Rejected">Rejected</SelectItem>
              <SelectItem className="p-2" value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <TableRow className='border-0 flex justify-center items-center h-full'>
              <TableCell className="text-center py-16">
                <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                  <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Loading reports...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <div className="flex items-center justify-center h-40 text-gray-400">No reports found.</div>
          ) : (
            <>
              {/* Fixed header */}
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                  <col className="w-[22%]" />
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                  <col className="w-[26%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#E2EBFF] border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Date</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Report ID</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Report Type</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Cereal Type</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Status</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Actions</th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[22%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[26%]" />
                  </colgroup>
                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-[#2D317F] font-medium">
                          No reports found.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report, i) => (
                        <tr
                          key={`${report.reportType}-${report.id}-${i}`}
                          className="text-[#2D317F] font-medium border-b border-gray-100 h-[60px]"
                        >
                          <td className="text-center">{report.date}</td>
                          <td className="text-center">{report.reportId}</td>
                          <td className="text-center">{report.reportType}</td>
                          <td className="text-center">{CEREAL_LABEL[report.cereal] || report.cereal}</td>
                          <td className="text-center">
                            <span className={getStatusStyle(report.status)}>
                              {getStatusIcon(report.status)}
                              {report.status}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center items-center gap-2">

                              {/* View button */}
                              <button
                                onClick={() => handleView(report)}
                                className="border border-[#2D317F] bg-white text-[#2D317F] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#2D317F] hover:text-white"
                              >
                                <GoLinkExternal size={15} /> View
                              </button>

                              {/* Reject reason button — only shown when Rejected */}
                              {report.status === "Rejected" && (
                                <button
                                  onClick={() => handleViewReason(report)}
                                  className="border border-[#FF595C] text-[#FF595C] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#BB2325] hover:text-white"
                                >
                                  <MdOutlineCancel size={15} /> Reject Reason
                                </button>
                              )}

                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="pt-0 px-0 pb-0 overflow-hidden max-w-[90vw] sm:max-w-[460px] bg-[#E6EEF6] [&>button]:hidden">
          <div className="h-7 bg-[#BB2325]" />
          <DialogHeader className="p-5 text-center items-center pb-2">
            <div className="rounded-full p-4 bg-[#BB2325] w-fit">
              <MdOutlineCancel size={48} color="white" />
            </div>
            <DialogTitle className="font-bold text-[#BB2325] text-xl mt-2">
              Rejection Reason
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 px-2 mt-1">
              This report was rejected for the following reason:
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-2">
            <div className="w-full border bg-white rounded-md p-3 text-sm min-h-[80px] text-[#333]">
              {rejectReason}
            </div>
          </div>
          <div className="px-6 pb-6 pt-3 flex justify-end gap-3">
            <button
              onClick={() => setRejectDialogOpen(false)}
              className="px-6 py-2 rounded-md text-sm font-medium bg-[#D9D9D9] text-[#5B5B5B] hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleEditRejected}
              className="px-6 py-2 rounded-md text-sm font-medium bg-[#BB2325] text-white hover:bg-red-800 transition-colors"
            >
              Edit Report
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}