// icons
import { GoLinkExternal } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { TbProgress, TbFileSearch } from "react-icons/tb";
import { FaRegCircleCheck } from "react-icons/fa6";
import { CiImport } from "react-icons/ci";
import { LuPenLine } from "react-icons/lu"
import { RiPenNibFill } from "react-icons/ri";

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// react
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const stockReports = [
  { cereal: "PD1350", id: "R-001", date: "30-Jan-26", status: "In Progress" },
  { cereal: "WD1G50", id: "R-002", date: "30-Jan-26", status: "Completed" },
  { cereal: "PD1350", id: "R-003", date: "30-Jan-26", status: "Under Review" },
];

const getStatusStyle = (status) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 w-28 pl-4";
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

export default function StockBook() {
  const navigate = useNavigate();

  const [selectedCereal, setSelectedCereal] = useState("All Cereal Type");
  const [selectedType, setSelectedType] = useState("");

  const [signatory, setSignatory] = useState({
    abm: "Marcelina A. Domingo",
    accountant: "Lovelyn M. Picardal",
    bm: "Celerina T. Capones",
  })

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [signatoryDialogOpen, setSignatoryDialogOpen] = useState(false);
  const [flow, setFlow] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(true)

  const filteredReports = selectedCereal === "All Cereal Type"
    ? stockReports
    : stockReports.filter((r) => r.cereal === selectedCereal);

  const handleAddReportClick = () => {
    setSelectedType("");
    setFlow(isFirstTime ? "first-time" : "not-first-time");
    setAddDialogOpen(true);
  };

  const handleSignatoryClick = () => {
    setFlow("signatory-only");
    setSignatoryDialogOpen(true);
  };

  const handleCerealNext = () => {
    if (!selectedType) { alert("Please select a cereal type"); return; }
    if (flow === "first-time") {
      setAddDialogOpen(false);
      setSignatoryDialogOpen(true);
    } else {
      setAddDialogOpen(false);
      navigate(`/whse/create/${selectedType}`);
    }
  };

  const handleSignatorySubmit = () => {
    if (flow === "first-time") {
      setSignatoryDialogOpen(false);
      navigate(`/whse/create/${selectedType}`);
    } else {
      setSignatoryDialogOpen(false);
    }
  };

  const handleViewReport = (record) => {
    navigate(`/whse/view/${record.id}`, { state: { stockBook: record } });
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
              <SelectItem className='p-2' value="All Cereal Type">All Cereal Type</SelectItem>
              <SelectItem className='p-2' value="WD1G50">Palay</SelectItem>
              <SelectItem className='p-2' value="PD1350">Rice</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSignatoryClick}
            className="bg-[#2D317F] text-white rounded-xl px-5 py-5.5 w-35 font-semibold hover:bg-[#1f2360]"
          >
          <RiPenNibFill/> Signatory
          </Button>
          <Button
            onClick={handleAddReportClick}
            className="bg-[#2D317F] text-white rounded-xl px-5 py-5.5 w-35 font-semibold hover:bg-[#1f2360]"
          >
            + Add Report
          </Button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#E2EBFF] text-[#2D317F] font-medium border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
              <TableHead className="text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base">Date</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base">Stock Book ID</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base">Cereal Type</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base">Status</TableHead>
              <TableHead className="text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-center text-[#2D317F]">{r.date}</TableCell>
                <TableCell className="text-center text-[#2D317F]">{r.id}</TableCell>
                <TableCell className="text-center text-[#2D317F]">{r.cereal}</TableCell>
                <TableCell className="text-center">
                  <span className={getStatusStyle(r.status)}>
                    {getStatusIcon(r.status)}
                    {r.status}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleViewReport(r)}
                      className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300"
                    >
                      <GoLinkExternal size={14} /> View
                    </button>
                    <button
                      disabled={r.status === "Completed"}
                      className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-400"
                    >
                      <FiEdit size={14} /> Edit
                    </button>
                    {r.status !== "In Progress" && (
                      <button className="flex items-center border border-red-500 text-red-500 rounded px-2 py-1.5 bg-white hover:bg-red-500 hover:text-white transition-colors duration-500">
                        <IoClose size={18} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* add modal */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        if (!open) setSelectedType("");
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
                <SelectItem className='p-2' value="Palay">Palay</SelectItem>
                <SelectItem className='p-2' value="Rice">Rice</SelectItem>
              </SelectContent>
            </Select>
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
                {flow === "first-time" ? "Next" : "Create"}
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
                <LuPenLine color={"#2D317F"} size={45}/>
              </div>
              <DialogTitle className="text-[#2D317F] font-extrabold text-center mt-2 mb-2 text-2xl">Signatory Details</DialogTitle>
            </DialogHeader>
            <div className="bg-white p-4 m-4 rounded">
              <FieldSet>
                <FieldGroup className='text-[#2D317F]'>
                  <Field>
                    <FieldLabel className='font-bold' htmlFor="abm">Assistant Branch Manager</FieldLabel>
                    <Input id="abm" autoComplete="off" placeholder="Assistant Branch Manager..."
                      value={signatory.abm}
                      onChange={(e) => setSignatory(prev => ({ ...prev, abm: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className='font-bold' htmlFor="accountant">Accountant II</FieldLabel>
                    <Input id="accountant" autoComplete="off" placeholder="Accountant II..."
                      value={signatory.accountant}
                      onChange={(e) => setSignatory(prev => ({ ...prev, accountant: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className='font-bold' htmlFor="bm">Branch Manager</FieldLabel>
                    <Input id="bm" autoComplete="off" placeholder="Branch Manager..."
                      value={signatory.bm}
                      onChange={(e) => setSignatory(prev => ({ ...prev, bm: e.target.value }))}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setSignatoryDialogOpen(false)}
                className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSignatorySubmit}
                className="bg-[#2D317F] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#1f2360]"
              >
                {flow === "signatory-only" ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}