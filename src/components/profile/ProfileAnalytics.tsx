'use client';

interface ProfileAnalyticsProps {
  profileViews?: number;
  searchImpressions?: number;
  searchScore?: number;
}

const ProfileAnalytics = ({
  profileViews = 0,
  searchImpressions = 0,
  searchScore,
}: ProfileAnalyticsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
      <h3 className="text-md font-bold text-gray-900 mb-2">Analytics</h3>
      <p className="text-xs text-gray-500 mb-4 flex gap-1 items-center">
        <span>👁️</span> Private to you
      </p>

      <div className="space-y-4">
        {/* Profile Views */}
        <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition cursor-pointer">
          <div className="text-gray-500 pt-1">👥</div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-gray-900">{profileViews}</span>
            </div>
            <p className="text-sm text-gray-600">profile views</p>
          </div>
        </div>

        {/* Search Impressions */}
        <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition cursor-pointer">
           <div className="text-gray-500 pt-1">🔍</div>
           <div>
             <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900">{searchImpressions}</span>
             </div>
             <p className="text-sm text-gray-600">search appearances</p>
           </div>
        </div>

         {/* Search Score */}
         {searchScore !== undefined && (
            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition cursor-pointer">
              <div className="text-gray-500 pt-1">📊</div>
              <div>
                <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-900">{searchScore}%</span>
                </div>
                <p className="text-sm text-gray-600">search score</p>
              </div>
            </div>
         )}
      </div>
      
      <div className="border-t border-gray-100 mt-3 pt-3 text-center">
          <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 mx-auto">
             Show all analytics <span>→</span>
          </button>
      </div>
    </div>
  );
};

export default ProfileAnalytics;
