import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NotFound } from './pages/NotFound';
import { AndroidLog } from './pages/Android';
import { IosLog } from './pages/iOS';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p>Welcome to your app tracking dashboard!</p>
              </div>
            }
          />
          <Route
            path="/applications"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Applications</h1>
                <p>Manage your applications here.</p>
              </div>
            }
          />
          <Route
            path="/analytics"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p>View your analytics and insights.</p>
              </div>
            }
          />
          <Route
            path="/performance"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Performance</h1>
                <p>Monitor application performance.</p>
              </div>
            }
          />
          <Route
            path="/users"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <p>Manage users and permissions.</p>
              </div>
            }
          />
          <Route path="/android-logs" element={<AndroidLog />} />
          <Route path="/ios-logs" element={<IosLog />} />
          <Route
            path="/calendar"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Calendar</h1>
                <p>View scheduled events and deadlines.</p>
              </div>
            }
          />
          <Route
            path="/notifications"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p>Manage your notifications.</p>
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p>Configure your application settings.</p>
              </div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
