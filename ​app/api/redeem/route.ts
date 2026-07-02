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

    const res = await fetch(WOS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    
    const json = await res.json();
    
    if (json.err_code === 20000) {
      return NextResponse.json({ success: true, message: '成功' });
    } else {
      return NextResponse.json({ success: false, message: json.msg || '失敗' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'サーバーエラー' }, { status: 500 });
  }
}
