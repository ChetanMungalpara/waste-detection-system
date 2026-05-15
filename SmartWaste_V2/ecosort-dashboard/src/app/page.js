import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 text-center bg-white p-10 rounded-3xl shadow-xl border border-green-100">
        
        {/* Logo / Icon Area */}
        <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-5xl">♻️</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 tracking-tight">
          Welcome to EcoSort
        </h1>
        
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Automating waste segregation at the source. Dispose of waste correctly, earn circular economy reward points, and help create a cleaner campus environment.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg transition-all shadow-md hover:shadow-lg"
          >
            Login to Dashboard
          </Link>
          
          <Link 
            href="/signup" 
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border-2 border-green-600 text-base font-bold rounded-xl text-green-700 bg-transparent hover:bg-green-50 md:py-4 md:text-lg transition-all"
          >
            Create Profile
          </Link>
        </div>
      </div>
    </div>
  );
}