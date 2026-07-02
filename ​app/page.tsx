'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Member = { pid: string; game_name: string };

export default function PortalPage() {
  const [gameName, setGameName] = useState('');
  const [pid, setPid] = useState('');
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = async () => {
    const { data } = await supabase.from('alliance_members').select('*').order('created_at', { ascending: false });
    if (data) setMembers(data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('通信中...');
    
    // UPSERT (pidが一致すれば更新、なければ新規作成)
    const { error } = await supabase
      .from('alliance_members')
      .upsert({ pid, game_name: gameName }, { onConflict: 'pid' });

    if (error) {
      setMessage(`❌ エラー: ${error.message}`);
    } else {
      setMessage('✅ 登録・更新が完了しました！');
      setGameName('');
      setPid('');
      fetchMembers();
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-400">
            ⚔️ Alliance Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">ホワサバ同盟 総合管理システム</p>
        </div>
        <Link href="/admin" className="text-sm bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition">
          管理者画面へ
        </Link>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg font-medium text-blue-400 mb-4">プレイヤーID登録</h2>
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">GAME NAME</label>
            <input type="text" required value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder="例: サンダー大将" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">PLAYER ID</label>
            <input type="number" required value={pid} onChange={(e) => setPid(e.target.value)} placeholder="例: 12345678" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none" />
          </div>
          <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">
            リストに登録・更新する
          </button>
        </form>
        {message && <div className="mt-4 text-center text-sm font-bold text-emerald-400">{message}</div>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
          <h2 className="text-lg font-medium text-indigo-400">登録メンバー一覧</h2>
          <button onClick={fetchMembers} className="text-xs bg-slate-700 px-3 py-1 rounded">更新</button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 sticky top-0">
              <tr className="text-slate-400 border-b border-slate-800"><th className="p-4">Name</th><th className="p-4">PID</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.map(m => (
                <tr key={m.pid} className="hover:bg-slate-800/30">
                  <td className="p-4 text-white">{m.game_name}</td>
                  <td className="p-4 text-slate-400 font-mono">{m.pid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
