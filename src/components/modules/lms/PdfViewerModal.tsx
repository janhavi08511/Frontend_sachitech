import { useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface Props {
  filename: string; // NOW this is actually a FULL URL
  title: string;
  onClose: () => void;
}

export function PdfViewerModal({ filename, title, onClose }: Props) {
  const [error, setError] = useState(false);

  const openInNewTab = () => {
    window.open(filename, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-3">
        <span className="text-sm truncate max-w-lg">{title}</span>

        <div className="flex gap-3">
          <button onClick={openInNewTab}>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-800">
        {error ? (
          <div className="flex items-center justify-center h-full text-white">
            Failed to load PDF
          </div>
        ) : (
          <iframe
            src={filename} // ✅ DIRECT CLOUDINARY URL
            className="w-full h-full"
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}