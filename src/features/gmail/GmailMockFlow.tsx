import { useEffect, useRef, useState } from "react";
import { DatePicker } from "rsuite";
import { format, isValid, parse } from "date-fns";
import { C, FN } from "@/lib/theme";
import { useAppContext } from "@/store/AppContext";

const GLogo=({size=32}:{size?:number})=>(<svg width={size} height={size} viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>);

export function GmailMockFlow(){
  const ctx:any = useAppContext();
  const { gmailStep, setGmailStep, gmailReturnTo, setScreen, completeGmailLink,
    gmailFirstName, setGmailFirstName, gmailLastName, setGmailLastName, gmailDob, setGmailDob,
    hsbcDigits1, setHsbcDigits1, hsbcDigits2, setHsbcDigits2 } = ctx;
  const dobPickerRef = useRef<HTMLDivElement | null>(null);
  const pendingFocusRef = useRef<{ prefix:string; index:number } | null>(null);
  const [dobInputValue, setDobInputValue] = useState(gmailDob || "");

  const focusDigit = (prefix:string, index:number) => {
    const el = document.getElementById(`${prefix}-${index}`) as HTMLInputElement | null;
    if(!el) return;
    el.focus();
    el.select();
  };

  const queueFocus = (prefix:string, index:number) => {
    pendingFocusRef.current = { prefix, index };
  };

  const updateDigitRow = (arr:string[], setArr:any, prefix:string, index:number, value:string) => {
    const digits = value.replace(/[^0-9]/g, "");
    if(!digits) {
      const next=[...arr];
      next[index]="";
      setArr(next);
      return;
    }

    const next=[...arr];
    digits.split("").forEach((digit, offset) => {
      const targetIndex = index + offset;
      if(targetIndex < 4) next[targetIndex] = digit;
    });
    setArr(next);

    const nextIndex = Math.min(index + digits.length, 3);
    queueFocus(prefix, nextIndex);
  };

  const handleDigitKeyDown = (
    e:React.KeyboardEvent<HTMLInputElement>,
    arr:string[],
    setArr:any,
    prefix:string,
    index:number,
  ) => {
    if(e.key==="Backspace"){
      if(arr[index]){
        const next=[...arr];
        next[index]="";
        setArr(next);
        return;
      }
      if(index>0){
        e.preventDefault();
        const next=[...arr];
        next[index-1]="";
        setArr(next);
        queueFocus(prefix,index-1);
      }
      return;
    }

    if(e.key==="Delete"){
      e.preventDefault();
      const next=[...arr];
      next[index]="";
      setArr(next);
      return;
    }

    if(e.key==="ArrowLeft"&&index>0){
      e.preventDefault();
      queueFocus(prefix,index-1);
      return;
    }

    if(e.key==="ArrowRight"&&index<3){
      e.preventDefault();
      queueFocus(prefix,index+1);
    }
  };

  // Auto-advance step 3 -> 4 once both HSBC rows are filled
  useEffect(()=>{
    if(gmailStep!==3) return;
    const f1=Array.isArray(hsbcDigits1)&&hsbcDigits1.every((d:string)=>d!=="");
    const f2=Array.isArray(hsbcDigits2)&&hsbcDigits2.every((d:string)=>d!=="");
    if(f1&&f2){const t=setTimeout(()=>setGmailStep(4),600);return()=>clearTimeout(t);}
  },[gmailStep,hsbcDigits1,hsbcDigits2,setGmailStep]);

  // Auto-complete on success step 4
  useEffect(()=>{
    if(gmailStep!==4) return;
    const t=setTimeout(()=>completeGmailLink(),1500);
    return()=>clearTimeout(t);
  },[gmailStep]);

  useEffect(()=>{
    if(gmailStep!==2) return;
    setDobInputValue(gmailDob || "");
  },[gmailStep, gmailDob]);

  useEffect(()=>{
    if(gmailStep!==2) return;
    const host = dobPickerRef.current;
    const input = host?.querySelector("input");
    if(!input) return;
    const syncInput = () => setDobInputValue(input.value || "");
    input.addEventListener("input", syncInput);
    input.addEventListener("change", syncInput);
    return()=>{
      input.removeEventListener("input", syncInput);
      input.removeEventListener("change", syncInput);
    };
  },[gmailStep]);

  useEffect(()=>{
    if(gmailStep!==3) return;
    const pending = pendingFocusRef.current;
    if(!pending) return;
    pendingFocusRef.current = null;
    requestAnimationFrame(()=>focusDigit(pending.prefix, pending.index));
  },[gmailStep, hsbcDigits1, hsbcDigits2]);

  useEffect(()=>{
    if(gmailStep!==3) return;
    const firstEmpty1 = hsbcDigits1.slice(0,4).findIndex((d:string)=>!d);
    const firstEmpty2 = hsbcDigits2.slice(0,4).findIndex((d:string)=>!d);
    const target = firstEmpty1 !== -1
      ? { prefix:"hsbc1", index:firstEmpty1 }
      : firstEmpty2 !== -1
        ? { prefix:"hsbc2", index:firstEmpty2 }
        : { prefix:"hsbc1", index:0 };
    requestAnimationFrame(()=>focusDigit(target.prefix, target.index));
  },[gmailStep]);

  const skipLink=<div onClick={completeGmailLink} style={{position:"absolute",top:16,right:16,fontSize:12,fontWeight:600,color:C.dim,cursor:"pointer"}}>Skip demo →</div>;
  const Wrap=({children}:any)=>(<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",background:C.white,display:"flex",flexDirection:"column",position:"relative",padding:"24px"}}>{skipLink}{children}</div>);
  if(gmailStep===0)return(<Wrap><div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:48}}><GLogo size={48}/><div style={{fontSize:22,fontWeight:500,color:C.text,marginTop:24,textAlign:"center"}}>Choose an account</div><div style={{fontSize:13,color:C.sub,marginTop:8,textAlign:"center"}}>to continue to <span style={{color:C.blue}}>CardCanvas</span></div><div style={{width:"100%",marginTop:36,display:"flex",flexDirection:"column",gap:8}}>{[{name:"Aarav Sharma",email:"aarav.sharma@gmail.com",initial:"A",color:"#4285F4"},{name:"Priya Aarav",email:"priya.s@gmail.com",initial:"P",color:"#EA4335"}].map((acc,i)=>(<div key={i} onClick={()=>setGmailStep(1)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 12px",borderRadius:12,border:`1px solid ${C.brd}`,cursor:"pointer"}}><div style={{width:36,height:36,borderRadius:"50%",background:acc.color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:600}}>{acc.initial}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.text}}>{acc.name}</div><div style={{fontSize:12,color:C.sub}}>{acc.email}</div></div></div>))}<div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 12px",borderRadius:12,cursor:"pointer",color:C.sub,fontSize:13,fontWeight:500}}><div style={{width:36,height:36,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>+</div>Use another account</div></div></div></Wrap>);
  if(gmailStep===1)return(<Wrap><div style={{display:"flex",flexDirection:"column",paddingTop:32}}><GLogo size={36}/><div style={{fontSize:20,fontWeight:500,color:C.text,marginTop:18}}>CardCanvas wants access to your Google Account</div><div style={{display:"flex",alignItems:"center",gap:10,marginTop:14,padding:"10px 12px",background:C.bg,borderRadius:10}}><div style={{width:28,height:28,borderRadius:"50%",background:"#4285F4",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600}}>A</div><div style={{fontSize:13,color:C.text}}>aarav.sharma@gmail.com</div></div><div style={{fontSize:13,color:C.sub,marginTop:24,marginBottom:10,fontWeight:600}}>This will allow CardCanvas to:</div>{["Read transaction emails from your banks","Identify card names and benefit details","Track your statements securely"].map((p,i)=>(<div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<2?`1px solid ${C.brd}`:"none"}}><div style={{color:C.green,fontSize:16,marginTop:1}}>✓</div><div style={{fontSize:13,color:C.text,lineHeight:1.5}}>{p}</div></div>))}<div style={{fontSize:11,color:C.dim,marginTop:18,lineHeight:1.5}}>You can review CardCanvas's terms and privacy policies before deciding. You can manage permissions in your Google Account.</div><div style={{display:"flex",gap:10,marginTop:28}}><div onClick={()=>setScreen(gmailReturnTo==="building"?"building":"home")} style={{flex:1,padding:"12px",borderRadius:8,textAlign:"center",fontSize:14,fontWeight:600,color:C.blue,cursor:"pointer"}}>Cancel</div><div onClick={()=>{setGmailStep(0);setScreen("gmail-extra");}} style={{flex:1,padding:"12px",borderRadius:8,background:C.blue,color:"#fff",textAlign:"center",fontSize:14,fontWeight:600,cursor:"pointer"}}>Allow</div></div></div></Wrap>);
  if(gmailStep===2){
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const normalizedDob = (dobInputValue || "").replace(/\s+/g, "");
    const parsedDob = normalizedDob ? parse(normalizedDob, "dd/MM/yyyy", new Date()) : null;
    const selectedDob = parsedDob && isValid(parsedDob) ? parsedDob : null;
    const canContinue = gmailFirstName.trim() && gmailLastName.trim() && !!selectedDob && selectedDob <= today;
    return(<Wrap><div style={{paddingTop:32,overflowY:"auto"}}><div style={{fontSize:22,fontWeight:700,color:C.text,marginBottom:6}}>Confirm your details</div><div style={{fontSize:13,color:C.sub,marginBottom:24}}>So we can match your cards to the right accounts</div><div style={{marginBottom:18}}><div style={{fontSize:11,color:C.dim,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>First name</div><input value={gmailFirstName} onChange={(e)=>setGmailFirstName(e.target.value)} style={{width:"100%",padding:"12px 14px",border:`1px solid ${C.brd}`,borderRadius:10,fontSize:14,color:C.text,background:C.white,outline:"none",fontFamily:FN}}/></div><div style={{marginBottom:18}}><div style={{fontSize:11,color:C.dim,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Last name</div><input value={gmailLastName} onChange={(e)=>setGmailLastName(e.target.value)} style={{width:"100%",padding:"12px 14px",border:`1px solid ${C.brd}`,borderRadius:10,fontSize:14,color:C.text,background:C.white,outline:"none",fontFamily:FN}}/></div><div style={{marginBottom:18}}><div style={{fontSize:11,color:C.dim,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Date of birth</div><div ref={dobPickerRef}><DatePicker value={selectedDob ?? null} onSelect={(value)=>{const next = value ? format(value, "dd/MM/yyyy") : ""; setDobInputValue(next); setGmailDob(next);}} onChange={(value)=>{const next = value ? format(value, "dd/MM/yyyy") : ""; setDobInputValue(next); setGmailDob(next);}} format="dd/MM/yyyy" placeholder="DD/MM/YYYY" cleanable={false} editable shouldDisableDate={(date)=>date>today} style={{width:"100%"}} oneTap/></div></div><div onClick={()=>{if(canContinue&&selectedDob){const normalized=format(selectedDob,"dd/MM/yyyy");setDobInputValue(normalized);setGmailDob(normalized);setGmailStep(3);}}} style={{padding:"15px",borderRadius:14,background:canContinue?"#1a2233":C.brd,color:"#fff",textAlign:"center",fontSize:15,fontWeight:700,cursor:canContinue?"pointer":"not-allowed",marginTop:18,opacity:canContinue?1:0.6}}>Continue</div></div></Wrap>);
  }
  if(gmailStep===3){
    const renderRow=(arr:string[],setArr:any,prefix:string)=>(<div style={{display:"flex",gap:8,justifyContent:"center"}}>{arr.map((d,i)=>(<input key={i} value={d} maxLength={i<4?4:1} inputMode="numeric" disabled={i>=4} onChange={(e)=>updateDigitRow(arr,setArr,prefix,i,e.target.value)} onKeyDown={(e)=>handleDigitKeyDown(e,arr,setArr,prefix,i)} onFocus={(e)=>e.target.select()} id={`${prefix}-${i}`} style={{width:40,height:52,borderRadius:10,border:`2px solid ${d?C.blue:C.brd}`,fontSize:20,fontWeight:700,color:i>=4?C.sub:C.text,textAlign:"center",outline:"none",background:i>=4?C.bg:C.white,fontFamily:FN}}/>))}</div>);
    return(<Wrap><div style={{paddingTop:24,overflowY:"auto"}}><div style={{fontSize:22,fontWeight:700,color:C.text,marginBottom:6}}>Verify your HSBC cards</div><div style={{fontSize:13,color:C.sub,marginBottom:20}}>Enter the first 4 digits of each card to confirm ownership</div><div style={{padding:16,borderRadius:14,border:`1px solid ${C.brd}`,background:C.white,marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>HSBC TravelOne</div><div style={{fontSize:11,color:C.sub}}>•••• {hsbcDigits1.slice(4).join("")}</div></div>{renderRow(hsbcDigits1,setHsbcDigits1,"hsbc1")}</div><div style={{padding:16,borderRadius:14,border:`1px solid ${C.brd}`,background:C.white,marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>HSBC Live+</div><div style={{fontSize:11,color:C.sub}}>•••• {hsbcDigits2.slice(4).join("")}</div></div>{renderRow(hsbcDigits2,setHsbcDigits2,"hsbc2")}</div><div style={{textAlign:"center",fontSize:12,color:C.dim,marginTop:8}}>This helps us securely link your cards</div></div></Wrap>);
  }
  if(gmailStep===4){
    return(<Wrap><div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%"}}><div style={{width:80,height:80,borderRadius:"50%",background:C.greenBg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,border:`3px solid ${C.green}`}}><span style={{fontSize:36,color:C.green}}>✓</span></div><div style={{fontSize:22,fontWeight:700,color:C.text,marginBottom:8,textAlign:"center"}}>Gmail linked successfully</div><div style={{fontSize:13,color:C.sub,textAlign:"center"}}>Returning to your dashboard…</div></div></Wrap>);
  }
  return null;
}
