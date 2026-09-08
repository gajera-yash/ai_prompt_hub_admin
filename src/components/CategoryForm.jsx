import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { X, Save, Layers, Loader2 } from "lucide-react";

export default function CategoryForm({ category, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (category) {
        await updateDoc(doc(db, "categories", category.id), data);
      } else {
        data.createdAt = new Date().toISOString();
        await addDoc(collection(db, "categories"), data);
      }
      onSaved();
    } catch (err) {
      console.error("Failed to save category:", err);
      setError("Failed to save category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="ui-dialog relative flex max-h-[90vh] max-w-md flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="ui-dialog-header">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2">
              <Layers size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {category ? "Edit Category" : "New Category"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ui-icon-button"
            aria-label="Close category form"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="ui-label">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marketing, Development, SEO..."
                className="ui-input"
                required
                autoFocus
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="ui-dialog-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="ui-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={saving}
            className="ui-button-primary"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Category"}
          </button>
        </div>

      </div>
    </div>
  );
}
