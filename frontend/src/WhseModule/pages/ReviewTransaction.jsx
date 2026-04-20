// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

// shadcn
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

// react icons
import { CiExport, CiImport } from "react-icons/ci"
import { FaExclamation } from "react-icons/fa"

export default function ReviewTransaction() {
  const { cereal } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { payload, header } = location.state ?? {}

  const reportId = header?.reportId ?? "—"
  const cerealType = header?.cerealType ?? cereal ?? "—"
  const status = header?.status ?? "In Progress"
  const mode = header?.mode ?? "create"
  const transactions = payload?.transactions ?? []

  const STATUS_CONFIG = {
    "In Progress": {
      label: "In Progress",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#F0E48B] text-[#856404]",
    },
    "Under Review": {
      label: "Under Review",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#ADCEFF] text-blue-800",
    },
  }
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG["In Progress"]

  // get all transactions
  const [localTransactions, setLocalTransactions] = useState(
    location.state?.allTransactions ?? []
  )

  // delete the transaction
  const handleDelete = (indexToDelete) => {
    setLocalTransactions(prev => prev.filter((_, i) => i !== indexToDelete))
  }

  const getDocumentField = (t) => {
    if (t.wts) return { label: "WTS#", value: t.wts }
    if (t.wsr) return { label: "WSR#", value: t.wsr }
    if (t.wsi) return { label: "WSI#", value: t.wsi }
    return { label: "—", value: "—" }
  }

  return (
    <div className="flex flex-col h-full p-5 box-border">

      {/* header */}
      <div className="flex-shrink-0 flex gap-[30px] items-center bg-white px-5 py-3 text-sm text-[#2d317f] border border-[#cfd6e0]">
        <div><strong>Report ID:</strong> {reportId}</div>
        <div className="flex items-center gap-2.5"><strong>Warehouse Supervisor:</strong></div>
        <div><strong>Cereal Type:</strong> {cerealType}</div>
        <div className="flex items-center gap-2.5"><strong>Warehouse Code:</strong></div>
        <div className="flex items-center gap-2">
          <strong>Status:</strong>
          <div className={badgeConfig.className}>{badgeConfig.label}</div>
        </div>
        <div className="flex gap-5 ml-auto">
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 border border-[#3e7a43] bg-transparent rounded-lg px-2 py-1">
            <CiImport size={25} color="#3E7A43" />
          </button>
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1d8104] text-white rounded-lg px-3 py-1 flex items-center gap-1">
            <CiExport size={25} color="white" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white mt-3 flex flex-col flex-1 overflow-hidden">
        <div className="text-white w-full bg-[#2D317F] h-12 flex items-center flex-shrink-0">
          <p className="font-semibold text-[20px] pl-5">Saved Entries</p>
        </div>

        {/* cards grid */}
        <div className="p-5 grid grid-cols-2 gap-4 overflow-y-auto flex-1">
          {localTransactions .map((t, i) => {
            const doc = getDocumentField(t)
            return (
              <div key={i} className="border border-[#cfd6e0] rounded-md p-4 bg-[#ECF0F3] shadow-md h-43">

                {/* card header */}
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <span className="font-semibold text-[#2D317F]">Entry {i + 1}</span>
                  <div className="flex gap-5">
                    <button
                      className="text-sm px-3 py-1 border border-[#2D317F] text-[#2D317F] rounded cursor-pointer hover:bg-[#2D317F] hover:text-white transition-colors"
                      onClick={() => navigate(`/whse/create/${cereal}`, {
                        state: {
                          stockBook: {
                            StockBook_ID: reportId,
                            CerealType: cerealType,
                            Status: status,
                            transactions: localTransactions,
                          },
                          mode,
                          editIndex: i,
                          header: { reportId, cerealType, status, mode },
                        }
                      })}
                    >
                      Edit
                    </button>

                    {/* msge for delete and last entry transaction */}
                    {localTransactions.length === 1 ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="text-[15px] px-3 py-1 border border-[#BB2325] text-[#BB2325] rounded cursor-pointer hover:bg-[#BB2325] hover:text-white transition-colors">
                            X
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none'>
                          <div className='h-7 bg-[#BB2325] rounded-t-lg'></div>
                          <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                            <div className="rounded-full px-5 py-5 bg-[#BB2325]">
                              <FaExclamation color={'white'} size={60} />
                            </div>
                            <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>
                              Cannot Delete Last Entry
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm px-2">
                              This is the only remaining entry in this stock book. You cannot delete it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
                            <AlertDialogAction className='!bg-[#2D317F] text-white hover:bg-[#1a1f5e] px-5 py-4.5'>
                              Okay
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      // normal delete confirmation modal
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="text-[15px] px-3 py-1 border border-[#BB2325] text-[#BB2325] rounded cursor-pointer hover:bg-[#BB2325] hover:text-white transition-colors">
                            X
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none'>
                          <div className='h-7 bg-[#BB2325] rounded-t-lg'></div>
                          <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                            <div className="rounded-full px-5 py-5 bg-[#BB2325]">
                              <FaExclamation color={'white'} size={60} />
                            </div>
                            <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>
                              Delete Entry {i + 1}?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm px-2">
                              Are you sure you want to delete this entry? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
                            <AlertDialogCancel className='w-23 px-5 py-4.5'>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className='w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-5 py-4.5'
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

                {/* cards */}
                <div className="grid grid-cols-3 gap-y-2 text-sm text-[#2d317f]">
                  <div>
                    <p className="text-gray-400 text-xs">{doc.label}</p>
                    <p className="font-medium">{doc.value || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Bags</p>
                    <p className="font-medium">{t.rBags || t.iBags || t.bBags || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">NKG</p>
                    <p className="font-medium">{t.rNkg || t.iNkg || t.bNkg || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Transaction</p>
                    <p className="font-medium">{t.transaction || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">GKG</p>
                    <p className="font-medium">{t.rGkg || t.iGkg || t.bGkg || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Condition</p>
                    <p className="font-medium">{t.rCondition || t.iCondition || t.bCondition || "—"}</p>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

        {/* bottom buttons */}
        <div className="flex justify-end gap-3 px-5 pb-5 flex-shrink-0 border-t border-[#cfd6e0] pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer">
                Cancel
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none'>
              <div className='h-7 bg-[#BB2325] rounded-t-lg'></div>
              <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                <div className="rounded-full px-5 py-5 bg-[#BB2325]">
                  <FaExclamation color={'white'} size={60} />
                </div>
                <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>
                  Go Back to Form?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm px-2">
                  Your entries are still saved. You will be taken back to the form to continue editing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
                <AlertDialogCancel className='w-23 px-5 py-4.5'>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className='w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-15 py-4.5'
                  onClick={() => navigate(`/whse/create/${cereal}`, {
                    state: {
                      stockBook: {
                        StockBook_ID: reportId,
                        CerealType: cerealType,
                        Status: status,
                        transactions: localTransactions,
                      },
                      mode,
                      editIndex: localTransactions.length - 1,
                      header: { reportId, cerealType, status, mode },
                    }
                  })}
                >
                  Yes, Go Back
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button
            className="px-[18px] py-2 bg-[#3E7A43] text-white rounded-md cursor-pointer"
            onClick={() => {
              console.log("Final submit:", payload)
              // api here
            }}
          >
            Submit All ({localTransactions.length})
          </button>
        </div>
      </div>

    </div>
  )
}