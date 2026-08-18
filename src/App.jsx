import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
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


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
  };

  const handleCategoryClose = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin border-2 border-blue-500 border-t-transparent rounded-full w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "prompts" && (
        <PromptList onEdit={handleEdit} onAdd={handleAdd} />
      )}
      {activeTab === "categories" && (
        <CategoryList onEdit={handleCategoryEdit} onAdd={handleCategoryAdd} />
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