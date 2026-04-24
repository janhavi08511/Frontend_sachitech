import { useEffect, useState } from "react";
import { X, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { getLmsFileUrl } from "../../../api/lmsApi";

interface Props {
  filename: string;   // just the filename, e.g. "1776346978149_resume.pdf"
  title: string;
  onClose: () => void;
}

/**
 * Fetches the PDF from the backend with the JWT Authorization header,
 * converts it to a blob URL, and renders it in an <iframe>.
 *
 * This avoids the browser's cross-origin / mixed-content block that
 * occurs when an <iframe src="http://..."> is loaded from a different origin.
 */
export function PdfViewerModal({ filename, title, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    let objectUrl: string | null = null;

    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const fileUrl = getLmsFileUrl(filename);
        
        // ✅ ADDED: Debug logging
        console.log("📄 Loading PDF:", {
          filename,
          fileUrl,
          hasToken: !!token,
        });

        const response = await fetch(
          fileUrl,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        // ✅ ADDED: Better error handling
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ PDF fetch failed:", {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          
          let errorMessage = `Server returned ${response.status}`;
          if (response.status === 401) {
            errorMessage = "Unauthorized - Please login again";
          } else if (response.status === 404) {
            errorMessage = "File not found - It may have been deleted";
          } else if (response.status === 500) {
            errorMessage = "Server error - Backend may not be running";
          }
          
          throw new Error(errorMessage);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        console.log("✅ PDF loaded successfully");
      } catch (e: any) {
        const errorMsg = e.message || "Failed to load PDF";
        console.error("❌ Error loading PDF:", errorMsg);
        setError(errorMsg);
        
        // ✅ ADDED: Debug info for troubleshooting
        setDebugInfo(`
File: ${filename}
Error: ${errorMsg}
Token: ${localStorage.getItem("token") ? "Present" : "Missing"}
Time: ${new Date().toLocaleTimeString()}
        `.trim());
      }
    };

    load();

    // Revoke the blob URL when the modal closes to free memory
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename]);

  const openInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-3 flex-shrink-0">
        <span className="font-medium text-sm truncate max-w-lg">{title}</span>
        <div className="flex items-center gap-3">
          {blobUrl && (
            <button
              onClick={openInNewTab}
              title="Open in new tab"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            title="Close"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-gray-800">
        {!blobUrl && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <p className="text-sm text-gray-300">Loading PDF…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-6">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div className="text-center">
              <p className="text-red-400 font-medium mb-2">Failed to load PDF</p>
              <p className="text-sm text-gray-400 mb-4">{error}</p>
              
              {/* ✅ ADDED: Debug info for troubleshooting */}
              <details className="text-left bg-gray-900 rounded p-3 text-xs text-gray-300 max-w-md">
                <summary className="cursor-pointer font-mono text-gray-400 hover:text-gray-300">
                  Debug Info
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-gray-400">
                  {debugInfo}
                </pre>
              </details>
              
              <p className="text-xs text-gray-500 mt-4">
                Troubleshooting: Check that the backend is running and the file was uploaded successfully.
              </p>
            </div>
          </div>
        )}

        {blobUrl && (
          <iframe
            src={blobUrl}
            className="w-full h-full border-0"
            title={title}
          />
        )}
      </div>
    </div>
  );
}
