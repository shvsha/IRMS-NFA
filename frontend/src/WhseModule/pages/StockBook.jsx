// icons
import { GoLinkExternal } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { TbProgress, TbFileSearch } from "react-icons/tb";
import { FaRegCircleCheck } from "react-icons/fa6";
import { CiImport } from "react-icons/ci";
import { LuPenLine } from "react-icons/lu";
import { RiPenNibFill } from "react-icons/ri";

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// react
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// api
import api from "@/api/axios";

const getStatusStyle = (status) => {
  const base = "px-3 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 w-30 pl-4";
  if (status === "In Progress")  return `${base} bg-[#FFF3CD] text-[#856404]`;
  if (status === "Completed")    return `${base} bg-[#D4EDDA] text-[#155724]`;
  if (status === "Under Review") return `${base} bg-[#D6E4FF] text-[#1D3A8A]`;
  return base;
};

const getStatusIcon = (status) => {
  if (status === "In Progress")  return <TbProgress size={16} />;
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

const EMPTY_SIGNATORY = { abm: "", accountant: "", bm: "" };

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

  // us
  const [stockReports, setStockReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCereal, setSelectedCereal] = useState("All Cereal Type");
  const [selectedType, setSelectedType] = useState("");

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [signatory, setSignatory] = useState(EMPTY_SIGNATORY);
  const [editingStock, setEditingStock] = useState(null); 

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [signatoryDialogOpen, setSignatoryDialogOpen] = useState(false);
  const [flow, setFlow] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [unsubmitting, setUnsubmitting] = useState(null); 

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

  // get the last signatory details from the previous stock book
  const lastSignatory = () => {
    if (!stockReports.length) return EMPTY_SIGNATORY;
    const sorted = [...stockReports].sort((a, b) => b.report_id - a.report_id);
    const last = sorted[0];
    return {
      abm: last.Assist_BM  || "",
      accountant: last.Account_II || "",
      bm: last.Branch_M   || "",
    };
  };

  // filter
  const filteredReports = selectedCereal === "All Cereal Type"
    ? stockReports
    : stockReports.filter((r) => {
        return r.CerealType === selectedCereal;
      });

  // add report
  const handleAddReportClick = () => {
    setSelectedType("");
    setEditingStock(null);
    const hasExisting = stockReports.length > 0;
    setFlow(hasExisting ? "not-first-time" : "first-time");
    setAddDialogOpen(true);
  };

  // signatory button
  const handleSignatoryClick = () => {
    setFlow("signatory-only");
    setSignatory(lastSignatory());
    setSignatoryDialogOpen(true);
  };

  // edit button
  const handleEditClick = (stock) => {
    setEditingStock(stock);
    setFlow("edit");
    setSignatory({
      abm:        stock.Assist_BM  || "",
      accountant: stock.Account_II || "",
      bm:         stock.Branch_M   || "",
    });
    setSignatoryDialogOpen(true);
  };

  // cereal modal
  const handleCerealNext = () => {
    if (!selectedType) { alert("Please select a cereal type"); return; }
    if (!selectedYear || !selectedMonth) { alert("Please enter year and month"); return; }
    if (flow === "first-time") {
      setAddDialogOpen(false);
      setSignatory(EMPTY_SIGNATORY);
      setSignatoryDialogOpen(true);
    } else {
      setAddDialogOpen(false);
      setSignatory(lastSignatory());
      setSignatoryDialogOpen(true);
    }
  };

  // signatory modal submit
  const handleSignatorySubmit = async () => {
    if (flow === "signatory-only") {
      setSignatoryDialogOpen(false);
      return;
    }

    if (flow === "edit" && editingStock) {
      try {
        setSubmitting(true);
        await api.put(`/reports/stocks/upd/${editingStock.report_id}`, {
          Assist_BM:  signatory.abm,
          Account_II: signatory.accountant,
          Branch_M:   signatory.bm,
        });
        await fetchStocks();
        setSignatoryDialogOpen(false);
        navigate(`/whse/edit/${editingStock.report_id}`, {
          state: { stockBook: { ...editingStock, Assist_BM: signatory.abm, Account_II: signatory.accountant, Branch_M: signatory.bm }, mode: "edit" },
        });
      } catch (err) {
        alert(err.response?.data?.error || "Failed to update signatory.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // create flow — first-time or not-first-time
    try {
      setSubmitting(true);
      const month = String(selectedMonth).padStart(2, "0");
      const date = `${selectedYear}-${month}-01`;
      const res = await api.post("/reports/stocks/create/", {
        CerealType:  selectedType,
        Assist_BM:   signatory.abm,
        Account_II:  signatory.accountant,
        Branch_M:    signatory.bm,
        Date:        date,
      });
      const newStock = res.data;
      await fetchStocks();
      setSignatoryDialogOpen(false);
      navigate(`/whse/create/${newStock.report_id}`, {
        state: { stockBook: newStock, mode: "create" },
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create stock book.");
    } finally {
      setSubmitting(false);
    }
  };

  // unsubmitting button
  const handleUnsubmit = async (stock) => {
    if (!window.confirm(`Unsubmit Report #${stock.report_id}? It will go back to In Progress.`)) return;
    try {
      setUnsubmitting(stock.report_id);
      await api.post(`/reports/stocks/unsubmit/${stock.report_id}`);
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
    <div className="m-7.5 flex flex-col h-[calc(100vh-160px)]">

      {/* Top controls */}
      <div className="flex justify-between items-center mb-4 pt-2">
        <button className="bg-[#1D8104] p-2 rounded text-white">
          <CiImport size={20} />
        </button>

        <div className="flex items-center gap-6">
          <Select value={selectedCereal} onValueChange={setSelectedCereal}>
            <SelectTrigger className="w-44 bg-white border-gray-300 py-5.5 font-semibold text-[#2D317F]">
              <SelectValue placeholder="All Cereal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="p-2" value="All Cereal Type">All Cereal Type</SelectItem>
              <SelectItem className="p-2" value="WD1G50">Palay</SelectItem>
              <SelectItem className="p-2" value="PD1350">Rice</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSignatoryClick}
            className="bg-[#2D317F] text-white rounded-xl px-5 py-5.5 w-35 font-semibold hover:bg-[#1f2360]"
          >
            <RiPenNibFill /> Signatory
          </Button>
          <Button
            onClick={handleAddReportClick}
            className="bg-[#2D317F] text-white rounded-xl px-5 py-5.5 w-35 font-semibold hover:bg-[#1f2360]"
          >
            + Add Report
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white flex-1 overflow-hidden flex flex-col">
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
                <tr className="bg-[#E2EBFF] border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
                  <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Date</th>
                  <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Stock Book ID</th>
                  <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Cereal Type</th>
                  <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Status</th>
                  <th className="text-[#2D317F] font-bold text-center text-sm xl:text-base">Action</th>
                </tr>
              </thead>
            </table>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1">
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
                              className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300"
                            >
                              <GoLinkExternal size={14} /> View
                            </button>
                            <button
                              disabled={r.Status === "Completed"}
                              onClick={() => handleEditClick(r)}
                              className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-400"
                            >
                              <FiEdit size={14} /> Edit
                            </button>
                            {r.Status === "Under Review" && (
                              <button
                                onClick={() => handleUnsubmit(r)}
                                disabled={unsubmitting === r.report_id}
                                className="flex items-center border border-red-500 text-red-500 rounded px-2 py-1.5 bg-white hover:bg-red-500 hover:text-white transition-colors duration-500 disabled:opacity-50"
                              >
                                <IoClose size={18} />
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

      {/* Add Report modal — cereal type selection */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        if (!open) {
          setSelectedType("");
          setSelectedYear("");
          setSelectedMonth("");
        }
      }}>
        <DialogContent className="pt-0 px-0 pb-0 overflow-hidden max-w-[90vw] sm:max-w-[500px] xl:max-w-[340px] [&>button]:hidden bg-[#DDE4F3]">
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
            {/* year and month */}
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <label className="text-sm font-semibold text-[#2D317F]">Year</label>
                <Input
                  type="number"
                  placeholder="e.g. 2026"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-white border-[#2D317F] text-[#2D317F] mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-[#2D317F]">Month</label>
                <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val)}>
                  <SelectTrigger className="w-full bg-white border-[#2D317F] text-[#2D317F] font-semibold mt-1">
                    <SelectValue placeholder="Select month" />
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
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => { setAddDialogOpen(false); setSelectedType(""); }}
                className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm text-[#919191] bg-[#D9D9D9]"
              >
                Cancel
              </button>
              <button
                onClick={handleCerealNext}
                disabled={!selectedType}
                className="bg-[#2D317F] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#1f2360] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* signatory modal */}
      <Dialog open={signatoryDialogOpen} onOpenChange={setSignatoryDialogOpen}>
        <DialogContent className="pt-0 px-0 pb-0 overflow-hidden !max-w-[500px] [&>button]:hidden bg-[#E6EEF6]">
          <div className="bg-[#2D317F] h-8 rounded-t-lg" />
          <div className="px-5 pb-5">
            <DialogHeader className="mb-3 flex flex-col items-center">
              <div className="w-[90px] h-[90px] flex items-center justify-center bg-[#ADCEFF] rounded-full">
                <LuPenLine color={"#2D317F"} size={45} />
              </div>
              <DialogTitle className="text-[#2D317F] font-extrabold text-center mt-2 mb-2 text-2xl">
                Signatory Details
              </DialogTitle>
            </DialogHeader>
            <div className="bg-white p-4 m-4 rounded">
              <FieldSet>
                <FieldGroup className="text-[#2D317F]">
                  <Field>
                    <FieldLabel className="font-bold" htmlFor="abm">Assistant Branch Manager</FieldLabel>
                    <Input
                      id="abm"
                      autoComplete="off"
                      placeholder="Assistant Branch Manager..."
                      value={signatory.abm}
                      onChange={(e) => setSignatory((prev) => ({ ...prev, abm: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="font-bold" htmlFor="accountant">Accountant II</FieldLabel>
                    <Input
                      id="accountant"
                      autoComplete="off"
                      placeholder="Accountant II..."
                      value={signatory.accountant}
                      onChange={(e) => setSignatory((prev) => ({ ...prev, accountant: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="font-bold" htmlFor="bm">Branch Manager</FieldLabel>
                    <Input
                      id="bm"
                      autoComplete="off"
                      placeholder="Branch Manager..."
                      value={signatory.bm}
                      onChange={(e) => setSignatory((prev) => ({ ...prev, bm: e.target.value }))}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setSignatoryDialogOpen(false)}
                className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm text-[#919191] bg-[#D9D9D9]"
              >
                Cancel
              </button>
              <button
                onClick={handleSignatorySubmit}
                disabled={submitting}
                className="bg-[#2D317F] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#1f2360] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Saving..."
                  : flow === "signatory-only"
                  ? "Save"
                  : flow === "edit"
                  ? "Save & Edit"
                  : "Create"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}