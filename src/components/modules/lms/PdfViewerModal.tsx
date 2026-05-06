import { X } from "lucide-react";

export function PdfViewerModal({ filename, title, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">

      <div className="flex justify-between p-3 text-white bg-gray-900">
        <span>{title}</span>
        <button onClick={onClose}><X /></button>
      </div>

      <iframe src={filename} className="w-full h-full" />

    </div>
  );
}