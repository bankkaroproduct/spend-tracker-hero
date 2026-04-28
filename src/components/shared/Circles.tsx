// @ts-nocheck
import { C } from "@/lib/theme";
import { f } from "@/lib/format";

export function Circles(){const saved=50000,missed=60000,mx=Math.max(saved,missed);return(<div style={{display:"flex",justifyContent:"center",gap:24,padding:"24px 0 12px"}}>{[{l:"Total Saved",v:saved,color:"#16a34a",grad:"linear-gradient(to top,#16a34a,#4ade80)"},{l:"Total Missed",v:missed,color:"#f97316",grad:"linear-gradient(to top,#f97316,#fbbf24)"}].map((m,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><div style={{fontSize:18,fontWeight:700,color:C.text}}>₹{f(m.v)}</div><div style={{width:56,height:140,borderRadius:10,background:"#e5e7eb",display:"flex",alignItems:"flex-end",overflow:"hidden"}}><div style={{width:"100%",height:`${(m.v/mx)*100}%`,borderRadius:10,background:m.grad,minHeight:20}}/></div><div style={{fontSize:10,fontWeight:700,color:m.color,letterSpacing:0.5,textTransform:"uppercase"}}>{m.l.replace("Total ","")}</div></div>))}</div>);}
