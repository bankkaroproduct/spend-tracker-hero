// @ts-nocheck
import { Clock, Star, AlertTriangle, CreditCard } from "lucide-react";

export const CD_BRANDS=[{name:"Amazon",icon:"🟠",spend:32000,saved:6000},{name:"Swiggy",icon:"🟠",spend:18000,saved:4000},{name:"Flipkart",icon:"🔵",spend:15000,saved:3600},{name:"Zomato",icon:"🔴",spend:12000,saved:2250},{name:"MakeMyTrip",icon:"✈️",spend:10000,saved:1800},{name:"BigBasket",icon:"🟢",spend:9500,saved:1400},{name:"Myntra",icon:"🟣",spend:8800,saved:1300},{name:"Uber",icon:"🚗",spend:7200,saved:1000},{name:"Ola",icon:"🚕",spend:6500,saved:950},{name:"BookMyShow",icon:"🎬",spend:5800,saved:850},{name:"Nykaa",icon:"🩷",spend:5200,saved:750},{name:"Cleartrip",icon:"🔵",spend:4800,saved:700},{name:"Shell",icon:"⛽",spend:4500,saved:650},{name:"DMart",icon:"🛒",spend:4200,saved:600},{name:"IndiGo",icon:"✈️",spend:3800,saved:550},{name:"PharmEasy",icon:"💊",spend:3200,saved:480},{name:"IRCTC",icon:"🚂",spend:2800,saved:420},{name:"Netflix",icon:"🔴",spend:2400,saved:360},{name:"Hotstar",icon:"🔵",spend:1800,saved:270},{name:"Jio",icon:"🔵",spend:1500,saved:220}];
export const CD_CATS=[{name:"Shopping",icon:"🛍️",spend:52000,saved:7800},{name:"Dining",icon:"🍽️",spend:35000,saved:5250},{name:"Travel",icon:"✈️",spend:28000,saved:4200},{name:"Groceries",icon:"🥦",cat:"Essentials",spend:24000,saved:3600},{name:"Food Ordering",icon:"🍔",spend:22000,saved:3300},{name:"Bills",icon:"📄",spend:18000,saved:2700},{name:"Fuel",icon:"⛽",spend:15000,saved:2250},{name:"Entertainment",icon:"🎬",cat:"Leisure",spend:12000,saved:1800},{name:"Insurance",icon:"🛡️",spend:10000,saved:1500},{name:"Recharge",icon:"📱",spend:8000,saved:1200},{name:"Education",icon:"📚",spend:7000,saved:1050},{name:"Health",icon:"💊",spend:6500,saved:975},{name:"Rent",icon:"home",spend:5000,saved:750},{name:"Cab Rides",icon:"🚕",spend:4500,saved:675},{name:"Subscriptions",icon:"📺",spend:4000,saved:600},{name:"Gym",icon:"🏋️",spend:3500,saved:525},{name:"Clothing",icon:"👗",spend:3000,saved:450},{name:"Electronics",icon:"📱",spend:2500,saved:375},{name:"Home",icon:"🏡",spend:2000,saved:300},{name:"Others",icon:"📦",spend:1500,saved:225}];
// All values confirmed from Great Cards website screenshots
export const BANK_FEES_HSBC_TRAVEL=[
  ["Forex Markups","3.50%"],
  ["APR Fees","3.75%"],
  ["ATM Withdrawal","2.50%"],
  ["Reward Redemption Fees","Not Applicable"],
  ["Link for all T&Cs","https://www.hsbc.co.in/credit-cards/products/travelone/"],
  ["Railway Surcharge","1.80%"],
  ["Rent Payment Fees","1%"],
  ["Cheque Payment Fees","₹100"],
  ["Cash Payment Fees","₹100"],
];

export const BANK_FEES_AXIS_FK=[
  ["Forex Markups","3.50%"],
  ["APR Fees","3.60%"],
  ["ATM Withdrawal","2.50%"],
  ["Reward Redemption Fees","Not Applicable"],
  ["Link for all T&Cs","https://www.axisbank.com/retail/cards/credit-card/flipkart-axis-bank-credit-card"],
  ["Railway Surcharge","As prescribed by IRCTC / Indian Railways"],
  ["Rent Payment Fees","1%"],
  ["Cheque Payment Fees","₹0"],
  ["Cash Payment Fees","₹100"],
];

export const BANK_FEES_HSBC_LIVE=[
  ["Forex Markups","3.50%"],
  ["APR Fees","3.75%"],
  ["ATM Withdrawal","2.50%"],
  ["Reward Redemption Fees","Not Applicable"],
  ["Link for all T&Cs","https://www.hsbc.co.in/credit-cards/products/live-plus/"],
  ["Railway Surcharge","1.80%"],
  ["Rent Payment Fees","1%"],
  ["Cheque Payment Fees","₹500"],
  ["Cash Payment Fees","₹100"],
];

export const BANK_FEES = BANK_FEES_HSBC_TRAVEL;

// Late fees — per card (structures differ)
export const LATE_FEES_HSBC_TRAVEL=[
  ["₹0 - ₹250","₹250"],
  ["₹251 - ₹500","₹500"],
  ["₹501 - ₹1,200","₹1,200"],
];
export const LATE_FEES_AXIS_FK=[
  ["₹0 - ₹500","₹0"],
  ["₹501 - ₹5,000","₹500"],
  ["₹5,001 - ₹10,000","₹750"],
  ["₹10,001 And Above","₹1,200"],
];
export const LATE_FEES_HSBC_LIVE=[
  ["₹0 - ₹500","₹0"],
  ["₹501 - ₹5,000","₹500"],
  ["₹5,001 - ₹10,000","₹750"],
  ["₹10,001 And Above","₹1,200"],
];
export const LATE_FEES = LATE_FEES_HSBC_TRAVEL;
export const CD=[
  {advice:"HSBC Travel One is strong for travel but weak on everyday spends. Optimize usage to save ₹80,000 more",adviceCta:"See how to optimize",saved:5200,potential:15000,bestCard:"HDFC Infinia",bestSaved:150000,actions:[{Ic:Clock,title:"3,200 points expiring soon",desc:"On your HSBC Travel One card",badge:"In 6 Days",cta:"Redeem ›"},{Ic:Star,title:"Unlock milestone travel voucher",desc:"Spend ₹4,200 more this quarter",badge:"In 30 Days",cta:"Track progress ›"}],brands:CD_BRANDS,categories:CD_CATS,txns:ALL_TXNS.slice(0,5),totalSpend:300000,totalSaved:5200,totalMissed:3200,welcome:{title:"1000 Reward Points worth ₹300",desc:"Bonus reward points awarded on your first spend above ₹500",status:"Claimed"},milestones:[{title:"2000 Points (Worth ₹600)",desc:"on spends of ₹2,00,000 on this card in a year",status:"Claimed",expiry:"18 days"},{title:"+1500 Points (Worth ₹450)",desc:"on spends of ₹3,00,000 on this card in a year",status:"Yet to claim"},{title:"+2000 Points (Worth ₹600)",desc:"on spends of ₹4,00,000 on this card in a year",status:"Yet to claim"}],lounge:[{title:"2 free domestic airport lounge visits per quarter",desc:"Via Visa Lounge program. Min spend of ₹50,000 in previous quarter required.",icon:"✈️"},{title:"1 free international lounge visit per quarter",desc:"Via Priority Pass. Requires ₹1,50,000+ quarterly spend.",icon:"🌍"},{title:"No railway lounge access",desc:"Not available on this card",icon:"🚫"}],limits:{creditUsed:53000,creditTotal:200000,caps:[{name:"Travel spends",used:28000,total:50000},{name:"Dining spends",used:20000,total:30000},{name:"International spends",used:8000,total:30000}]},fees:{annual:"₹500 + GST",annualWaiver:"Spend ₹1,50,000 or more to waive the next year's annual fee",annualStatus:"Waived",joining:"₹500 + GST",joiningNote:"Fee waived for first year"},bankFees:BANK_FEES,lateFees:LATE_FEES},
  {advice:"Strong for Flipkart but weak on dining & travel. Optimize usage to save ₹80,000 more",adviceCta:"See how to optimize",saved:8200,potential:12000,bestCard:"HDFC Infinia",bestSaved:150000,actions:[{Ic:AlertTriangle,title:"Flipkart 5X rewards ending soon",desc:"On your Axis Flipkart card",badge:"In 5 Days",cta:"Track progress ›"}],brands:CD_BRANDS.map(b=>({...b,spend:Math.round(b.spend*0.73),saved:Math.round(b.saved*0.82)})),categories:CD_CATS.map(c=>({...c,spend:Math.round(c.spend*0.73),saved:Math.round(c.saved*0.82)})),txns:ALL_TXNS.slice(5,10),totalSpend:220000,totalSaved:8200,totalMissed:1800,welcome:{title:"₹500 Flipkart voucher",desc:"On first spend above ₹500",status:"Claimed"},milestones:[{title:"₹750 Flipkart voucher",desc:"on spends of ₹50,000 in a year",status:"Claimed"},{title:"₹1,500 Flipkart voucher",desc:"on spends of ₹1,50,000 in a year",status:"Yet to claim"}],lounge:[{title:"4 complimentary domestic lounge visits per year",desc:"Via Mastercard partner lounges",icon:"✈️"},{title:"No railway lounge access",desc:"Not available on this card",icon:"🚫"}],limits:{creditUsed:38000,creditTotal:200000,caps:[{name:"Online Shopping spends",used:12000,total:25000},{name:"Dining spends",used:3000,total:15000}]},fees:{annual:"₹500 + GST",annualWaiver:"Spend ₹2,00,000 or more to waive the next year's annual fee",annualStatus:"Not yet",joining:"₹500 + GST",joiningNote:"Fee waived for first year"},bankFees:BANK_FEES,lateFees:LATE_FEES},
  {advice:"HSBC Live+ gives flat 1.5% on everything — great all-rounder but you're missing higher rates on specific brands",adviceCta:"See how to optimize",saved:6300,potential:9000,bestCard:"HDFC Infinia",bestSaved:150000,actions:[{Ic:CreditCard,title:"Waive your annual fee",desc:"Spend ₹18,000 more on HSBC Live+",badge:"In 45 Days",cta:"Track progress ›"}],brands:CD_BRANDS.map(b=>({...b,spend:Math.round(b.spend*0.6),saved:Math.round(b.saved*0.65)})),categories:CD_CATS.map(c=>({...c,spend:Math.round(c.spend*0.6),saved:Math.round(c.saved*0.65)})),txns:ALL_TXNS.slice(10,15),totalSpend:180000,totalSaved:6300,totalMissed:1400,welcome:{title:"₹500 Amazon Gift Card",desc:"On first spend above ₹5,000 within 30 days",status:"Claimed"},milestones:[{title:"₹1,000 cashback",desc:"on spends of ₹1,00,000 in a year",status:"Claimed"},{title:"₹2,000 cashback",desc:"on spends of ₹2,00,000 in a year",status:"Yet to claim"}],lounge:[{title:"4 domestic lounge visits per year",desc:"Via HSBC Lounge program, no min spend required",icon:"✈️"}],limits:{creditUsed:42000,creditTotal:150000,caps:[]},fees:{annual:"₹499 + GST",annualWaiver:"Spend ₹1,00,000 or more to waive the next year's annual fee",annualStatus:"Waived",joining:"₹499 + GST",joiningNote:"Fee waived for first year"},bankFees:BANK_FEES,lateFees:LATE_FEES},
];
