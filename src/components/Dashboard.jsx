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

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, "prompts"));
        const prompts = snapshot.docs.map((doc) => doc.data());

        const catSnapshot = await getDocs(collection(db, "categories"));
        const categoryNames = catSnapshot.docs
          .map((doc) => doc.data()?.name)
          .filter((name) => typeof name === "string" && name.trim());

        const uniqueCategoryCount = new Set(categoryNames.map((name) => name.trim())).size;

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
          categories: uniqueCategoryCount,
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4" aria-label="Loading dashboard">
        {["one", "two", "three", "four"].map((item) => (
          <div key={item} className="ui-card space-y-4 p-5">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-8 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 lg:space-y-8 pb-10">
      
      <div className="ui-card flex flex-col justify-between gap-6 p-7 sm:flex-row sm:items-end lg:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            <Sparkles size={12} />
            <span>Admin Portal</span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">
            Welcome back to Prompt Hub
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 lg:text-base">
            A concise overview of your prompt library, category structure, and user engagement.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-medium text-slate-900">{stats?.totalCopies?.toLocaleString?.() || 0}</span> total prompt copies
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Prompts", value: stats?.total, icon: FileText },
          { label: "Total Categories", value: stats?.categories, icon: Layers },
          { label: "Subcategories", value: stats?.subcategories, icon: FolderTree },
          { label: "Total Copies", value: stats?.totalCopies, icon: Activity },
        ].map((item, i) => (
          <div key={i} className="ui-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <item.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{item.value || 0}</p>
              <p className="mt-1 text-sm text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Categories */}
        <div className="ui-card p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
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
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No category data</div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {stats?.categoryData?.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: AI Tools */}
        <div className="ui-card p-6">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Sparkles size={18} className="text-indigo-500" />
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
                   <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {stats.toolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No tool data</div>
            )}
          </div>
        </div>
      </div>

      {/* Trending Prompts Table */}
      <div className="ui-card overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <TrendingUp size={18} className="text-emerald-500" />
            Most Copied Prompts
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0_rgb(226_232_240)]">
              <tr>
                <th className="px-6 py-4 font-medium">Prompt Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">AI Tool</th>
                <th className="px-6 py-4 font-medium text-right">Copies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats?.trendingPrompts?.length > 0 ? (
                stats.trendingPrompts.map((prompt, index) => (
                  <tr key={prompt.id || index} className="transition-colors hover:bg-slate-50">
                    <td className="max-w-[250px] truncate px-6 py-4 font-medium text-slate-900">
                      {prompt.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {prompt.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {prompt.aiTool || "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      {prompt.copyCount?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={4} className="bg-slate-50/50 px-6 py-8 text-center text-slate-400">
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
