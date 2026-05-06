import { useEffect, useRef, useState } from "react";
import {
  getCourses,
  getInternships,
  uploadLmsContent,
  getContentByCourse,
  getTrainerCourses,
  getAllSubmissions,
  getTrainerSubmissions,
  evaluateSubmission,
} from "../../../api/lmsApi";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import {
  Upload,
  Eye,
  BookOpen,
  ClipboardList,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react";

type Tab = "content" | "upload" | "submissions";

export function AdminTrainerLMS({ role }: { role: string }) {

  // ── TABS ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("content");

  // ── DATA ──────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // ── CONTENT TAB ───────────────────────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");

  // ── UPLOAD TAB ────────────────────────────────────────────────────────────
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"ASSIGNMENT" | "NOTE">("ASSIGNMENT");
  const [uploadTarget, setUploadTarget] = useState<"course" | "internship">("course");
  const [uploadCourseId, setUploadCourseId] = useState<number | "">("");
  const [uploadInternshipId, setUploadInternshipId] = useState<number | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── GRADE INLINE FORM ─────────────────────────────────────────────────────
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [grading, setGrading] = useState(false);

  // ── INITIAL LOAD ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const courseRes = role === "trainer" ? await getTrainerCourses() : await getCourses();
        setCourses(courseRes.data || courseRes);

        const intRes = await getInternships();
        setInternships(intRes.data || intRes);

        await loadSubmissions();
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [role]);

  // ── LOAD CONTENT ──────────────────────────────────────────────────────────
  const loadContent = async () => {
    if (!selectedCourseId) return;
    try {
      const res = await getContentByCourse(selectedCourseId as number);
      setContentList(res.data || res);
    } catch {
      toast.error("Failed to load content");
    }
  };

  useEffect(() => {
    if (selectedCourseId) loadContent();
  }, [selectedCourseId]);

  // ── LOAD SUBMISSIONS ──────────────────────────────────────────────────────
  const loadSubmissions = async () => {
    try {
      const res = role === "trainer"
        ? await getTrainerSubmissions()
        : await getAllSubmissions();
      setSubmissions(res.data || res);
    } catch (e) {
      console.error(e);
    }
  };

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadTitle.trim() || !uploadFile) {
      toast.error("Please fill all fields and select a file");
      return;
    }
    if (uploadTarget === "course" && !uploadCourseId) {
      toast.error("Please select a course");
      return;
    }
    if (uploadTarget === "internship" && !uploadInternshipId) {
      toast.error("Please select an internship");
      return;
    }

    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("title", uploadTitle);
    fd.append("type", uploadType);
    if (uploadTarget === "course") fd.append("courseId", String(uploadCourseId));
    else fd.append("internshipId", String(uploadInternshipId));

    setUploading(true);
    try {
      await uploadLmsContent(fd);
      toast.success("Content uploaded successfully");
      setUploadTitle("");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (selectedCourseId) await loadContent();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── GRADE ─────────────────────────────────────────────────────────────────
  const handleGrade = async (submissionId: number) => {
    const score = parseFloat(gradeScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Enter a valid score between 0 and 100");
      return;
    }
    setGrading(true);
    try {
      await evaluateSubmission(submissionId, score, gradeFeedback);
      toast.success("Evaluation saved");
      setGradingId(null);
      setGradeScore("");
      setGradeFeedback("");
      await loadSubmissions();
    } catch {
      toast.error("Evaluation failed");
    } finally {
      setGrading(false);
    }
  };

  const openPdf = (url: string) => window.open(url, "_blank");

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold">Learning Management System</h2>
        <p className="text-sm opacity-80">Upload, manage and evaluate LMS content</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b">
        {([
          { id: "content", label: "Content", icon: BookOpen },
          { id: "upload", label: "Upload", icon: Upload },
          { id: "submissions", label: "Submissions", icon: ClipboardList },
        ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
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

      {/* ── CONTENT TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "content" && (
        <div className="space-y-5">

          <div className="flex gap-3 flex-wrap items-center">
            <select
              className="border rounded-lg p-2.5 text-sm"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={loadContent}>Refresh</Button>
          </div>

          {contentList.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow text-gray-400">
              {selectedCourseId ? "No content found for this course" : "Select a course to view content"}
            </div>
          ) : (
            <div className="space-y-3">
              {contentList.map((c) => (
                <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{c.title}</p>
                    <Badge className={c.type === "ASSIGNMENT" ? "bg-orange-100 text-orange-700 mt-1" : "bg-blue-100 text-blue-700 mt-1"}>
                      {c.type}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openPdf(c.fileUrl)}>
                    <Eye className="w-4 h-4 mr-1" /> View File
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── UPLOAD TAB ──────────────────────────────────────────────────────── */}
      {activeTab === "upload" && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4 max-w-xl">

          <Input
            placeholder="Title *"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />

          <select
            className="border rounded-lg p-2.5 w-full text-sm"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as any)}
          >
            <option value="ASSIGNMENT">Assignment</option>
            <option value="NOTE">Notes / Material</option>
          </select>

          <select
            className="border rounded-lg p-2.5 w-full text-sm"
            value={uploadTarget}
            onChange={(e) => setUploadTarget(e.target.value as any)}
          >
            <option value="course">Course</option>
            <option value="internship">Internship</option>
          </select>

          {uploadTarget === "course" && (
            <select
              className="border rounded-lg p-2.5 w-full text-sm"
              value={uploadCourseId}
              onChange={(e) => setUploadCourseId(Number(e.target.value))}
            >
              <option value="">Select Course *</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {uploadTarget === "internship" && (
            <select
              className="border rounded-lg p-2.5 w-full text-sm"
              value={uploadInternshipId}
              onChange={(e) => setUploadInternshipId(Number(e.target.value))}
            >
              <option value="">Select Internship *</option>
              {internships.map((i) => (
                <option key={i.id} value={i.id}>{i.name || i.title}</option>
              ))}
            </select>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition text-sm text-gray-500"
          >
            {uploadFile ? (
              <span className="text-gray-800 font-medium">{uploadFile.name}</span>
            ) : (
              "Click to select PDF / file"
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleUpload}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Content"}
          </Button>
        </div>
      )}

      {/* ── SUBMISSIONS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow text-gray-400">
              No submissions found
            </div>
          ) : (
            submissions.map((s) => (
              <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm space-y-3">

                {/* Submission info row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      s.status === "EVALUATED" ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      {s.status === "EVALUATED"
                        ? <Star className="w-5 h-5 text-green-600" />
                        : <Clock className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {s.studentName || "Student"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.assignmentTitle || "Assignment"} · {s.courseName || ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        Submitted: {s.submissionDate ? new Date(s.submissionDate).toLocaleString() : "—"}
                      </p>
                      {s.status === "EVALUATED" && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs font-semibold text-green-700">Score: {s.score ?? "—"} / 100</p>
                          {s.feedback && <p className="text-xs text-gray-500 italic">"{s.feedback}"</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={
                      s.status === "EVALUATED"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }>
                      {s.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => openPdf(s.fileUrl)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    {s.status !== "EVALUATED" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          setGradingId(s.id);
                          setGradeScore("");
                          setGradeFeedback("");
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Grade
                      </Button>
                    )}
                  </div>
                </div>

                {/* Inline grade form */}
                {gradingId === s.id && (
                  <div className="border-t pt-4 flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 font-medium">Score (0–100)</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="e.g. 85"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                      <label className="text-xs text-gray-500 font-medium">Feedback (optional)</label>
                      <Input
                        placeholder="Great work! ..."
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={grading}
                      onClick={() => handleGrade(s.id)}
                    >
                      {grading ? "Saving..." : "Save Grade"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGradingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
