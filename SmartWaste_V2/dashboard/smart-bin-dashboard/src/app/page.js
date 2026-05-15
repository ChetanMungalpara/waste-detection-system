import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Bar */}
        <header className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              ♻️
            </div>
            <h1 className="text-2xl font-extrabold text-green-700 tracking-tight">EcoSort Circular Economy</h1>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm">
            Scan QR on Bin
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: User Profile Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 col-span-1 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-green-500"></div>
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-5xl mb-4 z-10 border-4 border-white shadow-md mt-6">
              👨‍🎓
            </div>
            <h2 className="text-2xl font-bold mt-2">Chetan Mungalpara</h2>
            <p className="text-gray-500 mb-6 font-medium">LPU ID: 12207641</p>
            
            <div className="w-full bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs text-green-800 font-bold uppercase tracking-wider mb-1">Current Tier</p>
              <p className="text-lg font-semibold text-green-700">🌿 Eco Warrior</p>
            </div>
          </div>

          {/* Right Column: Stats & Activity */}
          <div className="md:col-span-2 flex flex-col gap-8">
            
            {/* Big Points Card */}
            <div className="bg-gradient-to-r from-green-600 to-green-400 p-8 rounded-2xl shadow-md flex items-center justify-between text-white">
              <div>
                <p className="text-green-50 font-medium text-lg opacity-90">Total Reward Points</p>
                <h3 className="text-6xl font-black mt-1">1,450</h3>
                <p className="text-sm mt-3 opacity-80">≈ ₹145 value in campus cafeteria</p>
              </div>
              <div className="text-7xl drop-shadow-lg">
                🪙
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                📊 Recent Disposal History
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">🥤</div>
                    <div>
                      <p className="font-semibold text-gray-800">Plastic Bottle</p>
                      <p className="text-xs text-gray-500">Recyclable Bin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">+10 pts</span>
                    <p className="text-xs text-gray-400 mt-1">Today, 10:45 AM</p>
                  </div>
                </li>
                
                <li className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">🥫</div>
                    <div>
                      <p className="font-semibold text-gray-800">Aluminum Can</p>
                      <p className="text-xs text-gray-500">Recyclable Bin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">+10 pts</span>
                    <p className="text-xs text-gray-400 mt-1">Yesterday, 2:15 PM</p>
                  </div>
                </li>

                <li className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">🍎</div>
                    <div>
                      <p className="font-semibold text-gray-800">Apple Core</p>
                      <p className="text-xs text-gray-500">Organic Bin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full text-sm">0 pts</span>
                    <p className="text-xs text-gray-400 mt-1">Monday, 9:30 AM</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}