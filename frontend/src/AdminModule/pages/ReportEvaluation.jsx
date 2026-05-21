// react icons
import { GoLinkExternal } from "react-icons/go";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";
import { TbXboxX } from "react-icons/tb";
import { FaSearch, FaBars } from "react-icons/fa";

import { useState, useEffect, useMemo, useReducer } from 'react'
import Header from '../../components/Header'

// toast
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

// for notif
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getNotifRoute } from "@/utils/Import & Export/getNotifRoute";
import { useUnreadCount } from "@/hooks/useUnreadCount";

// react router
import { useNavigate } from "react-router-dom";
import { createPortal } from 'react-dom'

// shadcn components
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// api
import api from "@/api/axios";

const mapWSR = (r) => ({
  _type:        'WSR',
  _id:          r.wsr_report_id,
  date:         r.stockbook_date   ?? '—',
  cerealType:   r.stockbook_cereal ?? '—',
  reportType:   'Statement of Receipt',
  whse:         r.warehouse ?? r.transactions?.[0]?.user_WHCode ?? '—',
  status:       r.Evaluation       ?? 'Pending',
  reason:       r.Reason           ?? '',
  stockbookId:  r.stockbook,
  currentStage: r.current_stage,
});

const mapWSI = (r) => ({
  _type:        'WSI',
  _id:          r.wsi_report_id,
  date:         r.stockbook_date   ?? '—',
  cerealType:   r.stockbook_cereal ?? '—',
  reportType:   'Statement of Issue',
  whse:         r.warehouse ?? r.transactions?.[0]?.user_WHCode ?? '—',
  status:       r.Evaluation       ?? 'Pending',
  reason:       r.Reason           ?? '',
  stockbookId:  r.stockbook,
  currentStage: r.current_stage,
});

const getBasePath = () => {
  if (window.location.pathname.startsWith('/signa')) return '/signa';
  if (window.location.pathname.startsWith('/whse'))  return '/whse';
  return '/admin';
};

const getReportRoutes = (basePath) => ({
  'Statement of Receipt': `${basePath}/evaluation/receipt`,
  'Statement of Issue':   `${basePath}/evaluation/issue`,
});

const getSignatoryStage = (user) => {
  if (user?.user_level !== 'Signatory') return null;
  if (user.signatory_role === 'Asst. Branch Manager') return 'asst_bm';
  if (user.signatory_role === 'Accountant 3')         return 'accountant';
  if (user.signatory_role === 'Branch Manager')       return 'branch_m';
  return null;
};

const rowKey = (r) => `${r._type}-${r._id}`;

const ITEMS_PER_PAGE = 6;

function StatusBadge({ status }) {
  if (status === 'Pending') return (
    <span className="inline-flex items-center justify-center gap-3.5 px-4.5 py-1.5 rounded-full font-medium text-xs min-w-[100px]" style={{ backgroundColor: '#F0E48B', color: '#856404', border: '1px solid #FFE08A' }}>
      <div className="w-3 h-3 border-2 border-[#856404] border-t-transparent rounded-full animate-spin flex-shrink-0" />
      Pending
    </span>
  );
  if (status === 'Approved') return (
    <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-[5px] rounded-full font-medium text-xs min-w-[100px]" style={{ backgroundColor: '#8BF093', color: '#3E7A43', border: '1px solid #90EE90' }}>
      <IoMdCheckmarkCircleOutline size={18} /> Approved
    </span>
  );
  if (status === 'Rejected') return (
    <span className="inline-flex items-center justify-center gap-1.5 px-4.5 py-[5px] rounded-full font-medium text-xs min-w-[100px]" style={{ backgroundColor: '#BB2325', color: '#fff', border: '1px solid #F5A0A0' }}>
      <IoMdCloseCircleOutline size={18} /> Rejected
    </span>
  );
  return null;
}

function ApproveModal({ open, onClose, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[320px] shadow-2xl'>
        <div className='bg-[#3E7A43] py-3 rounded-t-lg' />
        <div className='bg-[#3E7A43] py-4 rounded-full flex justify-center mx-31 mb-1.5 mt-3'>
          <IoMdCheckmarkCircleOutline className="w-9 h-9" color='white' />
        </div>
        <DialogHeader>
          <div className='text-center'>
            <p className='text-[#3E7A43] font-bold text-[20px]'>Approve Report?</p>
            <p className='text-[12px] mx-5 mt-0.5 text-[#051F52]'>Are you sure you want to approve this report?</p>
          </div>
          <DialogDescription className='flex flex-col gap-5'>
            <div className='flex justify-center gap-3 mt-3 mb-3'>
              <Button variant="ghost" disabled={loading} onClick={onClose}
                className='px-3 py-4 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300'>
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={loading}
                className='px-3 py-4 rounded-md bg-[#3E7A43] text-white font-medium hover:bg-green-700 disabled:opacity-50'>
                {loading ? 'Approving…' : 'Approve'}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function RejectModal({ open, onClose, onSubmit, loading, reason, onReasonChange }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='pt-0 px-0 pb-0 overflow-hidden !max-w-[320px] bg-[#E6EEF6] [&>button]:hidden'>
        <div className='h-7 bg-[#BB2325]' />
        <DialogHeader className='p-5 text-center items-center pb-2'>
          <div className="rounded-full p-3.5 bg-[#BB2325] w-fit -mt-3">
            <TbXboxX size={35} color='white' />
          </div>
          <DialogTitle className='font-bold text-[#BB2325] text-[20px] mt-2'>Reject Report?</DialogTitle>
          <DialogDescription className='text-[12px] text-gray-600 px-2'>
            Please provide the reason for rejecting this report:
          </DialogDescription>
        </DialogHeader>
        <div className='px-6 pb-2 -mt-2'>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Type your reason here..."
            className="w-full border bg-white rounded-md p-3 text-sm resize-none h-20 focus:outline-none focus:border-[#BB2325]"
          />
        </div>
        <DialogFooter className='pb-10 pr-10 flex justify-center gap-3 bg-[#E6EEF6] border-0 -mt-7'>
          <button onClick={onClose} disabled={loading}
            className='px-4 py-1.5 rounded-md text-sm font-medium bg-[#D9D9D9] text-[#5B5B5B] disabled:opacity-50'>
            Cancel
          </button>
          <button onClick={onSubmit} disabled={!reason.trim() || loading}
            className='px-4 py-1.5 rounded-md text-sm font-medium bg-[#BB2325] text-white disabled:opacity-50 disabled:cursor-not-allowed'>
            {loading ? 'Rejecting…' : 'Reject'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const COL_WIDTHS = ['13%', '13%', '22%', '13%', '15%', '24%'];

function ReportTable({ reports, paginatedReports, currentPage, totalPages, onPageChange, onView, onAction, openDropdown, onDropdownToggle, dropdownPos, reportRoutes, filteredReports }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Fixed table header */}
      <table className="w-full table-fixed flex-shrink-0">
        <colgroup>{COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
        <thead>
          <tr className="bg-[#E2EBFF] text-[#2D317F] border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
            {['Date', 'Cereal Type', 'Report Type', 'Warehouse', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-[#2D317F] font-bold text-center text-sm xl:text-base">{h}</th>
            ))}
          </tr>
        </thead>
      </table>

      {/* Scrollable table body */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full table-fixed">
          <colgroup>{COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-12">No reports found.</td>
              </tr>
            ) : (
              paginatedReports.map((report) => (
                <tr key={rowKey(report)} className="border-b border-gray-100 h-[60px]">
                  <td className="text-center text-[#2D317F] text-sm">{report.date}</td>
                  <td className="text-center text-[#2D317F] text-sm">{report.cerealType}</td>
                  <td className="text-center text-[#2D317F] text-sm">{report.reportType}</td>
                  <td className="text-center text-[#2D317F] text-sm">{report.whse}</td>
                  <td className="text-center text-[#2D317F]"><StatusBadge status={report.status} /></td>
                  <td className="text-center px-0">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="font-medium rounded-full bg-transparent py-1.5 px-3.5 text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap transition ease-in-out duration-300 border border-[#2D317F] text-[#2D317F]"
                        onClick={() => onView(report)}
                      >
                        <GoLinkExternal size={15} /> View
                      </button>
                      <button
                        className="font-medium rounded-full bg-transparent py-[3px] px-3.5 text-sm inline-flex items-center gap-1 cursor-pointer whitespace-nowrap border border-[#2D317F] text-[#2D317F] disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={report.status === 'Approved' || report.status === 'Rejected'}
                        onClick={(e) => onDropdownToggle(e, report)}
                      >
                        <span className="text-lg font-bold tracking-widest">···</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-[12px] flex-shrink-0 border-t border-gray-100">
        <span className="text-[13px] text-gray-500 font-medium">
          {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : '—'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(p => p - 1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="px-[18px] py-[7px] rounded-md text-[13px] font-semibold text-[#2d317f] bg-[#e2e8f0] border-[1.5px] border-[#e2e8f0] cursor-pointer transition-colors duration-150 hover:bg-[#d1d9e6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(p => p + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-[18px] py-[7px] rounded-md text-[13px] font-semibold text-white bg-[#2d317f] border-[1.5px] border-[#2d317f] cursor-pointer transition-colors duration-150 hover:bg-[#222669] hover:border-[#222669] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const approvalInitialState = {
  selectedReport:   null,
  approveOpen:      false,
  approving:        false,
  rejectDialogOpen: false,
  rejectReason:     '',
  rejecting:        false,
};

function approvalReducer(state, action) {
  switch (action.type) {
    case 'OPEN_APPROVE':
      return { ...state, selectedReport: action.report, approveOpen: true };
    case 'CLOSE_APPROVE':
      return { ...state, approveOpen: false };
    case 'SET_APPROVING':
      return { ...state, approving: action.value };
    case 'OPEN_REJECT':
      return { ...state, selectedReport: action.report, rejectReason: '', rejectDialogOpen: true };
    case 'CLOSE_REJECT':
      return { ...state, rejectDialogOpen: false, rejectReason: '' };
    case 'SET_REJECT_REASON':
      return { ...state, rejectReason: action.value };
    case 'SET_REJECTING':
      return { ...state, rejecting: action.value };
    default:
      return state;
  }
}

export default function ReportEvaluation() {
  const user        = useCurrentUser()
  const notifRoute  = getNotifRoute(user)
  const userName    = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()
  const navigate    = useNavigate()
  const { toasts, addToast } = useToast()

  // Parse currentUser once, not on every render
  const currentUser = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('user')) || null; }
    catch { return null; }
  }, []);

  const basePath     = getBasePath();
  const reportRoutes = getReportRoutes(basePath);

  // Approval/reject state consolidated into a reducer
  const [approval, dispatchApproval] = useReducer(approvalReducer, approvalInitialState);

  const [reports,            setReports]            = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [currentPage,        setCurrentPage]        = useState(1);
  const [selectedStatus,     setSelectedStatus]     = useState('All Status');
  const [selectedCerealType, setSelectedCerealType] = useState('All Cereal Type');
  const [selectedWarehouse,  setSelectedWarehouse]  = useState('All Warehouses');
  const [search,             setSearch]             = useState('');
  const [openDropdown,       setOpenDropdown]       = useState(null);
  const [dropdownPos,        setDropdownPos]        = useState({ top: 0, left: 0 });

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
        combined = combined.filter((report) =>
          report.currentStage === 'admin' &&
          (report.status === 'Pending' || report.status === 'Rejected')
        );
      } else if (userStage) {
        combined = combined.filter((report) => report.currentStage === userStage);
      }

      combined.sort((a, b) => b._id - a._id);
      setReports(combined);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      addToast('Failed to load reports. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = (type, id, newStatus, newReason = '') => {
    setReports(prev => prev.map(r =>
      r._type === type && r._id === id
        ? { ...r, status: newStatus, reason: newReason }
        : r
    ));
  };

  // Approve handlers
  const handleApproveConfirm = async () => {
    const { selectedReport } = approval;
    if (!selectedReport) return;
    dispatchApproval({ type: 'SET_APPROVING', value: true });
    try {
      const endpoint = selectedReport._type === 'WSR'
        ? `/reports/wsr-reports/upd/${selectedReport._id}/`
        : `/reports/wsi-reports/upd/${selectedReport._id}/`;
      await api.put(endpoint, { Evaluation: 'Approved', Reason: null });
      updateReportStatus(selectedReport._type, selectedReport._id, 'Approved', '');
      await fetchReports();
      dispatchApproval({ type: 'CLOSE_APPROVE' });
      addToast('Report has been approved!');
    } catch (err) {
      dispatchApproval({ type: 'CLOSE_APPROVE' });
      addToast(err.response?.data?.error ?? 'Failed to approve report.', 'error');
    } finally {
      dispatchApproval({ type: 'SET_APPROVING', value: false });
    }
  };

  // Reject handlers
  const handleRejectSubmit = async () => {
    const { selectedReport, rejectReason } = approval;
    if (!selectedReport || !rejectReason.trim()) return;
    dispatchApproval({ type: 'SET_REJECTING', value: true });
    try {
      const endpoint = selectedReport._type === 'WSR'
        ? `/reports/wsr-reports/upd/${selectedReport._id}/`
        : `/reports/wsi-reports/upd/${selectedReport._id}/`;
      await api.put(endpoint, { Evaluation: 'Rejected', Reason: rejectReason.trim() });
      updateReportStatus(selectedReport._type, selectedReport._id, 'Rejected', rejectReason.trim());
      await fetchReports();
      dispatchApproval({ type: 'CLOSE_REJECT' });
      addToast('Report has been rejected.');
    } catch (err) {
      addToast(err.response?.data?.error ?? 'Failed to reject report.', 'error');
    } finally {
      dispatchApproval({ type: 'SET_REJECTING', value: false });
    }
  };

  // Dropdown toggle
  const handleDropdownToggle = (e, report) => {
    e.stopPropagation();
    const key = rowKey(report);
    if (openDropdown === key) {
      setOpenDropdown(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.right - 144 });
      setOpenDropdown(key);
    }
  };

  // Navigate to report detail
  const handleViewReport = (report) => {
    navigate(
      reportRoutes[report.reportType] ?? '/admin/evaluation',
      { state: { reportId: report._id, reportType: report._type, stockbookId: report.stockbookId, pageTitle: 'Evaluation' } }
    );
  };

  // Filtering
  const filteredReports = reports.filter(r => {
    const matchSearch =
      r.reportType.toLowerCase().includes(search.toLowerCase()) ||
      r.cerealType.toLowerCase().includes(search.toLowerCase()) ||
      r.whse.toLowerCase().includes(search.toLowerCase());
    const matchStatus     = selectedStatus     === 'All Status'      || r.status     === selectedStatus;
    const matchCerealType = selectedCerealType === 'All Cereal Type' || r.cerealType === selectedCerealType;
    const matchWarehouse  = selectedWarehouse  === 'All Warehouses'  || r.whse       === selectedWarehouse;
    return matchSearch && matchStatus && matchCerealType && matchWarehouse;
  });

  // Pagination
  const totalPages       = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex       = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page on filter/search change
  const handleStatusChange    = (v) => { setSelectedStatus(v);     setCurrentPage(1); };
  const handleCerealChange    = (v) => { setSelectedCerealType(v); setCurrentPage(1); };
  const handleWarehouseChange = (v) => { setSelectedWarehouse(v);  setCurrentPage(1); };
  const handleSearchChange    = (e) => { setSearch(e.target.value); setCurrentPage(1); };

  const uniqueCerealTypes = [...new Set(reports.map(r => r.cerealType).filter(v => v && v !== '—'))];
  const uniqueWarehouses  = [...new Set(reports.map(r => r.whse).filter(v => v && v !== '—'))];

  return (
    <>
      <Header pageTitle="Evaluation" unreadCount={unreadCount} notifTo={notifRoute} userName={userName} />

      {/* Outer card */}
      <div className="bg-[#F5F9F9] mx-4 my-4 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] border border-black/10 rounded-lg !min-h-[653px]">

        {/* Summary counts */}
        <div className='flex justify-between font-medium w-150 pt-2.5 pl-4 text-[#2D317F] flex-shrink-0'>
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

        {/* Search + filters */}
        <div className="flex justify-between items-center mt-5 mb-4 mx-4 text-[#2D317F] gap-3 flex-shrink-0">
          <div className="bg-white border border-[#2D317F] rounded-full py-1.5 px-5 flex items-center gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
            <FaBars color={'#2D317F'} size={18} className="shrink-0" />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search Report"
              className="bg-transparent border-0 placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
            />
            <FaSearch className="text-[#2D317F] shrink" size={20} />
          </div>
          <div className="flex gap-2.5 items-center flex-wrap">
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
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

            <Select value={selectedCerealType} onValueChange={handleCerealChange}>
              <SelectTrigger className="bg-white shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] inline-flex items-center justify-between gap-2.5 border-[#2d317f] rounded-md py-5.5 px-3.5 text-[#2D317F] font-medium text-sm w-40 min-w-0 cursor-pointer whitespace-nowrap transition-colors duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Cereal Type">All Cereal Type</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="Mixed Cereal">Mixed Cereal</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="WD1G50">Palay</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="PD1350">Rice</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
              <SelectTrigger className="bg-white shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] inline-flex items-center justify-between gap-2.5 border-[#2d317f] rounded-md py-5.5 px-3.5 text-[#2D317F] font-medium text-sm w-41 min-w-0 cursor-pointer whitespace-nowrap transition-colors duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#2D317F]' value="All Warehouses">All Warehouses</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="010501A">Warehouse 1</SelectItem>
                <SelectItem className='p-2 text-[#2D317F]' value="010502A">Warehouse 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table section */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[#2D317F]">
              <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading reports...</span>
            </div>
          </div>
        ) : (
          <ReportTable
            reports={reports}
            paginatedReports={paginatedReports}
            filteredReports={filteredReports}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onView={handleViewReport}
            onDropdownToggle={handleDropdownToggle}
            openDropdown={openDropdown}
            dropdownPos={dropdownPos}
            reportRoutes={reportRoutes}
          />
        )}
      </div>

      {/* Modals */}
      <ApproveModal
        open={approval.approveOpen}
        onClose={() => dispatchApproval({ type: 'CLOSE_APPROVE' })}
        onConfirm={handleApproveConfirm}
        loading={approval.approving}
      />
      <RejectModal
        open={approval.rejectDialogOpen}
        onClose={() => dispatchApproval({ type: 'CLOSE_REJECT' })}
        onSubmit={handleRejectSubmit}
        loading={approval.rejecting}
        reason={approval.rejectReason}
        onReasonChange={(v) => dispatchApproval({ type: 'SET_REJECT_REASON', value: v })}
      />

      {/* Toasts */}
      <Toast toasts={toasts} />

      {/* Dropdown portal */}
      {openDropdown && createPortal(
        <div
          className="fixed bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] w-36 overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onClick={e => e.stopPropagation()}
        >
          {(() => {
            const report = filteredReports.find(r => rowKey(r) === openDropdown);
            const isRejected = report?.status === 'Rejected';
            return (
              <>
                <button
                  disabled={isRejected}
                  onClick={() => { dispatchApproval({ type: 'OPEN_APPROVE', report }); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#3E7A43] hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <IoMdCheckmarkCircleOutline size={18} /> Approve
                </button>
                <button
                  disabled={isRejected}
                  onClick={() => { dispatchApproval({ type: 'OPEN_REJECT', report }); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#BB2325] hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <IoMdCloseCircleOutline size={18} /> Reject
                </button>
              </>
            );
          })()}
        </div>,
        document.body
      )}
    </>
  );
}