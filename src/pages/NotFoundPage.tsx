import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="premium-panel w-full max-w-md rounded-3xl p-6 text-center">
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="brand-heading mt-2 text-3xl font-semibold text-ink-900">Page not found</h1>
        <p className="mt-2 text-sm text-ink-600">The page you requested does not exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
