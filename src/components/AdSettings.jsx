import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Save, Smartphone, LayoutTemplate, Square, MonitorSmartphone, Loader2, AlertCircle, CheckCircle2, Video, Gift } from "lucide-react";

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
    rewardedInterstitialAdUnitId: "",
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
        <div className="ui-card space-y-5 p-6" aria-label="Loading ad settings">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 animate-pulse rounded bg-slate-100" />
            <div className="h-10 animate-pulse rounded bg-slate-100" />
          </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="ui-page-heading">Ad Settings</h2>
          <p className="ui-page-copy">Manage monetization and the AdMob IDs used in your mobile app.</p>
        </div>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="ui-card p-6">
          
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <div className="rounded-xl bg-indigo-50 p-2">
              <Smartphone size={18} className="text-indigo-600" />
            </div>
            General Configuration
          </h3>
          
          <div className="space-y-6">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50">
              <div>
                <div className="mb-1 font-medium text-slate-900">Enable Ads</div>
                <div className="text-sm text-slate-500">Turn on or off all ads across the mobile app.</div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="showAds"
                  checked={settings.showAds}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-['']"></div>
              </div>
            </label>

            <div>
              <label className="ui-label">AdMob App ID</label>
              <input
                type="text"
                name="adMobAppId"
                value={settings.adMobAppId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                className="ui-input"
              />
            </div>
          </div>
        </div>

        {/* Ad Units */}
        <div className={`ui-card p-6 transition-opacity duration-200 ${!settings.showAds ? 'pointer-events-none opacity-50' : ''}`}>
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <div className="rounded-xl bg-indigo-50 p-2">
              <LayoutTemplate size={18} className="text-indigo-600" />
            </div>
            Ad Unit IDs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="ui-label flex items-center gap-2">
                <Square size={16} className="text-slate-400" />
                Banner Ad Unit ID
              </label>
              <input
                type="text"
                name="bannerAdUnitId"
                value={settings.bannerAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="ui-input"
              />
            </div>
            
            <div>
              <label className="ui-label flex items-center gap-2">
                <MonitorSmartphone size={16} className="text-slate-400" />
                Interstitial Ad Unit ID
              </label>
              <input
                type="text"
                name="interstitialAdUnitId"
                value={settings.interstitialAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="ui-input"
              />
            </div>

            <div>
              <label className="ui-label flex items-center gap-2">
                <Smartphone size={16} className="text-slate-400" />
                App Open Ad Unit ID
              </label>
              <input
                type="text"
                name="appOpenAdUnitId"
                value={settings.appOpenAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="ui-input"
              />
            </div>
            
            <div>
              <label className="ui-label flex items-center gap-2">
                <LayoutTemplate size={16} className="text-slate-400" />
                Native Ad Unit ID
              </label>
              <input
                type="text"
                name="nativeAdUnitId"
                value={settings.nativeAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="ui-input"
              />
            </div>

            <div>
              <label className="ui-label flex items-center gap-2">
                <Gift size={16} className="text-slate-400" />
                Rewarded Ad Unit ID
              </label>
              <input
                type="text"
                name="rewardedAdUnitId"
                value={settings.rewardedAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="ui-input"
              />
            </div>

            <div>
              <label className="ui-label flex items-center gap-2">
                <Video size={16} className="text-slate-400" />
                Rewarded Interstitial Ad Unit ID
              </label>
              <input
                type="text"
                name="rewardedInterstitialAdUnitId"
                value={settings.rewardedInterstitialAdUnitId}
                onChange={handleChange}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="ui-input"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="ui-button-primary px-6"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
