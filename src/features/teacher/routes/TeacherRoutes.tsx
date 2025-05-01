import { Route } from 'react-router-dom';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import TeacherDashboard from '../dashboard/TeacherDashboard';

const TeacherRoutes = (
  <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
    <Route index element={<TeacherDashboard />} />
  </Route>
);

export default TeacherRoutes;
