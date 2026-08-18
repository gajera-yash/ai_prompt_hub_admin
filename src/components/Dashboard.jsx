import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { FileText, Brain, Layers, FolderTree, BarChart3, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, "prompts"));
        const prompts = snapshot.docs.map((doc) => doc.data());

        const catSnapshot = await getDocs(collection(db, "categories"));
        let subcategoriesCount = 0;
        catSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.subcategories && Array.isArray(data.subcategories)) {
            subcategoriesCount += data.subcategories.length;
          }
        });
        const subcategories = subcategoriesCount;

        const total = prompts.length;
        const categoryMap = {};
        const aiToolMap = {};
        let totalCopies = 0;

        prompts.forEach((p) => {
          const cat = p.category || "Uncategorized";
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;

          const tool = p.aiTool || "Unknown";
          aiToolMap[tool] = (aiToolMap[tool] || 0) + 1;
          
          totalCopies += p.copyCount || 0;
        });

        const topCategory = Object.entries(categoryMap).sort(
          (a, b) => b[1] - a[1]
        )[0] || ["N/A", 0];

        const topTool = Object.entries(aiToolMap).sort(
          (a, b) => b[1] - a[1]
        )[0] || ["N/A", 0];

        setStats({
          total,
          categories: Object.keys(categoryMap).length,
          subcategories,
          topCategory: topCategory[0],
          topTool: topTool[0],
          totalCopies
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Prompts",
      value: stats?.total ?? "—",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Categories",
      value: stats?.categories ?? "—",
      icon: Layers,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Subcategories",
      value: stats?.subcategories ?? "—",
      icon: FolderTree,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Copies",
      value: stats?.totalCopies ?? "—",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Most Used AI",
      value: stats?.topTool ?? "—",
      icon: Brain,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin border-4 border-gray-100 border-t-blue-600 rounded-full w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h2>
        <p className="text-gray-500 mt-1">Here's what's happening in your app today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {card.label}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight truncate">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to your Admin Portal</h3>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            Manage your mobile app's prompts, categories, and ad units from this dashboard. 
            The changes you make here are instantly reflected in your mobile app in real-time. Keep your content fresh to retain users!
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <BarChart3 className="text-gray-600" size={24} />
          </div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1">Top Category</h3>
          <p className="text-xl font-bold text-gray-900">{stats?.topCategory || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}