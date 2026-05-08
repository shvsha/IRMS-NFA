// icons
import { GoLinkExternal } from "react-icons/go";
import { FiEdit, FiRotateCcw } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { TbFileSearch } from "react-icons/tb";
import { FaRegCircleCheck } from "react-icons/fa6";
import { CiImport } from "react-icons/ci";
import { FaSearch, FaBars } from "react-icons/fa";

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";

// react
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from '../../components/Header'

// api
import api from "@/api/axios";

const getStatusStyle = (status) => {
  const base = "px-3 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 w-30 pl-4";
  if (status === "In Progress")  return `${base} bg-[#F0E48B] text-[#856404]`;
  if (status === "Completed")    return `${base} bg-[#8BF093] text-[#3E7A43]`;
  if (status === "Under Review") return `${base} bg-[#D6E4FF] text-[#1D3A8A] text-[10px]`;
  return base;
};

const getStatusIcon = (status) => {
  if (status === "In Progress")  return (
    <div className="w-3 h-3 border-2 border-[#856404] border-t-transparent rounded-full animate-spin flex-shrink-0" />
  );
  if (status === "Completed")    return <FaRegCircleCheck size={16} />;
  if (status === "Under Review") return <TbFileSearch size={16} />;
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).replace(/ /g, "-");
};

const CEREAL_LABEL = { WD1G50: "Palay", PD1350: "Rice" };

export default function StockBook() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchStocks();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchStocks();
    });
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const [stockReports, setStockReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCereal, setSelectedCereal] = useState("All Cereal Type");
  const [selectedType, setSelectedType] = useState("");

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [unsubmitting, setUnsubmitting] = useState(null);

  const [search, setSearch] = useState("");

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/stocks/");
      setStockReports(res.data);
    } catch (err) {
      setError("Failed to load stock books.");
    } finally {
      setLoading(false);
    }
  };

  // filter
  const filteredReports = stockReports
    .filter(r => selectedCereal === "All Cereal Type" || r.CerealType === selectedCereal)
    .filter(r => {
      const term = search.toLowerCase();
      return (
        String(r.report_id).includes(term) ||
        (r.CerealType || '').toLowerCase().includes(term) ||
        (r.Date || '').includes(term)
      );
    });

  // add report
  const handleAddReportClick = () => {
    setSelectedType("");
    setSelectedYear("");
    setSelectedMonth("");
    setAddDialogOpen(true);
  };

  const getDaysInMonth = (year, month) => {
    if (!month) return 31;
    return new Date(year || 2024, Number(month), 0).getDate();
  };

  // cereal modal next → create directly
  const handleCerealNext = async () => {
    if (!selectedType) { alert("Please select a cereal type"); return; }
    if (!selectedYear || !selectedMonth || !selectedDay) {
      alert("Please fill in all date fields (year, month, and day)");
      return;
    }

    const yearNum = parseInt(selectedYear);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        alert("Please enter a valid year (e.g. 2026)");
        return;
      }

    try {
      setSubmitting(true);
      const month = String(selectedMonth).padStart(2, "0");
      const day = String(selectedDay).padStart(2, "0");
      const date = `${selectedYear}-${month}-${day}`;
      const res = await api.post("/reports/stocks/create/", {
        CerealType: selectedType,
        Date: date,
      });
      const newStock = res.data;
      await fetchStocks();
      setAddDialogOpen(false);
      navigate(`/whse/create/${newStock.report_id}`, {
        state: { stockBook: newStock, mode: "create" },
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create stock book.");
    } finally {
      setSubmitting(false);
    }
  };

  // edit button
  const handleEditClick = (stock) => {
    navigate(`/whse/create/${stock.report_id}`, {
      state: { stockBook: stock, mode: "edit" },
    });
  };

  // unsubmit button
  const handleUnsubmit = async (stock) => {
    try {
      setUnsubmitting(stock.report_id);
      await api.post(`/reports/stocks/unsubmit/${stock.report_id}/`);
      await fetchStocks();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to unsubmit.");
    } finally {
      setUnsubmitting(null);
    }
  };

  const handleViewReport = (stock) => {
    navigate(`/whse/view/${stock.report_id}`, { state: { stockBook: stock } });
  };

  return (
    <>
      <Header
        pageTitle="Stock Book"
        notifTo="/admin/notif"
        unreadCount={5}
        userName="Raph Nigos"
      />

      <div className="bg-[#F5F9F9] mx-4 my-4 pb-50 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] border border-black/10 rounded-lg !min-h-[653px]">

        {/* Top controls */}
        <div className="flex justify-between items-center mb-4 pt-2 mx-3">
          {/* search */}
          <div className='mt-4'>
            <div className="bg-white border border-[#2D317F] rounded-full py-1 px-5 flex items-center gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <FaBars color={'#2D317F'} size={18} className="shrink-0" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Report"
                  className="bg-transparent border-0 placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
                />
              <FaSearch className="text-[#2D317F] shrink" size={20}/>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-3.5">
            <Select value={selectedCereal} onValueChange={setSelectedCereal}>
              <SelectTrigger className="w-40 bg-white border-gray-300 py-5.5 font-semibold text-[#2D317F] rounded-md shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]">
                <SelectValue placeholder="All Cereal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="p-2" value="All Cereal Type">All Cereal Type</SelectItem>
                <SelectItem className="p-2" value="WD1G50">Palay</SelectItem>
                <SelectItem className="p-2" value="PD1350">Rice</SelectItem>
              </SelectContent>
            </Select>

            <button className="bg-[#1D8104] px-5 py-3 rounded-md text-white shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)] font-semibold">
              <div className="flex gap-2 items-center">
                <CiImport size={20} />
                <p className="text-sm">Import</p>
              </div>
            </button>

            <Button
              onClick={handleAddReportClick}
              className="bg-[#2D317F] text-white rounded-md py-5.5 w-35 font-semibold hover:bg-[#1f2360] shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]"
            >
              + Add Report
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col h-90">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-[#2D317F]">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-40 text-red-500">{error}</div>
          ) : (
            <>
              {/* header */}
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[15%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#E2EBFF] border-b border-gray-200 h-12 ">
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Date</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Stock Book ID</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Cereal Type</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Status</th>
                    <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Action</th>
                  </tr>
                </thead>
              </table>

              {/* table body */}
              <div className="">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-400 py-10">
                          No stock books found.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((r) => (
                        <tr key={r.report_id} className="border-b border-gray-100">
                          <td className="text-center text-[#2D317F] py-3 text-sm">{formatDate(r.Date)}</td>
                          <td className="text-center text-[#2D317F] py-3 text-sm">R-{String(r.report_id).padStart(3, "0")}</td>
                          <td className="text-center text-[#2D317F] py-3 text-sm">{CEREAL_LABEL[r.CerealType] || r.CerealType}</td>
                          <td className="text-center py-3">
                            <span className={getStatusStyle(r.Status)}>
                              {getStatusIcon(r.Status)}
                              {r.Status}
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleViewReport(r)}
                                className="flex items-center gap-1.5 border border-gray-300 rounded-full px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300"
                              >
                                <GoLinkExternal size={14} /> View
                              </button>
                              <button
                                disabled={r.Status === "Completed" || r.Status === "Under Review"}
                                onClick={() => handleEditClick(r)}
                                className="flex items-center gap-1.5 border border-gray-300 rounded-full px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-400"
                              >
                                <FiEdit size={14} /> Edit
                              </button>
                              {r.Status === "Under Review" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                 <button
                                  disabled={unsubmitting === r.report_id}
                                  className="flex items-center border border-[#BB2325] text-[#BB2325] text-sm rounded-full px-2 py-1.5 bg-white hover:bg-[#BB2325] hover:text-white transition-colors duration-500 disabled:opacity-50"
                                >
                                  <IoClose size={18} />
                                  Unsubmit
                                </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none">
                                  <div className="h-7 bg-[#BB2325] rounded-t-lg" />
                                  <AlertDialogHeader className="p-5 text-center items-center pb-4">
                                    <div className="rounded-full px-5 py-5 bg-[#BB2325]">
                                      <FiRotateCcw color="white" size={55} />
                                    </div>
                                    <AlertDialogTitle className="!font-bold text-[#BB2325] text-2xl mx-2">
                                      Unsubmit Stockbook?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm px-2">
                                      Are you sure you want to unsubmit your stock book?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0">
                                    <AlertDialogCancel className="w-23 px-5 py-4.5">Stay</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="w-23 !bg-[#BB2325] text-white hover:bg-[#981416] px-10 py-4.5"
                                      onClick={() => handleUnsubmit(r)}
                                    >
                                      Yes
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

        {/* Add Report modal */}
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) {
            setSelectedType("");
            setSelectedYear("");
            setSelectedMonth("");
            setSelectedDay("");
          }
        }}>
          <DialogContent className="pt-0 px-0 pb-0 overflow-hidden max-w-[90vw] sm:max-w-[500px] xl:max-w-[315px] [&>button]:hidden bg-[#DDE4F3]">
            <div className="bg-[#2D317F] h-8 rounded-t-lg" />
            <div className="px-5 pb-5">
              <DialogHeader className="mb-3">
                <DialogTitle className="text-[#2D317F] font-bold py-2">Cereal Type</DialogTitle>
              </DialogHeader>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full bg-white border-[#2D317F] text-[#2D317F] font-semibold py-5">
                  <SelectValue placeholder="Select cereal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="p-2" value="WD1G50">Palay</SelectItem>
                  <SelectItem className="p-2" value="PD1350">Rice</SelectItem>
                </SelectContent>
              </Select>

              {/* date */}
              <div className="flex gap-3 mt-3">

                {/* year */}
                <div className="flex-1">
                  <label className="text-sm font-semibold text-[#2D317F]">Year</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="2026"
                    value={selectedYear}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setSelectedYear(val);
                    }}
                    className="bg-white border-[#2D317F] text-[#2D317F] mt-1"
                  />
                </div>

                {/* month */}
                <div className="flex-1">
                  <label className="text-sm font-semibold text-[#2D317F]">Month</label>
                  <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val)}>
                    <SelectTrigger className="w-full bg-white border-[#2D317F] text-[#2D317F] font-semibold mt-1">
                      <SelectValue placeholder="May" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="p-2" value="1">January</SelectItem>
                      <SelectItem className="p-2" value="2">February</SelectItem>
                      <SelectItem className="p-2" value="3">March</SelectItem>
                      <SelectItem className="p-2" value="4">April</SelectItem>
                      <SelectItem className="p-2" value="5">May</SelectItem>
                      <SelectItem className="p-2" value="6">June</SelectItem>
                      <SelectItem className="p-2" value="7">July</SelectItem>
                      <SelectItem className="p-2" value="8">August</SelectItem>
                      <SelectItem className="p-2" value="9">September</SelectItem>
                      <SelectItem className="p-2" value="10">October</SelectItem>
                      <SelectItem className="p-2" value="11">November</SelectItem>
                      <SelectItem className="p-2" value="12">December</SelectItem>
                    </SelectContent>
                  </Select> 
                </div>

                {/* day */}
                <div className="w-20">
                  <label className="text-sm font-semibold text-[#2D317F]">Day</label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-full bg-white border-[#2D317F] text-[#2D317F] font-semibold mt-1">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: getDaysInMonth(selectedYear, selectedMonth) },
                        (_, i) => i + 1
                      ).map((d) => (
                        <SelectItem key={d} className="p-2" value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setAddDialogOpen(false)}
                  className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm text-[#919191] bg-[#D9D9D9]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCerealNext}
                  disabled={!selectedType || submitting}
                  className="bg-[#2D317F] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#1f2360] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}