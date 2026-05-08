// react icon
import { GoLinkExternal } from "react-icons/go";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { TbXboxX } from "react-icons/tb";
import { FaSearch, FaBars } from "react-icons/fa";

import { useState, useEffect } from 'react'
import Header from '../../components/Header'

// react router
import { useNavigate } from "react-router-dom";
import { createPortal } from 'react-dom'

// shadcn components
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// api
import api from "@/api/axios";

// ─── helpers ─────────────────────────────────────────────────────────────────

// Normalize WSRReport → display row
const mapWSR = (r) => ({
  _type:      'WSR',
  _id:        r.wsr_report_id,
  date:       r.stockbook_date   ?? '—',
  cerealType: r.stockbook_cereal ?? '—',
  reportType: 'Statement of Receipt',
  whse:       r.transactions?.[0]?.user_WHCode ?? '—',
  status:     r.Evaluation       ?? 'Pending',
  reason:     r.Reason           ?? '',
  stockbookId: r.stockbook,
  currentStage: r.current_stage,
});

// Normalize WSIReport → display row
const mapWSI = (r) => ({
  _type:      'WSI',
  _id:        r.wsi_report_id,
  date:       r.stockbook_date   ?? '—',
  cerealType: r.stockbook_cereal ?? '—',
  reportType: 'Statement of Issue',
  whse:       r.transactions?.[0]?.user_WHCode ?? '—',
  status:     r.Evaluation       ?? 'Pending',
  reason:     r.Reason           ?? '',
  stockbookId: r.stockbook,
  currentStage: r.current_stage,
});

// Route to view detail page
const getBasePath = () => {
  if (window.location.pathname.startsWith('/signa')) return '/signa';
  if (window.location.pathname.startsWith('/whse')) return '/whse';
  return '/admin';
};

const getReportRoutes = (basePath) => ({
  'Statement of Receipt': `${basePath}/evaluation/receipt`,
  'Statement of Issue':   `${basePath}/evaluation/issue`,
});

const getSignatoryStage = (user) => {
  if (user?.user_level !== 'Signatory') return null;
  if (user.signatory_role === 'Asst. Branch Manager') return 'asst_bm';
  if (user.signatory_role === 'Accountant 3') return 'accountant';
  if (user.signatory_role === 'Branch Manager') return 'branch_m';
  return null;
};

// component

export default function ReportEvaluation() {
  const navigate = useNavigate();
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();
  const basePath = getBasePath();
  const reportRoutes = getReportRoutes(basePath);

  // state
  const [reports,             setReports]             = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [selectedStatus,      setSelectedStatus]      = useState('All Status');
  const [selectedCerealType,  setSelectedCerealType]  = useState('All Cereal Type');
  const [selectedWarehouse,   setSelectedWarehouse]   = useState('All Warehouses');
  const [search,              setSearch]              = useState('');
  const [openDropdown,        setOpenDropdown]        = useState(null);
  const [dropdownPos,         setDropdownPos]         = useState({ top: 0, left: 0 });
  const [toasts,              setToasts]              = useState([]);
  const [selectedReport,      setSelectedReport]      = useState(null);
  const [approveOpen,         setApproveOpen]         = useState(false);
  const [approving,           setApproving]           = useState(false);
  const [rejectDialogOpen,    setRejectDialogOpen]    = useState(false);
  const [rejectReason,        setRejectReason]        = useState('');
  const [rejecting,           setRejecting]           = useState(false);

  // fetch both report lists on mount 
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [wsrRes, wsiRes] = await Promise.all([
        api.get('/reports/wsr-reports/'),
        api.get('/reports/wsi-reports/'),
      ]);
      let combined = [
        ...wsrRes.data.map(mapWSR),
        ...wsiRes.data.map(mapWSI),
      ];

      const userStage = getSignatoryStage(currentUser);
      if (currentUser?.user_level === 'Admin') {
        combined = combined.filter((report) => report.currentStage === 'admin');
      } else if (userStage) {
        combined = combined.filter((report) => report.currentStage === userStage);
      }

      // Sort newest id first
      combined.sort((a, b) => b._id - a._id);
      setReports(combined);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      addToast('Failed to load reports. Please refresh.', '#BB2325');
    } finally {
      setLoading(false);
    }
  };

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // toast
  const addToast = (message, color) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // optimistically update a single row's status in state
  const updateReportStatus = (type, id, newStatus, newReason = '') => {
    setReports(prev => prev.map(r =>
      r._type === type && r._id === id
        ? { ...r, status: newStatus, reason: newReason }
        : r
    ));
  };

  // approve
  const handleApprove = (report) => {
    setSelectedReport(report);
    setApproveOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedReport) return;
    setApproving(true);
    try {
      const endpoint = selectedReport._type === 'WSR'
        ? `/reports/wsr-reports/upd/${selectedReport._id}/`
        : `/reports/wsi-reports/upd/${selectedReport._id}/`;

      await api.put(endpoint, { Evaluation: 'Approved', Reason: null });

      updateReportStatus(selectedReport._type, selectedReport._id, 'Approved', '');
      await fetchReports();
      setApproveOpen(false);
      addToast('Report has been approved!', '#3E7A43');
    } catch (err) {
      console.error('Approve failed:', err.response?.data || err);
      const msg = err.response?.data?.error ?? 'Failed to approve report.';
      addToast(msg, '#BB2325');
    } finally {
      setApproving(false);
    }
  };

  // reject
  const handleRejectOpen = (report) => {
    setSelectedReport(report);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedReport || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      const endpoint = selectedReport._type === 'WSR'
        ? `/reports/wsr-reports/upd/${selectedReport._id}/`
        : `/reports/wsi-reports/upd/${selectedReport._id}/`;

      await api.put(endpoint, { Evaluation: 'Rejected', Reason: rejectReason.trim() });

      updateReportStatus(selectedReport._type, selectedReport._id, 'Rejected', rejectReason.trim());
      await fetchReports();
      setRejectDialogOpen(false);
      setRejectReason('');
      addToast('Report has been rejected.', '#BB2325');
    } catch (err) {
      console.error('Reject failed:', err.response?.data || err);
      const msg = err.response?.data?.error ?? 'Failed to reject report.';
      addToast(msg, '#BB2325');
    } finally {
      setRejecting(false);
    }
  };

  // filtering
  const filteredReports = reports.filter(r => {
    const matchSearch =
      r.reportType.toLowerCase().includes(search.toLowerCase()) ||
      r.cerealType.toLowerCase().includes(search.toLowerCase()) ||
      r.whse.toLowerCase().includes(search.toLowerCase());
    const matchStatus      = selectedStatus      === 'All Status'      || r.status     === selectedStatus;
    const matchCerealType  = selectedCerealType  === 'All Cereal Type' || r.cerealType === selectedCerealType;
    const matchWarehouse   = selectedWarehouse   === 'All Warehouses'  || r.whse       === selectedWarehouse;
    return matchSearch && matchStatus && matchCerealType && matchWarehouse;
  });

  // derive unique filter options from live data
  const uniqueCerealTypes = [...new Set(reports.map(r => r.cerealType).filter(v => v && v !== '—'))];
  const uniqueWarehouses  = [...new Set(reports.map(r => r.whse).filter(v => v && v !== '—'))];

  const getStatusBadge = (status) => {
    if (status === 'Pending') return (
      <span className="inline-flex items-center justify-center gap-3.5 px-4.5 py-1.5 rounded-full font-medium text-xs min-w-[100px]" style={{ backgroundColor: '#F0E48B', color: '#856404', border: '1px solid #FFE08A' }}>
        <div className="w-3 h-3 border-2 border-[#856404] border-t-transparent rounded-full animate-spin flex-shrink-0" />
        Pending
      </span>
    );
    if (status === 'Approved') return (
      <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-[5px] rounded-full font-medium text-xs min-w-[100px]" style={{ backgroundColor: '#8BF093', color: '#3E7A43', border: '1px solid #90EE90' }}>
        <IoMdCheckmarkCircleOutline size={18} />
        Approved
      </span>
    );
    if (status === 'Rejected') return (
      <span className="inline-flex items-center justify-center gap-1.5 px-4.5 py-[5px] rounded-full font-medium text-xs min-w-[100px]" style={{ backgroundColor: '#BB2325', color: '#fff', border: '1px solid #F5A0A0' }}>
        <IoMdCloseCircleOutline size={18} />
        Rejected
      </span>
    );
    return null;
  };

  // unique key per row
  const rowKey = (r) => `${r._type}-${r._id}`;

  return (
    <>
      <Header
        pageTitle="Evaluation"
        notifTo={`${basePath}/notif`}
        unreadCount={5}
        userName={currentUser?.full_name || currentUser?.username || 'User'}
      />

      <div className="bg-[#F5F9F9] mx-4 my-4 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] border border-black/10 rounded-lg !min-h-[653px]">

        {/* summary counts */}
        <div className='flex justify-between font-medium w-150 pt-2.5 pl-4 text-[#2D317F]'>
          <div className="flex gap-4">
            <label>Total Reports:</label>
            <p className="m-0 font-bold">{reports.length}</p>
          </div>
          <div className="flex gap-4">
            <label>Pending: </label>
            <p className="bg-[#F0E48B] px-1.5 text-[#AE9C0F] rounded">{reports.filter(r => r.status === 'Pending').length}</p>
            <label>Approved: </label>
            <p className="bg-[#8BF093] px-1.5 text-[#3E7A43] rounded">{reports.filter(r => r.status === 'Approved').length}</p>
            <label>Rejected: </label>
            <p className="bg-[#FF595C] px-1.5 text-[#BB2325] rounded">{reports.filter(r => r.status === 'Rejected').length}</p>
          </div>
        </div>

        {/* search + filters */}
        <div className="flex justify-between items-center h-auto mt-5 mb-4 mx-4 text-[#2D317F] gap-3">
          <div className="bg-white border border-[#2D317F] rounded-full py-1.5 px-5 flex items-center gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
            <FaBars color={'#2D317F'} size={18} className="shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Report"
              className="bg-transparent border-0 placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
            />
            <FaSearch className="text-[#2D317F] shrink" size={20} />
          </div>

          <div className="flex gap-2.5 items-center flex-wrap">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-white shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] inline-flex items-center justify-between gap-2.5 border-[#2d317f] rounded-md py-5.5 px-3.5 text-[#2D317F] font-medium text-sm w-35 min-w-0 cursor-pointer whitespace-nowrap transition-colors duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Status">All Status</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Pending">Pending</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Approved">Approved</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCerealType} onValueChange={setSelectedCerealType}>
              <SelectTrigger className="bg-white shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] inline-flex items-center justify-between gap-2.5 border-[#2d317f] rounded-md py-5.5 px-3.5 text-[#2D317F] font-medium text-sm w-42 min-w-0 cursor-pointer whitespace-nowrap transition-colors duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Cereal Type">All Cereal Type</SelectItem>
                {uniqueCerealTypes.map(ct => (
                  <SelectItem key={ct} className='p-2 text-[#2D317F]' value={ct}>{ct}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="bg-white shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] inline-flex items-center justify-between gap-2.5 border-[#2d317f] rounded-md py-5.5 px-3.5 text-[#2D317F] font-medium text-sm w-45 min-w-0 cursor-pointer whitespace-nowrap transition-colors duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Warehouses">All Warehouses</SelectItem>
                {uniqueWarehouses.map(wh => (
                  <SelectItem key={wh} className='p-2 text-[#2D317F]' value={wh}>{wh}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <TableRow className='flex justify-center items-center h-full border-0'>
              <TableCell colSpan={6} className="text-center py-16">
                <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                  <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Loading reports...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <Table>
              <TableHeader className='text-center'>
                <TableRow className='bg-[#E2EBFF] text-[#2D317F] font-medium border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]'>
                  <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Date</TableHead>
                  <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Cereal Type</TableHead>
                  <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Report Type</TableHead>
                  <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Warehouse</TableHead>
                  <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Status</TableHead>
                  <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={rowKey(report)}>
                      <TableCell className='text-center text-[#2D317F]'>{report.date}</TableCell>
                      <TableCell className='text-center text-[#2D317F]'>{report.cerealType}</TableCell>
                      <TableCell className='text-center text-[#2D317F]'>{report.reportType}</TableCell>
                      <TableCell className='text-center text-[#2D317F]'>{report.whse}</TableCell>
                      <TableCell className='text-center text-[#2D317F]'>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell className='text-center px-0 !w-100'>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="font-medium rounded-full bg-transparent py-1.5 px-3.5 text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap transition ease-in-out duration-300 border border-[#2D317F] text-[#2D317F]"
                            onClick={() => navigate(
                              (reportRoutes[report.reportType] ?? '/admin/evaluation'),
                              { state: { reportId: report._id, reportType: report._type, stockbookId: report.stockbookId, pageTitle:   'Evaluation', } }
                            )}
                          >
                            <GoLinkExternal size={15} /> View
                          </button>

                          {/* actions dropdown */}
                          <div className="relative">
                            <button
                              className="font-medium rounded-full bg-transparent py-[3px] px-3.5 text-sm inline-flex items-center gap-1 cursor-pointer whitespace-nowrap border border-[#2D317F] text-[#2D317F] disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={report.status === 'Approved' || report.status === 'Rejected'}
                              onClick={(e) => {
                                e.stopPropagation();
                                const key = rowKey(report);
                                if (openDropdown === key) {
                                  setOpenDropdown(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDropdownPos({
                                    top:  rect.bottom + window.scrollY + 4,
                                    left: rect.right  - 144,
                                  });
                                  setOpenDropdown(key);
                                }
                              }}
                            >
                              <span className="text-lg font-bold tracking-widest">···</span>
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ── approve modal ── */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[400px] shadow-2xl'>
          <div className='bg-[#3E7A43] py-3 rounded-t-lg' />
          <div className='bg-[#3E7A43] py-5 rounded-full flex justify-center mx-38 mb-3 mt-5'>
            <IoMdCheckmarkCircleOutline className="w-12 h-12" color='white' />
          </div>
          <DialogHeader>
            <div className='text-center'>
              <p className='text-[#3E7A43] font-bold text-xl'>Approve Report?</p>
              <p className='text-sm mx-5 mt-2 text-[#051F52]'>Are you sure you want to approve this report?</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>
              <div className='flex justify-center gap-3 mt-6 mb-5'>
                <Button
                  variant="ghost"
                  disabled={approving}
                  onClick={() => setApproveOpen(false)}
                  className='px-7 py-4.5 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveConfirm}
                  disabled={approving}
                  className='px-7 py-4.5 rounded-md bg-[#3E7A43] text-white font-medium hover:bg-green-700 disabled:opacity-50'
                >
                  {approving ? 'Approving…' : 'Approve'}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* ── reject modal ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className='pt-0 px-0 pb-0 overflow-hidden max-w-[90vw] sm:max-w-[500px] xl:max-w-[540px] bg-[#E6EEF6] [&>button]:hidden'>
          <div className='h-7 bg-[#BB2325]' />
          <DialogHeader className='p-5 text-center items-center pb-2'>
            <div className="rounded-full p-5 bg-[#BB2325] w-fit">
              <TbXboxX size={60} color='white' />
            </div>
            <DialogTitle className='font-bold text-[#BB2325] text-2xl mt-2'>Reject Report?</DialogTitle>
            <DialogDescription className='text-sm text-gray-600 px-2'>
              Please provide the reason for rejecting this report:
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
              disabled={rejecting}
              className='px-6 py-2 rounded-md text-sm font-medium bg-[#D9D9D9] text-[#5B5B5B] disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || rejecting}
              className='px-6 py-2 rounded-md text-sm font-medium bg-[#BB2325] text-white disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {rejecting ? 'Rejecting…' : 'Reject'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-white rounded-lg shadow-2xl px-5 py-4 min-w-[300px]"
            style={{ borderLeft: `4px solid ${toast.color}` }}
          >
            <div className="rounded-full p-1.5 flex-shrink-0" style={{ backgroundColor: toast.color }}>
              <FaCheck size={16} color="white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: toast.color }}>
                {toast.color === '#BB2325' ? 'Rejected!' : 'Success!'}
              </p>
              <p className="text-gray-500 text-xs">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* dropdown */}
      {openDropdown && createPortal(
        <div
          className="fixed bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] w-36 overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const report = filteredReports.find(r => rowKey(r) === openDropdown);
              handleApprove(report);
              setOpenDropdown(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#3E7A43] hover:bg-green-50 transition-colors"
          >
            <IoMdCheckmarkCircleOutline size={18} /> Approve
          </button>
          <button
            onClick={() => {
              const report = filteredReports.find(r => rowKey(r) === openDropdown);
              handleRejectOpen(report);
              setOpenDropdown(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#BB2325] hover:bg-red-50 transition-colors"
          >
            <IoMdCloseCircleOutline size={18} /> Reject
          </button>
        </div>,
        document.body
      )}
    </>
  );
}