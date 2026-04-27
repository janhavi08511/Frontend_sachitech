import { useEffect, useRef, useState } from "react";
import {
  getCourses,
  uploadLmsContent,
  getContentByCourse,
  getAllSubmissions,
  evaluateSubmission,
  getTrainerCourses,
} from "../../../api/lmsApi";

import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { PdfViewerModal } from "./PdfViewerModal";

type Tab = "content" | "upload" | "evaluate";

export function AdminTrainerLMS({ role }: any) {
  const [activeTab, setActiveTab] = useState<Tab>("content");

  const [courses, setCourses] = useState<any[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCourseId, setUploadCourseId] = useState<number | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [contentList, setContentList] = useState<any[]>([]);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pdfViewer, setPdfViewer] = useState<any>(null);

  useEffect(() => {
    const fetch = role === "trainer" ? getTrainerCourses : getCourses;
    fetch().then((r) => setCourses(r.data || r));
  }, []);

  const handleUpload = async () => {
    const fd = new FormData();
    fd.append("file", uploadFile!);
    fd.append("title", uploadTitle);
    fd.append("courseId", String(uploadCourseId));

    setUploading(true);
    await uploadLmsContent(fd);
    setUploading(false);
  };

  return (
    <div className="space-y-6">

      {/* PREMIUM HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow">
        <h2 className="text-2xl font-bold">Learning Management System</h2>
        <p className="text-sm opacity-80">Upload, manage and evaluate content</p>
      </div>

      {/* TABS */}
      <div className="flex gap-3 bg-white p-2 rounded-xl shadow w-fit">
        {["content", "upload", "evaluate"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {activeTab === "content" && (
        <div className="grid gap-4">
          {contentList.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
              <p>{c.title}</p>
              <Button onClick={() => setPdfViewer({ filename: c.fileUrl, title: c.title })}>
                View
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD */}
      {activeTab === "upload" && (
        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">

            <Input
              placeholder="Title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />

            <select
              className="border p-2 rounded"
              onChange={(e) => setUploadCourseId(Number(e.target.value))}
            >
              <option>Select Course</option>
              {courses.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-dashed border-2 p-8 text-center rounded-xl cursor-pointer"
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

          </CardContent>
        </Card>
      )}

      {/* PDF */}
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