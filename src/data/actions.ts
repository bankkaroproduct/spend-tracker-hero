// @ts-nocheck
import { Clock, Gift, CreditCard, Star, AlertTriangle, Home, Wallet, Mail } from "lucide-react";

export const ACTIONS=[
  {Ic:Clock,title:"3,200 points expiring soon",desc:"Worth ₹960 on HSBC Travel One",badge:"In 6 Days",cta:"Redeem ›",type:"points",gmailRequired:true},
  {Ic:Gift,title:"₹500 Flipkart voucher unclaimed",desc:"Welcome voucher on your Axis Flipkart card",badge:"In 14 Days",cta:"Redeem ›",type:"benefit",gmailRequired:true},
  {Ic:CreditCard,title:"Waive your annual fee",desc:"Spend ₹18,000 more on HSBC Live+",badge:"In 45 Days",cta:"Track progress ›",type:"fee",gmailRequired:true},
];

export const ALL_ACTIONS=[
  {Ic:Star,title:"Unlock milestone travel voucher",desc:"Spend ₹4,200 more on HSBC Travel One",badge:"In 30 Days",cta:"Track progress ›",type:"milestone",gmailRequired:true},
  {Ic:CreditCard,title:"Waive your annual fee",desc:"Spend ₹18,000 more on HSBC Live+",badge:"In 45 Days",cta:"Track progress ›",type:"fee",gmailRequired:true},
  {Ic:AlertTriangle,title:"Dining rewards maxed out",desc:"Switch to HSBC Live+ to keep earning 1.5%",badge:"In 0 Days",cta:"See options ›",type:"cap",altCard:"HSBC Live+",altRate:1.5,gmailRequired:false},
  {Ic:AlertTriangle,title:"Online rewards cap almost full",desc:"₹800 left before Axis Flipkart caps out",badge:"In 5 Days",cta:"See options ›",type:"cap",altCard:"HSBC Live+",altRate:1.5,gmailRequired:false},
  {Ic:Home,title:"1 transaction to unlock lounge access",desc:"Make any spend on HSBC Travel One",badge:"In 90 Days",cta:"Track progress ›",type:"milestone",gmailRequired:true},
  {Ic:Wallet,title:"Credit limit nearly reached",desc:"Only ₹2,300 left on HSBC Travel One",badge:"In 3 Days",cta:"See options ›",type:"cap",altCard:"Axis Flipkart",altRate:1.5,creditLimit:true,gmailRequired:false},
  {Ic:Gift,title:"₹500 Flipkart voucher unclaimed",desc:"Welcome voucher on your Axis Flipkart card",badge:"In 14 Days",cta:"Redeem ›",type:"benefit",gmailRequired:true},
  {Ic:Clock,title:"3,200 points expiring soon",desc:"Worth ₹960 on HSBC Travel One",badge:"In 6 Days",cta:"Redeem ›",type:"points",gmailRequired:true},
];

/* SMS-safe action nudge cards (shown when gmail not connected) */
export const SMS_ACTIONS=[
  {Ic:Mail,title:"Connect Gmail to see expiring points",desc:"We can't detect point balances from SMS alone",badge:"Action Needed",cta:"Connect ›",type:"nudge",gmailRequired:false},
  {Ic:Mail,title:"Unlock unclaimed benefits",desc:"Connect Gmail to see vouchers & rewards waiting for you",badge:"Action Needed",cta:"Connect ›",type:"nudge",gmailRequired:false},
];
