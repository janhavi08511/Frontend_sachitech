import { useEffect, useRef, useState } from "react";
import {
  getMyContent,
  getMySubmissions,
  submitAssignment,
  type LmsContent,
  type LmsSubmission,
} from "../../../api/lmsApi";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { PdfViewerModal } from "./PdfViewerModal";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Upload,
  Eye,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";

type Tab = "assignments" | "notes" | "submissions";

export function StudentLMS() {
  const [activeTab, setActiveTab] = useState<Tab>("assignments");

  const [content, setContent] = useState<LmsContent[]>([]);
  const [submissions, setSubmissions] = useState<LmsSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit portal state
  const [submitting, setSubmitting] = useState<number | null>(null); // assignmentId
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [pdfViewer, setPdfViewer] = useState<{ filename: string; title: string } | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [contentRes, subRes] = await Promise.all([
        getMyContent(),
        getMySubmissions(),
      ]);
      setContent(contentRes.data);
      setSubmissions(subRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const assignments = content.filter((c) => c.type === "ASSIGNMENT");
  const notes = content.filter((c) => c.type === "NOTE");

  const getSubmissionForAssignment = (assignmentId: number) =>
    submissions.find((s) => s.assignment?.id === assignmentId);

  const handleSubmit = async (assignmentId: number) => {
    if (!submitFile) {
      alert("Please select a PDF file to submit.");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await submitAssignment(assignmentId, submitFile);
      // Optimistic update
      setSubmissions((prev) => {
        const existing = prev.findIndex((s) => s.assignment?.id === assignmentId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = res.data;
          return updated;
        }
        return [...prev, res.data];
      });
      setSubmitting(null);
      setSubmitFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      alert("Submission failed: " + (e.response?.data?.message || e.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  const submissionBadge = (sub?: LmsSubmission) => {
    if (!sub) return <Badge className="bg-gray-100 text-gray-600">Not Submitted</Badge>;
    if (sub.status === "EVALUATED")
      return <Badge className="bg-green-100 text-green-700">Evaluated · {sub.score ?? "—"} pts</Badge>;
    if (sub.status === "SUBMITTED")
      return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Learning</h2>
        <p className="text-gray-500 text-sm mt-1">
          Access your assignments and study materials for enrolled courses.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Assignments", value: assignments.length, icon: ClipboardList, color: "bg-orange-50 text-orange-600" },
          { label: "Notes", value: notes.length, icon: FileText, color: "bg-blue-50 text-blue-600" },
          { label: "Submitted", value: submissions.filter((s) => s.status !== "PENDING").length, icon: CheckCircle, color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(
          [
            { id: "assignments", label: "Assignments", icon: ClipboardList },
            { id: "notes", label: "Notes & Materials", icon: BookOpen },
            { id: "submissions", label: "My Submissions", icon: CheckCircle },
          ] as { id: Tab; label: string; icon: any }[]
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── ASSIGNMENTS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "assignments" && (
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <EmptyState icon={ClipboardList} message="No assignments available for your enrolled courses." />
          ) : (
            assignments.map((item) => {
              const sub = getSubmissionForAssignment(item.id);
              return (
                <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.course?.name || item.internship?.name} · {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                        {sub?.status === "EVALUATED" && sub.feedback && (
                          <p className="text-xs text-green-700 mt-1 italic">"{sub.feedback}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {submissionBadge(sub)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPdfViewer({ filename: item.fileUrl, title: item.title })}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      {sub?.status !== "EVALUATED" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => { setSubmitting(item.id); setSubmitFile(null); }}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {sub ? "Re-submit" : "Submit"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Submit portal */}
                  {submitting === item.id && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-3">
                      <div
                        className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => fileRef.current?.click()}
                      >
                        {submitFile ? (
                          <span className="text-sm text-gray-700 flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            {submitFile.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Click to select your PDF submission</span>
                        )}
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={submitLoading || !submitFile}
                        onClick={() => handleSubmit(item.id)}
                      >
                        {submitLoading ? "Uploading…" : "Submit"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSubmitting(null)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── NOTES TAB ───────────────────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <EmptyState icon={BookOpen} message="No study materials available for your enrolled courses." />
          ) : (
            notes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.course?.name || item.internship?.name} · {new Date(item.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPdfViewer({ filename: item.fileUrl, title: item.title })}
                >
                  <Eye className="w-4 h-4 mr-1" /> Open
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── SUBMISSIONS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "submissions" && (
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <EmptyState icon={CheckCircle} message="You haven't submitted any assignments yet." />
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sub.status === "EVALUATED" ? "bg-green-100" : "bg-blue-100"}`}>
                      {sub.status === "EVALUATED"
                        ? <Star className="w-5 h-5 text-green-600" />
                        : <Clock className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{sub.assignment?.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Submitted: {sub.submissionDate ? new Date(sub.submissionDate).toLocaleString() : "—"}
                      </p>
                      {sub.status === "EVALUATED" && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs font-semibold text-green-700">Score: {sub.score ?? "—"} / 100</p>
                          {sub.feedback && <p className="text-xs text-gray-500 italic">"{sub.feedback}"</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {submissionBadge(sub)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPdfViewer({ filename: sub.fileUrl, title: `My submission – ${sub.assignment?.title}` })}
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PDF VIEWER MODAL ───────────────────────────────────────────────── */}
      {pdfViewer && (
        <PdfViewerModal
          filename={pdfViewer.filename}
          title={pdfViewer.title}
          onClose={() => setPdfViewer(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <Icon className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
