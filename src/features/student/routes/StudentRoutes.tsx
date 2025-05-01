import { Route } from 'react-router-dom';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import StudentDashboard from '../dashboard/StudentDashboard';

const StudentRoutes = (
  <Route path="/student" element={<DashboardLayout role="student" />}>
    <Route index element={<StudentDashboard />} />
  </Route>
);

export default StudentRoutes;
