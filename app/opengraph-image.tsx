import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const alt = 'سكن — منصة تأجير عقاري';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() { return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#081725',color:'white',fontFamily:'Arial'}}><div style={{width:170,height:170,borderRadius:38,display:'flex',alignItems:'center',justifyContent:'center',border:'4px solid #c8a75d',fontSize:105,fontWeight:800,color:'#c8a75d'}}>س</div><div style={{fontSize:76,fontWeight:800,marginTop:24}}>سكن</div><div style={{fontSize:30,color:'#c7d0d5',marginTop:12}}>منصة تأجير عقاري جاهزة باسمك</div></div>, size); }