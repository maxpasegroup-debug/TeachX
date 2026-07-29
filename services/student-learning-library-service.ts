import { prisma } from "@/lib/db";

export const LIBRARY_KEYS = {
  settings: "learnx.library.settings",
  collections: "learnx.library.collections",
  searches: "learnx.library.searches",
  certificates: "learnx.library.certificates",
  completions: "learnx.library.completions",
} as const;

export type LibraryLesson = { id:string; kind:"topic"|"material"|"recording"|"content"; title:string; description:string; subjectId:string; subject:string; chapter:string; url:string|null; duration:number; completed:boolean; position:number; saved:boolean; downloadable:boolean };
export type LibraryCourse = { id:string; grade:string|null; board:string|null; difficulty:string|null; saved:boolean; classroomId:string; name:string; code:string; description:string; category:string; duration:string; thumbnailUrl:string|null; progress:number; lastActivity:string|null; subjects:Array<{id:string;name:string;description:string;progress:number;chapters:Array<{id:string;name:string;lessons:LibraryLesson[]}>}>; lessons:LibraryLesson[] };
export type LibraryData = { learnerName:string; courses:LibraryCourse[]; favorites:Array<{id:string;type:string;entityId:string;title:string;link:string|null}>; recent:Array<{id:string;title:string;link:string|null;viewedAt:string}>; collections:Array<{id:string;name:string;items:string[]}>; searches:string[]; settings:{playbackSpeed:number;readingSize:string;downloads:string;offlineReady:boolean;language:string;highContrast:boolean;reducedMotion:boolean}; stats:{progress:number;completed:number;total:number;minutes:number} };

const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
const defaults={playbackSpeed:1,readingSize:"Comfortable",downloads:"Ask every time",offlineReady:false,language:"English",highContrast:false,reducedMotion:false};
export async function getStudentLibrary(userId?:string):Promise<LibraryData>{
  const empty:LibraryData={learnerName:"Learner",courses:[],favorites:[],recent:[],collections:[],searches:[],settings:defaults,stats:{progress:0,completed:0,total:0,minutes:0}};
  if(!userId)return empty;
  const [user,enrollments,favorites,recent,prefs]=await Promise.all([
    prisma.user.findUnique({where:{id:userId},select:{name:true}}),
    prisma.batchStudent.findMany({
      where:{studentId:userId},
      include:{batch:{include:{
        course:{include:{subjects:{orderBy:{order:"asc"},include:{chapters:{orderBy:{order:"asc"},include:{topics:{orderBy:{order:"asc"}}}}}}}},
        classroom:{include:{
          materials:{where:{publishStatus:"PUBLISHED"},orderBy:{createdAt:"desc"}},
          recordings:{where:{status:"PUBLISHED"},orderBy:{createdAt:"desc"}},
          contentItems:{where:{status:"PUBLISHED",visibility:{in:["ENROLLED_STUDENTS","PUBLIC"]}},include:{topic:true,chapter:true,subject:true,watches:{where:{userId}}},orderBy:{publishedAt:"desc"}},
          learningProgress:{where:{studentId:userId}},videoProgress:{where:{studentId:userId}}
        }}
      }}}
    }),
    prisma.favoriteItem.findMany({where:{userId},orderBy:{createdAt:"desc"},take:100}),
    prisma.recentItem.findMany({where:{userId,type:{startsWith:"learnx.library"}},orderBy:{viewedAt:"desc"},take:20}),
    prisma.userPreference.findMany({where:{userId,key:{in:Object.values(LIBRARY_KEYS)}}}),
  ]);
  const preferenceMap=new Map(prefs.map(x=>[x.key,x.value])); const rawCompletions=preferenceMap.get(LIBRARY_KEYS.completions); const personalCompleted=new Set(Array.isArray(rawCompletions)?rawCompletions.map(String):[]);
  const courses:LibraryCourse[]=enrollments.flatMap(({batch})=>{const c=batch.classroom;if(!c)return[];const vp=new Map(c.videoProgress.map(x=>[x.recordingId,x]));const progress=new Map(c.learningProgress.map(x=>[x.subjectId,x.completion]));const saved=new Set(favorites.map(x=>x.entityId));
    const subjects=batch.course.subjects.map(subject=>{const extras:LibraryLesson[]=[
      ...c.materials.filter(x=>x.subjectId===subject.id).map(x=>({id:x.id,kind:"material" as const,title:x.title,description:x.aiSummary||x.notes||`${x.type} study material`,subjectId:subject.id,subject:subject.name,chapter:x.chapter||"Study materials",url:x.fileUrl,duration:0,completed:personalCompleted.has(x.id),position:0,saved:saved.has(x.id),downloadable:!!x.fileUrl})),
      ...c.contentItems.filter(x=>x.subjectId===subject.id).map(x=>{const h=x.watches?.[0];return{id:x.id,kind:"content" as const,title:x.title,description:x.description||`${x.type.toLowerCase()} lesson`,subjectId:subject.id,subject:subject.name,chapter:x.chapter?.name||"Supplementary learning",url:x.fileUrl||x.externalUrl,duration:x.durationSeconds,completed:!!h?.completed||personalCompleted.has(x.id),position:h?.lastPosition||0,saved:saved.has(x.id),downloadable:!!x.fileUrl}}),
      ...c.recordings.map(x=>{const p=vp.get(x.id);return{id:x.id,kind:"recording" as const,title:x.title,description:x.editorNotes||"Recorded lesson",subjectId:subject.id,subject:subject.name,chapter:"Video lessons",url:x.videoUrl,duration:p?.duration||0,completed:!!p?.completed||personalCompleted.has(x.id),position:p?.lastPosition||0,saved:saved.has(x.id),downloadable:false}}),
    ];
    const chapters=subject.chapters.map(ch=>({id:ch.id,name:ch.name,lessons:[...ch.topics.map(t=>({id:t.id,kind:"topic" as const,title:t.name,description:"Curriculum topic",subjectId:subject.id,subject:subject.name,chapter:ch.name,url:null,duration:0,completed:personalCompleted.has(t.id),position:0,saved:saved.has(t.id),downloadable:false})),...extras.filter(x=>x.chapter===ch.name)]}));
    const loose=extras.filter(x=>!chapters.some(ch=>ch.name===x.chapter));if(loose.length)chapters.push({id:`extra-${subject.id}`,name:"Learning resources",lessons:loose});
    return{id:subject.id,name:subject.name,description:subject.description||"",progress:progress.get(subject.id)||0,chapters};
  });const lessons=subjects.flatMap(s=>s.chapters.flatMap(ch=>ch.lessons));const aggregate=c.learningProgress.length?Math.round(c.learningProgress.reduce((a,x)=>a+x.completion,0)/c.learningProgress.length):0;return[{id:batch.course.id,grade:null,board:null,difficulty:null,saved:saved.has(batch.course.id),classroomId:c.id,name:batch.course.name,code:batch.course.code,description:batch.course.description||"Your enrolled learning program",category:batch.course.category||"Enrolled course",duration:batch.course.duration||"Self-paced",thumbnailUrl:batch.course.thumbnailUrl,progress:aggregate,lastActivity:c.learningProgress.map(x=>x.lastActivityAt?.toISOString()||"").sort().at(-1)||null,subjects,lessons}]});
  const map=preferenceMap,rawSettings=map.get(LIBRARY_KEYS.settings),settings={...defaults,...(object(rawSettings)?rawSettings:{})} as LibraryData["settings"],rawCollections=map.get(LIBRARY_KEYS.collections),collections=Array.isArray(rawCollections)?(rawCollections.filter(object) as Record<string,unknown>[]).slice(0,30).map(x=>({id:String(x.id||""),name:String(x.name||"Collection"),items:Array.isArray(x.items)?x.items.map(String).slice(0,100):[]})):[],rawSearches=map.get(LIBRARY_KEYS.searches),searches=Array.isArray(rawSearches)?rawSearches.map(String).slice(0,12):[];
  const all=courses.flatMap(x=>x.lessons),completed=all.filter(x=>x.completed).length,minutes=Math.round(all.reduce((a,x)=>a+x.position,0)/60),overall=courses.length?Math.round(courses.reduce((a,x)=>a+x.progress,0)/courses.length):0;
  return{learnerName:user?.name||"Learner",courses,favorites:favorites.map(x=>({...x,link:x.link||null})),recent:recent.map(x=>({id:x.id,title:x.title,link:x.link,viewedAt:x.viewedAt.toISOString()})),collections,searches,settings,stats:{progress:overall,completed,total:all.length,minutes}};
}

export async function getStudentCourse(userId:string|undefined,courseId:string){const data=await getStudentLibrary(userId);return{data,course:data.courses.find(x=>x.id===courseId)||null}}
