/**
 * SETUVANA - Integrated Gemini AI Studio Hub
 * Houses all 6 mandatory Gemini capabilities:
 * 1. Grounded Traveller Assistant (gemini-3.8-flash)
 * 2. Search Grounding (gemini-3.8-flash + googleSearch)
 * 3. Maps Grounding (gemini-3.8-flash + googleMaps)
 * 4. High-Thinking Route Planner (gemini-4-argon + ThinkingLevel.HIGH)
 * 5. High-Quality Image Generation (gemini-3-pro-image-preview + 1K/2K/4K)
 * 6. Image Creation & Editing (gemini-nano-banana-2.1)
 * 7. Text-to-Speech (gemini-3.8-flash-tts)
 */

import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import {
  Bot,
  Brain,
  Image as ImageIcon,
  Sparkles,
  Volume2,
  Search,
  MapPin,
  X,
  Send,
  Loader2,
  Wand2,
  Download,
} from 'lucide-react';

interface AIStudioModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({
  currentLanguage,
  isOpen,
  onClose,
}) => {
  const t = translations[currentLanguage];

  const [activeTab, setActiveTab] = useState<
    'grounded_chat' | 'thinking_planner' | 'pro_image' | 'edit_image' | 'tts_voice'
  >('grounded_chat');

  // Grounded Chat & Search/Maps Grounding
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; source?: string }>>([
    {
      role: 'assistant',
      text: 'Namaskar! I am your SETUVANA rural tourism guide. How can I assist your journey across Odisha tribal homestays today? Ask about village stays, organic food, or click Search/Maps grounding below.',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // High-Thinking Planner (gemini-4-argon)
  const [plannerPref, setPlannerPref] = useState('5-day tribal circuit exploring Dongria Kondh in Rayagada and pine hills in Daringbadi, using local passenger trains.');
  const [plannerDays, setPlannerDays] = useState(5);
  const [planResult, setPlanResult] = useState<string | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Pro Image Generation (gemini-3-pro-image-preview)
  const [proImagePrompt, setProImagePrompt] = useState('Traditional Dongria Kondh thatched mud cottage in Niyamgiri foothills surrounded by organic turmeric fields and misty morning hills');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Image Edit (gemini-nano-banana-2.1)
  const [editPrompt, setEditPrompt] = useState('Add intricate traditional Saura tribal wall mural paintings (Ikons) with dancers and peacocks on the cottage mud wall');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // TTS (gemini-3.8-flash-tts)
  const [ttsText, setTtsText] = useState('ନମସ୍କାର। ସେତୁବନକୁ ସ୍ୱାଗତ। ପ୍ରତ୍ୟେକ ଗ୍ରାମ ସୁଯୋଗ ସହିତ ସଂଯୁକ୍ତ। ଆପଣଙ୍କ ଓଡ଼ିଶା ଯାତ୍ରା ସୁଖମୟ ହେଉ।');
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState(false);

  if (!isOpen) return null;

  // Send normal grounded chat
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language: currentLanguage }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.text || 'Information processed from SETUVANA platform data.' },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error connecting to Gemini API: ' + err.message },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Google Search Grounding
  const handleSearchGrounding = async () => {
    setIsChatLoading(true);
    const query = chatInput.trim() || 'Current weather & seasonal festivals in Kandhamal & Koraput Odisha';
    setChatMessages((prev) => [...prev, { role: 'user', text: `[Search Grounding]: ${query}` }]);
    setChatInput('');

    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.text || 'Grounded search completed.',
          source: 'Google Search Data Grounding (gemini-3.8-flash)',
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Search grounding error: ' + err.message },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Google Maps Grounding
  const handleMapsGrounding = async () => {
    setIsChatLoading(true);
    const destination = chatInput.trim() || 'Daringbadi & Bissamcuttack Rayagada';
    setChatMessages((prev) => [...prev, { role: 'user', text: `[Maps Grounding]: Transit hubs & terrain for ${destination}` }]);
    setChatInput('');

    try {
      const res = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.text || 'Maps grounding completed.',
          source: 'Google Maps Data Grounding (gemini-3.8-flash)',
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Maps grounding error: ' + err.message },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // High-Thinking Planner (gemini-4-argon)
  const handleGenerateThinkingPlan = async () => {
    setIsPlanLoading(true);
    setPlanResult(null);

    try {
      const res = await fetch('/api/gemini/thinking-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelPreferences: plannerPref, days: plannerDays }),
      });
      const data = await res.json();
      setPlanResult(data.plan || 'Plan generated successfully.');
    } catch (err: any) {
      setPlanResult('Thinking Planner Error: ' + err.message);
    } finally {
      setIsPlanLoading(false);
    }
  };

  // High-Quality Image Generation (gemini-3-pro-image-preview with 1K, 2K, 4K)
  const handleGenerateProImage = async () => {
    setIsImageLoading(true);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: proImagePrompt, imageSize }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        alert(data.error || 'Image generation completed without image data');
      }
    } catch (err: any) {
      alert('Image generation error: ' + err.message);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Edit Image (gemini-nano-banana-2.1)
  const handleEditImage = async () => {
    setIsEditLoading(true);
    setEditedImageUrl(null);

    try {
      const res = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          base64ImageData: generatedImageUrl?.split(',')[1] || undefined,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setEditedImageUrl(data.imageUrl);
      } else {
        alert(data.error || 'Edit completed');
      }
    } catch (err: any) {
      alert('Edit error: ' + err.message);
    } finally {
      setIsEditLoading(false);
    }
  };

  // TTS with gemini-3.8-flash-tts
  const handleGenerateTTS = async () => {
    setIsTtsLoading(true);
    setTtsAudioUrl(null);

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, voiceName: 'Kore' }),
      });
      const data = await res.json();
      if (data.base64Audio) {
        setTtsAudioUrl(`data:audio/wav;base64,${data.base64Audio}`);
      } else {
        alert(data.error || 'TTS audio failed');
      }
    } catch (err: any) {
      alert('TTS error: ' + err.message);
    } finally {
      setIsTtsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#faf8f5] text-stone-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#133926] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-[#c25e3e] text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif">{t.navAIStudio}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-amber-200 font-mono font-bold">
                  Gemini API Suite
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Grounding, High Thinking, TTS Voice, & High-Res Visual Creation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-900 text-stone-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="bg-[#0e2a1c] border-b border-emerald-900/60 px-6 flex items-center gap-1 overflow-x-auto text-xs py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('grounded_chat')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'grounded_chat'
                ? 'bg-[#c25e3e] text-white shadow-xs'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Companion & Grounding
          </button>

          <button
            onClick={() => setActiveTab('thinking_planner')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'thinking_planner'
                ? 'bg-[#c25e3e] text-white shadow-xs'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            High-Thinking Planner (gemini-4-argon)
          </button>

          <button
            onClick={() => setActiveTab('pro_image')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'pro_image'
                ? 'bg-[#c25e3e] text-white shadow-xs'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            1K/2K/4K Images (gemini-3-pro)
          </button>

          <button
            onClick={() => setActiveTab('edit_image')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'edit_image'
                ? 'bg-[#c25e3e] text-white shadow-xs'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Edit Art (gemini-nano-banana-2.1)
          </button>

          <button
            onClick={() => setActiveTab('tts_voice')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'tts_voice'
                ? 'bg-[#c25e3e] text-white shadow-xs'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            TTS Voice (gemini-3.8-flash-tts)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: Grounded Companion & Search/Maps Grounding */}
          {activeTab === 'grounded_chat' && (
            <div className="flex flex-col h-[480px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-inner mb-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'ml-auto bg-[#133926] text-white font-medium'
                        : 'bg-stone-50 border border-stone-200 text-stone-800'
                    }`}
                  >
                    {msg.source && (
                      <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                        ● {msg.source}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-stone-500 italic p-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                    <span>Grounding response with verified platform & Google services...</span>
                  </div>
                )}
              </div>

              {/* Input & Grounding tool buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask about Kandhamal turmeric, Dongria Dokra art, drinking water, or festival dates..."
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-[#133926] text-white hover:bg-[#0e2a1c] disabled:opacity-50 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-stone-500 font-semibold">Special Grounding:</span>
                  <button
                    onClick={handleSearchGrounding}
                    disabled={isChatLoading}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-semibold flex items-center gap-1 transition"
                  >
                    <Search className="w-3 h-3 text-blue-600" />
                    {t.searchGroundingBadge}
                  </button>
                  <button
                    onClick={handleMapsGrounding}
                    disabled={isChatLoading}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition"
                  >
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {t.mapsGroundingBadge}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: High Thinking Route Planner (gemini-4-argon) */}
          {activeTab === 'thinking_planner' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-950">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Brain className="w-4 h-4 text-amber-600" />
                  <span>Deep Reasoning Model: gemini-4-argon</span>
                  <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                    ThinkingLevel.HIGH
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80">
                  Solves complex multi-day rural logistics: train connections across southern Odisha, Dongria Kondh cultural protocols, offline corridor preparation, and direct community revenue distribution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-stone-700 font-bold mb-1">
                    Travel Preferences & Cultural Interests
                  </label>
                  <textarea
                    rows={3}
                    value={plannerPref}
                    onChange={(e) => setPlannerPref(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Duration (Days)</label>
                  <select
                    value={plannerDays}
                    onChange={(e) => setPlannerDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs"
                  >
                    <option value={3}>3 Days (Weekend Circuit)</option>
                    <option value={5}>5 Days (Recommended)</option>
                    <option value={7}>7 Days (Full Grand Circuit)</option>
                  </select>

                  <button
                    onClick={handleGenerateThinkingPlan}
                    disabled={isPlanLoading}
                    className="w-full mt-3 py-2.5 bg-[#c25e3e] hover:bg-[#a84d30] disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isPlanLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking Deeply...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Generate Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {planResult && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    High-Reasoning Multi-Village Itinerary
                  </h4>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-sans leading-relaxed text-stone-700 whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {planResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: High-Quality Image Generator (gemini-3-pro-image-preview) */}
          {activeTab === 'pro_image' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <span>Model: gemini-3-pro-image-preview</span>
                </div>
                <p className="text-[11px] text-emerald-900/80">
                  Generate high-resolution visual assets for homestay listings and promotional banners. Choose between 1K, 2K, and 4K output sizes.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Visual Prompt</label>
                  <textarea
                    rows={2}
                    value={proImagePrompt}
                    onChange={(e) => setProImagePrompt(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-700">Select Resolution:</span>
                    {(['1K', '2K', '4K'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`px-3 py-1 rounded-lg font-bold border transition ${
                          imageSize === size
                            ? 'bg-[#133926] text-white border-[#133926]'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateProImage}
                    disabled={isImageLoading}
                    className="py-2.5 px-5 bg-[#c25e3e] hover:bg-[#a84d30] disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    {isImageLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating {imageSize} Image...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate High-Quality Image ({imageSize})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {generatedImageUrl && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
                  <img
                    src={generatedImageUrl}
                    alt="Generated Homestay Visual"
                    className="max-h-80 mx-auto rounded-xl object-contain border border-stone-200 shadow"
                  />
                  <div className="mt-2 text-stone-500 text-[11px]">
                    Generated at {imageSize} resolution using gemini-3-pro-image-preview
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Edit Art & Murals (gemini-nano-banana-2.1) */}
          {activeTab === 'edit_image' && (
            <div className="space-y-4">
              <div className="bg-stone-100 p-4 rounded-xl border border-stone-300 text-stone-800">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Model: gemini-nano-banana-2.1</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Create and edit cultural artwork, apply authentic Saura tribal wall motifs, or transform cottage photography.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Editing / Creation Instruction</label>
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <button
                  onClick={handleEditImage}
                  disabled={isEditLoading}
                  className="py-2.5 px-5 bg-[#133926] hover:bg-[#0e2a1c] disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  {isEditLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing with Nano Banana 2.1...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-amber-300" />
                      <span>Apply Edit Prompt</span>
                    </>
                  )}
                </button>
              </div>

              {editedImageUrl && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
                  <img
                    src={editedImageUrl}
                    alt="Edited Artwork"
                    className="max-h-80 mx-auto rounded-xl object-contain border border-stone-200 shadow"
                  />
                  <div className="mt-2 text-stone-500 text-[11px]">
                    Created with gemini-nano-banana-2.1
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TTS Voice Studio (gemini-3.8-flash-tts) */}
          {activeTab === 'tts_voice' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>Model: gemini-3.8-flash-tts</span>
                </div>
                <p className="text-[11px] text-emerald-900/80">
                  Generate natural spoken audio in Odia, Hindi, or English for host keypad call prompts and traveller audio guides.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Text for Voice Synthesis</label>
                  <textarea
                    rows={3}
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <button
                  onClick={handleGenerateTTS}
                  disabled={isTtsLoading}
                  className="py-2.5 px-5 bg-[#c25e3e] hover:bg-[#a84d30] disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  {isTtsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Voice...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Convert Text to Speech (TTS)</span>
                    </>
                  )}
                </button>
              </div>

              {ttsAudioUrl && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-stone-900">Synthesized Spoken Audio Output:</h4>
                  <audio controls src={ttsAudioUrl} className="w-full" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-300 hover:bg-stone-400 text-stone-800 font-semibold text-xs transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
