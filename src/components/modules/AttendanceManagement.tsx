import { useEffect, useState } from "react";
import { getStudentAttendance } from "../../api/attendanceApi";

export function AttendanceManagement({ user }: any) {

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getStudentAttendance(user.id);
    setData(res.data || []);
  };

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-4">My Attendance</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {[...data].reverse().map((d, i) => (
            <tr key={i}>
              <td>{d.attendanceDate}</td>
              <td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}