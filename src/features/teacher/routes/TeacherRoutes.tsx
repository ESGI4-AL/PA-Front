import { Route } from 'react-router-dom';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import TeacherDashboard from '../dashboard/TeacherDashboard';
import PromotionsPage from '../promotions/pages/PromotionPage';
import PromotionCreatePage from '../promotions/pages/PromotionCreatePage';

const TeacherRoutes = (
  <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
    <Route index element={<TeacherDashboard />} />
    <Route path="promotions" element={<PromotionsPage />} />
      <Route path="promotions/create" element={<PromotionCreatePage />} />
  </Route>
);

export default TeacherRoutes;
