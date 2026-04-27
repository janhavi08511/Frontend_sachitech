import { useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface Props {
  filename: string;
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
      
      {/* Header */}
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

      {/* Viewer */}
      <div className="flex-1 bg-gray-800">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white gap-4">
            <p>Failed to load PDF</p>
            <button
              onClick={openInNewTab}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              Open in new tab
            </button>
          </div>
        ) : (
          <iframe
            src={filename}
            className="w-full h-full"
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}