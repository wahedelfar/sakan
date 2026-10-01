import { NextResponse } from 'next/server';import { cookies } from 'next/headers';
export async function GET(){return NextResponse.json({ok:cookies().get('sakan_admin')?.value==='1'});}
export async function POST(){const res=NextResponse.json({ok:true});res.cookies.set('sakan_admin','',{httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:0});return res;}