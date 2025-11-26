import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
