// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";

// shadcn
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"

// react icons
import { CiExport, CiImport } from "react-icons/ci";

export default function CreateReport() {
  const { cereal } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stockBook = location.state?.stockBook ?? null;
  const mode = location.state?.mode ?? "create";

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const reportId = stockBook?.StockBook_ID ?? "—";
  const cerealType = stockBook?.CerealType ?? cereal ?? "—";
  const status = stockBook?.Status ?? "In Progress";

  const STATUS_CONFIG = {
    "In Progress": {
      label: "In Progress",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#F0E48B] text-[#856404]",
    },
    "Under Review": {
      label: "Under Review",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#ADCEFF] text-blue-800",
    },
    Completed: {
      label: "Completed",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#8BF093] text-green-800",
    },
  };
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG["In Progress"];

  const EMPTY_ROW = {
    year: "", month: "", Particulars: "", Plate_Number: "", WTS: "",
    WSR: "", WSI: "", Batch_No: "", Age: "", AI_Number: "", OR_Number: "",
    Moisture_Content: "", Classifier: "", Transaction: "", Pile_No: "",
    R_Bags: "", R_GKG: "", R_NKG: "", R_Cond: "", I_Bags: "", I_GKG: "",
    I_NKG: "", I_Cond: "", Fillers: "", B_Bags: "", B_GKG: "", B_NKG: "",
  };

  const [rows, setRows] = useState(
    Array.from({ length: 15 }, () => ({ ...EMPTY_ROW }))
  );

  const handleRowChange = (rowIndex, field, value) => {
    if (isViewMode) return;
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });
  };

  const handleSubmitCreate = () => {
    const payload = {
      CerealType: cerealType,
      Status: "Under Review",
      rows: rows.filter((row) => Object.values(row).some((v) => v !== "")),
    };
    console.log("Stock Book Payload (ready for API):", payload);
    navigate("/whse/management");
  };

  const handleSubmitEdit = () => {
    const payload = {
      StockBook_ID: reportId,
      CerealType: cerealType,
      Status: status,
      rows: rows.filter((row) => Object.values(row).some((v) => v !== "")),
    };
    console.log("Edit Payload (ready for API):", payload);
    navigate("/whse/management");
  };


  return (
    <div className="flex flex-col min-h-full p-5 box-border">

      {/* header */}
      <div className="flex-shrink-0 flex gap-[30px] items-center bg-white px-5 py-3 text-sm text-[#2d317f] border border-[#cfd6e0]">
        <div>
          <strong>Report ID:</strong> {reportId}
        </div>
        <div className="flex items-center gap-2.5">
          <strong>Warehouse Supervisor:</strong>
        </div>
        <div>
          <strong>Cereal Type:</strong> {cerealType}
        </div>
        <div className="flex items-center gap-2.5">
          <strong>Warehouse Code:</strong>
        </div>
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

      {/* container for form */}
      <div className="mt-[15px] overflow-x-auto w-full flex flex-col gap-3">

        {/* first layer */}
        <div className="bg-white py-4 px-5 ">
          <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Deliver & Vehicle Information</p>

            <div className="flex gap-9 w-full">
              {/* year and month */}
              <div>
                <Field className="flex-col w-fit">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Year</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Year"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Month</FieldLabel>
                  <Input
                    placeholder="Month"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              {/* Particulars */}
              <div className="flex-1">
                <Field className="flex w-full">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Particulars</FieldLabel>
                  <Input
                    placeholder="Particulars"
                    className="bg-[#E6EEF6] border-0 rounded pb-21 pt-5 "
                  />
                </Field>
              </div>
              {/* plate # and batch # */}
              <div className="flex gap-10 flex-1">
                <Field className="flex flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Plate #</FieldLabel>
                  <Input
                    placeholder="Particulars"
                    className="bg-[#E6EEF6] border-0 rounded h-10"
                  />
                </Field>
                <Field className="flex flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Batch No.</FieldLabel>
                  <Input
                    placeholder="Particulars"
                    className="bg-[#E6EEF6] border-0 rounded h-10"
                  />
                </Field>
              </div>
            </div>


        </div>

        {/* second layer */}
        <div className="flex gap-3 w-full">
          {/* Documents */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Documents</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">WTS #</FieldLabel>
                  <Input
                    type='number'
                    placeholder="WTS #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">AI #</FieldLabel>
                  <Input
                    placeholder="AI #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">WSR #</FieldLabel>
                  <Input
                    type='number'
                    placeholder="WSR #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">OR #</FieldLabel>
                  <Input
                    placeholder="OR #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">WSI #</FieldLabel>
                  <Input
                    type='number'
                    placeholder="WSI #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Transaction</FieldLabel>
                  <Input
                    placeholder="Transaction"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* QUality Metrics */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Quality Metrics</p>
          
            {/* Age, Classifier, Moisture Content (%), Pile No. */}
            <div className="flex gap-5">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Age</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Age"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Moisture Content (%)</FieldLabel>
                  <Input
                    placeholder="Moisture Content (%)"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Classifier</FieldLabel>
                  <Input
                    placeholder="Classifier"
                    className="bg-[#E6EEF6] border-0 rounded h-8"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Pile No.</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Pile No."
                    className="bg-[#E6EEF6] border-0 rounded h-8"
                  />
                </Field>
              </div>
            </div>
          </div>

        </div>

        {/* third layer */}
        <div className="flex gap-3 w-full">
          {/* Receipts */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Receipts</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Bags</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Bags"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Condition</FieldLabel>
                  <Input
                    placeholder="Condition"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Gkg</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Gkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Nkg</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Nkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Issues*/}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Issues</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Bags</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Bags"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Condition</FieldLabel>
                  <Input
                    placeholder="Condition"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Gkg</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Gkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Nkg</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Nkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

        </div>

        {/* fourth layer */}
        <div className="flex gap-3 w-full">
          {/* Receipts */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Receipts</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Fillers Description</FieldLabel>
                  <Input
                    placeholder="Fillers Description"
                    className="bg-[#E6EEF6] border-0 rounded pt-5 pb-21 w-full"
                  />
                </Field>
              </div>

            </div>
          </div>

          {/* Balances*/}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Balances</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Bags</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Bags"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Condition</FieldLabel>
                  <Input
                    placeholder="Condition"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Gkg</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Gkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Nkg</FieldLabel>
                  <Input
                    type='number'
                    placeholder="Nkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* button */}
      <div className="flex-shrink-0 mt-[15px] flex justify-end gap-2.5">
        {isCreateMode && (
          <>
            <button
              className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer"
              onClick={() => navigate("/whse/management")}
            >
              Back
            </button>
            <button
              className="px-[18px] py-2 border-none bg-[#2d317f] text-white rounded-md cursor-pointer"
              onClick={handleSubmitCreate}
            >
              Submit
            </button>
          </>
        )}
        {isEditMode && (
          <>
            <button
              className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer"
              onClick={() => navigate("/whse/management")}
            >
              Cancel
            </button>
            <button
              className="px-[18px] py-2 border-none bg-[#2d317f] text-white rounded-md cursor-pointer"
              onClick={handleSubmitEdit}
            >
              Submit
            </button>
          </>
        )}
        {isViewMode && (
          <button
            className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer"
            onClick={() => navigate("/whse/management")}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}