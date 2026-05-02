import { useState, useEffect } from "react";
import { GoLinkExternal } from "react-icons/go";
import { TbProgress } from "react-icons/tb";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import Header from '../../components/Header'

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  if (status === "Pending")  return <TbProgress size={15} />;
  if (status === "Approved") return <FaRegCircleCheck size={15} />;
  if (status === "Rejected") return <MdOutlineCancel size={15} />;
  return null;
};

export default function ReportStatus() {
  const [reports, setReports]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type");
  const [selectedReportType, setSelectedReportType] = useState("All Report Type");
  const [selectedStatus, setSelectedStatus]         = useState("All Status");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [wsrRes, wsiRes] = await Promise.all([
          api.get("/reports/wsr-reports/"),
          api.get("/reports/wsi-reports/"),
        ]);

        const wsrMapped = wsrRes.data.map((r) => ({
          id:         r.wsr_report_id,
          reportId:   `R-${String(r.stockbook).padStart(3, "0")}`,
          stockbookId: r.stockbook,
          date:       formatDate(r.stockbook_date ?? r.date),
          reportType: "Statement of Receipts",
          cereal:     r.cereal_type ?? r.CerealType ?? "—",
          status:     r.Evaluation ?? "Pending",
          reason:     r.Reason ?? "",
          date:   formatDate(r.stockbook_date),
          cereal: r.stockbook_cereal ?? "—",
          raw:        r,
        }));

        const wsiMapped = wsiRes.data.map((r) => ({
          id:         r.wsi_report_id,
          reportId:   `R-${String(r.stockbook).padStart(3, "0")}`,
          stockbookId: r.stockbook,
          date:       formatDate(r.stockbook_date ?? r.date),
          reportType: "Statement of Issuance",
          cereal:     r.cereal_type ?? r.CerealType ?? "—",
          status:     r.Evaluation ?? "Pending",
          reason:     r.Reason ?? "",
          date:   formatDate(r.stockbook_date),
          cereal: r.stockbook_cereal ?? "—",
          raw:        r,
        }));

        setReports([...wsrMapped, ...wsiMapped]);
      } catch (err) {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // filters
  const filteredReports = reports.filter((r) => {
    const matchCereal = selectedCerealType === "All Cereal Type" || r.cereal === selectedCerealType;
    const matchReport = selectedReportType === "All Report Type" || r.reportType === selectedReportType;
    const matchStatus = selectedStatus      === "All Status"     || r.status    === selectedStatus;
    return matchCereal && matchReport && matchStatus;
  });

  return (
    <>
      <Header
        pageTitle="Report Status"
        notifTo="/admin/notif"
        unreadCount={5}
        userName="Raph Nigos"
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
            <div className="flex items-center justify-center h-40 text-[#2D317F]">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-40 text-red-500">{error}</div>
          ) : (
            <>
              {/* Fixed header table */}
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[25%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
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
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[25%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
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
                        <tr key={`${report.reportType}-${report.id}-${i}`} className="text-[#2D317F] font-medium border-b border-gray-100 h-[60px]">
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
                            <div className="flex justify-center">
                              <button className="border border-[#2D317F] bg-white text-[#2D317F] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#2D317F] hover:text-white">
                                <GoLinkExternal size={15} /> View
                              </button>
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
    </>
  );
}