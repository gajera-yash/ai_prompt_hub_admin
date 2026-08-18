import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Pencil, Trash2, Plus, Search, AlertTriangle, FileText, Copy, Star } from "lucide-react";

export default function PromptList({ onEdit, onAdd }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "prompts"), orderBy("title", "asc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrompts(list);
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "prompts", id));
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = prompts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategory?.toLowerCase().includes(search.toLowerCase()) ||
      p.aiTool?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Prompts
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Manage your prompt library.</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Prompt
        </button>
      </div>

      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="animate-spin border-4 border-gray-100 border-t-gray-900 rounded-full w-8 h-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
            <FileText className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-900 font-medium mb-1">No prompts found</p>
          <p className="text-gray-500 text-sm">
            {search ? "Try a different search term" : "Click 'Create Prompt' to add your first one"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Subcategory</th>
                <th className="text-left px-4 py-3 font-medium">AI Tool</th>
                <th className="text-center px-4 py-3 font-medium">Copies</th>
                <th className="text-center px-4 py-3 font-medium">Rating</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((prompt) => (
                <tr
                  key={prompt.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium max-w-[250px] truncate">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{prompt.title}</span>
                      {prompt.isPremium && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                          Pro
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {prompt.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                      {prompt.subcategory || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {prompt.aiTool}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 text-gray-600">
                      <Copy size={12} className="text-gray-400" />
                      {prompt.copyCount ?? 0}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="font-medium text-gray-700">{prompt.rating ?? "4.8"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(prompt)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(prompt.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-50">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Prompt
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this prompt? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}