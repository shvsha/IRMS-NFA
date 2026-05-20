import { FaCheck } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";

export function Toast({ toasts }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => {
        const isError = toast.type === 'error'
        const color   = isError ? '#BB2325' : '#3E7A43'

        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-white rounded-lg shadow-2xl px-5 py-4 min-w-[300px]"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <div className="rounded-full p-1.5 flex-shrink-0" style={{ backgroundColor: color }}>
              {isError
                ? <IoMdCloseCircleOutline size={16} color="white" />
                : <FaCheck size={16} color="white" />
              }
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color }}>{isError ? 'Error!' : 'Success!'}</p>
              <p className="text-gray-500 text-xs">{toast.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}