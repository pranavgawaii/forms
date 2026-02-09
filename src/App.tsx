import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import AccountPage from './pages/AccountPage';
import AuthPage from './pages/AuthPage';
import FormBuilderPage from './pages/FormBuilderPage';
import FormsListPage from './pages/FormsListPage';
import NotFoundPage from './pages/NotFoundPage';
import PublicFormPage from './pages/PublicFormPage';
import ResponsesPage from './pages/ResponsesPage';
import TestFormsPage from './pages/TestFormsPage';

import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/test-forms" element={<TestFormsPage />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="/f/:slug" element={<PublicFormPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="forms" replace />} />
          <Route path="forms" element={<FormsListPage />} />
          <Route path="forms/new" element={<FormBuilderPage />} />
          <Route path="forms/:id/edit" element={<FormBuilderPage />} />
          <Route path="forms/:id/responses" element={<ResponsesPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
