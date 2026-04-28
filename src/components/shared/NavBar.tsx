// @ts-nocheck
import { Home, CreditCard, User } from "lucide-react";
import { useAppContext } from "@/store/AppContext";

export const NavBar = () => {
  const { screen, setScreen, openCard, ci } = useAppContext();
  return (
    <div style={{display:"flex",background:"linear-gradient(135deg,#1a1a2e,#16213e)",borderRadius:24,padding:"5px 6px",boxShadow:"0 12px 40px rgba(0,0,0,0.25),0 2px 8px rgba(0,0,0,0.1)"}}>
      {[{icon:Home,label:"Home",s:"home"},{icon:CreditCard,label:"Cards",s:"cards"},{icon:User,label:"Profile",s:"profile"}].map((n,i)=>{
        const act = n.s==="home" ? (screen==="home"||screen==="actions"||screen==="transactions") : n.s==="cards" ? (screen==="detail"||screen==="bestcards") : screen==="profile";
        return (
          <div key={i} onClick={()=>{if(n.s==="home")setScreen("home");else if(n.s==="cards"){if(screen==="detail")openCard(ci);else setScreen("bestcards");}else setScreen("profile");}} style={{textAlign:"center",padding:"8px 22px",cursor:"pointer",borderRadius:20,background:act?"rgba(255,255,255,0.15)":"transparent",transition:"background 0.2s"}}>
            <n.icon size={20} strokeWidth={1.5} color={act?"#fff":"rgba(255,255,255,0.45)"} style={{margin:"0 auto"}}/>
            <div style={{fontSize:10,fontWeight:600,color:act?"#fff":"rgba(255,255,255,0.45)",marginTop:3}}>{n.label}</div>
          </div>
        );
      })}
    </div>
  );
};
