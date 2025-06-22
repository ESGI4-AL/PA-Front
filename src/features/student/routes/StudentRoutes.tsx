import { Route } from 'react-router-dom';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import StudentDashboard from '../dashboard/StudentDashboard';
import NotificationsPage from '@/features/common/pages/NotificationsPage';
import SettingsPage from '@/features/common/pages/SettingsPage';
import StudentProjectsListPage from '../projects/pages/StudentProjectsListPage';
import StudentPromotionsListPage from '../promotions/pages/StudentPromotionListPage';
import ProfilePage from '@/features/common/pages/ProfilePage';
import StudentProjectTabPage from '../projects/pages/StudentProjectTabPage';

const StudentRoutes = (
  <Route path="/student" element={<DashboardLayout role="student" />}>
    <Route index element={<StudentDashboard />} />
    <Route path="promotions/my-promotion" element={<StudentPromotionsListPage />} />

    <Route path="projects/my-projects" element={<StudentProjectsListPage />} />
    <Route path="projects/:id/detail" element={<StudentProjectTabPage />} />

    <Route path="notifications" element={<NotificationsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="profile" element={<ProfilePage />} />
  </Route>
);

export default StudentRoutes;
