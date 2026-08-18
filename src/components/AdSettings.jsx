import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Save, Smartphone, LayoutTemplate, Square, MonitorSmartphone, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [settings, setSettings] = useState({
    showAds: true,
    adMobAppId: "",
    bannerAdUnitId: "",
    interstitialAdUnitId: "",
    appOpenAdUnitId: "",
    nativeAdUnitId: "",
    rewardedAdUnitId: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "appSettings");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setStatus({ type: "error", message: "Failed to load settings." });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });
    
    try {
      const docRef = doc(db, "settings", "appSettings");
      await setDoc(docRef, settings, { merge: true });
      setStatus({ type: "success", message: "Settings saved successfully!" });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setStatus({ type: "error", message: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin border-4 border-gray-100 border-t-gray-900 rounded-full w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Ad Settings</h2>
          <p className="text-gray-500 mt-1 text-sm">Manage monetization and AdMob units.</p>
        </div>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Smartphone size={18} className="text-gray-600" />
            </div>
            General Configuration
          </h3>
          
          <div className="space-y-6">
            <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="text-gray-900 font-medium mb-1">Enable Ads</div>
                <div className="text-sm text-gray-500">Turn on/off all ads across the mobile app.</div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="showAds"
                  checked={settings.showAds}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">AdMob App ID</label>
              <input
                type="text"
                name="adMobAppId"
                value={settings.adMobAppId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Ad Units */}
        <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-opacity duration-300 ${!settings.showAds ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <div className="p-2 bg-gray-50 rounded-lg">
              <LayoutTemplate size={18} className="text-gray-600" />
            </div>
            Ad Unit IDs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Square size={16} className="text-gray-400" />
                Banner Ad Unit ID
              </label>
              <input
                type="text"
                name="bannerAdUnitId"
                value={settings.bannerAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <MonitorSmartphone size={16} className="text-gray-400" />
                Interstitial Ad Unit ID
              </label>
              <input
                type="text"
                name="interstitialAdUnitId"
                value={settings.interstitialAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Smartphone size={16} className="text-gray-400" />
                App Open Ad Unit ID
              </label>
              <input
                type="text"
                name="appOpenAdUnitId"
                value={settings.appOpenAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <LayoutTemplate size={16} className="text-gray-400" />
                Native Ad Unit ID
              </label>
              <input
                type="text"
                name="nativeAdUnitId"
                value={settings.nativeAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
