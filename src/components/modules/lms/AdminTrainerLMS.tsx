import { useEffect, useRef, useState } from "react";

import {
  getCourses,
  getInternships,
  uploadLmsContent,
  getContentByCourse,
  getTrainerCourses,
  getAllSubmissions,
  evaluateSubmission,
  submitAssignment
} from "../../../api/lmsApi";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

type Tab = "content" | "upload" | "submissions";

export function AdminTrainerLMS({ role }: any) {

  // ================= STATES =================

  const [activeTab, setActiveTab] =
    useState<Tab>("content");

  const [courses, setCourses] =
    useState<any[]>([]);

  const [internships, setInternships] =
    useState<any[]>([]);

  const [contentList, setContentList] =
    useState<any[]>([]);

  const [submissions, setSubmissions] =
    useState<any[]>([]);

  const [selectedCourseId, setSelectedCourseId] =
    useState<number | "">("");

  // ================= PDF =================

  const [pdfViewer, setPdfViewer] =
    useState<any>(null);

  // ================= UPLOAD =================

  const [uploadTitle, setUploadTitle] =
    useState("");

  const [uploadType, setUploadType] =
    useState<"ASSIGNMENT" | "NOTE">("ASSIGNMENT");

  const [uploadTarget, setUploadTarget] =
    useState<"course" | "internship">("course");

  const [uploadCourseId, setUploadCourseId] =
    useState<number | "">("");

  const [uploadInternshipId, setUploadInternshipId] =
    useState<number | "">("");

  const [uploadFile, setUploadFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // ================= STUDENT SUBMISSION =================

  const [submissionFile, setSubmissionFile] =
    useState<File | null>(null);

  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState<number | "">("");

  const [submittingAssignment, setSubmittingAssignment] =
    useState(false);

  const submissionInputRef =
    useRef<HTMLInputElement>(null);

  // ================= INITIAL LOAD =================

  useEffect(() => {

    const fetchData = async () => {

      try {

        const courseApi =
          role === "trainer"
            ? getTrainerCourses
            : getCourses;

        const coursesRes =
          await courseApi();

        setCourses(
          coursesRes.data || coursesRes
        );

        const internshipRes =
          await getInternships();

        setInternships(
          internshipRes.data || internshipRes
        );

        await loadSubmissions();

      } catch (e) {

        console.error(e);
      }
    };

    fetchData();

  }, [role]);

  // ================= LOAD CONTENT =================

  const loadContent = async () => {

    if (!selectedCourseId) return;

    try {

      const res =
        await getContentByCourse(selectedCourseId);

      setContentList(res.data || res);

    } catch (e) {

      console.error(e);

      alert("Failed to load content");
    }
  };

  useEffect(() => {

    if (selectedCourseId) {
      loadContent();
    }

  }, [selectedCourseId]);

  // ================= LOAD SUBMISSIONS =================

  const loadSubmissions = async () => {

    try {

      const res =
        await getAllSubmissions();

      setSubmissions(res.data || res);

    } catch (e) {

      console.error(e);
    }
  };

  // ================= CONTENT UPLOAD =================

  const handleUpload = async () => {

    if (!uploadTitle || !uploadFile) {

      return alert("Fill all fields");
    }

    try {

      const fd = new FormData();

      fd.append("file", uploadFile);

      fd.append("title", uploadTitle);

      fd.append("type", uploadType);

      fd.append("target", uploadTarget);

      if (uploadTarget === "course") {

        fd.append(
          "courseId",
          String(uploadCourseId)
        );

      } else {

        fd.append(
          "internshipId",
          String(uploadInternshipId)
        );
      }

      setUploading(true);

      await uploadLmsContent(fd);

      alert("Uploaded successfully");

      setUploadTitle("");

      setUploadFile(null);

      await loadContent();

    } catch (e) {

      console.error(e);

      alert("Upload failed");

    } finally {

      setUploading(false);
    }
  };

  // ================= STUDENT SUBMIT =================

  const handleAssignmentSubmit =
    async () => {

      if (!submissionFile ||
          !selectedAssignmentId) {

        return alert(
          "Select assignment and file"
        );
      }

      try {

        const fd = new FormData();

        fd.append(
          "file",
          submissionFile
        );

        fd.append(
          "assignmentId",
          String(selectedAssignmentId)
        );

        setSubmittingAssignment(true);

        await submitAssignment(fd);

        alert("Assignment submitted");

        setSubmissionFile(null);

        await loadSubmissions();

      } catch (e) {

        console.error(e);

        alert("Submission failed");

      } finally {

        setSubmittingAssignment(false);
      }
    };

  // ================= GRADE =================

  const handleGrade =
    async (submission: any) => {

      const score =
        prompt("Enter score");

      if (!score) return;

      const feedback =
        prompt("Enter feedback") || "";

      try {

        await evaluateSubmission(
          submission.id,
          Number(score),
          feedback
        );

        alert("Evaluation completed");

        await loadSubmissions();

      } catch (e) {

        console.error(e);

        alert("Evaluation failed");
      }
    };

  // ================= PDF =================

  const openPdf =
    (url: string) => {

      window.open(url, "_blank");
    };

  // ================= UI =================

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">

        <h2 className="text-2xl font-bold">
          Learning Management System
        </h2>

        <p className="text-sm opacity-80">
          Upload, manage and evaluate assignments
        </p>

      </div>

      {/* TABS */}

      <div className="flex gap-3">

        <Button
          onClick={() =>
            setActiveTab("content")
          }
        >
          Content
        </Button>

        {(role === "admin" ||
          role === "trainer") && (

          <Button
            onClick={() =>
              setActiveTab("upload")
            }
          >
            Upload
          </Button>
        )}

        <Button
          onClick={() =>
            setActiveTab("submissions")
          }
        >
          Submissions
        </Button>

      </div>

      {/* ================= CONTENT ================= */}

      {activeTab === "content" && (

        <div className="space-y-4">

          {/* COURSE */}

          <div className="flex gap-3">

            <select
              className="border p-2 rounded"
              value={selectedCourseId}
              onChange={(e) =>
                setSelectedCourseId(
                  Number(e.target.value)
                )
              }
            >

              <option value="">
                Select Course
              </option>

              {courses.map((c) => (

                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </option>

              ))}

            </select>

            <Button
              onClick={loadContent}
            >
              Refresh
            </Button>

          </div>

          {/* CONTENT LIST */}

          {contentList.length === 0 ? (

            <p className="text-gray-400">
              No content found
            </p>

          ) : (

            contentList.map((c) => (

              <div
                key={c.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between"
              >

                <div>

                  <p className="font-semibold">
                    {c.title}
                  </p>

                  <p className="text-xs text-gray-400">
                    {c.type}
                  </p>

                </div>

                <div className="flex gap-2">

                  <Button
                    onClick={() =>
                      openPdf(c.fileUrl)
                    }
                  >
                    View
                  </Button>

                  {/* STUDENT SUBMIT */}

                  {role === "student" &&
                    c.type === "ASSIGNMENT" && (

                    <Button
                      variant="outline"
                      onClick={() =>
                        setSelectedAssignmentId(c.id)
                      }
                    >
                      Submit
                    </Button>

                  )}

                </div>

              </div>

            ))

          )}

          {/* STUDENT FILE SUBMIT */}

          {role === "student" &&
            selectedAssignmentId && (

            <div className="bg-white p-5 rounded-2xl shadow space-y-4">

              <h3 className="font-semibold">
                Submit Assignment
              </h3>

              <div
                onClick={() =>
                  submissionInputRef.current?.click()
                }
                className="border-dashed border-2 p-6 rounded-xl cursor-pointer text-center"
              >

                {submissionFile
                  ? submissionFile.name
                  : "Click to upload assignment"}

              </div>

              <input
                ref={submissionInputRef}
                type="file"
                className="hidden"
                onChange={(e) =>
                  setSubmissionFile(
                    e.target.files?.[0] || null
                  )
                }
              />

              <Button
                onClick={handleAssignmentSubmit}
              >

                {submittingAssignment
                  ? "Submitting..."
                  : "Submit Assignment"}

              </Button>

            </div>

          )}

        </div>

      )}

      {/* ================= UPLOAD ================= */}

      {activeTab === "upload" &&
        (role === "admin" ||
          role === "trainer") && (

        <div className="bg-white p-6 rounded-2xl shadow space-y-5">

          <Input
            placeholder="Title"
            value={uploadTitle}
            onChange={(e) =>
              setUploadTitle(e.target.value)
            }
          />

          <select
            value={uploadType}
            onChange={(e) =>
              setUploadType(
                e.target.value as any
              )
            }
          >

            <option value="ASSIGNMENT">
              Assignment
            </option>

            <option value="NOTE">
              Notes
            </option>

          </select>

          <div
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="border-dashed border-2 p-6 rounded-xl text-center cursor-pointer"
          >

            {uploadFile
              ? uploadFile.name
              : "Click to upload PDF"}

          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) =>
              setUploadFile(
                e.target.files?.[0] || null
              )
            }
          />

          <Button
            onClick={handleUpload}
          >

            {uploading
              ? "Uploading..."
              : "Upload"}

          </Button>

        </div>

      )}

      {/* ================= SUBMISSIONS ================= */}

      {activeTab === "submissions" && (

        <div className="space-y-4">

          {submissions.length === 0 ? (

            <p className="text-gray-400">
              No submissions found
            </p>

          ) : (

            submissions.map((s) => (

              <div
                key={s.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >

                <div>

                  <p className="font-semibold">
                    {s.studentName}
                  </p>

                  <p className="text-xs text-gray-400">
                    {s.assignmentTitle}
                  </p>

                  <p className="text-sm mt-1">
                    Status:
                    <span className="font-medium ml-1">
                      {s.status}
                    </span>
                  </p>

                  {s.score && (

                    <p className="text-sm">
                      Score: {s.score}
                    </p>

                  )}

                </div>

                <div className="flex gap-2">

                  <Button
                    variant="outline"
                    onClick={() =>
                      openPdf(s.fileUrl)
                    }
                  >
                    View
                  </Button>

                  {(role === "admin" ||
                    role === "trainer") &&
                    s.status !== "EVALUATED" && (

                    <Button
                      className="bg-green-600 text-white"
                      onClick={() =>
                        handleGrade(s)
                      }
                    >
                      Grade
                    </Button>

                  )}

                </div>

              </div>

            ))

          )}

        </div>

      )}

    </div>
  );
}