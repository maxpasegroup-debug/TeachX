import{redirect}from"next/navigation";import{auth}from"@/auth";
export default async function Layout({children}:{children:React.ReactNode}){const s=await auth();if(!s?.user.id||!s.user.roles.includes("PARENT")||!s.user.institutionId)redirect("/entry");return children}
