import { Toaster } from "sonner";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import PageNotFound from './lib/PageNotFound';

import Sidebar from '@/components/prompt-cowboy/Sidebar';
import Home from '@/pages/Home';
import Library from '@/pages/Library';
import Memories from '@/pages/Memories';
import Landing from '@/pages/Landing';
import SignIn from '@/pages/SignIn';

function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <main style={{
        marginLeft: 220,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        position: 'relative',
      }}
      className="max-md:ml-0"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(200,184,138,0.2)',
          borderTop: '3px solid #2C3A1E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  return <AppLayout />;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#2C3A1E',
              color: '#D4C49A',
              border: '1px solid rgba(200, 184, 138, 0.3)',
              borderRadius: '8px',
              fontSize: '13px',
            },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;