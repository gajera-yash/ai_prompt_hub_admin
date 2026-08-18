import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { Bell, Send, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Notifications() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    imageUrl: "",
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      // Save notification to Firestore so the mobile app can listen to this collection
      await addDoc(collection(db, "notifications"), {
        title: form.title.trim(),
        body: form.body.trim(),
        imageUrl: form.imageUrl.trim() || null,
        createdAt: serverTimestamp(),
        status: "sent",
      });

      setStatus({ type: "success", message: "Notification sent successfully!" });
      setForm({ title: "", body: "", imageUrl: "" });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (err) {
      console.error("Failed to send notification:", err);
      setStatus({ type: "error", message: "Failed to send notification. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Push Notifications
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Send announcements or updates directly to your app users.
        </p>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          status.type === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {status.type === "success" ? <CheckCircle2 size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-red-600" />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Form Section */}
        <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-gray-100">
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={65}
                placeholder="e.g., 50+ New ChatGPT Prompts!"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                required
                rows={3}
                maxLength={200}
                placeholder="Check out the newly added marketing prompts in the app."
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-gray-400" />
                Image URL <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending || !form.title.trim() || !form.body.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="p-6 md:w-1/3 bg-gray-50 flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6 w-full text-center">
            App Preview
          </p>
          
          <div className="w-full max-w-[240px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden text-left relative before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-blue-500">
            <div className="p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell size={14} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {form.title || "Notification Title"}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-snug">
                  {form.body || "Message body will appear here..."}
                </p>
              </div>
            </div>
            {form.imageUrl && (
              <div className="w-full h-24 bg-gray-100">
                <img 
                  src={form.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
