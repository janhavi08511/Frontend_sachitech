import { X, ExternalLink } from "lucide-react";
import { Button } from "../../ui/button";

export function PdfViewerModal({ filename, title, onClose }: any) {

  // Cloudinary raw URLs are direct download links.
  // Embed via Google Docs viewer so they render in-browser on all devices.
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(filename)}&embedded=true`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-900 text-white flex-shrink-0">
        <span className="text-sm font-medium truncate max-w-[70%]">{title}</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-white border-white hover:bg-gray-700 text-xs"
            onClick={() => window.open(filename, "_blank")}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open in new tab
          </Button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF viewer via Google Docs */}
      <iframe
        src={viewerUrl}
        className="w-full flex-1 border-0"
        title={title}
        allow="autoplay"
      />

    </div>
  );
}
