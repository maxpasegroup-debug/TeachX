import process from "node:process";
const raw=process.env.SMOKE_BASE_URL||process.env.MONITOR_BASE_URL,checks=[],check=(name,pass,detail)=>checks.push({name,pass,detail});
if(!raw){console.error("Privacy verification requires SMOKE_BASE_URL=https://your-production-domain.");process.exit(1);}const base=raw.replace(/\/+$/,"");
check("target:https",new URL(base).protocol==="https:","production target uses HTTPS");
for(const key of ["PRIVACY_PROGRAM_READY","PRIVACY_RETENTION_READY","PRIVACY_VENDOR_REGISTER_READY","PRIVACY_TRANSFER_REVIEW_READY"])check(`control:${key}`,process.env[key]==="true",`${key} is attested`);
check("contact:assigned",Boolean(process.env.PRIVACY_CONTACT_EMAIL?.trim()),"privacy contact is assigned");
const maxAge=Number(process.env.PRIVACY_EVIDENCE_MAX_AGE_DAYS||90);
for(const key of ["PRIVACY_RIGHTS_DRILL_TESTED_AT","PRIVACY_RETENTION_REVIEWED_AT","PRIVACY_VENDOR_REVIEWED_AT","PRIVACY_COOKIE_REVIEWED_AT"]){const age=process.env[key]?(Date.now()-new Date(process.env[key]).getTime())/86400000:Infinity;check(`evidence:${key}`,Number.isFinite(age)&&age>=0&&age<=maxAge,`${key} age ${Number.isFinite(age)?age.toFixed(1):"missing"} days`);}
async function request(path){return fetch(`${base}${path}`,{redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(10000)});}
try{const response=await request("/privacy");const body=await response.text();check("privacy:page",response.ok&&body.includes("Privacy Policy"),`HTTP ${response.status}`);}catch(error){check("privacy:page",false,error instanceof Error?error.message:"request failed");}
try{const response=await request("/api/privacy/consent");check("consent:private-read",response.status===401,`anonymous GET is HTTP ${response.status}`);}catch(error){check("consent:private-read",false,error instanceof Error?error.message:"request failed");}
try{const response=await request("/api/privacy/admin/requests");check("admin:protected",response.status===401,`anonymous GET is HTTP ${response.status}`);}catch(error){check("admin:protected",false,error instanceof Error?error.message:"request failed");}
try{const response=await request("/api/status"),body=await response.json();check("status:privacy",body.components?.some(item=>item.name==="Privacy operations"),"privacy operations appears in public status");}catch(error){check("status:privacy",false,error instanceof Error?error.message:"request failed");}
const failed=checks.filter(item=>!item.pass);console.log(`TeachX privacy verification: ${checks.length-failed.length}/${checks.length} checks passed`);for(const item of checks)console.log(`${item.pass?"PASS":"FAIL"} ${item.name} - ${item.detail}`);if(failed.length)process.exit(1);console.log("Live global privacy evidence passed.");
