// FULL CLEAN FILE

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

import { Card, CardContent } from "../../ui/card";
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
  Eye,
  CheckCircle,
} from "lucide-react";

import { UserRole } from "../../../types";

interface Props {
  role: UserRole;
}

type Tab = "content" | "upload" | "evaluate";

export function AdminTrainerLMS({ role }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("content");

  const [courses, setCourses] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"ASSIGNMENT" | "NOTE">("ASSIGNMENT");
  const [uploadCourseId, setUploadCourseId] = useState<number | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [contentList, setContentList] = useState<LmsContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  const [submissions, setSubmissions] = useState<LmsSubmission[]>([]);
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);
  const [evalScore, setEvalScore] = useState("");
  const [evalFeedback, setEvalFeedback] = useState("");

  const [pdfViewer, setPdfViewer] = useState<any>(null);

  useEffect(() => {
    const fetchCourses = role === "trainer" ? getTrainerCourses : getCourses;
    fetchCourses().then((r) => setCourses(Array.isArray(r) ? r : r.data));
  }, [role]);

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadCourseId) return alert("Fill all fields");

    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("title", uploadTitle);
    fd.append("type", uploadType);
    fd.append("courseId", String(uploadCourseId));

    setUploading(true);
    try {
      await uploadLmsContent(fd);
      setUploadSuccess(true);
      setUploadTitle("");
      setUploadFile(null);
    } finally {
      setUploading(false);
    }
  };

  const loadContent = async () => {
    if (!selectedCourseId) return;
    setContentLoading(true);
    const res = await getContentByCourse(Number(selectedCourseId));
    setContentList(Array.isArray(res) ? res : res.data);
    setContentLoading(false);
  };

  useEffect(() => {
    if (selectedCourseId) loadContent();
  }, [selectedCourseId]);

  useEffect(() => {
    if (activeTab === "evaluate") {
      getAllSubmissions().then((r) =>
        setSubmissions(Array.isArray(r) ? r : r.data)
      );
    }
  }, [activeTab]);

  const openPdf = (url: string, title: string) => {
    setPdfViewer({ filename: url, title });
  };

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">LMS</h2>

      <div className="flex gap-3">
        <Button onClick={() => setActiveTab("content")}>Content</Button>
        <Button onClick={() => setActiveTab("upload")}>Upload</Button>
        <Button onClick={() => setActiveTab("evaluate")}>Evaluate</Button>
      </div>

      {/* CONTENT */}
      {activeTab === "content" && (
        <div>
          <select onChange={(e) => setSelectedCourseId(Number(e.target.value))}>
            <option>Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {contentList.map((c) => (
            <div key={c.id} className="flex justify-between p-3 border">
              <span>{c.title}</span>
              <Button onClick={() => openPdf(c.fileUrl, c.title)}>View</Button>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD */}
      {activeTab === "upload" && (
        <div className="max-w-xl">
          <Input placeholder="Title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />

          <select onChange={(e) => setUploadCourseId(Number(e.target.value))}>
            <option>Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />

          <Button onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>

          {uploadSuccess && <p className="text-green-600">Uploaded!</p>}
        </div>
      )}

      {/* EVALUATE */}
      {activeTab === "evaluate" && (
        <div>
          {submissions.map((s) => (
            <div key={s.id} className="border p-3">
              <p>{s.studentName}</p>
              <Button onClick={() => openPdf(s.fileUrl, "Submission")}>View</Button>

              <Input placeholder="Score" onChange={(e) => setEvalScore(e.target.value)} />
              <Textarea placeholder="Feedback" onChange={(e) => setEvalFeedback(e.target.value)} />

              <Button onClick={() => evaluateSubmission(s.id, Number(evalScore), evalFeedback)}>
                Submit
              </Button>
            </div>
          ))}
        </div>
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