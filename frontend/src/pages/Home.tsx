import {Link} from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mt-4">Home Page</h1>
        <h1 className="text-3xl font-bold text-blue-600 mt-4">Hello, Football App!</h1>
        {/* link to matches page */}
        <Link to="/matches" className="mt-6 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">
            Go to Match List
        </Link>
        
    </div>
  );
}