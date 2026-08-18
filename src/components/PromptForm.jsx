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
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative bg-white border border-gray-200 rounded-xl w-full max-w-3xl shadow-xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <FileText size={18} className="text-gray-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {prompt ? "Edit Prompt" : "New Prompt"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="prompt-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm" 
                  placeholder="e.g. Expert Copywriter" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subcategory
                </label>
                <select 
                  name="subcategory" 
                  value={form.subcategory} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
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
                  <p className="text-xs text-amber-600 mt-1">
                    No subcategories found for this category. You can add one in Subcategories tab.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">AI Tool</label>
                <select 
                  name="aiTool" 
                  value={form.aiTool} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm"
                >
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="Midjourney">Midjourney</option>
                  <option value="Claude">Claude</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating" 
                    value={form.rating} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Copy Count</label>
                  <input 
                    type="number" 
                    name="copyCount" 
                    value={form.copyCount} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={form.isPremium}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </div>
              <div>
                <label className="text-sm font-bold text-amber-900 cursor-pointer" onClick={() => setForm(prev => ({ ...prev, isPremium: !prev.isPremium }))}>
                  Premium Prompt 💎
                </label>
                <p className="text-xs text-amber-700">Only accessible to users who watch an ad or have a subscription.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Image / Thumbnail
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="space-y-2 text-center relative z-0">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-md shadow-sm mb-3" />
                      <p className="text-xs text-gray-500 font-medium">Click or drag to replace image</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <ImageIcon size={48} strokeWidth={1} />
                      </div>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prompt Text <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="promptText" 
                value={form.promptText} 
                onChange={handleChange} 
                rows={5}
                required
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm resize-y font-mono" 
                placeholder="Act as a professional copywriter..." 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructions (Optional)</label>
              <textarea 
                name="instructions" 
                value={form.instructions} 
                onChange={handleChange} 
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm resize-y" 
                placeholder="How to use this prompt..." 
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="prompt-form"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
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