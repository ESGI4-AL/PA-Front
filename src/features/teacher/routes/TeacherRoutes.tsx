import { Route } from 'react-router-dom';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import TeacherDashboard from '../dashboard/TeacherDashboard';
import PromotionsPage from '../promotions/pages/PromotionPage';
import PromotionCreatePage from '../promotions/pages/PromotionCreatePage';
import PromotionEditPage from '../promotions/pages/PromotionEditPage';
import TeacherProjectsListPage from '../projects/pages/TeacherProjectsListPage';
import TeacherProjectsCreatePage from '../projects/pages/TeacherProjectsCreatePage';
import TeacherProjectsTabPage from '../projects/pages/TeacherProjectsTabPage';
import NotificationsPage from '@/features/common/pages/NotificationsPage';
import SettingsPage from '@/features/common/pages/SettingsPage';
import ProfilePage from '@/features/common/pages/ProfilePage';

const TeacherRoutes = (
  <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
    <Route index element={<TeacherDashboard />} />
    <Route path="promotions" element={<PromotionsPage />} />
    <Route path="promotions/create" element={<PromotionCreatePage />} />
    <Route path="promotions/:id/edit" element={<PromotionEditPage />} />
    <Route path="projects" element={<TeacherProjectsListPage />} />
    <Route path="projects/create" element={<TeacherProjectsCreatePage />} />
    <Route path="projects/:id/detail" element={<TeacherProjectsTabPage />} />

    <Route path="notifications" element={<NotificationsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="profile" element={<ProfilePage />} />
  </Route>
);

export default TeacherRoutes;
