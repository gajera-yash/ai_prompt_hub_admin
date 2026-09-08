import { useState, useEffect } from "react";
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="ui-page-heading">
            Categories & Subcategories
          </h2>
          <p className="ui-page-copy">Organize the categories and subcategories used across your prompt library.</p>
        </div>
        <button
          onClick={onAdd}
          className="ui-button-primary"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      <div className="ui-card mb-6 p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories or subcategories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ui-input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="ui-card space-y-5 p-6" aria-label="Loading categories">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
          {["one", "two", "three", "four"].map((row) => (
            <div key={row} className="flex items-center gap-6 border-t border-slate-100 pt-5">
              <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ui-card border-dashed py-16 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Layers className="text-slate-400" size={24} />
          </div>
          <p className="mb-1 font-semibold text-slate-900">No categories found</p>
          <p className="text-sm text-slate-500">
            {search ? "Try a different search term" : "Click 'Create Category' to add your first one"}
          </p>
        </div>
      ) : (
        <div className="ui-card mb-6 overflow-hidden">
          <div className="sticky top-0 z-10 flex items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div className="w-8"></div>
            <div className="flex-1">Category Name</div>
            <div className="w-32 text-center">Subcategories</div>
            <div className="w-24 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {paginatedCategories.map((category) => {
              const subs = category.subcategories || [];
              const isExpanded = expanded[category.id];
              return (
                <div key={category.id} className="group flex flex-col transition-colors">
                  <div className={`flex items-center px-4 py-3.5 transition-colors hover:bg-slate-50 ${isExpanded ? 'bg-slate-50/40' : ''}`}>
                    <div className="w-8 flex items-center justify-center">
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="ui-icon-button h-7 w-7"
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                    <div className="flex flex-1 cursor-pointer items-center gap-2 font-medium text-slate-900" onClick={() => toggleExpand(category.id)}>
                      {category.name}
                    </div>
                    <div className="w-32 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        <FolderTree size={12} />
                        {subs.length}
                      </span>
                    </div>
                    <div className="w-24 flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                        className="ui-icon-button"
                        title="Edit Category"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(category.id); }}
                        className="ui-icon-button hover:bg-red-50 hover:text-red-600"
                        title="Delete Category"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Subcategories Panel */}
                  {isExpanded && (
                    <div className="animate-in border-t border-indigo-100 bg-slate-50/80 py-4 pl-14 pr-4 duration-200">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {subs.length === 0 ? (
                           <span className="text-sm italic text-slate-400">No subcategories yet.</span>
                        ) : (
                          subs.map((sub) => {
                            const isEditing = editingSubcategory?.catId === category.id && editingSubcategory?.originalName === sub;
                            if (isEditing) {
                              return (
                                <div key={sub} className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-white py-1 pl-2 pr-1 shadow-sm">
                                  <input
                                    autoFocus
                                    className="w-32 bg-transparent text-sm text-slate-900 outline-none"
                                    value={editSubName}
                                    onChange={(e) => setEditSubName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleEditSubcategory(category.id, sub);
                                      if (e.key === "Escape") setEditingSubcategory(null);
                                    }}
                                  />
                                   <button onClick={() => handleEditSubcategory(category.id, sub)} className="rounded p-1 text-emerald-600 hover:bg-emerald-50" aria-label={`Save ${sub}`}>
                                    <Check size={14} />
                                  </button>
                                   <button onClick={() => setEditingSubcategory(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label={`Cancel editing ${sub}`}>
                                    <X size={14} />
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={sub}
                                className="group/sub inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                              >
                                <span className="mr-1">{sub}</span>
                                <div className="flex items-center opacity-0 group-hover/sub:opacity-100 transition-opacity gap-0.5">
                                    <button 
                                      onClick={() => {
                                        setEditingSubcategory({ catId: category.id, originalName: sub });
                                        setEditSubName(sub);
                                      }}
                                       className="rounded p-0.5 text-slate-400 hover:text-indigo-600"
                                       aria-label={`Edit ${sub}`}
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSubcategory(category.id, sub)}
                                       className="rounded p-0.5 text-slate-400 hover:text-red-600"
                                       aria-label={`Delete ${sub}`}
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
                            className="ui-input w-52 py-1.5"
                          />
                          <button
                            onClick={() => handleAddSubcategory(category.id)}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setAddingSubcategory(null)}
                            className="px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
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
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
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
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> categories
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="ui-icon-button border border-slate-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-sm font-medium text-slate-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="ui-icon-button border border-slate-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
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
                Delete Category
              </h3>
            </div>
            <p className="mb-6 text-sm leading-6 text-slate-500">
              Are you sure you want to delete this category? Prompts using this category might lose their association. This cannot be undone.
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
                onClick={() => handleDeleteCategory(deleteConfirm)}
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
