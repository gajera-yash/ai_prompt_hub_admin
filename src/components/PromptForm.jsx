import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { X, Save, FileText, Loader2, Image as ImageIcon, AlertTriangle } from "lucide-react";

export default function PromptForm({ prompt, onClose, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    category: "",
    subcategory: "",
    aiTool: "ChatGPT",
    rating: "4.5",
    copyCount: 0,
    promptText: "",
    instructions: "",
    imageUrl: "",
    isPremium: false,
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const IMGBB_API_KEY = "d59698eba1b06e131cf96fc0a8dc36df";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(list);
        
        // Populate subcategories from categories
        const subList = [];
        list.forEach(cat => {
           if (cat.subcategories && Array.isArray(cat.subcategories)) {
              cat.subcategories.forEach(subName => {
                 subList.push({
                    id: `${cat.id}-${subName}`,
                    name: subName,
                    categoryId: cat.id
                 });
              });
           }
        });
        setSubcategories(subList);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
        setSubcategoriesLoading(false);
      }
    };

    // fetchSubcategories is no longer needed as subcategories are fetched with categories.
    
    fetchCategories();

    if (prompt) {
      setForm({
        title: prompt.title || "",
        category: prompt.category || "",
        subcategory: prompt.subcategory || "",
        aiTool: prompt.aiTool || "ChatGPT",
        rating: prompt.rating || "4.5",
        copyCount: prompt.copyCount || 0,
        promptText: prompt.promptText || "",
        instructions: prompt.instructions || "",
        imageUrl: prompt.imageUrl || "",
        isPremium: prompt.isPremium || false,
      });
      if (prompt.imageUrl) {
        setImagePreview(prompt.imageUrl);
      }
    }
  }, [prompt]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (form.category) {
      const selectedCategory = categories.find(c => c.name === form.category);
      if (selectedCategory) {
        const filtered = subcategories.filter(s => s.categoryId === selectedCategory.id);
        setFilteredSubcategories(filtered);
      } else {
        setFilteredSubcategories([]);
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [form.category, categories, subcategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      // Reset subcategory when category changes
      if (name === "category") {
        return { ...prev, [name]: type === "checkbox" ? checked : value, subcategory: "" };
      }
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Try to extract an image URL if dragging from another browser tab
    const html = e.dataTransfer.getData("text/html");
    const url = e.dataTransfer.getData("URL");

    let externalUrl = null;
    if (html) {
      const match = html.match(/src\s*=\s*["']([^"']+)["']/);
      if (match && match[1]) {
        externalUrl = match[1];
      }
    } 
    
    if (!externalUrl && url && url.startsWith("http")) {
      externalUrl = url;
    }

    if (externalUrl) {
      setImagePreview(externalUrl);
      setImageFile(null); // Clear file to indicate it's an external URL
    }
  };

  const uploadImageToImgbb = async (base64Data) => {
    const formData = new FormData();
    formData.append("image", base64Data);
    
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error?.message || "Failed to upload image to ImgBB");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    
    if (!form.title.trim() || !form.promptText.trim()) {
      setError("Title and Prompt Text are required");
      setSaving(false);
      return;
    }

    try {
      let finalImageUrl = form.imageUrl;

      if (imageFile && imagePreview) {
        setUploadingImage(true);
        const base64Data = imagePreview.split(',')[1];
        finalImageUrl = await uploadImageToImgbb(base64Data);
        setUploadingImage(false);
      } else if (imagePreview) {
        finalImageUrl = imagePreview;
      }

      const data = {
        title: form.title.trim(),
        category: form.category.trim(),
        subcategory: form.subcategory.trim(),
        aiTool: form.aiTool,
        rating: Number(form.rating),
        copyCount: Number(form.copyCount),
        promptText: form.promptText.trim(),
        instructions: form.instructions.trim(),
        imageUrl: finalImageUrl,
        isPremium: form.isPremium,
        updatedAt: serverTimestamp(),
      };

      if (prompt) {
        await updateDoc(doc(db, "prompts", prompt.id), data);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "prompts"), data);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save. Please try again.");
      setUploadingImage(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="ui-dialog relative flex max-h-[95vh] max-w-3xl flex-col animate-in zoom-in-95 duration-200">
        
        <div className="ui-dialog-header">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {prompt ? "Edit Prompt" : "New Prompt"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="ui-icon-button"
            aria-label="Close prompt form"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="prompt-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="ui-label">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required
                  autoFocus
                  className="ui-input"
                  placeholder="e.g. Expert Copywriter" 
                />
              </div>

              <div>
                <label className="ui-label">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="ui-input"
                  disabled={categoriesLoading}
                  required
                >
                  <option value="">Select Main Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="ui-label">
                  Subcategory
                </label>
                <select 
                  name="subcategory" 
                  value={form.subcategory} 
                  onChange={handleChange} 
                  className="ui-input"
                  disabled={!form.category || subcategoriesLoading}
                >
                  <option value="">
                    {!form.category ? "Select Main Category First" : "Select Subcategory"}
                  </option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
                {form.category && filteredSubcategories.length === 0 && !subcategoriesLoading && (
                  <p className="mt-1 text-xs text-amber-600">
                    No subcategories found for this category. You can add one in Subcategories tab.
                  </p>
                )}
              </div>

              <div>
                <label className="ui-label">AI Tool</label>
                <select 
                  name="aiTool" 
                  value={form.aiTool} 
                  onChange={handleChange} 
                  className="ui-input"
                >
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="Midjourney">Midjourney</option>
                  <option value="Claude">Claude</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ui-label">Rating</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating" 
                    value={form.rating} 
                    onChange={handleChange} 
                    className="ui-input"
                  />
                </div>
                <div>
                  <label className="ui-label">Copy Count</label>
                  <input 
                    type="number" 
                    name="copyCount" 
                    value={form.copyCount} 
                    onChange={handleChange} 
                    className="ui-input"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={form.isPremium}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-['']"></div>
              </div>
              <div>
                <label className="cursor-pointer text-sm font-semibold text-amber-900" onClick={() => setForm(prev => ({ ...prev, isPremium: !prev.isPremium }))}>
                  Premium Prompt 💎
                </label>
                <p className="text-xs text-amber-700">Only accessible to users who watch an ad or have a subscription.</p>
              </div>
            </div>

            <div>
              <label className="ui-label">
                Image / Thumbnail
              </label>
              
              <div 
                className="group relative mt-1 flex cursor-pointer justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 pb-6 pt-5 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                
                <div className="relative z-0 space-y-2 text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={imagePreview} alt="Preview" className="mb-3 h-32 rounded-lg object-contain shadow-sm" />
                      <p className="text-xs font-medium text-slate-500">Click or drag to replace image</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-12 w-12 text-slate-400">
                        <ImageIcon size={48} strokeWidth={1} />
                      </div>
                      <div className="flex justify-center text-sm text-slate-600">
                        <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="ui-label">
                Prompt Text <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="promptText" 
                value={form.promptText} 
                onChange={handleChange} 
                rows={5}
                required
                className="ui-input resize-y py-3 font-mono"
                placeholder="Act as a professional copywriter..." 
              />
            </div>

            <div>
              <label className="ui-label">Instructions (Optional)</label>
              <textarea 
                name="instructions" 
                value={form.instructions} 
                onChange={handleChange} 
                rows={3}
                className="ui-input resize-y py-3"
                placeholder="How to use this prompt..." 
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

          </form>
        </div>

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
            form="prompt-form"
            disabled={saving}
            className="ui-button-primary"
          >
            {saving || uploadingImage ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? (uploadingImage ? "Uploading Image..." : "Saving...") : "Save Prompt"}
          </button>
        </div>

      </div>
    </div>
  );
}
