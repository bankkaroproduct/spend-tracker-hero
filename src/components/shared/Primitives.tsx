// @ts-nocheck
import { C } from "@/lib/theme";

export const SemiGauge=({pct})=>{const cx=120,cy=110,r=80,a=Math.PI-(pct/100)*Math.PI,ex=cx+r*Math.cos(a),ey=cy-r*Math.sin(a);return(<svg width="240" height="130" viewBox="0 0 240 130"><path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" strokeLinecap="round"/><path d={`M ${cx-r} ${cy} A ${r} ${r} 0 ${pct>50?1:0} 1 ${ex} ${ey}`} fill="none" stroke="url(#gg)" strokeWidth="14" strokeLinecap="round"/><defs><linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fb923c"/></linearGradient></defs></svg>);};

export const RBar=({pct,h=14})=>{const clr=pct>85?"linear-gradient(90deg,#ef4444,#f87171)":pct>60?"linear-gradient(90deg,#d97706,#fbbf24)":"linear-gradient(90deg,#1d4ed8,#60a5fa)";return(<div style={{height:h,borderRadius:7,background:"#eef0f3",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct,100)}%`,borderRadius:7,background:clr}}/></div>);};

export const DotDiv=({label})=>(<div style={{padding:"32px 0 14px"}}><span style={{fontSize:13,fontWeight:700,color:C.sub,letterSpacing:0.3}}>{label}</span></div>);

export const ThkDiv=()=><div style={{height:1,background:C.brd,margin:"48px 0"}}/>;
