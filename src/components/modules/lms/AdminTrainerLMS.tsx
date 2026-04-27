import { useEffect, useRef, useState } from "react";
import {
  getCourses,
  getInternships,
  uploadLmsContent,
  getContentByCourse,
  getTrainerCourses,
} from "../../../api/lmsApi";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { PdfViewerModal } from "./PdfViewerModal";

type Tab = "content" | "upload";

export function AdminTrainerLMS({ role }: any) {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [contentList, setContentList] = useState<any[]>([]);
  const [pdfViewer, setPdfViewer] = useState<any>(null);

  // ✅ LOAD COURSES + INTERNSHIPS
  useEffect(() => {
    const fetch = role === "trainer" ? getTrainerCourses : getCourses;
    fetch().then((r) => setCourses(r.data || r));
    getInternships().then((r) => setInternships(r.data || r));
  }, [role]);

  // ✅ LOAD CONTENT FUNCTION (FIXED POSITION)
  const loadContent = async () => {
    if (!selectedCourseId) return;

    try {
      const res = await getContentByCourse(selectedCourseId);
      setContentList(res.data || res);
    } catch (e) {
      console.error(e);
      alert("Failed to load content");
    }
  };

  // ✅ AUTO LOAD WHEN COURSE CHANGES
  useEffect(() => {
    if (selectedCourseId) {
      loadContent();
    }
  }, [selectedCourseId]);

  // ✅ UPLOAD
  const handleUpload = async () => {
    if (!uploadTitle || !uploadFile) return alert("Fill all fields");

    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("title", uploadTitle);
    fd.append("type", uploadType);
    fd.append("target", uploadTarget);

    if (uploadTarget === "course") {
      fd.append("courseId", String(uploadCourseId));
    } else {
      fd.append("internshipId", String(uploadInternshipId));
    }

    setUploading(true);
    await uploadLmsContent(fd);
    setUploading(false);

    alert("Uploaded successfully");

    // 🔥 reload content after upload
    loadContent();
  };

  const openPdf = (url: string, title: string) => {
    setPdfViewer({ filename: url, title });
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold">Learning Management System</h2>
        <p className="text-sm opacity-80">Upload, browse and manage content</p>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        <Button onClick={() => setActiveTab("content")}>Content</Button>
        <Button onClick={() => setActiveTab("upload")}>Upload</Button>
      </div>

      {/* ================= CONTENT ================= */}
      {activeTab === "content" && (
        <div className="space-y-4">

          {/* SELECT COURSE */}
          <div className="flex gap-3 items-center">
            <select
              className="border p-2 rounded"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <Button onClick={loadContent}>Refresh</Button>
          </div>

          {/* CONTENT LIST */}
          {contentList.length === 0 ? (
            <p className="text-gray-400">No content found</p>
          ) : (
            contentList.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.type}</p>
                </div>
                <Button onClick={() => openPdf(c.fileUrl, c.title)}>
                  View
                </Button>
              </div>
            ))
          )}

        </div>
      )}

      {/* ================= UPLOAD ================= */}
      {activeTab === "upload" && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow space-y-6">

          <h3 className="text-lg font-semibold">Upload PDF Content</h3>

          {/* TITLE */}
          <div>
            <label>Title *</label>
            <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
          </div>

          {/* TYPE + TARGET */}
          <div className="grid grid-cols-2 gap-4">
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value as any)}>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="NOTE">Notes</option>
            </select>

            <select value={uploadTarget} onChange={(e) => setUploadTarget(e.target.value as any)}>
              <option value="course">Course</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          {/* SELECT COURSE / INTERNSHIP */}
          {uploadTarget === "course" ? (
            <select onChange={(e) => setUploadCourseId(Number(e.target.value))}>
              <option>Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <select onChange={(e) => setUploadInternshipId(Number(e.target.value))}>
              <option>Select Internship</option>
              {internships.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          )}

          {/* FILE */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-dashed border-2 p-6 text-center rounded-xl cursor-pointer"
          >
            {uploadFile ? uploadFile.name : "Click to upload PDF"}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />

          <Button onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>

        </div>
      )}

      {/* PDF VIEWER */}
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