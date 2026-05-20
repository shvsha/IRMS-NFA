// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from '../../components/Header'

// shadcn
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

// react icons
import { FaExclamation } from "react-icons/fa"
import { FaCheck } from "react-icons/fa6"
import { IoSend } from "react-icons/io5"

// for notif
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { getNotifRoute } from "@/utils/Import & Export/getNotifRoute";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// api
import api from "@/api/axios";

// same mapFromBackend helper as CreateReport 
const mapFromBackend = (txn) => ({
  id:              txn.transaction_id,
  particulars:     txn.Particulars      || '',
  plateNo:         txn.Plate_Number     || '',
  batchNo:         txn.Batch_No         || '',
  aiNo:            txn.AI_Number        || '',
  orNo:            txn.OR_Number        || '',
  transaction:     txn.Transaction_ref  || '',
  wts:             txn.WTS_no           || '',
  wsr:             txn.WSR_no           || '',
  wsi:             txn.WSI_no           || '',
  age:             txn.Age              || '',
  classifier:      txn.Classifier       || '',
  moistureContent: txn.Moisture_Content || '',
  pileNo:          txn.Pile_No          || '',
  fillers:         txn.Fillers          || '',
  rBags:           txn.R_Bags           || '',
  rGkg:            txn.R_GKG            || '',
  rNkg:            txn.R_NKG            || '',
  rCondition:      txn.Cond_R           || '',
  iBags:           txn.I_Bags           || '',
  iGkg:            txn.I_GKG            || '',
  iNkg:            txn.I_NKG            || '',
  iCondition:      txn.Cond_I           || '',
});

export default function ReviewTransaction() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stockBook  = location.state?.stockBook ?? null;
  const mode       = location.state?.mode      ?? "create";
  const reportId   = stockBook?.report_id      ?? id ?? "—";
  const cerealType = stockBook?.CerealType     ?? "—";
  const status     = stockBook?.Status         ?? "In Progress";

  const whseUser = JSON.parse(sessionStorage.getItem("user") || "{}");

  const STATUS_CONFIG = {
    "In Progress": {
      label: "In Progress",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#F0E48B] text-[#856404]",
    },
    "Under Review": {
      label: "Under Review",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#ADCEFF] text-blue-800",
    },
  };
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG["In Progress"];

  const [localTransactions, setLocalTransactions] = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [loadError,         setLoadError]         = useState(null);
  const [submitting,        setSubmitting]        = useState(false);
  const [deletingIndex,     setDeletingIndex]     = useState(null);
  
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const fetchId = reportId !== "—" ? reportId : id;
    if (!fetchId) {
      setLoadError("No report ID available.");
      setLoading(false);
      return;
    }

    api.get(`/reports/stocks/upd/${fetchId}/`)
      .then(res => {
        const raw = res.data?.transactions ?? [];
        setLocalTransactions(raw.map(mapFromBackend));
        setLoading(false);
      })
      .catch(() => {
        const fallback = location.state?.transactions ?? [];
        setLocalTransactions(fallback);
        setLoadError("Could not refresh from server — showing last known data.");
        setLoading(false);
      });
  }, []);

  // helpers
  const getDocumentField = (t) => {
    if (t.wts) return { label: "WTS#", value: t.wts };
    if (t.wsr) return { label: "WSR#", value: t.wsr };
    if (t.wsi) return { label: "WSI#", value: t.wsi };
    return { label: "—", value: "—" };
  };

  const handleDelete = async (indexToDelete) => {
    const txn = localTransactions[indexToDelete];
    setDeletingIndex(indexToDelete);
    try {
      if (txn?.id) {
        await api.delete(`/reports/transactions/upd/${txn.id}/`);
      }
      setLocalTransactions(prev => prev.filter((_, i) => i !== indexToDelete));
    } catch (err) {
      addToast('Failed to delete transaction. Please try again.', '#BB2325')
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSubmitAll = async () => {
    if (!stockBook?.report_id) return;
    try {
      setSubmitting(true);
      await api.post(`/reports/stocks/submit/${stockBook.report_id}/`);
      navigate("/whse/management", {
        state: { successMessage: `Report R-${String(reportId).padStart(3, "0")} submitted for review.` },
      });
    } catch (err) {
      const errData = err.response?.data
      const message = typeof errData === 'object' && errData !== null
        ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : errData || 'Failed to submit report.';
      addToast(message, '#BB2325')
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/whse/create/${reportId}`, {
      state: {
        stockBook,
        mode,
        editIndex: Math.max(0, localTransactions.length - 1),
      },
    });
  };

  const handleEdit = (index) => {
    navigate(`/whse/create/${reportId}`, {
      state: {
        stockBook,
        mode,
        editIndex: index,
      },
    });
  };

  const addToast = (message, color) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  if (loading) {
    return (
      <>
        <Header pageTitle="Stock Book" notifTo="/admin/notif" unreadCount={5} userName="Raph Nigos" />
        <div className="flex items-center justify-center h-64 text-[#2D317F] text-lg">
          Loading saved entries…
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        pageTitle="Stock Book" 
        unreadCount={unreadCount}
        notifTo={notifRoute}
        userName={userName}
      />

      <div className="mx-4 my-4 mt-2 pb-50 flex flex-col rounded-lg !min-h-[640px]">

        {/* header */}
        <div className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex-shrink-0 flex flex-wrap gap-[30px] rounded-lg items-center bg-white px-3 py-2 text-sm text-[#2d317f]">
          <div><strong>Report ID:</strong> R-{String(reportId).padStart(3, "0")}</div>
          <div><strong>Warehouse Supervisor:</strong> {whseUser?.fname} {whseUser?.lname}</div>
          <div><strong>Cereal Type:</strong> {cerealType}</div>
          <div><strong>Warehouse Code:</strong> {whseUser?.WHCode ?? "—"}</div>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <div className={badgeConfig.className}>{badgeConfig.label}</div>
          </div>
        </div>

        {/* soft warning if fallback data is shown */}
        {loadError && (
          <div className="mt-2 px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg">
            ⚠️ {loadError}
          </div>
        )}

        {/* main content */}
        <div className="bg-[#F3F6F9] mt-3 flex flex-col rounded-lg shadow-[0_0_8px_rgba(0,0,0,0.25)] overflow-hidden h-[605px]">
          <div className="text-white w-full bg-[#2D317F] h-10 flex items-center flex-shrink-0">
            <p className="font-semibold text-[16px] pl-5">Saved Entries</p>
          </div>

          {/* cards grid */}
          <div className="p-5 grid grid-cols-2 gap-4 overflow-y-auto flex-1 min-h-0">

            {localTransactions.length === 0 ? (
              <div className="col-span-2 flex items-center justify-center text-gray-400 text-sm h-32">
                No saved entries found for this report.
              </div>
            ) : (
              localTransactions.map((t, i) => {
                const doc        = getDocumentField(t);
                const isDeleting = deletingIndex === i;

                return (
                  <div
                    key={t.id ?? i}
                    className={`border border-[#cfd6e0] rounded-md p-4 bg-white shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] h-43 transition-opacity ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    {/* card header */}
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <span className="font-semibold text-[#2D317F]">Entry {i + 1}</span>
                      <div className="flex gap-5">

                        {/* Edit */}
                        <button
                          className="text-sm px-3 py-1 border border-[#2D317F] text-[#2D317F] rounded cursor-pointer hover:bg-[#2D317F] hover:text-white transition-colors"
                          onClick={() => handleEdit(i)}
                        >
                          Edit
                        </button>

                        {/* Delete — blocked when only one entry remains */}
                        {localTransactions.length === 1 ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-[15px] px-3 py-1 border border-[#BB2325] text-[#BB2325] rounded cursor-pointer hover:bg-[#BB2325] hover:text-white transition-colors">
                                X
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 !max-w-[320px] overflow-hidden rounded-[10px] border-none">
                              <div className="h-5 bg-[#BB2325] rounded-t-lg" />
                              <AlertDialogHeader className="p-5 text-center items-center pb-4">
                                <div className="rounded-full px-4 py-4 bg-[#BB2325]">
                                  <FaExclamation color="white" size={33} />
                                </div>
                                <AlertDialogTitle className="!font-bold text-[#BB2325] text-[23px]">
                                  Cannot Delete Last Entry
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[12px] px-2">
                                  This is the only remaining entry in this stock book. You cannot delete it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="-mt-5 mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0">
                                <AlertDialogAction className="!bg-[#BB2325] text-white hover:bg-[#c8191c] text-xs px-1 py-3">
                                  Okay
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-[15px] px-3 py-1 border border-[#BB2325] text-[#BB2325] rounded cursor-pointer hover:bg-[#BB2325] hover:text-white transition-colors">
                                X
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 !max-w-[320px] overflow-hidden rounded-[10px] border-none">
                              <div className="h-5 bg-[#BB2325] rounded-t-lg" />
                              <AlertDialogHeader className="p-5 text-center items-center pb-4">
                                <div className="rounded-full px-4 py-4 bg-[#BB2325]">
                                  <FaExclamation color="white" size={33} />
                                </div>
                                <AlertDialogTitle className="!font-bold text-[#BB2325] text-[23px]">
                                  Delete Entry {i + 1}?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[12px] px-2">
                                  Are you sure you want to delete this entry? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-5">
                                <AlertDialogCancel className=" text-xs w-23 px-1 py-3">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className=" text-xs w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-1 py-3"
                                  onClick={() => handleDelete(i)}
                                >
                                  Yes, Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    {/* card body */}
                    <div className="grid grid-cols-3 gap-y-2 text-sm text-[#2d317f]">
                      <div>
                        <p className="text-gray-400 text-xs">{doc.label}</p>
                        <p className="font-medium">{doc.value || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Bags</p>
                        <p className="font-medium">{t.rBags !== '' ? t.rBags : t.iBags !== '' ? t.iBags : '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">NKG</p>
                        <p className="font-medium">{t.rNkg || t.iNkg || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Transaction</p>
                        <p className="font-medium">{t.transaction || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">GKG</p>
                        <p className="font-medium">{t.rGkg || t.iGkg || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Condition</p>
                        <p className="font-medium">{t.rCondition || t.iCondition || "—"}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* bottom buttons */}
          <div className="flex justify-end gap-3 px-5 pb-5 flex-shrink-0 border-t border-[#cfd6e0] pt-4">

            {/* Cancel */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer">
                  Cancel
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 !max-w-[320px] overflow-hidden rounded-[10px] border-none">
                <div className="h-5 bg-[#BB2325] rounded-t-lg" />
                <AlertDialogHeader className="p-5 text-center items-center pb-4">
                  <div className="rounded-full px-4 py-4 bg-[#BB2325]">
                    <FaExclamation color="white" size={33} />
                  </div>
                  <AlertDialogTitle className="!font-bold text-[#BB2325] text-[23px] mx-2">
                    Go Back to Form?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[12px] px-2">
                    Your entries are still saved. You will be taken back to the form to continue editing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-4.5">
                  <AlertDialogCancel className="text-xs w-23 px-3 py-2">Stay</AlertDialogCancel>
                  <AlertDialogAction
                    className="text-xs w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-3 py-2"
                    onClick={handleGoBack}
                  >
                    Yes, Go Back
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Submit All */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="px-[18px] py-2 bg-[#3E7A43] text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || localTransactions.length === 0}
                >
                Submit All ({localTransactions.length})
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 !max-w-[320px] overflow-hidden rounded-[10px] border-none">
                <div className="h-5 bg-[#3E7A43] rounded-t-lg" />
                <AlertDialogHeader className="p-5 text-center items-center pb-4">
                  <div className="rounded-full px-4 py-4 bg-[#3E7A43]">
                    <IoSend color="white" size={33} />
                  </div>
                  <AlertDialogTitle className="!font-bold text-[#3E7A43] text-[23px] mx-2">
                    Submit Stockbook?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[12px] px-2">
                    Are you sure you want to submit your stock book?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-4">
                  <AlertDialogCancel className="text-xs w-23 px-3 py-2">Stay</AlertDialogCancel>
                  <AlertDialogAction
                    className="text-xs w-23 !bg-[#3E7A43] text-white hover:bg-[#28602c] px-3 py-2"
                    onClick={handleSubmitAll}
                  >
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

      </div>

      {/* toast */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
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
                {toast.color === '#BB2325' ? 'Error!' : 'Success!'}
              </p>
              <p className="text-gray-500 text-xs">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}