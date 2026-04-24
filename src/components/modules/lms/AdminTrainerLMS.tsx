import { useEffect, useRef, useState } from "react";
import {
  getCourses,
  getInternships,
  uploadLmsContent,
  getContentByCourse,
  getAllSubmissions,
  evaluateSubmission,
  getTrainerCourses,
  getTrainerInternships,
  type LmsContent,
  type LmsSubmission,
} from "../../../api/lmsApi";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { PdfViewerModal } from "./PdfViewerModal";
import {
  Upload,
  FileText,
  ClipboardList,
  BookOpen,
  X,
  CheckCircle,
  Eye,
} from "lucide-react";
import { UserRole } from "../../../types";

interface Props {
  role: UserRole;
}

type Tab = "upload" | "content" | "evaluate";

export function AdminTrainerLMS({ role }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("content");

  // ── Courses / Internships ──────────────────────────────────────────────────
  const [courses, setCourses] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  // ── Upload form ────────────────────────────────────────────────────────────
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"ASSIGNMENT" | "NOTE">("ASSIGNMENT");
  const [uploadTarget, setUploadTarget] = useState<"course" | "internship">("course");
  const [uploadCourseId, setUploadCourseId] = useState<number | "">("");
  const [uploadInternshipId, setUploadInternshipId] = useState<number | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Content browser ────────────────────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [contentList, setContentList] = useState<LmsContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // ── Evaluation ─────────────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<LmsSubmission[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [evaluating, setEvaluating] = useState<number | null>(null);
  const [evalScore, setEvalScore] = useState<string>("");
  const [evalFeedback, setEvalFeedback] = useState("");
  const [pdfViewer, setPdfViewer] = useState<{ filename: string; title: string } | null>(null);

  useEffect(() => {
    // Both admin and trainer use the same endpoints now:
    // - trainer/courses returns ALL courses (backend fixed)
    // - admin uses /api/admin/courses
    // Use trainer endpoint for trainer, admin endpoint for admin
    const fetchCourses = role === "trainer" ? getTrainerCourses : getCourses;
    const fetchInternships = role === "trainer" ? getTrainerInternships : getInternships;

    fetchCourses()
      .then((r) => {
        const data = Array.isArray(r) ? r : (r.data || []);
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch((e) => { console.error("courses error:", e); setCourses([]); });

    fetchInternships()
      .then((r) => {
        const data = Array.isArray(r) ? r : (r.data || []);
        setInternships(Array.isArray(data) ? data : []);
      })
      .catch((e) => { console.error("internships error:", e); setInternships([]); });
  }, [role]);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      alert("Please fill in the title and select a PDF file.");
      return;
    }
    if (uploadTarget === "course" && !uploadCourseId) {
      alert("Please select a course.");
      return;
    }
    if (uploadTarget === "internship" && !uploadInternshipId) {
      alert("Please select an internship.");
      return;
    }

    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("title", uploadTitle.trim());
    fd.append("type", uploadType);
    if (uploadTarget === "course" && uploadCourseId) fd.append("courseId", String(uploadCourseId));
    if (uploadTarget === "internship" && uploadInternshipId) fd.append("internshipId", String(uploadInternshipId));

    setUploading(true);
    try {
      await uploadLmsContent(fd);
      setUploadSuccess(true);
      setUploadTitle("");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (e: any) {
      alert("Upload failed: " + (e.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  // ── Content browser ────────────────────────────────────────────────────────
  const loadContent = async () => {
    if (!selectedCourseId) return;
    setContentLoading(true);
    try {
      const res = await getContentByCourse(Number(selectedCourseId));
      // Handle both res.data and direct array response
      const data = Array.isArray(res) ? res : (res.data || []);
      setContentList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setContentList([]);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) loadContent();
  }, [selectedCourseId]);

  // ── Submissions — both admin and trainer see ALL submissions ─────────────
  useEffect(() => {
    if (activeTab === "evaluate") {
      setSubLoading(true);
      getAllSubmissions()
        .then((r) => {
          const data = Array.isArray(r) ? r : (r.data || []);
          setSubmissions(Array.isArray(data) ? data : []);
        })
        .catch((e) => { console.error(e); setSubmissions([]); })
        .finally(() => setSubLoading(false));
    }
  }, [activeTab]);

  const handleEvaluate = async (submissionId: number) => {
    const score = parseFloat(evalScore);
    if (isNaN(score)) {
      alert("Please enter a valid score.");
      return;
    }
    try {
      const res = await evaluateSubmission(submissionId, score, evalFeedback);
      const updatedSubmission = Array.isArray(res) ? res[0] : (res.data || res);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? updatedSubmission : s))
      );
      setEvaluating(null);
      setEvalScore("");
      setEvalFeedback("");
    } catch (e: any) {
      alert("Evaluation failed: " + (e.response?.data?.message || e.message));
    }
  };

  const statusBadge = (status: string) => {
    if (status === "EVALUATED")
      return <Badge className="bg-green-100 text-green-700">Evaluated</Badge>;
    if (status === "SUBMITTED")
      return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Learning Management System</h2>
        <p className="text-gray-500 text-sm mt-1">Upload content, browse materials, and evaluate student submissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(
          [
            { id: "content", label: "Content Browser", icon: BookOpen },
            { id: "upload", label: "Upload Content", icon: Upload },
            { id: "evaluate", label: "Evaluate Submissions", icon: ClipboardList },
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

      {/* ── UPLOAD TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "upload" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-lg">Upload PDF Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <CheckCircle className="w-4 h-4" />
                Content uploaded successfully!
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
              <Input
                placeholder="e.g. Week 3 Assignment – React Hooks"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Content Type *</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as "ASSIGNMENT" | "NOTE")}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="NOTE">Note / Study Material</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Target *</label>
                <select
                  value={uploadTarget}
                  onChange={(e) => setUploadTarget(e.target.value as "course" | "internship")}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="course">Course</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            {uploadTarget === "course" ? (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Select Course *</label>
                <select
                  value={uploadCourseId}
                  onChange={(e) => setUploadCourseId(Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Select Internship *</label>
                <select
                  value={uploadInternshipId}
                  onChange={(e) => setUploadInternshipId(Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose an internship --</option>
                  {internships.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">PDF File *</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{uploadFile.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-red-400 hover:text-red-600 ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Click to select a PDF (max 20 MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? "Uploading…" : "Upload Content"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── CONTENT BROWSER TAB ────────────────────────────────────────────── */}
      {activeTab === "content" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            >
              <option value="">-- Select a course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={loadContent} disabled={!selectedCourseId}>
              Refresh
            </Button>
          </div>

          {contentLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg" />
              ))}
            </div>
          ) : contentList.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{selectedCourseId ? "No content uploaded for this course yet." : "Select a course to view content."}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {contentList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === "ASSIGNMENT" ? "bg-orange-100" : "bg-blue-100"}`}>
                      {item.type === "ASSIGNMENT"
                        ? <ClipboardList className="w-5 h-5 text-orange-600" />
                        : <FileText className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-400">
                        {item.type} · {item.course?.name || item.internship?.name} · {new Date(item.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={item.type === "ASSIGNMENT" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
                      {item.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPdfViewer({ filename: item.fileUrl, title: item.title })}
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EVALUATE TAB ───────────────────────────────────────────────────── */}
      {activeTab === "evaluate" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""} found.
          </p>

          {subLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{sub.assignment?.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Student: <span className="font-medium">{sub.student?.user?.name || "—"}</span>
                        {" · "}Submitted: {sub.submissionDate ? new Date(sub.submissionDate).toLocaleString() : "—"}
                      </p>
                      {sub.status === "EVALUATED" && (
                        <p className="text-xs text-green-700 mt-1">
                          Score: <strong>{sub.score}</strong>
                          {sub.feedback && <> · Feedback: {sub.feedback}</>}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {statusBadge(sub.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPdfViewer({ filename: sub.fileUrl, title: `${sub.student?.user?.name} – ${sub.assignment?.title}` })}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View PDF
                      </Button>
                      {sub.status !== "EVALUATED" && (
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => { setEvaluating(sub.id); setEvalScore(String(sub.score || "")); setEvalFeedback(sub.feedback || ""); }}
                        >
                          Grade
                        </Button>
                      )}
                      {sub.status === "EVALUATED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEvaluating(sub.id); setEvalScore(String(sub.score || "")); setEvalFeedback(sub.feedback || ""); }}
                        >
                          Re-grade
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Inline grading panel */}
                  {evaluating === sub.id && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Score</label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0–100"
                          value={evalScore}
                          onChange={(e) => setEvalScore(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-600 block mb-1">Feedback</label>
                        <Textarea
                          placeholder="Write feedback for the student…"
                          value={evalFeedback}
                          onChange={(e) => setEvalFeedback(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-3 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleEvaluate(sub.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Save Evaluation
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEvaluating(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
