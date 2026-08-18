import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { FileText, Layers, FolderTree, TrendingUp, Sparkles, Activity } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

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

        const total = prompts.length;
        let totalCopies = 0;
        const categoryMap = {};
        const aiToolMap = {};

        prompts.forEach((p) => {
          if (p.category) {
            categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
          }
          if (p.aiTool) {
            aiToolMap[p.aiTool] = (aiToolMap[p.aiTool] || 0) + 1;
          }
          if (p.copyCount) {
            totalCopies += p.copyCount;
          }
        });

        const topCategory = Object.entries(categoryMap).sort(
          (a, b) => b[1] - a[1]
        )[0] || ["N/A", 0];

        const topTool = Object.entries(aiToolMap).sort(
          (a, b) => b[1] - a[1]
        )[0] || ["N/A", 0];
        
        // Get top 5 trending prompts by copyCount
        const trendingPrompts = [...prompts]
          .sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0))
          .slice(0, 5);

        // Format data for charts
        const categoryData = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6); // Top 6 for pie chart
          
        const toolData = Object.entries(aiToolMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5 for bar chart

        setStats({
          total,
          categories: Object.keys(categoryMap).length,
          subcategories: subcategoriesCount,
          topCategory: topCategory[0],
          topTool: topTool[0],
          totalCopies,
          trendingPrompts,
          categoryData,
          toolData,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-indigo-900 font-medium tracking-wide animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 lg:space-y-8 pb-10">
      
      {/* Hero Section with Glassmorphism */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-8 lg:p-12">
        <div className="absolute top-0 right-0 w-full h-full opacity-40 pointer-events-none" style={{
          backgroundImage: "url('/assets/dashboard_hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
          WebkitMaskImage: "-webkit-linear-gradient(right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)"
        }}></div>
        
        <div className="relative z-10 max-w-xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-amber-300" />
            <span>Admin Portal</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Welcome back to PromptHub!
          </h2>
          <p className="text-indigo-100/80 leading-relaxed text-sm lg:text-base">
            Your centralized command center. Manage your mobile app's prompts, categories, and track real-time user engagement through beautiful analytics.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Prompts", value: stats?.total, icon: FileText, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 text-blue-600" },
          { label: "Total Categories", value: stats?.categories, icon: Layers, color: "from-purple-500 to-pink-600", bg: "bg-purple-50 text-purple-600" },
          { label: "Subcategories", value: stats?.subcategories, icon: FolderTree, color: "from-emerald-400 to-teal-500", bg: "bg-teal-50 text-teal-600" },
          { label: "Total Copies", value: stats?.totalCopies, icon: Activity, color: "from-amber-400 to-orange-500", bg: "bg-orange-50 text-orange-600" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${item.color} blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${item.bg}`}>
                <item.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{item.value || 0}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Categories */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Layers size={18} className="text-indigo-500" />
            Prompts by Category
          </h3>
          <div className="h-[280px] w-full">
            {stats?.categoryData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No category data</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {stats?.categoryData?.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: AI Tools */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-pink-500" />
            Top AI Tools
          </h3>
          <div className="h-[300px] w-full">
            {stats?.toolData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.toolData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {stats.toolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No tool data</div>
            )}
          </div>
        </div>
      </div>

      {/* Trending Prompts Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            Most Copied Prompts
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Prompt Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">AI Tool</th>
                <th className="px-6 py-4 font-medium text-right">Copies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.trendingPrompts?.length > 0 ? (
                stats.trendingPrompts.map((prompt, index) => (
                  <tr key={prompt.id || index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-[250px] truncate">
                      {prompt.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {prompt.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {prompt.aiTool || "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      {prompt.copyCount?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 bg-gray-50/30">
                    No trending prompts found. Keep growing your library!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}