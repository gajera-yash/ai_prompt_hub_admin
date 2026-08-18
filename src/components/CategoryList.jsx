import { useState, useEffect, Fragment } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";
import { db } from "../config/firebase";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  AlertTriangle, 
  Layers, 
  FolderTree, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Check,
  X
} from "lucide-react";

export default function CategoryList({ onEdit, onAdd }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Inline Subcategory Adding/Editing state
  const [addingSubcategory, setAddingSubcategory] = useState(null); // categoryId
  const [newSubName, setNewSubName] = useState("");
  
  const [editingSubcategory, setEditingSubcategory] = useState(null); // { catId, originalName }
  const [editSubName, setEditSubName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const catQ = query(collection(db, "categories"), orderBy("name", "asc"));
      const catSnapshot = await getDocs(catQ);
      const catList = catSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        subcategories: doc.data().subcategories || [],
      }));
      setCategories(catList);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Category to DB after adding/editing/deleting a subcategory
  const syncCategoryToDB = async (categoryId, newSubcategories) => {
    try {
      await updateDoc(doc(db, "categories", categoryId), {
         subcategories: newSubcategories
      });
      setCategories(prev => prev.map(c => 
         c.id === categoryId ? { ...c, subcategories: newSubcategories } : c
      ));
    } catch (err) {
      console.error("Failed to sync subcategories:", err);
      alert("Error saving subcategory. Please try again.");
    }
  };

  const handleAddSubcategory = async (categoryId) => {
    if (!newSubName.trim()) return;
    const cat = categories.find(c => c.id === categoryId);
    if (cat.subcategories.includes(newSubName.trim())) {
        alert("Subcategory already exists.");
        return;
    }
    const newSubcategories = [...cat.subcategories, newSubName.trim()];
    await syncCategoryToDB(categoryId, newSubcategories);
    setAddingSubcategory(null);
    setNewSubName("");
  };

  const handleEditSubcategory = async (categoryId, originalName) => {
    if (!editSubName.trim()) return;
    const cat = categories.find(c => c.id === categoryId);
    const newSubcategories = [...cat.subcategories];
    const index = newSubcategories.indexOf(originalName);
    if (index !== -1) {
        if (editSubName !== originalName && newSubcategories.includes(editSubName.trim())) {
            alert("Subcategory already exists.");
            return;
        }
        newSubcategories[index] = editSubName.trim();
        await syncCategoryToDB(categoryId, newSubcategories);
    }
    setEditingSubcategory(null);
    setEditSubName("");
  };

  const handleDeleteSubcategory = async (categoryId, subName) => {
    if (window.confirm(`Are you sure you want to delete the subcategory "${subName}"?`)) {
        const cat = categories.find(c => c.id === categoryId);
        const newSubcategories = cat.subcategories.filter(s => s !== subName);
        await syncCategoryToDB(categoryId, newSubcategories);
    }
  };

  const handleDeleteCategory = async (id) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = categories.filter((c) => {
    const searchLower = search.toLowerCase();
    if (c.name?.toLowerCase().includes(searchLower)) return true;
    if (c.subcategories?.some(sub => sub.toLowerCase().includes(searchLower))) return true;
    return false;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCategories = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Categories & Subcategories
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Manage all prompt categories and their subcategories in one place.</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories or subcategories..."
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
            <Layers className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-900 font-medium mb-1">No categories found</p>
          <p className="text-gray-500 text-sm">
            {search ? "Try a different search term" : "Click 'Create Category' to add your first one"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div className="w-8"></div>
            <div className="flex-1">Category Name</div>
            <div className="w-32 text-center">Subcategories</div>
            <div className="w-24 text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-100">
            {paginatedCategories.map((category) => {
              const subs = category.subcategories || [];
              const isExpanded = expanded[category.id];
              return (
                <div key={category.id} className="flex flex-col group transition-colors">
                  <div className={`flex items-center px-4 py-3 hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}>
                    <div className="w-8 flex items-center justify-center">
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                    <div className="flex-1 font-medium text-gray-900 flex items-center gap-2 cursor-pointer" onClick={() => toggleExpand(category.id)}>
                      {category.name}
                    </div>
                    <div className="w-32 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                        <FolderTree size={12} />
                        {subs.length}
                      </span>
                    </div>
                    <div className="w-24 flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                        title="Edit Category"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(category.id); }}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Subcategories Panel */}
                  {isExpanded && (
                    <div className="bg-gray-50/80 border-t border-gray-100 pl-14 pr-4 py-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {subs.length === 0 ? (
                           <span className="text-sm text-gray-400 italic">No subcategories yet.</span>
                        ) : (
                          subs.map((sub) => {
                            const isEditing = editingSubcategory?.catId === category.id && editingSubcategory?.originalName === sub;
                            if (isEditing) {
                              return (
                                <div key={sub} className="inline-flex items-center gap-1 bg-white border border-blue-300 rounded-md shadow-sm pl-2 pr-1 py-1">
                                  <input
                                    autoFocus
                                    className="text-sm outline-none w-32 bg-transparent text-gray-900"
                                    value={editSubName}
                                    onChange={(e) => setEditSubName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleEditSubcategory(category.id, sub);
                                      if (e.key === "Escape") setEditingSubcategory(null);
                                    }}
                                  />
                                  <button onClick={() => handleEditSubcategory(category.id, sub)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setEditingSubcategory(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                                    <X size={14} />
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={sub}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-700 shadow-sm group/sub"
                              >
                                <span className="mr-1">{sub}</span>
                                <div className="flex items-center opacity-0 group-hover/sub:opacity-100 transition-opacity gap-0.5">
                                    <button 
                                      onClick={() => {
                                        setEditingSubcategory({ catId: category.id, originalName: sub });
                                        setEditSubName(sub);
                                      }}
                                      className="p-0.5 text-gray-400 hover:text-blue-600 rounded"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSubcategory(category.id, sub)}
                                      className="p-0.5 text-gray-400 hover:text-red-600 rounded"
                                    >
                                      <X size={14} />
                                    </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add Subcategory Inline */}
                      {addingSubcategory === category.id ? (
                        <div className="inline-flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            autoFocus
                            placeholder="New Subcategory..."
                            value={newSubName}
                            onChange={(e) => setNewSubName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddSubcategory(category.id);
                              if (e.key === "Escape") setAddingSubcategory(null);
                            }}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                          />
                          <button
                            onClick={() => handleAddSubcategory(category.id)}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setAddingSubcategory(null)}
                            className="px-2 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAddingSubcategory(category.id);
                            setNewSubName("");
                          }}
                          className="inline-flex items-center gap-1 mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Plus size={14} />
                          Add Subcategory
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filtered.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> categories
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-900 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
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
                Delete Category
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this category? Prompts using this category might lose their association. This cannot be undone.
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
                onClick={() => handleDeleteCategory(deleteConfirm)}
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
