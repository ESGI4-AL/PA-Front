import { Route } from 'react-router-dom';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import TeacherDashboard from '../dashboard/TeacherDashboard';
import PromotionsPage from '../promotions/pages/PromotionPage';
import PromotionCreatePage from '../promotions/pages/PromotionCreatePage';
import PromotionEditPage from '../promotions/pages/PromotionEditPage';

const TeacherRoutes = (
  <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
    <Route index element={<TeacherDashboard />} />
    <Route path="promotions" element={<PromotionsPage />} />
      <Route path="promotions/create" element={<PromotionCreatePage />} />
      <Route path="promotions/:id/edit" element={<PromotionEditPage />} />
  </Route>
);

export default TeacherRoutes;
