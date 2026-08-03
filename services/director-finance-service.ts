import { prisma } from "@/lib/db";

const amount=(value:unknown)=>Number(value??0);
const month=(d:Date)=>d.toLocaleDateString("en-IN",{month:"short",year:"2-digit"});

export async function getDirectorFinanceIntelligence({institutionId}:{institutionId?:string|null}) {
 if(!institutionId)return {institution:"Institution",summary:{today:0,revenue:0,expenses:0,net:0,outstanding:0,health:null},payments:[],fees:[],expenses:[],trends:[],categories:[],actions:[],settings:{format:"csv",threshold:70}};
 const [institution,payments,fees,expenses,setting]=await Promise.all([
  prisma.institution.findUnique({where:{id:institutionId},select:{name:true}}),
  prisma.payment.findMany({where:{institutionId,status:"COMPLETED"},include:{student:{select:{name:true}},studentFee:{include:{feeHead:{select:{name:true}}}},method:true},orderBy:{paidAt:"desc"},take:500}),
  prisma.studentFee.findMany({where:{institutionId},include:{student:{select:{name:true}},feeHead:{select:{name:true}},course:{select:{name:true}}},orderBy:{dueDate:"asc"},take:500}),
  prisma.expense.findMany({where:{institutionId},include:{category:true},orderBy:{spentAt:"desc"},take:500}),
  prisma.setting.findUnique({where:{institutionId_key:{institutionId,key:"directorx.finance.preferences"}},select:{value:true}})
 ]);
 const now=new Date(),today=new Date(now);today.setHours(0,0,0,0);
 const revenue=payments.reduce((n,p)=>n+amount(p.amount),0), expenseTotal=expenses.reduce((n,e)=>n+amount(e.amount),0);
 const expected=fees.reduce((n,f)=>n+amount(f.amount)+amount(f.fine)-amount(f.discount)-amount(f.scholarship)-amount(f.waiver),0);
 const outstanding=Math.max(expected-revenue,0), todayCollections=payments.filter(p=>p.paidAt>=today).reduce((n,p)=>n+amount(p.amount),0);
 const periods=new Map<string,{label:string;revenue:number;expenses:number}>(); [...payments.map(p=>p.paidAt),...expenses.map(e=>e.spentAt)].forEach(d=>{const key=`${d.getFullYear()}-${d.getMonth()}`;if(!periods.has(key))periods.set(key,{label:month(d),revenue:0,expenses:0})}); payments.forEach(p=>{const x=periods.get(`${p.paidAt.getFullYear()}-${p.paidAt.getMonth()}`);if(x)x.revenue+=amount(p.amount)}); expenses.forEach(e=>{const x=periods.get(`${e.spentAt.getFullYear()}-${e.spentAt.getMonth()}`);if(x)x.expenses+=amount(e.amount)});
 const categories=Object.entries(expenses.reduce<Record<string,number>>((a,e)=>{a[e.category?.name??"Uncategorised"]=(a[e.category?.name??"Uncategorised"]??0)+amount(e.amount);return a},{})).map(([name,total])=>({name,total})).sort((a,b)=>b.total-a.total);
 const overdue=fees.filter(f=>f.status!=="PAID"&&f.dueDate&&f.dueDate<now), health=expected?Math.max(0,Math.min(100,Math.round((revenue/expected)*100))):null;
 const actions=[...(overdue.length?[{severity:"ATTENTION",signal:"Overdue fee exposure",evidence:`${overdue.length} fee records are past due, totalling INR ${overdue.reduce((n,f)=>n+amount(f.amount),0).toLocaleString("en-IN")}.`,action:"Prioritise the oldest receivables in existing collections workflows.",owner:"Accounts lead",due:"This week"}]:[]),...(expenses.some(e=>e.status==="PENDING")?[{severity:"WATCH",signal:"Pending expense records",evidence:`${expenses.filter(e=>e.status==="PENDING").length} expense records remain pending.`,action:"Review status in the existing finance workspace.",owner:"Accounts lead",due:"Next review"}]:[])];
 const raw=setting?.value;const prefs=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
 return {institution:institution?.name??"Institution",summary:{today:todayCollections,revenue,expenses:expenseTotal,net:revenue-expenseTotal,outstanding,health},payments:payments.map(p=>({id:p.id,student:p.student.name??"Student",amount:amount(p.amount),paidAt:p.paidAt,status:p.status,method:p.method?.name??"Unrecorded",head:p.studentFee?.feeHead?.name??"Unallocated"})),fees:fees.map(f=>({id:f.id,student:f.student.name??"Student",amount:amount(f.amount),dueDate:f.dueDate,status:f.status,head:f.feeHead?.name??"Unallocated",course:f.course?.name??"Unassigned"})),expenses:expenses.map(e=>({id:e.id,title:e.title,amount:amount(e.amount),spentAt:e.spentAt,status:e.status,category:e.category?.name??"Uncategorised"})),trends:[...periods.values()].slice(-12),categories,actions,settings:{format:prefs.format==="json"?"json":"csv",threshold:typeof prefs.threshold==="number"?prefs.threshold:70}};
}
