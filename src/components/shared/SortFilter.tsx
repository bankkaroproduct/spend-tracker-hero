// @ts-nocheck
import { useState, useRef } from "react";
import { Clock, HelpCircle, CreditCard, Smartphone, Filter, Check } from "lucide-react";
import { C } from "@/lib/theme";

export function SortFilter({sortBy,setSortBy,filters,toggleFilter,onFilterOpen,customFilters}){
  const sortOpts=["Recent","Most Saved","Least Saved","Most Spent","Least Spent"];
  const filterItems=customFilters||[{label:"Unaccounted",Ic:HelpCircle},{label:"Via Travel One",filterKey:"Travel One",Ic:CreditCard,color:"#0c2340"},{label:"Via Flipkart",filterKey:"Flipkart",Ic:CreditCard,color:"#5b2c8e"},{label:"Via Live+",filterKey:"Live+",Ic:CreditCard,color:"#006d5b"},{label:"UPI",filterKey:"UPI",Ic:Smartphone,color:"#6d28d9"}];
  const [showSortDD,setShowSortDD]=useState(false);
  const [ddPos,setDdPos]=useState({top:0,left:0});
  const pillRef=useRef(null);
  const openDD=()=>{if(!showSortDD&&pillRef.current){const r=pillRef.current.getBoundingClientRect();setDdPos({top:r.bottom+6,left:r.left});}setShowSortDD(v=>!v);};
  return(<div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,overflowX:"auto",paddingBottom:4}}>
    <div style={{flexShrink:0}}>
      <div ref={pillRef} onClick={openDD} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"10px 12px",borderRadius:24,border:`1.5px solid ${C.blue}`,background:C.blueBg,cursor:"pointer"}}>
        <Clock size={14} strokeWidth={1.5} color={C.blue}/>
        <span style={{fontSize:13,fontWeight:600,color:C.blue}}>{sortBy}</span>
        <span style={{fontSize:10,color:C.blue}}>▼</span>
      </div>
    </div>
    {showSortDD&&<div onClick={()=>setShowSortDD(false)} style={{position:"fixed",inset:0,zIndex:200}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:ddPos.top,left:ddPos.left,background:C.white,borderRadius:16,boxShadow:"0 12px 40px rgba(0,0,0,0.15)",border:`1px solid ${C.brd}`,overflow:"hidden",minWidth:180,zIndex:201}}>
        {sortOpts.map(o=>(<div key={o} onClick={()=>{setSortBy(o);setShowSortDD(false);}} style={{padding:"14px 18px",fontSize:13,fontWeight:sortBy===o?700:400,color:sortBy===o?C.blue:C.text,background:sortBy===o?C.blueBg:"transparent",cursor:"pointer"}}>{o}</div>))}
      </div>
    </div>}
    <div onClick={()=>{if(onFilterOpen)onFilterOpen();}} style={{width:38,height:38,borderRadius:24,border:`1.5px solid ${C.brd}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><Filter size={16} strokeWidth={1.5} color={C.dim}/></div>
    {filterItems.map(fl=>{const key=fl.filterKey||fl.label;const on=filters.includes(key);return(
      <div key={fl.label} onClick={()=>toggleFilter(key)} style={{padding:"9px 14px",borderRadius:24,background:on?"#111827":C.white,color:on?"#fff":C.sub,fontSize:12,fontWeight:600,border:`1.5px solid ${on?"#111827":C.brd}`,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
        {on?<Check size={12} strokeWidth={2} color="#fff"/>:<fl.Ic size={14} strokeWidth={1.5} color={on?"#fff":fl.color||C.dim}/>}{fl.label}
      </div>
    );})}
  </div>);
}

export function doSort(txns,s){const r=[...txns];if(s==="Most Saved")r.sort((a,b)=>(b.saved||0)-(a.saved||0));else if(s==="Least Saved")r.sort((a,b)=>(a.saved||0)-(b.saved||0));else if(s==="Most Spent")r.sort((a,b)=>b.amt-a.amt);else if(s==="Least Spent")r.sort((a,b)=>a.amt-b.amt);return r;}
export function doFilter(txns,fs){if(!fs.length)return txns;let r=txns;if(fs.includes("Unaccounted"))return r.filter(t=>t.unaccounted);const cardFs=fs.filter(x=>["Travel One","Flipkart","Live+","UPI"].some(c=>x.includes(c)||x===c));const brandFs=fs.filter(x=>["Flipkart","Amazon","Swiggy","Zomato","Myntra","MakeMyTrip","Uber","Ola","BigBasket","BookMyShow","Nykaa","Shell"].includes(x)&&!["Travel One","Live+"].some(c=>x.includes(c)));const catFs=fs.filter(x=>["Shopping","Groceries","Bills","Travel","Insurance","Fuel","Dining","Entertainment","Cab Rides","Health","Recharge"].includes(x));if(cardFs.length)r=r.filter(t=>{if(cardFs.includes("UPI")&&t.via==="UPI")return true;return cardFs.some(cf=>t.via.includes(cf));});if(brandFs.length)r=r.filter(t=>brandFs.includes(t.brand));return r;}
