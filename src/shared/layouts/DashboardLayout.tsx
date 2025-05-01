import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

type Properties = {
  role: 'teacher' | 'student';
};

export default function DashboardLayout({ role }: Properties) {
  return (
    <div className="flex h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
