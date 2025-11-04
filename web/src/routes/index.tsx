import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Files from '@/pages/Files';
import Notes from '@/pages/Notes';
import Questions from '@/pages/Questions';
import WrongAnswers from '@/pages/WrongAnswers';
import Ask from '@/pages/Ask';
import { RequireAuth } from './RequireAuth';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/files"
        element={(
          <RequireAuth>
            <Files />
          </RequireAuth>
        )}
      />
      <Route
        path="/notes"
        element={(
          <RequireAuth>
            <Notes />
          </RequireAuth>
        )}
      />
      <Route
        path="/questions"
        element={(
          <RequireAuth>
            <Questions />
          </RequireAuth>
        )}
      />
      <Route
        path="/wrong-answers"
        element={(
          <RequireAuth>
            <WrongAnswers />
          </RequireAuth>
        )}
      />
      <Route
        path="/ask"
        element={(
          <RequireAuth>
            <Ask />
          </RequireAuth>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
