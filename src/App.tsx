/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  User, 
  Image as ImageIcon, 
  Video, 
  Layers, 
  Download, 
  Copy, 
  RefreshCw, 
  Upload, 
  Check, 
  ChevronRight,
  Sparkles,
  Trash2,
  FileText,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

// --- Constants ---

const CHARACTER_TYPES = [
  "Ông lão", "Bà lão", "Trung niên", "Thanh niên", "Cô gái", "Cậu bé",
  "Mèo nhân hóa", "Chó nhân hóa", "Cáo nhân hóa", "Gà nhân hóa", "Hổ nhân hóa", "Gấu nhân hóa",
  "Khổng Minh", "Tào Tháo", "Quan Vũ", "Lưu Bị", "Triệu Vân", "Tôn Ngộ Không"
];

const CLOTHING_OPTIONS = [
  "Áo nâu sờn cũ", "Áo dài truyền thống", "Vest sang trọng", "Trang phục cổ trang", 
  "Áo dân dã", "Áo bào gấm vóc", "Áo sơ mi đơn giản", "Trang phục võ thuật", "Áo choàng lữ hành",
  "Áo măng tô sang trọng", "Áo dài Nhật Bình", "Áo dài cổ phục hoàng cung", "Trang phục dân tộc H'Mông", 
  "Trang phục dân tộc Thái", "Váy dạ hội quý phái", "Áo sườn xám cách tân", "Áo bà ba lụa tơ tằm", 
  "Áo vest Bến Thượng Hải", "Áo choàng quý tộc"
];

const ACCESSORIES = [
  "Gậy gỗ", "Nón lá", "Quạt lông vũ", "Kính cận", "Túi xách", "Đèn lồng", 
  "Kiếm cổ", "Sách cũ", "Bàn trà", "Tẩu thuốc", "Chuỗi tràng hạt",
  "Nón rộng vành", "Giày boot cao cổ", "Mũ phớt"
];

const BACKGROUNDS = [
  "Cánh đồng lúa chín", "Nhà tranh vách đất", "Sân chùa thanh tịnh", "Văn phòng hiện đại", 
  "Dưới gốc cây cổ thụ", "Bên bờ suối", "Thư phòng yên tĩnh", "Đỉnh núi mờ sương", "Phố cổ về đêm",
  "Ngồi trong siêu xe hạng sang", "Ngồi tại bàn làm việc quyền lực", "Đứng bên cửa sổ biệt thự", 
  "Khoang máy bay hạng thương gia", "Ghế sau xe Rolls Royce", "Trên boong du thuyền 5 sao", 
  "Sảnh khách sạn sang trọng", "Sân golf xanh mướt", "Ban công view biển", "Phòng họp cao cấp"
];

const CHARACTER_STYLES = [
  "Người thật (Realistic)", "Hoạt hình (3D Animation)"
];

interface CharacterPreset {
  name: string;
  type: string;
  clothing: string;
  accessory: string;
  background: string;
  style: string;
}

const PRESETS: CharacterPreset[] = [
  { name: "Lão nông nghèo", type: "Ông lão", clothing: "Áo nâu sờn cũ", accessory: "Gậy gỗ", background: "Cánh đồng lúa chín", style: "Người thật (Realistic)" },
  { name: "Doanh nhân thành đạt", type: "Trung niên", clothing: "Vest sang trọng", accessory: "Kính cận", background: "Văn phòng hiện đại", style: "Người thật (Realistic)" },
  { name: "Thiền sư tĩnh lặng", type: "Ông lão", clothing: "Áo dài truyền thống", accessory: "Chuỗi tràng hạt", background: "Sân chùa thanh tịnh", style: "Người thật (Realistic)" },
  { name: "Mèo triết gia", type: "Mèo nhân hóa", clothing: "Áo sơ mi đơn giản", accessory: "Sách cũ", background: "Thư phòng yên tĩnh", style: "Hoạt hình (3D Animation)" },
  { name: "Cáo già gian xảo", type: "Cáo nhân hóa", clothing: "Áo bào gấm vóc", accessory: "Tẩu thuốc", background: "Dưới gốc cây cổ thụ", style: "Hoạt hình (3D Animation)" },
  { name: "Khổng Minh suy tư", type: "Khổng Minh", clothing: "Trang phục cổ trang", accessory: "Quạt lông vũ", background: "Đỉnh núi mờ sương", style: "Người thật (Realistic)" },
  { name: "Cô gái vùng cao", type: "Cô gái", clothing: "Áo dân dã", accessory: "Nón lá", background: "Bên bờ suối", style: "Người thật (Realistic)" },
  { name: "Võ sư thâm hậu", type: "Trung niên", clothing: "Trang phục võ thuật", accessory: "Gậy gỗ", background: "Sân chùa thanh tịnh", style: "Người thật (Realistic)" },
  { name: "Lữ hành cô độc", type: "Thanh niên", clothing: "Áo choàng lữ hành", accessory: "Kiếm cổ", background: "Phố cổ về đêm", style: "Người thật (Realistic)" },
  { name: "Bà lão hiền hậu", type: "Bà lão", clothing: "Áo nâu sờn cũ", accessory: "Chuỗi tràng hạt", background: "Nhà tranh vách đất", style: "Người thật (Realistic)" },
  { name: "Hổ tướng quân", type: "Hổ nhân hóa", clothing: "Áo bào gấm vóc", accessory: "Kiếm cổ", background: "Đỉnh núi mờ sương", style: "Hoạt hình (3D Animation)" },
  { name: "Gấu thông thái", type: "Gấu nhân hóa", clothing: "Áo sơ mi đơn giản", accessory: "Kính cận", background: "Thư phòng yên tĩnh", style: "Hoạt hình (3D Animation)" },
  { name: "Tào Tháo bá đạo", type: "Tào Tháo", clothing: "Trang phục cổ trang", accessory: "Kiếm cổ", background: "Dưới gốc cây cổ thụ", style: "Người thật (Realistic)" },
  { name: "Quan Vũ nghĩa hiệp", type: "Quan Vũ", clothing: "Trang phục cổ trang", accessory: "Kiếm cổ", background: "Bên bờ suối", style: "Người thật (Realistic)" },
  { name: "Tôn Ngộ Không", type: "Tôn Ngộ Không", clothing: "Trang phục võ thuật", accessory: "Gậy gỗ", background: "Đỉnh núi mờ sương", style: "Hoạt hình (3D Animation)" },
  { name: "Chó trung thành", type: "Chó nhân hóa", clothing: "Áo dân dã", accessory: "Nón lá", background: "Cánh đồng lúa chín", style: "Hoạt hình (3D Animation)" },
  { name: "Gà thông thái", type: "Gà nhân hóa", clothing: "Áo sơ mi đơn giản", accessory: "Sách cũ", background: "Nhà tranh vách đất", style: "Hoạt hình (3D Animation)" },
  { name: "Thanh niên tri thức", type: "Thanh niên", clothing: "Áo sơ mi đơn giản", accessory: "Kính cận", background: "Văn phòng hiện đại", style: "Người thật (Realistic)" },
  { name: "Cậu bé hiếu thảo", type: "Cậu bé", clothing: "Áo dân dã", accessory: "Gậy gỗ", background: "Cánh đồng lúa chín", style: "Người thật (Realistic)" },
  { name: "Nữ sĩ quan", type: "Cô gái", clothing: "Vest sang trọng", accessory: "Kính cận", background: "Văn phòng hiện đại", style: "Người thật (Realistic)" },
  { name: "Quý bà khí chất 1", type: "Cô gái", clothing: "Áo măng tô sang trọng", accessory: "Nón rộng vành", background: "Đứng bên cửa sổ biệt thự", style: "Người thật (Realistic)" },
  { name: "Quý bà khí chất 2", type: "Trung niên", clothing: "Áo măng tô sang trọng", accessory: "Giày boot cao cổ", background: "Ngồi trong siêu xe hạng sang", style: "Người thật (Realistic)" },
  { name: "Quý bà khí chất 3", type: "Cô gái", clothing: "Áo dài Nhật Bình", accessory: "Quạt lông vũ", background: "Sân chùa thanh tịnh", style: "Người thật (Realistic)" },
  { name: "Quý bà khí chất 4", type: "Trung niên", clothing: "Áo dài cổ phục hoàng cung", accessory: "Chuỗi tràng hạt", background: "Thư phòng yên tĩnh", style: "Người thật (Realistic)" },
  { name: "Quý bà khí chất 5", type: "Cô gái", clothing: "Váy dạ hội quý phái", accessory: "Túi xách", background: "Trên boong du thuyền 5 sao", style: "Người thật (Realistic)" },
  { name: "Bến Thượng Hải 1", type: "Thanh niên", clothing: "Áo măng tô sang trọng", accessory: "Mũ phớt", background: "Phố cổ về đêm", style: "Người thật (Realistic)" },
  { name: "Bến Thượng Hải 2", type: "Trung niên", clothing: "Áo vest Bến Thượng Hải", accessory: "Mũ phớt", background: "Ngồi tại bàn làm việc quyền lực", style: "Người thật (Realistic)" },
  { name: "Bến Thượng Hải 3", type: "Thanh niên", clothing: "Áo măng tô sang trọng", accessory: "Tẩu thuốc", background: "Ghế sau xe Rolls Royce", style: "Người thật (Realistic)" },
  { name: "Bến Thượng Hải 4", type: "Trung niên", clothing: "Áo vest Bến Thượng Hải", accessory: "Kính cận", background: "Khoang máy bay hạng thương gia", style: "Người thật (Realistic)" },
  { name: "Bến Thượng Hải 5", type: "Thanh niên", clothing: "Áo măng tô sang trọng", accessory: "Mũ phớt", background: "Sảnh khách sạn sang trọng", style: "Người thật (Realistic)" }
];

const THEMES = [
  "Bài học cuộc sống", "Thành công", "Thất bại", "Kiếm tiền", "Tình yêu", 
  "Vợ chồng", "Bạn bè", "Lòng người", "Kỷ luật", "Kiên trì", 
  "Đam mê", "Sự nghiệp", "Thời gian", "Cơ hội", "Trưởng thành", 
  "Cô đơn", "Gia đình", "Hạnh phúc", "Tư duy", "Lựa chọn cuộc đời"
];

const VOICE_STYLES = ["Trầm", "Sâu", "Chill", "Hài hước", "Drama"];

// --- Types ---

interface Script {
  title: string;
  scenes: string[];
}

// --- App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'character' | 'video' | 'bulk'>('character');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feature 1: Character State
  const [charType, setCharType] = useState(CHARACTER_TYPES[0]);
  const [clothing, setClothing] = useState(CLOTHING_OPTIONS[0]);
  const [accessory, setAccessory] = useState(ACCESSORIES[0]);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [charStyle, setCharStyle] = useState(CHARACTER_STYLES[0]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Feature 2: Video State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [voiceStyle, setVoiceStyle] = useState(VOICE_STYLES[0]);
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null);

  // Feature 3: Bulk State
  const [bulkThemes, setBulkThemes] = useState<string[]>([THEMES[0]]);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkScripts, setBulkScripts] = useState<Script[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bulkProgress, setBulkProgress] = useState(0);
  const mergeFileInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---

  const applyPreset = (preset: CharacterPreset) => {
    setCharType(preset.type);
    setClothing(preset.clothing);
    setAccessory(preset.accessory);
    setBackground(preset.background);
    setCharStyle(preset.style);
  };

  const randomizeCharacter = () => {
    setCharType(CHARACTER_TYPES[Math.floor(Math.random() * CHARACTER_TYPES.length)]);
    setClothing(CLOTHING_OPTIONS[Math.floor(Math.random() * CLOTHING_OPTIONS.length)]);
    setAccessory(ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)]);
    setBackground(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]);
    setCharStyle(CHARACTER_STYLES[Math.floor(Math.random() * CHARACTER_STYLES.length)]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- AI Logic ---

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const generateCharacter = async () => {
    setLoading(true);
    setError(null);
    try {
      const stylePrompt = charStyle.includes("Realistic") 
        ? "phong cách ảnh chụp thực tế (realistic photography), cực kỳ chi tiết, ánh sáng điện ảnh" 
        : "phong cách hoạt hình 3D (3D animation style), Pixar/Disney style, màu sắc rực rỡ, chi tiết cao";
        
      const prompt = `Tạo hình ảnh [${charType}] theo ${stylePrompt}, đang ở [${background}], mặc [${clothing}], có [${accessory}]. Biểu cảm trầm tư, từng trải, giống người đã trải qua nhiều biến cố cuộc đời. Độ sâu trường ảnh nông, cảm xúc sâu sắc, chi tiết cao, chất lượng 4K.`;
      setGeneratedPrompt(prompt);
      // Removed image generation as per user request
    } catch (err: any) {
      setError(err.message || "Lỗi khi tạo nhân vật");
    } finally {
      setLoading(false);
    }
  };

  const generateVideoScript = async (theme: string, style: string) => {
    const systemInstruction = `Bạn là một người từng trải, nói chuyện như một ông lão hiểu đời. 
Hãy tạo kịch bản 4 cảnh cho video 8 giây, mỗi cảnh 18-25 từ, tổng 80-100 từ.
Chủ đề: ${theme}. Phong cách: ${style}.
Yêu cầu:
- Mỗi cảnh là 1 câu thoại.
- Nhân vật nói tiếng Việt chậm rãi (chỉ nói, không hát).
- Không mô tả lại nhân vật hay đồ vật xung quanh (để phù hợp với mọi ảnh tham chiếu).
- Chỉ mô tả hành động đơn giản và chuyển động camera: zoom gần, zoom vào cận cảnh khuôn mặt, camera chuyển động sang trái hoặc sang phải.
- Tránh các hành động phức tạp với đồ vật (như cầm chén trà, cầm gậy) nếu không chắc chắn đồ vật đó có trong ảnh.
Format:
[Tên tiêu đề] [Scene X] [Hành động/Camera] Nhân vật miệng nói tiếng Việt: "..."`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tạo kịch bản video triết lý về chủ đề ${theme}`,
      config: { systemInstruction }
    });

    const text = response.text || "";
    const lines = text.split('\n').filter(l => l.trim());
    
    // Parse title and scenes
    let title = theme;
    const scenes: string[] = [];
    
    lines.forEach(line => {
      // Try to find title in brackets that isn't a Scene tag
      const titleMatch = line.match(/^\[(?!Scene)(.*?)\]/);
      if (titleMatch) title = titleMatch[1];
      
      if (line.includes('[Scene')) {
        // Clean line to avoid duplicate titles or "Tiêu đề:" prefix
        const cleanLine = line.replace(/^\[.*?\]\s*/, '').trim();
        scenes.push(cleanLine);
      }
    });

    const finalScenes = scenes.map(s => `[${title}] ${s}`);

    return { title, scenes: finalScenes };
  };

  const handleGenerateSingleScript = async () => {
    setLoading(true);
    setError(null);
    try {
      const script = await generateVideoScript(selectedTheme, voiceStyle);
      setGeneratedScript(script);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tạo kịch bản");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulk = async () => {
    setLoading(true);
    setError(null);
    setBulkScripts([]);
    setBulkProgress(0);
    try {
      const scripts: Script[] = [];
      for (let i = 0; i < bulkCount; i++) {
        // Add a small delay between requests to avoid rate limits (RPM)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay
        }

        const randomTheme = bulkThemes[Math.floor(Math.random() * bulkThemes.length)];
        const script = await generateVideoScript(randomTheme, voiceStyle);
        scripts.push(script);
        setBulkScripts(prev => [...prev, script]);
        setBulkProgress(i + 1);
        
        // Auto download each script
        const content = script.scenes.join('\n\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = script.title.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
        a.download = `${safeTitle}_${i + 1}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      let errorMessage = err.message || "Lỗi khi tạo hàng loạt";
      if (errorMessage.includes("429") || errorMessage.includes("quota")) {
        errorMessage = "Bạn đã đạt giới hạn tốc độ (Rate Limit) của API. Vui lòng giảm số lượng kịch bản tạo cùng lúc hoặc đợi một lát rồi thử lại.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadTxt = (script: Script) => {
    const content = script.scenes.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = script.title.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
    a.download = `${safeTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    bulkScripts.forEach((script, i) => {
      const content = script.scenes.join('\n\n');
      const safeTitle = script.title.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
      // Handle potential duplicate titles by adding index
      zip.file(`${safeTitle}_${i + 1}.txt`, content);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = "ai_dao_ly_scripts.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsTxt = () => {
    const content = bulkScripts.map(script => script.scenes.join('\n\n')).join('\n\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "ai_dao_ly_scripts_merged.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMergeFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const contents: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        contents.push(text.trim());
      }
      const mergedContent = contents.join('\n\n\n');
      const blob = new Blob([mergedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "merged_prompts.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError("Lỗi khi nối file: " + err.message);
    } finally {
      setLoading(false);
      if (mergeFileInputRef.current) mergeFileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">AI ĐẠO LÝ STUDIO</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Professional Content Creator</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
            {[
              { id: 'character', label: 'Nhân Vật', icon: User },
              { id: 'video', label: 'Kịch Bản', icon: Video },
              { id: 'bulk', label: 'Hàng Loạt', icon: Layers },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Settings2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* --- Tab 1: Character Generator --- */}
          {activeTab === 'character' && (
            <motion.div
              key="character"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between gap-2 text-emerald-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Settings2 size={18} />
                      <h2 className="font-semibold">Cấu hình nhân vật</h2>
                    </div>
                    <button 
                      onClick={randomizeCharacter}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-emerald-400"
                      title="Ngẫu nhiên"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Loại nhân vật</label>
                      <select 
                        value={charType} 
                        onChange={(e) => setCharType(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                      >
                        {CHARACTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trang phục</label>
                      <select 
                        value={clothing} 
                        onChange={(e) => setClothing(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                      >
                        {CLOTHING_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phụ kiện</label>
                      <select 
                        value={accessory} 
                        onChange={(e) => setAccessory(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                      >
                        {ACCESSORIES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bối cảnh</label>
                      <select 
                        value={background} 
                        onChange={(e) => setBackground(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                      >
                        {BACKGROUNDS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kiểu nhân vật</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CHARACTER_STYLES.map(style => (
                          <button
                            key={style}
                            onClick={() => setCharStyle(style)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                              charStyle === style 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                : 'bg-black border-white/10 text-zinc-500 hover:border-white/20'
                            }`}
                          >
                            {style.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={generateCharacter}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    TẠO NHÂN VẬT
                  </button>
                </section>

                <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Layers size={18} />
                    <h2 className="font-semibold">Tạo hình chuẩn (Presets)</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="text-left p-3 rounded-xl bg-black border border-white/5 hover:border-emerald-500/30 transition-all group"
                      >
                        <p className="text-[10px] font-bold text-emerald-400 mb-1 group-hover:text-emerald-300">{preset.name}</p>
                        <p className="text-[8px] text-zinc-500 line-clamp-1">{preset.type} - {preset.style.split(' ')[0]}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-400" />
                      <span className="text-sm font-medium">Prompt Nhân Vật</span>
                    </div>
                    {generatedPrompt && (
                      <button 
                        onClick={() => copyToClipboard(generatedPrompt)}
                        className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Copy size={14} /> Copy Prompt
                      </button>
                    )}
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center bg-black/40">
                    {loading ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <p className="text-zinc-500 text-sm animate-pulse">Đang tạo prompt...</p>
                      </div>
                    ) : generatedPrompt ? (
                      <div className="w-full max-w-2xl bg-black/50 p-8 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <Sparkles size={20} className="text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">Prompt đã sẵn sàng</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Sử dụng prompt này trong các công cụ tạo ảnh AI</p>
                          </div>
                        </div>
                        
                        <div className="relative group">
                          <p className="text-lg text-zinc-200 leading-relaxed font-serif italic p-6 bg-white/5 rounded-xl border border-white/5">
                            "{generatedPrompt}"
                          </p>
                          <button 
                            onClick={() => copyToClipboard(generatedPrompt)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500/20 text-emerald-400"
                            title="Copy to clipboard"
                          >
                            <Copy size={16} />
                          </button>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-zinc-500 uppercase mb-1">Tỷ lệ khung hình</p>
                            <p className="text-sm font-mono text-emerald-400">9:16 (Vertical)</p>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-zinc-500 uppercase mb-1">Độ phân giải gợi ý</p>
                            <p className="text-sm font-mono text-emerald-400">4K / Ultra HD</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-xs mx-auto">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                          <User size={40} className="text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 text-sm italic">Thiết lập cấu hình hoặc chọn mẫu có sẵn để tạo prompt nhân vật triết lý của riêng bạn.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- Tab 2: Video Prompt Generator --- */}
          {activeTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Upload size={18} />
                    <h2 className="font-semibold">Đầu vào kịch bản</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ảnh nhân vật</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                          uploadedImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-black/20'
                        }`}
                      >
                        {uploadedImage ? (
                          <div className="relative w-full aspect-square">
                            <img src={uploadedImage} className="w-full h-full object-cover rounded-xl" alt="Uploaded" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                              <span className="text-xs font-bold">Thay đổi ảnh</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                              <Upload size={24} className="text-zinc-500" />
                            </div>
                            <p className="text-xs text-zinc-500 text-center">Click hoặc kéo thả ảnh nhân vật vào đây</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chủ đề triết lý</label>
                      <select 
                        value={selectedTheme} 
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                      >
                        {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Giọng điệu / Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VOICE_STYLES.map(style => (
                          <button
                            key={style}
                            onClick={() => setVoiceStyle(style)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                              voiceStyle === style 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                : 'bg-black border-white/10 text-zinc-500 hover:border-white/20'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateSingleScript}
                    disabled={loading || !uploadedImage}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Video size={20} />}
                    TẠO KỊCH BẢN
                  </button>
                </section>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-emerald-400" />
                      <span className="text-sm font-medium">Kịch bản Veo3 (4 Scenes)</span>
                    </div>
                    {generatedScript && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(generatedScript.scenes.join('\n\n'))}
                          className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Copy size={14} /> Copy
                        </button>
                        <button 
                          onClick={() => downloadTxt(generatedScript)}
                          className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-emerald-500/20"
                        >
                          <Download size={14} /> Tải .txt
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto">
                    {loading ? (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <p className="text-zinc-500 text-sm animate-pulse">Đang chiêm nghiệm nhân sinh...</p>
                      </div>
                    ) : generatedScript ? (
                      <div className="space-y-8 max-w-2xl mx-auto">
                        <div className="text-center space-y-2">
                          <h3 className="text-2xl font-serif italic text-emerald-400">"{generatedScript.title}"</h3>
                          <div className="h-px w-24 bg-emerald-500/20 mx-auto" />
                        </div>
                        
                        <div className="space-y-6">
                          {generatedScript.scenes.map((scene, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-black/40 p-6 rounded-2xl border border-white/5 relative group"
                            >
                              <div className="absolute -left-3 top-6 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-lg shadow-emerald-500/20">
                                {i + 1}
                              </div>
                              <p className="text-zinc-300 leading-relaxed font-mono italic">
                                {scene}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xs mx-auto">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                          <Video size={40} className="text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 text-sm italic">Tải ảnh nhân vật và chọn chủ đề để sinh kịch bản video chuẩn 8 giây.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- Tab 3: Bulk Generator --- */}
          {activeTab === 'bulk' && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chọn các chủ đề</label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-black rounded-xl border border-white/10">
                    {THEMES.map(theme => (
                      <button
                        key={theme}
                        onClick={() => {
                          if (bulkThemes.includes(theme)) {
                            setBulkThemes(bulkThemes.filter(t => t !== theme));
                          } else {
                            setBulkThemes([...bulkThemes, theme]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                          bulkThemes.includes(theme)
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Số lượng kịch bản (1-100)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={bulkCount}
                      onChange={(e) => setBulkCount(parseInt(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="w-12 text-center font-mono font-bold text-emerald-400 bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                      {bulkCount}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-3 flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                    <Settings2 size={16} />
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    <span className="text-emerald-400 font-bold uppercase tracking-widest block mb-1">Lưu ý về tốc độ (Rate Limit):</span>
                    Hệ thống đã được tối ưu hóa với độ trễ 1.5 giây giữa mỗi kịch bản để tránh lỗi vượt quá hạn mức (Quota) của API. 
                    Nếu bạn gặp lỗi, hãy thử giảm số lượng kịch bản tạo cùng lúc hoặc đợi một lát.
                  </p>
                </div>

                <button 
                  onClick={handleGenerateBulk}
                  disabled={loading || bulkThemes.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <Layers size={20} />}
                  SINH HÀNG LOẠT
                </button>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <FileText size={18} />
                      <h3 className="text-sm font-semibold">Nối File .TXT</h3>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mb-4 italic">Chọn nhiều file .txt để gộp thành 1 file duy nhất.</p>
                  <input 
                    type="file" 
                    multiple 
                    accept=".txt" 
                    className="hidden" 
                    ref={mergeFileInputRef}
                    onChange={handleMergeFiles}
                  />
                  <button 
                    onClick={() => mergeFileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
                  >
                    <Upload size={14} /> CHỌN FILE ĐỂ NỐI
                  </button>
                </div>
              </section>

              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-emerald-400" />
                    <span className="text-sm font-medium">Danh sách kịch bản ({bulkScripts.length})</span>
                  </div>
                  {bulkScripts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={downloadAllAsTxt}
                        className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-colors"
                      >
                        <FileText size={14} /> Tải tất cả (.txt)
                      </button>
                      <button 
                        onClick={downloadAllAsZip}
                        className="text-xs bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                      >
                        <Download size={14} /> Tải tất cả (.zip)
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {loading && bulkScripts.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <p className="text-zinc-500 text-sm">Đang ồ ạt sinh kịch bản... ({bulkProgress}/{bulkCount})</p>
                      <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(bulkProgress / bulkCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : bulkScripts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {bulkScripts.map((script, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 group hover:border-emerald-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kịch bản #{i + 1}</span>
                            <button 
                              onClick={() => downloadTxt(script)}
                              className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                          <h4 className="font-serif italic text-sm text-zinc-300 truncate">"{script.title}"</h4>
                          <div className="space-y-1">
                            {script.scenes.slice(0, 2).map((s, j) => (
                              <p key={j} className="text-[10px] text-zinc-600 truncate font-mono">{s}</p>
                            ))}
                            <p className="text-[10px] text-zinc-700 italic">... và 2 cảnh khác</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                      <Layers size={40} className="text-zinc-700" />
                      <p className="text-zinc-500 text-sm italic">Chọn chủ đề và số lượng để tạo hàng loạt nội dung viral.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Sparkles size={14} />
            <span>Powered by Gemini 3 & AI Đạo Lý Studio</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-500 text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-emerald-400 transition-colors">Hướng dẫn</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Cộng đồng</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Bản quyền</a>
          </div>
        </div>
      </footer>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100]"
          >
            <Trash2 size={20} />
            <div className="flex flex-col">
              <span className="font-bold text-sm">Đã xảy ra lỗi</span>
              <span className="text-xs opacity-90">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="ml-4 hover:bg-white/20 p-1 rounded-lg">
              <Check size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
