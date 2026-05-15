'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';

// Mapping icons for the history list
const CATEGORY_ICONS = {
  'Recyclable': '🥤',
  'Organic': '🍎',
  'Hazardous': '🔋',
  'E-waste': '💻',
  'Unknown': '❓'
};

export default function DashboardPage() {
  const router = useRouter();
  const webcamRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [showSorter, setShowSorter] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(true);

  // 1. Authentication Check
  useEffect(() => {
    const storedUser = localStorage.getItem('ecoSortUser');
    const token = localStorage.getItem('ecoSortToken');
    if (!storedUser || !token) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  // 2. THE FULL STACK CONNECTION: Next.js talking to Python Flask
  const captureAndClassify = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setClassifying(true);
    setLastResult(null);
    setErrorMsg('');

    try {
      // ---> THIS CALLS YOUR PYTHON FLASK SERVER (ml_api.py) <---
      const mlResponse = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });

      const mlData = await mlResponse.json();

      if (!mlResponse.ok) {
        setErrorMsg(mlData.error || 'Failed to detect waste. Try again.');
        setClassifying(false);
        return;
      }

      // ---> THIS CALLS YOUR NEXT.JS DATABASE ROUTE <---
      const token = localStorage.getItem('ecoSortToken');
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));

      const dbResponse = await fetch('/api/add-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tokenPayload.userId,
          itemDetected: mlData.item,
          category: mlData.category,
          points: mlData.points,
        }),
      });

      const dbData = await dbResponse.json();

      if (dbResponse.ok) {
        setLastResult(mlData);
        // Update the screen with new points and history immediately
        const updatedUser = { ...user, points: dbData.totalPoints, history: dbData.history };
        setUser(updatedUser);
        localStorage.setItem('ecoSortUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setErrorMsg('Could not connect to AI. Make sure Python Flask is running on port 5000.');
    } finally {
      setClassifying(false);
    }
  }, [user]);

  if (!user) return <div className="min-h-screen flex items-center justify-center text-green-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-10">
      
      {/* Top Navbar - Matches Figure 1 */}
      <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm m-4 rounded-xl border border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-white font-bold">♻️</div>
          <h1 className="text-xl font-bold text-[#10b981]">EcoSort Circular Economy</h1>
        </div>
        <button 
          onClick={() => setShowSorter(!showSorter)}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {showSorter ? 'Back to Dashboard' : 'Scan QR on Bin'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        
        {showSorter ? (
          /* AI WASTE SORTER VIEW - Matches Figure 3 & 4 */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Waste Sorter</h2>
            
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video relative flex items-center justify-center mb-6 border border-gray-200">
              {cameraActive ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    className="w-full h-full object-cover"
                  />
                  {classifying && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <p className="text-green-600 font-bold text-lg animate-pulse">Analyzing with YOLOv8...</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 font-medium">Upload an image or use camera</p>
              )}
            </div>

            {errorMsg && <p className="text-red-500 font-semibold mb-4 text-sm">{errorMsg}</p>}

            <div className="flex justify-center gap-4 mb-6">
              <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded font-semibold w-40">
                Upload Image
              </button>
              <button 
                onClick={() => { setCameraActive(true); captureAndClassify(); }}
                disabled={classifying}
                className={`px-6 py-2 rounded font-semibold w-40 text-white ${classifying ? 'bg-gray-400' : 'bg-[#10b981] hover:bg-[#059669]'}`}
              >
                {classifying ? 'Wait...' : 'Use Live Camera'}
              </button>
            </div>

            {lastResult ? (
              <div className="mt-4">
                <h3 className={`text-xl font-bold ${lastResult.category === 'Recyclable' ? 'text-blue-600' : lastResult.category === 'Organic' ? 'text-green-600' : 'text-red-600'}`}>
                  {lastResult.category}
                </h3>
                <p className="text-gray-500 text-sm mt-1">This appears to be {lastResult.category.toLowerCase()} waste ({lastResult.item}).</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Please provide an image to classify</p>
            )}
          </div>
        ) : (
          
          /* MAIN DASHBOARD VIEW - Matches Figure 1 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: User Profile */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Solid Green Header Block */}
                <div className="h-28 bg-[#10b981] w-full"></div>
                
                {/* Circular Avatar cutting across the green/white border */}
                <div className="flex justify-center -mt-12">
                  <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-sm">
                    <div className="w-full h-full bg-[#1e293b] rounded-full flex items-center justify-center text-4xl">
                      🎓
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4 px-4 pb-8">
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 uppercase">LPU ID: {user.lpuUid}</p>
                  
                  <div className="mt-6 flex flex-col items-center">
                    <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider mb-1">Current Tier</p>
                    <div className="bg-[#ecfdf5] text-[#059669] px-4 py-1 rounded-md font-semibold text-sm flex items-center gap-1">
                      🌿 Eco Warrior
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Points & History */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Green Reward Points Banner */}
              <div className="bg-[#10b981] rounded-xl shadow-sm p-6 text-white flex justify-between items-center">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Total Reward Points</p>
                  <h3 className="text-5xl font-bold">{user.points.toLocaleString()}</h3>
                  <p className="text-xs text-green-100 mt-2">≈ ₹{user.points / 10} value in campus cafeteria</p>
                </div>
                <div className="bg-[#f59e0b] w-14 h-14 rounded-full flex items-center justify-center shadow-inner border-2 border-yellow-300">
                  <span className="text-2xl">🪙</span>
                </div>
              </div>

              {/* Disposal History List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📊 Recent Disposal History
                </h3>
                
                {user.history && user.history.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {user.history.map((record, index) => (
                      <div key={index} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-sm">
                            {CATEGORY_ICONS[record.category] || '♻️'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{record.itemDetected}</p>
                            <p className="text-xs text-gray-500">{record.category} Bin</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${record.pointsEarned > 0 ? 'text-[#10b981]' : 'text-gray-400'}`}>
                            {record.pointsEarned > 0 ? `+${record.pointsEarned} pts` : '0 pts'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No history yet. Click "Scan QR on Bin" to start!
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}