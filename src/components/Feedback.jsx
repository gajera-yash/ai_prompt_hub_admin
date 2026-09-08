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
import { Search, MessageSquare, User, Calendar, CheckCircle } from "lucide-react";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbacks(list);
    } catch (err) {
      console.error("Failed to fetch feedback, falling back:", err);
      // Fallback if index fails because orderBy desc requires index if other queries are used
      try {
        const snapshot = await getDocs(collection(db, "feedback"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => {
           const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
           const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
           return timeB - timeA;
        });
        setFeedbacks(list);
      } catch (e) {
        console.error("Fallback fetch failed", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "feedback", id));
      setFeedbacks((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete feedback:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = feedbacks.filter(
    (f) =>
      f.message?.toLowerCase().includes(search.toLowerCase()) ||
      f.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      f.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="ui-page-heading">
            Feedback & Reports
          </h2>
          <p className="ui-page-copy">Review reports and resolve feedback from your users.</p>
        </div>
      </div>

      <div className="ui-card relative mb-6 p-3">
        <Search
          size={16}
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-input pl-10"
        />
      </div>

      {loading ? (
        <div className="ui-card space-y-4 p-6" aria-label="Loading feedback">
          {["one", "two", "three"].map((item) => (
            <div key={item} className="space-y-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ui-card border-dashed py-16 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <MessageSquare className="text-slate-400" size={24} />
          </div>
          <p className="mb-1 font-semibold text-slate-900">No feedback found</p>
          <p className="text-sm text-slate-500">
            You don't have any feedback yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((feedback) => (
            <div key={feedback.id} className="ui-card group relative flex flex-col p-5 transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                  feedback.type === 'Bug' ? 'bg-red-50 text-red-700' :
                  feedback.type === 'Report' ? 'bg-amber-50 text-amber-700' :
                  'bg-indigo-50 text-indigo-700'
                }`}>
                  {feedback.type || "General"}
                </span>
                <button
                  onClick={() => setDeleteConfirm(feedback.id)}
                  className="ui-icon-button opacity-0 hover:bg-emerald-50 hover:text-emerald-600 group-hover:opacity-100 focus:opacity-100"
                  title="Resolve & Delete"
                  aria-label="Resolve feedback"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
              <p className="mb-4 flex-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {feedback.message}
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <User size={12} />
                  <span className="truncate">{feedback.userEmail || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar size={12} />
                  <span>
                    {feedback.createdAt?.toMillis ? new Date(feedback.createdAt.toMillis()).toLocaleDateString() : "Just now"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="ui-dialog max-w-sm animate-in zoom-in-95 duration-200">
            <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-emerald-50 p-2">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Resolve Feedback
              </h3>
            </div>
            <p className="mb-6 text-sm leading-6 text-slate-500">
              Are you sure you want to resolve and remove this feedback from the list?
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Resolving..." : "Resolve"}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
