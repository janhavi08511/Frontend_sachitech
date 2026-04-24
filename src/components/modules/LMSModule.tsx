import { useEffect, useState } from "react";
import { UserRole } from "../../types";
import { AdminTrainerLMS } from "./lms/AdminTrainerLMS";
import { StudentLMS } from "./lms/StudentLMS";

interface Props {
  role: UserRole;
}

export function LMSModule({ role }: Props) {
  if (role === "student") {
    return <StudentLMS />;
  }
  return <AdminTrainerLMS role={role} />;
}
