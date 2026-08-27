-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('teacher', 'student', 'admin');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AcademicYearStatus" AS ENUM ('PLANNED', 'CURRENT', 'CLOSED');

-- CreateEnum
CREATE TYPE "AcademicTermType" AS ENUM ('SEMESTER', 'TRIMESTER', 'QUARTER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LearningMode" AS ENUM ('LIVE', 'RECORDED', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "BatchMode" AS ENUM ('LIVE', 'RECORDED', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "BatchType" AS ENUM ('MORNING', 'EVENING', 'WEEKEND', 'WEEKDAY', 'ONLINE', 'OFFLINE', 'HYBRID', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlannerEventType" AS ENUM ('HOLIDAY', 'SPECIAL_HOLIDAY', 'EVENT');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "TimeSlotType" AS ENUM ('CLASS', 'BREAK', 'LUNCH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OverrideType" AS ENUM ('FACULTY_REPLACEMENT', 'SUBJECT_REPLACEMENT', 'ROOM_CHANGE', 'TIME_CHANGE', 'CANCEL_CLASS', 'EXTRA_CLASS', 'SPECIAL_CLASS', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "ClassroomStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'LATE', 'RETURNED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'PUBLISHED', 'SENT_TO_EDITOR');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'PPT', 'IMAGE', 'NOTES');

-- CreateEnum
CREATE TYPE "BookmarkTargetType" AS ENUM ('RECORDING', 'MATERIAL', 'ASSIGNMENT', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "NoteTargetType" AS ENUM ('RECORDING', 'MATERIAL', 'ASSIGNMENT', 'LESSON');

-- CreateEnum
CREATE TYPE "DiscussionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW_LEAD', 'CONTACTED', 'INTERESTED', 'DEMO_SCHEDULED', 'DEMO_ATTENDED', 'APPLICATION_SUBMITTED', 'DOCUMENT_VERIFICATION', 'ADMISSION_APPROVED', 'FEE_PENDING', 'ENROLLED', 'STUDENT_CREATED');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('CALL', 'MEETING', 'WHATSAPP', 'EMAIL', 'REMINDER');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'ENROLLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FIXED', 'PERCENTAGE', 'COURSE_WISE', 'CAMPAIGN_WISE', 'MANUAL');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'MULTIPLE_CORRECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'IMAGE', 'PARAGRAPH', 'ASSERTION_REASON', 'CASE_STUDY');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ContentVisibility" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentItemType" AS ENUM ('VIDEO', 'PDF', 'PPT', 'IMAGE', 'AUDIO', 'ZIP', 'EXTERNAL_LINK', 'DOCUMENT', 'NOTES', 'WORKSHEET', 'QUESTION_PAPER', 'ANSWER_KEY', 'REFERENCE');

-- CreateEnum
CREATE TYPE "ContentWorkflowStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VIDEO_REVIEW', 'NEEDS_CHANGES', 'ACADEMIC_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentReviewDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'NEEDS_CHANGES');

-- CreateEnum
CREATE TYPE "ContentVisibilityScope" AS ENUM ('PRIVATE', 'TEACHERS', 'ENROLLED_STUDENTS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('NOT_STARTED', 'READY', 'FAILED', 'AI_READY');

-- CreateEnum
CREATE TYPE "WorkspaceKind" AS ENUM ('DIRECTOR', 'ACADEMIC_HEAD', 'TEACHER', 'STUDENT', 'PARENT', 'BUSINESS_DEVELOPMENT', 'ACCOUNTS', 'RECEPTION', 'VIDEO_EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ADMISSION', 'ASSIGNMENT', 'ATTENDANCE', 'EXAM', 'PLANNER', 'FINANCE', 'ANNOUNCEMENT', 'CONTENT', 'LEAVE', 'VISITOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DashboardWidgetType" AS ENUM ('CARD', 'TABLE', 'LIST', 'PROGRESS', 'TIMELINE', 'CHART_PLACEHOLDER', 'AI_READY');

-- CreateEnum
CREATE TYPE "CommunicationKind" AS ENUM ('ANNOUNCEMENT', 'BROADCAST', 'ROLE_MESSAGE', 'COURSE_MESSAGE', 'BATCH_MESSAGE', 'INDIVIDUAL_MESSAGE');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CommunicationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DirectConversationType" AS ENUM ('TEACHER_STUDENT', 'TEACHER_TEACHER', 'STUDENT_STUDENT_DISABLED', 'SUPPORT');

-- CreateEnum
CREATE TYPE "DirectConversationStatus" AS ENUM ('REQUESTED', 'ACTIVE', 'ARCHIVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DirectMessageStatus" AS ENUM ('SENT', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommunityType" AS ENUM ('TEACHER_GROUP', 'STUDY_GROUP', 'INSTITUTION', 'INTEREST', 'SUPPORT');

-- CreateEnum
CREATE TYPE "CommunityVisibility" AS ENUM ('PRIVATE', 'INVITE_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "CommunityStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'LOCKED');

-- CreateEnum
CREATE TYPE "CommunityRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "GenericDiscussionScope" AS ENUM ('SUBJECT', 'COURSE', 'RESOURCE', 'TEACHER', 'INSTITUTION', 'SUPPORT');

-- CreateEnum
CREATE TYPE "GenericDiscussionStatus" AS ENUM ('OPEN', 'PINNED', 'LOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ActivityEventStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SupportTicketType" AS ENUM ('SUPPORT', 'FEEDBACK', 'BUG', 'FEATURE_REQUEST', 'CONTACT');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AIConversationScope" AS ENUM ('TEACHER', 'STUDENT', 'ADMISSIONS', 'DIRECTOR', 'FINANCE', 'SEARCH', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('ADMISSION_APPROVED', 'EXAM_PUBLISHED', 'ASSIGNMENT_DUE', 'FEE_DUE', 'CONTENT_PUBLISHED', 'LEAVE_APPROVED', 'VISITOR_REGISTERED');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "AutomationExecutionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('PRACTICE', 'MOCK', 'ASSIGNMENT', 'CLASS_TEST', 'FINAL');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionSelectionMode" AS ENUM ('MANUAL', 'RANDOM', 'TOPIC_WISE', 'DIFFICULTY_WISE', 'AI_READY');

-- CreateEnum
CREATE TYPE "ExamAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED');

-- CreateEnum
CREATE TYPE "ExamAnswerStatus" AS ENUM ('NOT_VISITED', 'ANSWERED', 'SKIPPED', 'MARKED_REVIEW');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('ADMISSION', 'COURSE', 'REGISTRATION', 'EXAM', 'MATERIAL', 'HOSTEL', 'TRANSPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StudentFeeStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'WAIVED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'ONLINE_GATEWAY', 'RAZORPAY_READY', 'STRIPE_READY');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommerceAudience" AS ENUM ('TEACHER', 'STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT', 'HOLD', 'RELEASE', 'EARNING', 'SPENDING', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "CommerceOrderType" AS ENUM ('RESOURCE_PURCHASE', 'SUBSCRIPTION_PURCHASE', 'AI_CREDIT_PACK', 'BOOKING_RESERVATION');

-- CreateEnum
CREATE TYPE "CommerceOrderStatus" AS ENUM ('DRAFT', 'CREATED', 'PENDING_PAYMENT', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CommerceItemType" AS ENUM ('RESOURCE', 'SUBSCRIPTION', 'AI_CREDITS', 'BOOKING');

-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('WAITING', 'MET', 'CANCELLED');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#111827',
    "secondaryColor" TEXT NOT NULL DEFAULT '#64748b',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "academicYear" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userType" "UserType",
    "passwordHash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "rememberToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "contact" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AcademicYearStatus" NOT NULL DEFAULT 'PLANNED',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicTerm" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AcademicTermType" NOT NULL DEFAULT 'SEMESTER',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "branchId" TEXT,
    "academicYearId" TEXT,
    "departmentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "duration" TEXT,
    "category" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "thumbnailUrl" TEXT,
    "learningModes" "LearningMode"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "departmentId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "academicYearId" TEXT,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "maximumStrength" INTEGER NOT NULL DEFAULT 30,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "mode" "BatchMode" NOT NULL DEFAULT 'OFFLINE',
    "type" "BatchType" NOT NULL DEFAULT 'WEEKDAY',
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchFaculty" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchStudent" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ClassroomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomAnnouncement" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyMaterial" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "subjectId" TEXT,
    "uploadedById" TEXT,
    "title" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "chapter" TEXT,
    "topic" TEXT,
    "fileUrl" TEXT,
    "notes" TEXT,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "subjectId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "aiPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "remarks" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "assignmentProgress" INTEGER NOT NULL DEFAULT 0,
    "attendancePercentage" INTEGER NOT NULL DEFAULT 0,
    "studyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "achievements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "playbackSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "targetType" "BookmarkTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentNote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "targetType" "NoteTargetType" NOT NULL,
    "targetId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionThread" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" "DiscussionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscussionThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionReply" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSource" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "sourceId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "guestUserId" TEXT,
    "assignedExecutiveId" TEXT,
    "sourceId" TEXT,
    "campaignId" TEXT,
    "interestedCourseId" TEXT,
    "preferredBatchId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "address" TEXT,
    "education" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW_LEAD',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "remarks" TEXT,
    "aiSummary" TEXT,
    "aiRisk" TEXT,
    "aiSuggestedFollowUp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "actorId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "FollowUpType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTask" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "courseId" TEXT,
    "batchId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "formData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "leadId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admission" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "applicationId" TEXT,
    "courseId" TEXT,
    "batchId" TEXT,
    "studentId" TEXT,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "referralCode" TEXT NOT NULL,
    "referralLink" TEXT,
    "qrCodeUrl" TEXT,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "profile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerReferral" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "leadId" TEXT,
    "campaignId" TEXT,
    "referralCode" TEXT NOT NULL,
    "campaignSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCommission" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "referralId" TEXT,
    "courseId" TEXT,
    "campaignId" TEXT,
    "type" "CommissionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "percentage" DECIMAL(65,30),
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "settlementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerSettlement" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "topicId" TEXT,
    "authorId" TEXT,
    "type" "QuestionType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'DRAFT',
    "question" TEXT NOT NULL,
    "paragraph" TEXT,
    "imageUrl" TEXT,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "teacherExplanation" TEXT,
    "marks" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "negativeMarks" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "aiPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTagLink" (
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "QuestionTagLink_pkey" PRIMARY KEY ("questionId","tagId")
);

-- CreateTable
CREATE TABLE "QuestionImport" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "sourceType" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "parsedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentVisibility" NOT NULL DEFAULT 'DRAFT',
    "aiReadyNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "createdById" TEXT,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    "batchId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "durationSeconds" INTEGER NOT NULL,
    "totalMarks" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "negativeMarks" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "attemptsAllowed" INTEGER NOT NULL DEFAULT 1,
    "passingMarks" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "type" "ExamType" NOT NULL DEFAULT 'PRACTICE',
    "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
    "selectionMode" "QuestionSelectionMode" NOT NULL DEFAULT 'MANUAL',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "aiBlueprint" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "marks" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "negativeMarks" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "ExamAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeTakenSeconds" INTEGER NOT NULL DEFAULT 0,
    "currentQuestion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT,
    "status" "ExamAnswerStatus" NOT NULL DEFAULT 'NOT_VISITED',
    "isCorrect" BOOLEAN,
    "marksAwarded" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "wrong" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "percentage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "accuracy" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "timeTakenSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceAnalytics" (
    "id" TEXT NOT NULL,
    "examId" TEXT,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    "strongAreas" JSONB,
    "weakAreas" JSONB,
    "accuracy" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeHead" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePlan" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "courseId" TEXT,
    "subjectId" TEXT,
    "batchId" TEXT,
    "name" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "scholarship" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fineRule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeInstallment" (
    "id" TEXT NOT NULL,
    "feePlanId" TEXT NOT NULL,
    "feeHeadId" TEXT,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "FeeInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentFee" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT,
    "subjectId" TEXT,
    "batchId" TEXT,
    "feePlanId" TEXT,
    "feeHeadId" TEXT,
    "installmentId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "scholarship" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fine" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "waiver" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "status" "StudentFeeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentFeeId" TEXT,
    "methodId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "gatewayPayload" JSONB,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "emailReady" BOOLEAN NOT NULL DEFAULT true,
    "whatsappReady" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "studentFeeId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "duplicateOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audience" "CommerceAudience" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "interval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "aiMonthlyCredits" INTEGER NOT NULL DEFAULT 0,
    "marketplaceAccess" BOOLEAN NOT NULL DEFAULT false,
    "resourceLimit" INTEGER NOT NULL DEFAULT 0,
    "storageLimitMb" INTEGER NOT NULL DEFAULT 0,
    "featureFlags" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pendingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lifetimeEarnings" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lifetimeSpending" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceOrder" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "buyerId" TEXT NOT NULL,
    "type" "CommerceOrderType" NOT NULL,
    "status" "CommerceOrderStatus" NOT NULL DEFAULT 'CREATED',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "couponId" TEXT,
    "gateway" TEXT,
    "gatewayOrderId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommerceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemType" "CommerceItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "resourceId" TEXT,
    "planId" TEXT,
    "bookingRequestId" TEXT,
    "sellerId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommerceOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "code" TEXT NOT NULL,
    "campaign" TEXT,
    "description" TEXT,
    "discountType" "CouponDiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "code" TEXT NOT NULL,
    "referrerId" TEXT,
    "referredUserId" TEXT,
    "campaign" TEXT,
    "rewardMetadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceInvoice" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "orderId" TEXT,
    "buyerId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "gstNumber" TEXT,
    "billingName" TEXT,
    "billingEmail" TEXT,
    "billingAddress" TEXT,
    "businessDetails" JSONB,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommerceInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "attachmentUrl" TEXT,
    "remarks" TEXT,
    "spentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "designation" TEXT,
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "joiningDate" TIMESTAMP(3),
    "documents" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalary" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "basic" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "allowances" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bonus" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3),

    CONSTRAINT "EmployeeSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "salaryId" TEXT,
    "staffId" TEXT NOT NULL,
    "grossAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "purpose" TEXT,
    "status" "VisitorStatus" NOT NULL DEFAULT 'WAITING',
    "remarks" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "phone" TEXT,
    "purpose" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "VisitorStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveApplication" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "approverId" TEXT,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "used" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "timetableEntryId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "savedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordingStatus" NOT NULL DEFAULT 'UPLOADED',
    "editorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFolder" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "courseId" TEXT,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "folderId" TEXT,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    "classroomId" TEXT,
    "batchId" TEXT,
    "materialId" TEXT,
    "recordingId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ContentItemType" NOT NULL,
    "fileUrl" TEXT,
    "externalUrl" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "visibility" "ContentVisibilityScope" NOT NULL DEFAULT 'TEACHERS',
    "status" "ContentWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "aiReadyNotes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "externalUrl" TEXT,
    "storageKey" TEXT,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "changeNote" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "stage" TEXT NOT NULL,
    "decision" "ContentReviewDecision" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentApproval" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "approverId" TEXT,
    "decision" "ContentReviewDecision" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAnalytics" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "watchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "completionRate" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadHistory" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT,
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "watchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "text" TEXT,
    "status" "TranscriptStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalContent" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "provider" TEXT,
    "url" TEXT NOT NULL,
    "embedUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "facultyId" TEXT,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "provider" TEXT,
    "meetingUrl" TEXT,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannerEvent" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "title" TEXT NOT NULL,
    "type" "PlannerEventType" NOT NULL DEFAULT 'EVENT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TEXT NOT NULL,
    "endsAt" TEXT NOT NULL,
    "type" "TimeSlotType" NOT NULL DEFAULT 'CLASS',
    "shift" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "capacity" INTEGER,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT,
    "courseId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "day" "WeekDay" NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "facultyId" TEXT,
    "subjectId" TEXT,
    "roomId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyScheduleOverride" (
    "id" TEXT NOT NULL,
    "timetableEntryId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "OverrideType" NOT NULL,
    "facultyId" TEXT,
    "subjectId" TEXT,
    "roomId" TEXT,
    "startsAt" TEXT,
    "endsAt" TEXT,
    "remarks" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyScheduleOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "coverUrl" TEXT,
    "qualification" TEXT,
    "experienceYears" INTEGER,
    "classes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "boards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "teachingMode" TEXT,
    "hourlyRate" DECIMAL(65,30),
    "weeklyRate" DECIMAL(65,30),
    "monthlyRate" DECIMAL(65,30),
    "availability" JSONB,
    "teachingStyle" TEXT,
    "certificates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT,
    "isMarketplaceListed" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" TEXT NOT NULL DEFAULT 'welcome',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherBookingRequest" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT,
    "preferredDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "subject" TEXT NOT NULL,
    "className" TEXT,
    "learningGoal" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "teacherNotes" TEXT,
    "studentNotes" TEXT,
    "history" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherBookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "learningGoal" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "onboardingStep" TEXT NOT NULL DEFAULT 'welcome',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "link" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildRelation" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relation" TEXT NOT NULL DEFAULT 'Parent',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChildRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "createdById" TEXT,
    "kind" "CommunicationKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "priority" "CommunicationPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "CommunicationStatus" NOT NULL DEFAULT 'DRAFT',
    "channels" "CommunicationChannel"[],
    "courseId" TEXT,
    "batchId" TEXT,
    "roleKey" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationRecipient" (
    "id" TEXT NOT NULL,
    "communicationId" TEXT NOT NULL,
    "userId" TEXT,
    "roleKey" TEXT,
    "courseId" TEXT,
    "batchId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL,
    "communicationId" TEXT,
    "userId" TEXT,
    "channel" "CommunicationChannel" NOT NULL,
    "status" "CommunicationStatus" NOT NULL,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectConversation" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "createdById" TEXT,
    "type" "DirectConversationType" NOT NULL,
    "status" "DirectConversationStatus" NOT NULL DEFAULT 'REQUESTED',
    "title" TEXT NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "archivedAt" TIMESTAMP(3),
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "lastReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "body" TEXT NOT NULL,
    "status" "DirectMessageStatus" NOT NULL DEFAULT 'SENT',
    "attachments" JSONB,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CommunityType" NOT NULL,
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'INVITE_ONLY',
    "status" "CommunityStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenericDiscussion" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "communityId" TEXT,
    "authorId" TEXT,
    "scope" "GenericDiscussionScope" NOT NULL,
    "scopeId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" "GenericDiscussionStatus" NOT NULL DEFAULT 'OPEN',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenericDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenericDiscussionReply" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenericDiscussionReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "createdById" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "actorId" TEXT,
    "eventKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entity" TEXT,
    "entityId" TEXT,
    "status" "ActivityEventStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "userId" TEXT,
    "scope" "AIConversationScope" NOT NULL,
    "title" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "context" JSONB,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "userId" TEXT,
    "conversationId" TEXT,
    "feature" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "costEstimate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "key" TEXT NOT NULL,
    "scope" "AIConversationScope" NOT NULL,
    "name" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "variables" JSONB,
    "model" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" "AutomationTrigger" NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "conditions" JSONB,
    "actions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationExecution" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" TEXT,
    "entityId" TEXT,
    "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AutomationExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspacePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspace" "WorkspaceKind" NOT NULL,
    "layout" JSONB,
    "pinned" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspacePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "actorId" TEXT,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entity" TEXT,
    "entityId" TEXT,
    "link" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "workspace" "WorkspaceKind" NOT NULL,
    "type" "DashboardWidgetType" NOT NULL,
    "title" TEXT NOT NULL,
    "config" JSONB,
    "order" INTEGER NOT NULL DEFAULT 1,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "metadata" JSONB,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "channels" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "message" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "requesterId" TEXT,
    "assignedToId" TEXT,
    "type" "SupportTicketType" NOT NULL DEFAULT 'SUPPORT',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "SupportTicketPriority" NOT NULL DEFAULT 'NORMAL',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportReply" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT NOT NULL DEFAULT 'platform',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformMetric" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dimension" TEXT,
    "metadata" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "User"("userType");

-- CreateIndex
CREATE INDEX "Branch_institutionId_idx" ON "Branch"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_institutionId_code_key" ON "Branch"("institutionId", "code");

-- CreateIndex
CREATE INDEX "AcademicYear_institutionId_isCurrent_idx" ON "AcademicYear"("institutionId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_institutionId_name_key" ON "AcademicYear"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicTerm_academicYearId_name_key" ON "AcademicTerm"("academicYearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_institutionId_name_key" ON "Department"("institutionId", "name");

-- CreateIndex
CREATE INDEX "Course_institutionId_idx" ON "Course"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_institutionId_code_key" ON "Course"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_courseId_name_key" ON "Subject"("courseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_subjectId_name_key" ON "Chapter"("subjectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_name_key" ON "Topic"("subjectId", "name");

-- CreateIndex
CREATE INDEX "Batch_courseId_status_idx" ON "Batch"("courseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_courseId_name_key" ON "Batch"("courseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BatchFaculty_batchId_facultyId_key" ON "BatchFaculty"("batchId", "facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchStudent_batchId_studentId_key" ON "BatchStudent"("batchId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_batchId_key" ON "Classroom"("batchId");

-- CreateIndex
CREATE INDEX "Classroom_institutionId_idx" ON "Classroom"("institutionId");

-- CreateIndex
CREATE INDEX "ClassroomAnnouncement_classroomId_createdAt_idx" ON "ClassroomAnnouncement"("classroomId", "createdAt");

-- CreateIndex
CREATE INDEX "StudyMaterial_classroomId_title_idx" ON "StudyMaterial"("classroomId", "title");

-- CreateIndex
CREATE INDEX "Assignment_classroomId_dueDate_idx" ON "Assignment"("classroomId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_key" ON "AssignmentSubmission"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "LearningProgress_studentId_idx" ON "LearningProgress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_studentId_classroomId_subjectId_key" ON "LearningProgress"("studentId", "classroomId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoProgress_studentId_recordingId_key" ON "VideoProgress"("studentId", "recordingId");

-- CreateIndex
CREATE INDEX "Bookmark_studentId_classroomId_idx" ON "Bookmark"("studentId", "classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_studentId_targetType_targetId_key" ON "Bookmark"("studentId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "StudentNote_studentId_classroomId_idx" ON "StudentNote"("studentId", "classroomId");

-- CreateIndex
CREATE INDEX "DiscussionThread_classroomId_createdAt_idx" ON "DiscussionThread"("classroomId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSource_institutionId_code_key" ON "CampaignSource"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_institutionId_code_key" ON "Campaign"("institutionId", "code");

-- CreateIndex
CREATE INDEX "Lead_institutionId_stage_idx" ON "Lead"("institutionId", "stage");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadFollowUp_scheduledAt_status_idx" ON "LeadFollowUp"("scheduledAt", "status");

-- CreateIndex
CREATE INDEX "Application_institutionId_status_idx" ON "Application"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_applicationId_key" ON "Admission"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_referralCode_key" ON "Partner"("referralCode");

-- CreateIndex
CREATE INDEX "Partner_institutionId_status_idx" ON "Partner"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerReferral_leadId_key" ON "PartnerReferral"("leadId");

-- CreateIndex
CREATE INDEX "Question_courseId_subjectId_difficulty_idx" ON "Question"("courseId", "subjectId", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_label_key" ON "QuestionOption"("questionId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTag_name_key" ON "QuestionTag"("name");

-- CreateIndex
CREATE INDEX "Exam_institutionId_status_idx" ON "Exam"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExamQuestion_examId_questionId_key" ON "ExamQuestion"("examId", "questionId");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_studentId_idx" ON "ExamAttempt"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAnswer_attemptId_questionId_key" ON "ExamAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_attemptId_key" ON "ExamResult"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_examId_studentId_scope_key" ON "Leaderboard"("examId", "studentId", "scope");

-- CreateIndex
CREATE INDEX "PerformanceAnalytics_studentId_examId_idx" ON "PerformanceAnalytics"("studentId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeHead_institutionId_name_key" ON "FeeHead"("institutionId", "name");

-- CreateIndex
CREATE INDEX "FeePlan_institutionId_idx" ON "FeePlan"("institutionId");

-- CreateIndex
CREATE INDEX "StudentFee_institutionId_studentId_status_idx" ON "StudentFee"("institutionId", "studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_type_key" ON "PaymentMethod"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_invoiceId_key" ON "Receipt"("invoiceId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_audience_isActive_idx" ON "SubscriptionPlan"("audience", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_institutionId_key_key" ON "SubscriptionPlan"("institutionId", "key");

-- CreateIndex
CREATE INDEX "UserSubscription_institutionId_status_idx" ON "UserSubscription"("institutionId", "status");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_status_idx" ON "UserSubscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Wallet_institutionId_idx" ON "Wallet"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_currency_key" ON "Wallet"("userId", "currency");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CommerceOrder_institutionId_status_createdAt_idx" ON "CommerceOrder"("institutionId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CommerceOrder_buyerId_createdAt_idx" ON "CommerceOrder"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "CommerceOrderItem_resourceId_idx" ON "CommerceOrderItem"("resourceId");

-- CreateIndex
CREATE INDEX "CommerceOrderItem_sellerId_idx" ON "CommerceOrderItem"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_institutionId_code_key" ON "Coupon"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_institutionId_code_key" ON "Referral"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceInvoice_invoiceNumber_key" ON "CommerceInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "CommerceInvoice_institutionId_createdAt_idx" ON "CommerceInvoice"("institutionId", "createdAt");

-- CreateIndex
CREATE INDEX "CommerceInvoice_buyerId_createdAt_idx" ON "CommerceInvoice"("buyerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_institutionId_name_key" ON "ExpenseCategory"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_staffId_leaveType_key" ON "LeaveBalance"("staffId", "leaveType");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_classroomId_date_key" ON "AttendanceSession"("classroomId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON "AttendanceRecord"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "Recording_classroomId_createdAt_idx" ON "Recording"("classroomId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentFolder_institutionId_courseId_subjectId_idx" ON "ContentFolder"("institutionId", "courseId", "subjectId");

-- CreateIndex
CREATE INDEX "ContentItem_institutionId_status_type_idx" ON "ContentItem"("institutionId", "status", "type");

-- CreateIndex
CREATE INDEX "ContentItem_courseId_subjectId_chapterId_topicId_idx" ON "ContentItem"("courseId", "subjectId", "chapterId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_itemId_version_key" ON "ContentVersion"("itemId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAnalytics_itemId_key" ON "ContentAnalytics"("itemId");

-- CreateIndex
CREATE INDEX "DownloadHistory_itemId_downloadedAt_idx" ON "DownloadHistory"("itemId", "downloadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_itemId_userId_key" ON "WatchHistory"("itemId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_itemId_key" ON "Transcript"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalContent_itemId_key" ON "ExternalContent"("itemId");

-- CreateIndex
CREATE INDEX "LiveSession_classroomId_scheduledAt_idx" ON "LiveSession"("classroomId", "scheduledAt");

-- CreateIndex
CREATE INDEX "PlannerEvent_institutionId_startsAt_idx" ON "PlannerEvent"("institutionId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_institutionId_name_key" ON "TimeSlot"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Room_institutionId_name_key" ON "Room"("institutionId", "name");

-- CreateIndex
CREATE INDEX "TimetableEntry_batchId_day_idx" ON "TimetableEntry"("batchId", "day");

-- CreateIndex
CREATE INDEX "DailyScheduleOverride_date_idx" ON "DailyScheduleOverride"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE INDEX "TeacherBookingRequest_teacherId_status_createdAt_idx" ON "TeacherBookingRequest"("teacherId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherBookingRequest_studentId_createdAt_idx" ON "TeacherBookingRequest"("studentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "ParentChildRelation_childId_idx" ON "ParentChildRelation"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildRelation_parentId_childId_key" ON "ParentChildRelation"("parentId", "childId");

-- CreateIndex
CREATE INDEX "Communication_institutionId_kind_status_idx" ON "Communication"("institutionId", "kind", "status");

-- CreateIndex
CREATE INDEX "Communication_institutionId_scheduledAt_idx" ON "Communication"("institutionId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Communication_institutionId_expiresAt_idx" ON "Communication"("institutionId", "expiresAt");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_communicationId_userId_idx" ON "CommunicationRecipient"("communicationId", "userId");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_userId_readAt_idx" ON "CommunicationRecipient"("userId", "readAt");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_roleKey_idx" ON "CommunicationRecipient"("roleKey");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_courseId_batchId_idx" ON "CommunicationRecipient"("courseId", "batchId");

-- CreateIndex
CREATE INDEX "CommunicationLog_communicationId_channel_status_idx" ON "CommunicationLog"("communicationId", "channel", "status");

-- CreateIndex
CREATE INDEX "DirectConversation_institutionId_status_updatedAt_idx" ON "DirectConversation"("institutionId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "DirectConversationParticipant_userId_archivedAt_idx" ON "DirectConversationParticipant"("userId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DirectConversationParticipant_conversationId_userId_key" ON "DirectConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "DirectMessage_conversationId_createdAt_idx" ON "DirectMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "DirectMessage_senderId_createdAt_idx" ON "DirectMessage"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "Community_institutionId_type_status_idx" ON "Community"("institutionId", "type", "status");

-- CreateIndex
CREATE INDEX "CommunityMember_userId_idx" ON "CommunityMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");

-- CreateIndex
CREATE INDEX "GenericDiscussion_institutionId_scope_status_idx" ON "GenericDiscussion"("institutionId", "scope", "status");

-- CreateIndex
CREATE INDEX "GenericDiscussion_communityId_createdAt_idx" ON "GenericDiscussion"("communityId", "createdAt");

-- CreateIndex
CREATE INDEX "GenericDiscussionReply_discussionId_createdAt_idx" ON "GenericDiscussionReply"("discussionId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationTemplate_institutionId_category_idx" ON "NotificationTemplate"("institutionId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_institutionId_key_channel_key" ON "NotificationTemplate"("institutionId", "key", "channel");

-- CreateIndex
CREATE INDEX "ActivityEvent_institutionId_eventKey_status_idx" ON "ActivityEvent"("institutionId", "eventKey", "status");

-- CreateIndex
CREATE INDEX "AIConversation_institutionId_userId_scope_idx" ON "AIConversation"("institutionId", "userId", "scope");

-- CreateIndex
CREATE INDEX "AIUsage_institutionId_feature_createdAt_idx" ON "AIUsage"("institutionId", "feature", "createdAt");

-- CreateIndex
CREATE INDEX "PromptTemplate_institutionId_scope_isActive_idx" ON "PromptTemplate"("institutionId", "scope", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_institutionId_key_key" ON "PromptTemplate"("institutionId", "key");

-- CreateIndex
CREATE INDEX "AutomationRule_institutionId_trigger_status_idx" ON "AutomationRule"("institutionId", "trigger", "status");

-- CreateIndex
CREATE INDEX "AutomationExecution_ruleId_status_createdAt_idx" ON "AutomationExecution"("ruleId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspacePreference_userId_workspace_key" ON "WorkspacePreference"("userId", "workspace");

-- CreateIndex
CREATE INDEX "Activity_institutionId_type_createdAt_idx" ON "Activity"("institutionId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_scope_idx" ON "SavedSearch"("userId", "scope");

-- CreateIndex
CREATE INDEX "DashboardWidget_userId_workspace_order_idx" ON "DashboardWidget"("userId", "workspace", "order");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key_key" ON "UserPreference"("userId", "key");

-- CreateIndex
CREATE INDEX "RecentItem_userId_viewedAt_idx" ON "RecentItem"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecentItem_userId_type_entityId_key" ON "RecentItem"("userId", "type", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteItem_userId_type_entityId_key" ON "FavoriteItem"("userId", "type", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_type_key" ON "NotificationPreference"("userId", "type");

-- CreateIndex
CREATE INDEX "Setting_institutionId_idx" ON "Setting"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_institutionId_key_key" ON "Setting"("institutionId", "key");

-- CreateIndex
CREATE INDEX "SupportTicket_institutionId_status_priority_idx" ON "SupportTicket"("institutionId", "status", "priority");

-- CreateIndex
CREATE INDEX "SupportTicket_requesterId_createdAt_idx" ON "SupportTicket"("requesterId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportReply_ticketId_createdAt_idx" ON "SupportReply"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "FeatureFlag_institutionId_enabled_idx" ON "FeatureFlag"("institutionId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_institutionId_key_key" ON "FeatureFlag"("institutionId", "key");

-- CreateIndex
CREATE INDEX "PlatformMetric_institutionId_key_recordedAt_idx" ON "PlatformMetric"("institutionId", "key", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicTerm" ADD CONSTRAINT "AcademicTerm_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchFaculty" ADD CONSTRAINT "BatchFaculty_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchFaculty" ADD CONSTRAINT "BatchFaculty_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchStudent" ADD CONSTRAINT "BatchStudent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchStudent" ADD CONSTRAINT "BatchStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomAnnouncement" ADD CONSTRAINT "ClassroomAnnouncement_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomAnnouncement" ADD CONSTRAINT "ClassroomAnnouncement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DiscussionThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSource" ADD CONSTRAINT "CampaignSource_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CampaignSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_guestUserId_fkey" FOREIGN KEY ("guestUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedExecutiveId_fkey" FOREIGN KEY ("assignedExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CampaignSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_interestedCourseId_fkey" FOREIGN KEY ("interestedCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_preferredBatchId_fkey" FOREIGN KEY ("preferredBatchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFollowUp" ADD CONSTRAINT "LeadFollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTask" ADD CONSTRAINT "LeadTask_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTask" ADD CONSTRAINT "LeadTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerReferral" ADD CONSTRAINT "PartnerReferral_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerReferral" ADD CONSTRAINT "PartnerReferral_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerReferral" ADD CONSTRAINT "PartnerReferral_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "PartnerReferral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "PartnerSettlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerSettlement" ADD CONSTRAINT "PartnerSettlement_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTagLink" ADD CONSTRAINT "QuestionTagLink_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTagLink" ADD CONSTRAINT "QuestionTagLink_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "QuestionTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionImport" ADD CONSTRAINT "QuestionImport_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionImport" ADD CONSTRAINT "QuestionImport_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAnalytics" ADD CONSTRAINT "PerformanceAnalytics_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeHead" ADD CONSTRAINT "FeeHead_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePlan" ADD CONSTRAINT "FeePlan_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePlan" ADD CONSTRAINT "FeePlan_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePlan" ADD CONSTRAINT "FeePlan_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePlan" ADD CONSTRAINT "FeePlan_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInstallment" ADD CONSTRAINT "FeeInstallment_feePlanId_fkey" FOREIGN KEY ("feePlanId") REFERENCES "FeePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInstallment" ADD CONSTRAINT "FeeInstallment_feeHeadId_fkey" FOREIGN KEY ("feeHeadId") REFERENCES "FeeHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_feePlanId_fkey" FOREIGN KEY ("feePlanId") REFERENCES "FeePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_feeHeadId_fkey" FOREIGN KEY ("feeHeadId") REFERENCES "FeeHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "FeeInstallment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "StudentFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "StudentFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrder" ADD CONSTRAINT "CommerceOrder_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrder" ADD CONSTRAINT "CommerceOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrder" ADD CONSTRAINT "CommerceOrder_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrderItem" ADD CONSTRAINT "CommerceOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrderItem" ADD CONSTRAINT "CommerceOrderItem_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrderItem" ADD CONSTRAINT "CommerceOrderItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrderItem" ADD CONSTRAINT "CommerceOrderItem_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "TeacherBookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrderItem" ADD CONSTRAINT "CommerceOrderItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceInvoice" ADD CONSTRAINT "CommerceInvoice_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceInvoice" ADD CONSTRAINT "CommerceInvoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceInvoice" ADD CONSTRAINT "CommerceInvoice_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalary" ADD CONSTRAINT "EmployeeSalary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "EmployeeSalary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "TimetableEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFolder" ADD CONSTRAINT "ContentFolder_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFolder" ADD CONSTRAINT "ContentFolder_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFolder" ADD CONSTRAINT "ContentFolder_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFolder" ADD CONSTRAINT "ContentFolder_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFolder" ADD CONSTRAINT "ContentFolder_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFolder" ADD CONSTRAINT "ContentFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ContentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "StudyMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentApproval" ADD CONSTRAINT "ContentApproval_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentApproval" ADD CONSTRAINT "ContentApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAnalytics" ADD CONSTRAINT "ContentAnalytics_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContent" ADD CONSTRAINT "ExternalContent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerEvent" ADD CONSTRAINT "PlannerEvent_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerEvent" ADD CONSTRAINT "PlannerEvent_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyScheduleOverride" ADD CONSTRAINT "DailyScheduleOverride_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "TimetableEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyScheduleOverride" ADD CONSTRAINT "DailyScheduleOverride_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyScheduleOverride" ADD CONSTRAINT "DailyScheduleOverride_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyScheduleOverride" ADD CONSTRAINT "DailyScheduleOverride_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherBookingRequest" ADD CONSTRAINT "TeacherBookingRequest_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildRelation" ADD CONSTRAINT "ParentChildRelation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildRelation" ADD CONSTRAINT "ParentChildRelation_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "Communication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "Communication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectConversation" ADD CONSTRAINT "DirectConversation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectConversation" ADD CONSTRAINT "DirectConversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectConversationParticipant" ADD CONSTRAINT "DirectConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "DirectConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectConversationParticipant" ADD CONSTRAINT "DirectConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "DirectConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericDiscussion" ADD CONSTRAINT "GenericDiscussion_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericDiscussion" ADD CONSTRAINT "GenericDiscussion_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericDiscussion" ADD CONSTRAINT "GenericDiscussion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericDiscussionReply" ADD CONSTRAINT "GenericDiscussionReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "GenericDiscussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericDiscussionReply" ADD CONSTRAINT "GenericDiscussionReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AutomationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspacePreference" ADD CONSTRAINT "WorkspacePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentItem" ADD CONSTRAINT "RecentItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteItem" ADD CONSTRAINT "FavoriteItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformMetric" ADD CONSTRAINT "PlatformMetric_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
