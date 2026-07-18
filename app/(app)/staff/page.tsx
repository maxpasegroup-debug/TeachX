import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { StaffBoard } from "@/features/staff/components/staff-board";
import { prisma } from "@/lib/db";
import { getLeaveOverview } from "@/services/leave-service";
import { getPayrollOverview } from "@/services/payroll-service";

export default async function StaffPage() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  const [staffUsers, payroll, leave] = await Promise.all([
    prisma.user.findMany({
      where: {
        institutionId,
        roles: {
          some: {
            role: {
              key: {
                in: ["DIRECTOR", "ADMIN", "ACCOUNTS", "ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR", "BUSINESS_DEVELOPMENT_EXECUTIVE", "VIDEO_EDITOR", "RECEPTION"]
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    }),
    getPayrollOverview(institutionId),
    getLeaveOverview(institutionId)
  ]);

  return (
    <>
      <PageHeader description="Maintain the staff directory, leave requests and payroll foundation without crowded HR screens." eyebrow="People operations" title="Staff" />
      <StaffBoard leave={leave} payroll={payroll} staffUsers={staffUsers} />
    </>
  );
}
