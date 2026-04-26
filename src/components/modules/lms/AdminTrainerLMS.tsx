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

  const [courses, setCourses] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"ASSIGNMENT" | "NOTE">("ASSIGNMENT");
  const [uploadTarget, setUploadTarget] = useState<"course" | "internship">("course");
  const [uploadCourseId, setUploadCourseId] = useState<number | "">("");
  const [uploadInternshipId, setUploadInternshipId] = useState<number | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [contentList, setContentList] = useState<LmsContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  const [submissions, setSubmissions] = useState<LmsSubmission[]>([]);
  const [subLoading, setSubLoading] = useState(false);

  const [evaluating, setEvaluating] = useState<number | null>(null);
  const [evalScore, setEvalScore] = useState("");
  const [evalFeedback, setEvalFeedback] = useState("");

  const [pdfViewer, setPdfViewer] = useState<{ filename: string; title: string } | null>(null);

  // ─────────────────────────────────────────────
  // LOAD COURSES & INTERNSHIPS
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchCourses = role === "trainer" ? getTrainerCourses : getCourses;
    const fetchInternships = role === "trainer" ? getTrainerInternships : getInternships;

    fetchCourses()
      .then((r) => {
        const data = Array.isArray(r) ? r : r.data;
        setCourses(data || []);
      })
      .catch(() => setCourses([]));

    fetchInternships()
      .then((r) => {
        const data = Array.isArray(r) ? r : r.data;
        setInternships(data || []);
      })
      .catch(() => setInternships([]));
  }, [role]);

  // ─────────────────────────────────────────────
  // UPLOAD
  // ─────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      alert("Fill all fields");
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

      setUploadSuccess(true);
      setUploadTitle("");
      setUploadFile(null);

      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ─────────────────────────────────────────────
  // LOAD CONTENT
  // ─────────────────────────────────────────────
  const loadContent = async () => {
    if (!selectedCourseId) return;

    setContentLoading(true);
    try {
      const res = await getContentByCourse(Number(selectedCourseId));
      setContentList(Array.isArray(res) ? res : res.data || []);
    } catch {
      setContentList([]);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) loadContent();
  }, [selectedCourseId]);

  // ─────────────────────────────────────────────
  // LOAD SUBMISSIONS
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "evaluate") {
      setSubLoading(true);

      getAllSubmissions()
        .then((r) => {
          setSubmissions(Array.isArray(r) ? r : r.data || []);
        })
        .finally(() => setSubLoading(false));
    }
  }, [activeTab]);

  // ─────────────────────────────────────────────
  // EVALUATE
  // ─────────────────────────────────────────────
  const handleEvaluate = async (id: number) => {
    const score = parseFloat(evalScore);
    if (isNaN(score)) return alert("Invalid score");

    try {
      const res = await evaluateSubmission(id, score, evalFeedback);
      const updated = Array.isArray(res) ? res[0] : res.data;

      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );

      setEvaluating(null);
    } catch {
      alert("Failed");
    }
  };

  // ─────────────────────────────────────────────
  // SAFE PDF OPEN
  // ─────────────────────────────────────────────
  const openPdf = (url: string, title: string) => {
    if (!url || !url.startsWith("http")) {
      alert("Invalid file");
      return;
    }

    setPdfViewer({ filename: url, title });
  };

  // ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <h2 className="text-xl font-bold">LMS</h2>

      {/* TABS */}
      <div className="flex gap-4">
        <Button onClick={() => setActiveTab("content")}>Content</Button>
        <Button onClick={() => setActiveTab("upload")}>Upload</Button>
        <Button onClick={() => setActiveTab("evaluate")}>Evaluate</Button>
      </div>

      {/* CONTENT */}
      {activeTab === "content" && (
        <>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
          >
            <option>Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {contentList.map((c) => (
            <div key={c.id} className="flex justify-between">
              <span>{c.title}</span>
              <Button onClick={() => openPdf(c.fileUrl, c.title)}>
                View
              </Button>
            </div>
          ))}
        </>
      )}

      {/* UPLOAD */}
      {activeTab === "upload" && (
        <div>
          <Input
            placeholder="Title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />

          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />

          <Button onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}

      {/* EVALUATE */}
      {activeTab === "evaluate" && (
        <>
          {submissions.map((s) => (
            <div key={s.id}>
              <p>{s.assignment.title}</p>

              <Button onClick={() => openPdf(s.fileUrl, "Submission")}>
                View PDF
              </Button>

              <Input
                placeholder="Score"
                value={evalScore}
                onChange={(e) => setEvalScore(e.target.value)}
              />

              <Textarea
                placeholder="Feedback"
                value={evalFeedback}
                onChange={(e) => setEvalFeedback(e.target.value)}
              />

              <Button onClick={() => handleEvaluate(s.id)}>
                Save
              </Button>
            </div>
          ))}
        </>
      )}

      {/* PDF MODAL */}
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
