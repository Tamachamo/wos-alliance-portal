'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  const [giftCode, setGiftCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, fail: 0 });

  const handleExecute = async () => {
    if (!giftCode) return alert('ギフトコードを入力してください');
    if (!confirm(`「${giftCode}」を名簿全員に適用しますか？`)) return;

    setLoading(true);
    
    const { data: members, error } = await supabase.from('alliance_members').select('pid');
    if (error || !members) {
      alert('名簿の取得に失敗しました');
      setLoading(false);
      return;
    }

    setProgress({ current: 0, total: members.length, success: 0, fail: 0 });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < members.length; i++) {
      try {
        const res = await fetch('/api/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ giftCode, pid: members[i].pid }),
        });

        if (res.ok) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }

      setProgress({ current: i + 1, total: members.length, success: successCount, fail: failCount });
      await new Promise(resolve => setTimeout(resolve, 400)); // 連続リクエスト回避
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col justify-center">
      <Link href="/" className="text-sm text-slate-400 hover:text-white mb-6">← ポータルへ戻る</Link>
      
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-amber-500 mb-6 text-center">🛡️ ギフトコード一括適用</h1>
        
        <div className="space-y-6">
          <input
            type="text"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value)}
            placeholder="例: WOS2026"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 uppercase outline-none text-white"
            disabled={loading}
          />

          <button
            onClick={handleExecute}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition"
          >
            {loading ? '処理中...' : '名簿全員分を実行'}
          </button>

          {progress.total > 0 && (
            <div className="mt-6 space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between text-sm text-slate-300">
                <span>進行状況 ({progress.current} / {progress.total}人)</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex gap-4 pt-2 text-sm font-medium">
                <span className="text-emerald-400">✅ 成功: {progress.success}</span>
                <span className="text-red-400">❌ 失敗: {progress.fail}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
