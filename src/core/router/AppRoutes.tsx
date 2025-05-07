import { Routes, Route } from 'react-router-dom';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterTeacherPage from '@/features/auth/pages/RegisterTeacherPage';
import TeacherRoutes from '@/features/teacher/routes/TeacherRoutes';
import StudentRoutes from '@/features/student/routes/StudentRoutes';
import NotFoundPage from '@/pages/NotFoundPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/teacher" element={<RegisterTeacherPage />} />

      {TeacherRoutes}
      {StudentRoutes}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
