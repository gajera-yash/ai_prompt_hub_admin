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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Feedback & Reports
          </h2>
          <p className="text-gray-500 mt-1 text-sm">See what your users are saying.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search feedback..."
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
            <MessageSquare className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-900 font-medium mb-1">No feedback found</p>
          <p className="text-gray-500 text-sm">
            You don't have any feedback yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((feedback) => (
            <div key={feedback.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col relative group">
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                  feedback.type === 'Bug' ? 'bg-red-50 text-red-700' :
                  feedback.type === 'Report' ? 'bg-amber-50 text-amber-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {feedback.type || "General"}
                </span>
                <button
                  onClick={() => setDeleteConfirm(feedback.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Resolve & Delete"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
              <p className="text-gray-800 text-sm mb-4 flex-1 whitespace-pre-wrap">
                {feedback.message}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-50">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Resolve Feedback
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to resolve and remove this feedback from the list?
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
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                {deleting ? "Resolving..." : "Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
