import { prisma } from "@/lib/db";

const day=(date:Date)=>date.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
export async function getDirectorOperationsIntelligence({institutionId}:{institutionId?:string|null}){
 if(!institutionId)return {institution:"Institution",summary:{health:null,openTickets:0,pendingTasks:0,upcomingEvents:0,audits:0,rooms:0},tickets:[],events:[],audits:[],rooms:[],risks:[],settings:{threshold:3,format:"csv" as "csv"|"json"}};
 const [institution,tickets,events,audits,rooms,setting]=await Promise.all([
  prisma.institution.findUnique({where:{id:institutionId},select:{name:true}}),
  prisma.supportTicket.findMany({where:{institutionId},include:{assignedTo:{select:{name:true}}},orderBy:{updatedAt:"desc"},take:200}),
  prisma.plannerEvent.findMany({where:{institutionId},orderBy:{startsAt:"asc"},take:100}),
  prisma.auditLog.findMany({where:{institutionId},include:{actor:{select:{name:true}}},orderBy:{createdAt:"desc"},take:200}),
  prisma.room.findMany({where:{institutionId},orderBy:{name:"asc"},take:200}),
  prisma.setting.findUnique({where:{institutionId_key:{institutionId,key:"directorx.operations.preferences"}},select:{value:true}})
 ]);
 const now=new Date(), open=tickets.filter(t=>!["RESOLVED","CLOSED"].includes(t.status)), upcoming=events.filter(e=>e.startsAt>=now), critical=tickets.filter(t=>t.priority==="URGENT"||t.priority==="HIGH");
 const risks=[...critical.map(t=>({severity:"CRITICAL",signal:"Escalated operational issue",evidence:`${t.subject} is ${t.status.toLowerCase().replaceAll("_"," ")}.`,action:"Review the existing support workflow and assign an accountable owner.",owner:t.assignedTo?.name??"Unassigned",due:"Today"})),...(open.length>=3?[{severity:"WATCH",signal:"Open work queue",evidence:`${open.length} institution-scoped support issues remain open.`,action:"Triage backlog using the existing support workflow.",owner:"Operations lead",due:"This week"}]:[]),...(upcoming.length?[{severity:"NOTICE",signal:"Upcoming operational calendar",evidence:`${upcoming.length} events are scheduled; next is ${upcoming[0].title} on ${day(upcoming[0].startsAt)}.`,action:"Confirm readiness with the responsible department.",owner:"Operations lead",due:day(upcoming[0].startsAt)}]:[])];
 const raw=setting?.value;const prefs=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
 const health=(tickets.length||events.length)?Math.max(0,Math.min(100,100-open.length*8-critical.length*10)):null;
 return {institution:institution?.name??"Institution",summary:{health,openTickets:open.length,pendingTasks:open.length,upcomingEvents:upcoming.length,audits:audits.length,rooms:rooms.length},tickets:tickets.map(t=>({id:t.id,subject:t.subject,status:t.status,priority:t.priority,owner:t.assignedTo?.name??"Unassigned",updatedAt:t.updatedAt,type:t.type})),events:events.map(e=>({id:e.id,title:e.title,type:e.type,startsAt:e.startsAt,endsAt:e.endsAt,description:e.description})),audits:audits.map(a=>({id:a.id,action:a.action,entity:a.entity,message:a.message,actor:a.actor?.name??"System",createdAt:a.createdAt})),rooms:rooms.map(r=>({id:r.id,name:r.name,code:r.code,capacity:r.capacity,status:r.status})),risks,settings:{threshold:typeof prefs.threshold==="number"?prefs.threshold:3,format:prefs.format==="json"?"json":"csv" as "csv"|"json"}};
}
