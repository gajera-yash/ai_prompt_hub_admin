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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="ui-page-heading">Prompts</h2>
          <p className="ui-page-copy">Manage your prompt library and keep its details current.</p>
        </div>
        <button
          onClick={onAdd}
          className="ui-button-primary"
        >
          <Plus size={16} />
          Create Prompt
        </button>
      </div>

      <div className="ui-card mb-6 p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ui-input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="ui-card space-y-5 p-6" aria-label="Loading prompts">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
          {["one", "two", "three", "four", "five"].map((row) => (
            <div key={row} className="grid grid-cols-5 gap-6 border-t border-slate-100 pt-5">
              <div className="col-span-2 h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FileText className="text-slate-400" size={24} />
          </div>
          <p className="text-base font-semibold text-slate-900">No prompts found</p>
          <p className="mt-1 text-sm text-slate-500">
            {search ? "Try a different search term" : "Click 'Create Prompt' to add your first one"}
          </p>
        </div>
      ) : (
        <div className="ui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/70 text-slate-500 shadow-[0_1px_0_0_rgb(226_232_240)]">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Subcategory</th>
                  <th className="px-4 py-3 text-left font-semibold">AI Tool</th>
                  <th className="px-4 py-3 text-center font-semibold">Copies</th>
                  <th className="px-4 py-3 text-center font-semibold">Rating</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prompt, index) => (
                  <tr
                    key={prompt.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"} transition-colors hover:bg-slate-50`}
                  >
                    <td className="max-w-[280px] px-4 py-3 text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{prompt.title}</span>
                        {prompt.isPremium && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                            Pro
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {prompt.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {prompt.subcategory || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {prompt.aiTool}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 text-slate-600">
                        <Copy size={12} className="text-slate-400" />
                        {prompt.copyCount ?? 0}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium text-slate-700">{prompt.rating ?? "4.8"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(prompt)}
                          className="ui-icon-button"
                          title="Edit"
                          aria-label={`Edit ${prompt.title}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(prompt.id)}
                          className="ui-icon-button hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                          aria-label={`Delete ${prompt.title}`}
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="ui-dialog max-w-sm animate-in zoom-in-95 duration-200">
            <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-50 p-2">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Prompt
              </h3>
            </div>
            <p className="mb-6 text-sm leading-6 text-slate-500">
              Are you sure you want to delete this prompt? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="ui-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
