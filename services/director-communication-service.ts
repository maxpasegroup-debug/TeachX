import { prisma } from "@/lib/db";

const asPrefs=(value:unknown)=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
export async function getDirectorCommunicationIntelligence({institutionId,userId}:{institutionId?:string|null;userId?:string|null}){
 if(!institutionId)return {institution:"Institution",notifications:[],communications:[],events:[],discussions:[],summary:{priority:0,upcoming:0,published:0,conversations:0},settings:{format:"csv" as "csv"|"json",digest:true}};
 const [institution,notifications,communications,events,discussions,setting]=await Promise.all([
  prisma.institution.findUnique({where:{id:institutionId},select:{name:true}}),
  prisma.notification.findMany({where:{institutionId,status:{not:"ARCHIVED"}},orderBy:{createdAt:"desc"},take:100}),
  prisma.communication.findMany({where:{institutionId},include:{createdBy:{select:{name:true}},recipients:true,logs:true},orderBy:{createdAt:"desc"},take:100}),
  prisma.plannerEvent.findMany({where:{institutionId},orderBy:{startsAt:"asc"},take:100}),
  prisma.genericDiscussion.findMany({where:{institutionId},include:{author:{select:{name:true}},community:{select:{name:true}},replies:true},orderBy:{updatedAt:"desc"},take:100}),
  prisma.setting.findUnique({where:{institutionId_key:{institutionId,key:"directorx.communication.preferences"}},select:{value:true}})
 ]);
 const now=new Date(), prefs=asPrefs(setting?.value), priority=communications.filter(c=>c.priority==="URGENT"||c.priority==="HIGH");
 return {institution:institution?.name??"Institution",notifications:notifications.map(n=>({id:n.id,title:n.title,body:n.body,status:n.status,createdAt:n.createdAt,link:n.link})),communications:communications.map(c=>({id:c.id,title:c.title,body:c.body,kind:c.kind,priority:c.priority,status:c.status,scheduledAt:c.scheduledAt,publishedAt:c.publishedAt,createdAt:c.createdAt,author:c.createdBy?.name??"System",recipients:c.recipients.length,delivery:c.logs.length})),events:events.map(e=>({id:e.id,title:e.title,type:e.type,startsAt:e.startsAt,endsAt:e.endsAt,description:e.description})),discussions:discussions.map(d=>({id:d.id,title:d.title,body:d.body,scope:d.scope,status:d.status,author:d.author?.name??"Unknown",community:d.community?.name??"Institution",replies:d.replies.length,updatedAt:d.updatedAt})),summary:{priority:priority.length,upcoming:events.filter(e=>e.startsAt>=now).length,published:communications.filter(c=>c.status==="SENT").length,conversations:discussions.length},settings:{format:prefs.format==="json"?"json":"csv" as "csv"|"json",digest:prefs.digest!==false}};
}
