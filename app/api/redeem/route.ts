import { NextResponse } from 'next/server';
import crypto from 'crypto';

const WOS_API_URL = "https://wos-giftcode-api.centurygame.com/api/gift_code";
const WOS_SECRET = "tB87#kPtkxqOS2";

export async function POST(request: Request) {
  try {
    const { giftCode, pid } = await request.json();
    if (!giftCode || !pid) {
      return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 });
    }

    const code = giftCode.toString().trim();
    const targetPid = pid.toString().trim();
    const time = Date.now().toString();

    const rawData = `cdk=${code}&fid=${targetPid}&time=${time}`;
    const signRaw = rawData + WOS_SECRET;
    const sign = crypto.createHash('md5').update(signRaw).digest('hex');

    const params = new URLSearchParams();
    params.append('cdk', code);
    params.append('fid', targetPid);
    params.append('time', time);
    params.append('sign', sign);

    // Bot検知回避のためのヘッダーを追加
    const res = await fetch(WOS_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: params.toString(),
    });
    
    // APIからの生の応答テキストを取得（ここでCloudflareのHTMLが返ってくることもある）
    const text = await res.text();
    console.log(`[PID: ${targetPid}] ホワサバAPIの応答:`, text);

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error(`[PID: ${targetPid}] JSONパースエラー。HTMLが返却されています（Botブロックの可能性）`);
      return NextResponse.json({ success: false, message: '通信ブロック' }, { status: 500 });
    }
    
    if (json.err_code === 20000) {
      return NextResponse.json({ success: true, message: '成功' });
    } else {
      // エラーコードとメッセージを詳細に返す
      return NextResponse.json({ success: false, message: json.msg || '失敗', err_code: json.err_code }, { status: 400 });
    }

  } catch (error) {
    console.error('サーバー側での例外エラー:', error);
    return NextResponse.json({ success: false, message: 'サーバーエラー' }, { status: 500 });
  }
}
