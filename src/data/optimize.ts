// @ts-nocheck
import { C } from "@/lib/theme";

export const OPT_BRANDS=[
  {name:"Amazon",icon:"🟠",cat:"Online shopping",totalSpend:50000,saved:100,bestCard:"HSBC Live+",bestRate:1.5,bestSaved:750,altCard:"Axis Flipkart",altRate:1.5,txnCount:24,breakdown:[{card:"HSBC Live+",pct:100,spend:50000,saved:750}]},
  {name:"Flipkart",icon:"🔵",cat:"Online shopping",totalSpend:45000,saved:100,bestCard:"Axis Flipkart",bestRate:5,bestSaved:2250,altCard:"HSBC Live+",altRate:1.5,txnCount:18,breakdown:[{card:"Axis Flipkart",pct:100,spend:45000,saved:2250}]},
  {name:"Swiggy",icon:"🟠",cat:"Groceries",totalSpend:36000,saved:80,bestCard:"Axis Flipkart",bestRate:4,bestSaved:1440,altCard:"HSBC Live+",altRate:1.5,txnCount:48,capInfo:"₹750/month cashback cap on preferred merchants",breakdown:[{card:"Axis Flipkart",pct:67,spend:24000,saved:960},{card:"HSBC Live+",pct:33,spend:12000,saved:180}]},
  {name:"Myntra",icon:"🟣",cat:"Online shopping",totalSpend:28000,saved:60,bestCard:"Axis Flipkart",bestRate:4,bestSaved:1120,altCard:"HSBC Live+",altRate:1.5,txnCount:12,capInfo:"₹750/month cashback cap on preferred merchants",breakdown:[{card:"Axis Flipkart",pct:57,spend:16000,saved:640},{card:"HSBC Live+",pct:43,spend:12000,saved:180}]},
  {name:"MakeMyTrip",icon:"✈️",cat:"Travel",totalSpend:24000,saved:120,bestCard:"HSBC Travel One",bestRate:3,bestSaved:720,altCard:"Axis Flipkart",altRate:1.5,txnCount:6,breakdown:[{card:"HSBC Travel One",pct:100,spend:24000,saved:720}]},
  {name:"Uber",icon:"🚗",cat:"Cab Rides",totalSpend:18000,saved:40,bestCard:"Axis Flipkart",bestRate:4,bestSaved:720,altCard:"HSBC Travel One",altRate:2,txnCount:36,breakdown:[{card:"Axis Flipkart",pct:100,spend:18000,saved:720}]},
  {name:"BookMyShow",icon:"🎬",cat:"Entertainment",totalSpend:8000,saved:30,bestCard:"HSBC Live+",bestRate:1.5,bestSaved:120,altCard:"Axis Flipkart",altRate:1.5,txnCount:10,breakdown:[{card:"HSBC Live+",pct:100,spend:8000,saved:120}]},
];

export const SAVINGS_COMP=[
  {name:"HDFC Infinia",color:"#111827",cls:"Best Card For You",clsColor:C.dkGreen,barColor:"linear-gradient(90deg,#0d9f5f,#16a34a)",barPct:100,savings:150000},
  {name:"Axis Flipkart",color:"#5b2c8e",cls:"Good Card",clsColor:"#6d8c00",barColor:"linear-gradient(90deg,#a3c520,#d4e82c)",barPct:65,savings:98000},
  {name:"HSBC Travel One",color:"#0c2340",cls:"Average Card",clsColor:C.orange,barColor:"linear-gradient(90deg,#d97706,#fbbf24)",barPct:35,savings:52000},
];
