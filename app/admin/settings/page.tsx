"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Loader2, 
  Save, 
  Image as ImageIcon, 
  MapPin, 
  UploadCloud, 
  Megaphone, 
  BellRing,
  Plus,
  Trash2
} from "lucide-react";
import { purgeWebsiteCache } from "@/app/actions/cache";

// --- REUSABLE CLOUDINARY UPLOAD COMPONENT ---
const CloudinaryUpload = ({ currentImage, onUpload }: { currentImage: string, onUpload: (url: string) => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string); 

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.secure_url) {
        onUpload(data.secure_url);
      } else {
        alert("Upload failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert("Something went wrong with the upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      {currentImage && (
        <img src={currentImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0" />
      )}
      <div className="relative w-full">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
        />
        <div className={`w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-lg transition-colors ${uploading ? 'bg-gray-50 border-gray-300 text-gray-400' : 'bg-brand-primary/5 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 cursor-pointer'}`}>
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
          <span className="font-bold text-sm tracking-wide uppercase">
            {uploading ? "Uploading..." : "Click or Tap to Upload Image"}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- DEFAULT HOMEPAGE DATA ---
const DEFAULT_HOME_DATA = {
  heroImage: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1200&auto=format&fit=crop",
  kingSizeImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
  doubleBedImage: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780488159/db_fvbirv.jpg",
  destinations: [
    { name: "Keran Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780495146/kkk_zynfng.jpg" },
    { name: "Bungus Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780469195/bungus_valley_fsuopv.jpg" },
    { name: "Sharda Mandir", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780495015/2024_7_largeimg_476843546_ubb7dv.jpg" },
    { name: "Lolab Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780497987/0_lryde3.jpg" },
    { name: "Teetwal", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780833879/teetwal-valley_kashmir_brown_chinar_kashmir_mzofsm.webp" },
    { name: "Kalaroos Caves", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780833878/kalaroos_caves_ftrcrp.jpg" },
    { name: "Sadhna Top", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780833878/sadhna_hi0jeh.jpg" },
  ],
  announcementBanner: {
    enabled: false,
    text: "Restaurant is temporarily closed today for private event.",
    bgColor: "#dc2626", 
    textColor: "#ffffff",
    linkText: "Read More",
    linkUrl: "/about"
  },
  frontendPopup: {
    enabled: false,
    title: "Special Winter Offer!",
    message: "Get 20% off on all Premium Room bookings this weekend. Limited availability.",
    image: "",
    buttonText: "Book Now",
    buttonUrl: "/book",
    delay: 3 
  }
};

export default function AdminHomepageSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homeData, setHomeData] = useState(DEFAULT_HOME_DATA);

  useEffect(() => {
    const fetchSettings = async () => {
      const docSnap = await getDoc(doc(db, "settings", "homepage"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHomeData({ 
          ...DEFAULT_HOME_DATA, 
          ...data,
          destinations: data.destinations || DEFAULT_HOME_DATA.destinations, // Ensure destinations exist
          announcementBanner: { ...DEFAULT_HOME_DATA.announcementBanner, ...(data.announcementBanner || {}) },
          frontendPopup: { ...DEFAULT_HOME_DATA.frontendPopup, ...(data.frontendPopup || {}) }
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "homepage"), homeData);
      await purgeWebsiteCache();
      alert("Homepage settings updated successfully!");
    } catch (error) {
      console.error("Error saving homepage settings", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateDestination = (index: number, field: "name" | "img", value: string) => {
    const newDestinations = [...homeData.destinations];
    newDestinations[index][field] = value;
    setHomeData({ ...homeData, destinations: newDestinations });
  };

  const addDestination = () => {
    setHomeData({
      ...homeData,
      destinations: [...homeData.destinations, { name: "New Destination", img: "" }]
    });
  };

  const removeDestination = (indexToRemove: number) => {
    if (confirm("Are you sure you want to remove this destination?")) {
      const newDestinations = homeData.destinations.filter((_, index) => index !== indexToRemove);
      setHomeData({ ...homeData, destinations: newDestinations });
    }
  };

  const updateBanner = (field: string, value: string | boolean) => {
    setHomeData({ ...homeData, announcementBanner: { ...homeData.announcementBanner, [field]: value } });
  };

  const updatePopup = (field: string, value: string | boolean | number) => {
    setHomeData({ ...homeData, frontendPopup: { ...homeData.frontendPopup, [field]: value } });
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-primary w-8 h-8" /></div>;

  return (
    <div className="max-w-5xl space-y-8 pb-20 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-serif text-brand-text">Homepage Customization</h2>
          <p className="text-gray-500 text-sm mt-1">Manage global banners, pop-ups, and main showcase images.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#A65520] transition-colors shadow-sm whitespace-nowrap"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Publish to Live Site
        </button>
      </div>

      {/* 1. GLOBAL ANNOUNCEMENT BANNER */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <div className="flex items-center gap-2">
            <Megaphone className="text-brand-primary w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-800">Global Announcement Banner</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={homeData.announcementBanner.enabled} onChange={(e) => updateBanner("enabled", e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            <span className="ml-3 text-sm font-bold uppercase tracking-wider text-gray-600">
              {homeData.announcementBanner.enabled ? "Active" : "Hidden"}
            </span>
          </label>
        </div>
        
        <div className={`space-y-6 transition-opacity ${!homeData.announcementBanner.enabled && 'opacity-50 pointer-events-none'}`}>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Banner Message</label>
            <input type="text" value={homeData.announcementBanner.text} onChange={(e) => updateBanner("text", e.target.value)} placeholder="e.g., The restaurant is closed today." className="w-full p-3 border border-gray-300 rounded focus:border-brand-primary outline-none font-medium text-gray-800" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Background Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={homeData.announcementBanner.bgColor} onChange={(e) => updateBanner("bgColor", e.target.value)} className="h-10 w-10 cursor-pointer border border-gray-300 rounded" />
                <span className="text-sm text-gray-600 font-mono">{homeData.announcementBanner.bgColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Text Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={homeData.announcementBanner.textColor} onChange={(e) => updateBanner("textColor", e.target.value)} className="h-10 w-10 cursor-pointer border border-gray-300 rounded" />
                <span className="text-sm text-gray-600 font-mono">{homeData.announcementBanner.textColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Link Text (Optional)</label>
              <input type="text" value={homeData.announcementBanner.linkText} onChange={(e) => updateBanner("linkText", e.target.value)} placeholder="e.g., Read More" className="w-full p-2.5 border border-gray-300 rounded focus:border-brand-primary outline-none text-sm font-medium text-gray-800" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Link URL (Optional)</label>
              <input type="text" value={homeData.announcementBanner.linkUrl} onChange={(e) => updateBanner("linkUrl", e.target.value)} placeholder="e.g., /contact" className="w-full p-2.5 border border-gray-300 rounded focus:border-brand-primary outline-none text-sm font-medium text-gray-800" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. FRONTEND POP-UP */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <div className="flex items-center gap-2">
            <BellRing className="text-brand-primary w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-800">Frontend Pop-up Settings</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={homeData.frontendPopup.enabled} onChange={(e) => updatePopup("enabled", e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            <span className="ml-3 text-sm font-bold uppercase tracking-wider text-gray-600">
              {homeData.frontendPopup.enabled ? "Active" : "Hidden"}
            </span>
          </label>
        </div>
        
        <div className={`space-y-6 transition-opacity ${!homeData.frontendPopup.enabled && 'opacity-50 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Pop-up Title</label>
                <input type="text" value={homeData.frontendPopup.title} onChange={(e) => updatePopup("title", e.target.value)} className="w-full p-3 border border-gray-300 rounded focus:border-brand-primary outline-none font-medium text-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Message</label>
                <textarea rows={3} value={homeData.frontendPopup.message} onChange={(e) => updatePopup("message", e.target.value)} className="w-full p-3 border border-gray-300 rounded focus:border-brand-primary outline-none font-medium text-gray-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Button Text</label>
                  <input type="text" value={homeData.frontendPopup.buttonText} onChange={(e) => updatePopup("buttonText", e.target.value)} className="w-full p-2.5 border border-gray-300 rounded focus:border-brand-primary outline-none text-sm font-medium text-gray-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Button URL</label>
                  <input type="text" value={homeData.frontendPopup.buttonUrl} onChange={(e) => updatePopup("buttonUrl", e.target.value)} className="w-full p-2.5 border border-gray-300 rounded focus:border-brand-primary outline-none text-sm font-medium text-gray-800" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Delay (Seconds before showing)</label>
                <input type="number" min="0" value={homeData.frontendPopup.delay} onChange={(e) => updatePopup("delay", Number(e.target.value))} className="w-full max-w-[150px] p-2.5 border border-gray-300 rounded focus:border-brand-primary outline-none text-sm font-medium text-gray-800" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col justify-center">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Pop-up Image (Optional)</label>
              <CloudinaryUpload 
                currentImage={homeData.frontendPopup.image} 
                onUpload={(url) => updatePopup("image", url)} 
              />
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">Adding a high-quality image helps convert visitors. Leave empty for a text-only pop-up.</p>
            </div>
          </div>
        </div>
      </div>


      {/* 3. MAIN IMAGES SECTION */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b pb-2">
          <ImageIcon className="text-brand-primary w-5 h-5" />
          <h3 className="text-lg font-bold text-gray-800">Primary Showcase Images</h3>
        </div>
        <div className="space-y-8">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Hero Banner Image</label>
            <CloudinaryUpload 
              currentImage={homeData.heroImage} 
              onUpload={(url) => setHomeData({...homeData, heroImage: url})} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">King Size Room Image</label>
              <CloudinaryUpload 
                currentImage={homeData.kingSizeImage} 
                onUpload={(url) => setHomeData({...homeData, kingSizeImage: url})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Double Bed Room Image</label>
              <CloudinaryUpload 
                currentImage={homeData.doubleBedImage} 
                onUpload={(url) => setHomeData({...homeData, doubleBedImage: url})} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. DYNAMIC NEARBY DESTINATIONS SECTION */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="text-brand-primary w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-800">Nearby Scenic Destinations</h3>
          </div>
          <span className="text-sm font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
            {homeData.destinations.length} Active
          </span>
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-6">
          Add, edit, or remove nearby destinations shown in the scrolling marquee.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {homeData.destinations.map((dest, index) => (
            <div key={index} className="bg-gray-50 p-5 border border-gray-200 rounded-xl space-y-4 relative group hover:border-brand-primary/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Location {index + 1}</span>
                <button 
                  onClick={() => removeDestination(index)}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove Destination"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Destination Name</label>
                <input 
                  type="text" 
                  value={dest.name} 
                  onChange={(e) => updateDestination(index, "name", e.target.value)} 
                  className="w-full p-2.5 mt-1 border border-gray-300 rounded focus:border-brand-primary outline-none font-medium text-gray-800" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Upload Location Image</label>
                <CloudinaryUpload 
                  currentImage={dest.img} 
                  onUpload={(url) => updateDestination(index, "img", url)} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* ADD NEW DESTINATION BUTTON */}
        <button 
          onClick={addDestination}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Add New Destination</span>
        </button>
      </div>

    </div>
  );
}