import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./config/firebase";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import PromptList from "./components/PromptList";
import PromptForm from "./components/PromptForm";
import CategoryList from "./components/CategoryList";
import CategoryForm from "./components/CategoryForm";
import Feedback from "./components/Feedback";
import Notifications from "./components/Notifications";

import AdSettings from "./components/AdSettings";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const expirationTime = firebaseUser?.stsTokenManager?.expirationTime;

      if (firebaseUser && expirationTime && Date.now() >= expirationTime) {
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingPrompt(null);
    setShowForm(true);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditingPrompt(null);
    setActiveTab("prompts");
    setRefreshKey(prev => prev + 1);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPrompt(null);
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategoryAdd = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleCategorySaved = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setActiveTab("categories");
    setRefreshKey(prev => prev + 1);
  };

  const handleCategoryClose = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };



  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          Loading workspace
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && <Dashboard key={`dashboard-${refreshKey}`} />}
      {activeTab === "prompts" && (
        <PromptList key={`prompts-${refreshKey}`} onEdit={handleEdit} onAdd={handleAdd} />
      )}
      {activeTab === "categories" && (
        <CategoryList key={`categories-${refreshKey}`} onEdit={handleCategoryEdit} onAdd={handleCategoryAdd} />
      )}
      
      {activeTab === "feedback" && <Feedback />}
      {activeTab === "notifications" && <Notifications />}

      {activeTab === "ads" && <AdSettings />}

      {showForm && (
        <PromptForm
          prompt={editingPrompt}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCategoryClose}
          onSaved={handleCategorySaved}
        />
      )}


    </Layout>
  );
}
