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
          <h2 className="ui-page-heading flex items-center gap-2">
          Push Notifications
        </h2>
          <p className="ui-page-copy">
          Send announcements or updates directly to your app users.
        </p>
      </div>

      {status.message && (
        <div className={`mb-6 flex items-center gap-3 rounded-xl border p-4 shadow-sm ${
          status.type === "success" 
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {status.type === "success" ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-red-600" />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <div className="ui-card flex flex-col overflow-hidden md:flex-row">
        
        {/* Form Section */}
        <div className="border-b border-slate-100 p-6 md:w-2/3 md:border-b-0 md:border-r">
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="ui-label">
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
                className="ui-input"
              />
            </div>

            <div>
              <label className="ui-label">
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
                className="ui-input resize-none py-3"
              />
            </div>

            <div>
              <label className="ui-label flex items-center gap-1.5">
                <ImageIcon size={14} className="text-slate-400" />
                Image URL <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="ui-input"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending || !form.title.trim() || !form.body.trim()}
                className="ui-button-primary w-full"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center bg-slate-50 p-6 md:w-1/3">
          <p className="mb-6 w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            App Preview
          </p>
          
          <div className="relative w-full max-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:bg-indigo-500">
            <div className="p-3 flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <Bell size={14} className="text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {form.title || "Notification Title"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-600">
                  {form.body || "Message body will appear here..."}
                </p>
              </div>
            </div>
            {form.imageUrl && (
              <div className="h-24 w-full bg-slate-100">
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
