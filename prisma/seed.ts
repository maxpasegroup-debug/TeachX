import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { permissionKeys, roleLabels, roleKeys, rolePermissions } from "../lib/constants/roles";

const prisma = new PrismaClient();

async function main() {
  const institution = await prisma.institution.upsert({
    where: { id: "seed-institution" },
    update: {},
    create: {
      id: "seed-institution",
      name: "Demo Institution",
      email: "hello@demo.edu",
      phone: "+91 90000 00000",
      website: "https://demo.edu",
      academicYear: "2026-2027"
    }
  });

  for (const key of permissionKeys) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
        name: key
          .split(".")
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join(" ")
      }
    });
  }

  for (const key of roleKeys) {
    const role = await prisma.role.upsert({
      where: { key },
      update: { name: roleLabels[key] },
      create: {
        key,
        name: roleLabels[key]
      }
    });

    for (const permissionKey of rolePermissions[key]) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { key: permissionKey }
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { key: "ADMIN" } });
  const passwordHash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Admin",
      email: "admin@demo.edu",
      passwordHash,
      profile: {
        create: {
          title: "Administrator"
        }
      }
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id
    }
  });

  const academicHeadRole = await prisma.role.findUniqueOrThrow({ where: { key: "ACADEMIC_HEAD" } });
  const academicFacultyRole = await prisma.role.findUniqueOrThrow({ where: { key: "ACADEMIC_FACULTY" } });
  const directorRole = await prisma.role.findUniqueOrThrow({ where: { key: "DIRECTOR" } });
  const accountsRole = await prisma.role.findUniqueOrThrow({ where: { key: "ACCOUNTS" } });
  const videoEditorRole = await prisma.role.findUniqueOrThrow({ where: { key: "VIDEO_EDITOR" } });
  const bdeRole = await prisma.role.findUniqueOrThrow({ where: { key: "BUSINESS_DEVELOPMENT_EXECUTIVE" } });
  const receptionRole = await prisma.role.findUniqueOrThrow({ where: { key: "RECEPTION" } });
  const studentRole = await prisma.role.findUniqueOrThrow({ where: { key: "STUDENT" } });
  const parentRole = await prisma.role.findUniqueOrThrow({ where: { key: "PARENT" } });

  const directorUser = await prisma.user.upsert({
    where: { email: "director@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Director",
      email: "director@demo.edu",
      passwordHash,
      profile: { create: { title: "Director" } }
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: directorUser.id, roleId: directorRole.id } },
    update: {},
    create: { userId: directorUser.id, roleId: directorRole.id }
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: "accounts@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Accounts",
      email: "accounts@demo.edu",
      passwordHash,
      profile: { create: { title: "Accounts" } }
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: accountsUser.id, roleId: accountsRole.id } },
    update: {},
    create: { userId: accountsUser.id, roleId: accountsRole.id }
  });

  const videoEditorUser = await prisma.user.upsert({
    where: { email: "video@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Video Editor",
      email: "video@demo.edu",
      passwordHash,
      profile: { create: { title: "Video Editor" } }
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: videoEditorUser.id, roleId: videoEditorRole.id } },
    update: {},
    create: { userId: videoEditorUser.id, roleId: videoEditorRole.id }
  });

  await prisma.setting.upsert({
    where: { institutionId_key: { institutionId: institution.id, key: "white_label" } },
    update: {},
    create: {
      institutionId: institution.id,
      key: "white_label",
      value: {
        institutionName: "Demo Institution",
        logoUrl: "",
        faviconUrl: "",
        primaryColor: "#111827",
        secondaryColor: "#64748b",
        accentColor: "#0f766e",
        theme: "light",
        contactEmail: "hello@demo.edu",
        contactPhone: "+91 90000 00000",
        applicationTitle: "Demo Institution",
        browserTitle: "Demo Institution | TeachX",
        footerText: "Powered by TeachX",
        socialLinks: [],
        emailTemplate: "Simple branded email",
        certificateTemplate: "Standard certificate",
        invoiceTemplate: "Standard invoice",
        pdfBranding: { showLogo: true, showAddress: true, footerNote: "Generated by TeachX" }
      }
    }
  });

  const facultyUser = await prisma.user.upsert({
    where: { email: "academic@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Academic Head",
      email: "academic@demo.edu",
      passwordHash,
      profile: {
        create: {
          title: "Academic Head"
        }
      }
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: facultyUser.id,
        roleId: academicHeadRole.id
      }
    },
    update: {},
    create: {
      userId: facultyUser.id,
      roleId: academicHeadRole.id
    }
  });

  const bdeUser = await prisma.user.upsert({
    where: { email: "bde@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Executive",
      email: "bde@demo.edu",
      passwordHash,
      profile: {
        create: {
          title: "Business Development Executive"
        }
      }
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: bdeUser.id,
        roleId: bdeRole.id
      }
    },
    update: {},
    create: {
      userId: bdeUser.id,
      roleId: bdeRole.id
    }
  });

  const receptionUser = await prisma.user.upsert({
    where: { email: "reception@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Reception",
      email: "reception@demo.edu",
      passwordHash,
      profile: {
        create: {
          title: "Reception"
        }
      }
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: receptionUser.id,
        roleId: receptionRole.id
      }
    },
    update: {},
    create: {
      userId: receptionUser.id,
      roleId: receptionRole.id
    }
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Teacher",
      email: "teacher@demo.edu",
      passwordHash,
      profile: {
        create: {
          title: "Academic Faculty"
        }
      }
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: teacherUser.id,
        roleId: academicFacultyRole.id
      }
    },
    update: {},
    create: {
      userId: teacherUser.id,
      roleId: academicFacultyRole.id
    }
  });

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@demo.edu" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Parent",
      email: "parent@demo.edu",
      passwordHash,
      profile: {
        create: {
          title: "Parent"
        }
      }
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: parentUser.id, roleId: parentRole.id } },
    update: {},
    create: { userId: parentUser.id, roleId: parentRole.id }
  });

  const branch = await prisma.branch.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "MAIN"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Main Campus",
      code: "MAIN",
      address: "Demo city",
      contact: "+91 90000 00000"
    }
  });

  const academicYear = await prisma.academicYear.upsert({
    where: {
      institutionId_name: {
        institutionId: institution.id,
        name: "2026-2027"
      }
    },
    update: {
      isCurrent: true,
      status: "CURRENT"
    },
    create: {
      institutionId: institution.id,
      name: "2026-2027",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "CURRENT"
    }
  });

  const department = await prisma.department.upsert({
    where: {
      institutionId_name: {
        institutionId: institution.id,
        name: "Science"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Science",
      code: "SCI"
    }
  });

  const course = await prisma.course.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "SCI-FND"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      branchId: branch.id,
      academicYearId: academicYear.id,
      departmentId: department.id,
      name: "Science Foundation",
      code: "SCI-FND",
      description: "A calm demo course for academic planning.",
      duration: "6 months",
      category: "Science",
      learningModes: ["OFFLINE", "LIVE", "HYBRID"]
    }
  });

  const subject = await prisma.subject.upsert({
    where: {
      courseId_name: {
        courseId: course.id,
        name: "Physics"
      }
    },
    update: {},
    create: {
      courseId: course.id,
      departmentId: department.id,
      name: "Physics",
      code: "PHY",
      order: 1
    }
  });

  await prisma.subject.upsert({
    where: {
      courseId_name: {
        courseId: course.id,
        name: "Chemistry"
      }
    },
    update: {},
    create: {
      courseId: course.id,
      departmentId: department.id,
      name: "Chemistry",
      code: "CHEM",
      order: 2
    }
  });

  const chapter = await prisma.chapter.upsert({
    where: {
      subjectId_name: {
        subjectId: subject.id,
        name: "Motion"
      }
    },
    update: {},
    create: {
      courseId: course.id,
      subjectId: subject.id,
      name: "Motion",
      order: 1
    }
  });

  const topic = await prisma.topic.upsert({
    where: {
      subjectId_name: {
        subjectId: subject.id,
        name: "Speed and Velocity"
      }
    },
    update: {},
    create: {
      courseId: course.id,
      subjectId: subject.id,
      chapterId: chapter.id,
      name: "Speed and Velocity",
      order: 1
    }
  });

  const batch = await prisma.batch.upsert({
    where: {
      courseId_name: {
        courseId: course.id,
        name: "Morning A"
      }
    },
    update: {},
    create: {
      courseId: course.id,
      branchId: branch.id,
      academicYearId: academicYear.id,
      name: "Morning A",
      capacity: 30,
      maximumStrength: 35,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-12-15"),
      mode: "HYBRID",
      type: "MORNING",
      status: "RUNNING"
    }
  });

  await prisma.batchFaculty.upsert({
    where: {
      batchId_facultyId: {
        batchId: batch.id,
        facultyId: facultyUser.id
      }
    },
    update: { isLead: true },
    create: {
      batchId: batch.id,
      facultyId: facultyUser.id,
      isLead: true
    }
  });

  await prisma.batchFaculty.upsert({
    where: {
      batchId_facultyId: {
        batchId: batch.id,
        facultyId: teacherUser.id
      }
    },
    update: {},
    create: {
      batchId: batch.id,
      facultyId: teacherUser.id
    }
  });

  const students = await Promise.all(
    ["Ananya Sharma", "Rohan Mehta", "Diya Nair"].map(async (name, index) => {
      const student = await prisma.user.upsert({
        where: { email: `student${index + 1}@demo.edu` },
        update: {},
        create: {
          institutionId: institution.id,
          name,
          email: `student${index + 1}@demo.edu`,
          passwordHash,
          profile: {
            create: {
              title: "Student"
            }
          }
        }
      });

      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: student.id, roleId: studentRole.id } },
        update: {},
        create: { userId: student.id, roleId: studentRole.id }
      });

      await prisma.batchStudent.upsert({
        where: { batchId_studentId: { batchId: batch.id, studentId: student.id } },
        update: {},
        create: { batchId: batch.id, studentId: student.id }
      });

      return student;
    })
  );

  await prisma.parentChildRelation.upsert({
    where: { parentId_childId: { parentId: parentUser.id, childId: students[0].id } },
    update: {},
    create: {
      parentId: parentUser.id,
      childId: students[0].id,
      relation: "Father",
      isPrimary: true
    }
  });

  const room = await prisma.room.upsert({
    where: {
      institutionId_name: {
        institutionId: institution.id,
        name: "Room 101"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      branchId: branch.id,
      name: "Room 101",
      code: "R101",
      capacity: 40
    }
  });

  const slot = await prisma.timeSlot.upsert({
    where: {
      institutionId_name: {
        institutionId: institution.id,
        name: "Period 1"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Period 1",
      startsAt: "09:00",
      endsAt: "09:45",
      type: "CLASS",
      shift: "Morning",
      order: 1
    }
  });

  await prisma.plannerEvent.upsert({
    where: { id: "seed-foundation-day" },
    update: {},
    create: {
      id: "seed-foundation-day",
      institutionId: institution.id,
      academicYearId: academicYear.id,
      title: "Foundation Day",
      type: "EVENT",
      startsAt: new Date("2026-07-20"),
      endsAt: new Date("2026-07-20"),
      description: "Demo academic calendar event."
    }
  });

  await prisma.timetableEntry.upsert({
    where: { id: "seed-monday-period-1" },
    update: {},
    create: {
      id: "seed-monday-period-1",
      academicYearId: academicYear.id,
      courseId: course.id,
      batchId: batch.id,
      day: "MONDAY",
      timeSlotId: slot.id,
      facultyId: facultyUser.id,
      subjectId: subject.id,
      roomId: room.id,
      remarks: "Demo timetable item"
    }
  });

  const classroom = await prisma.classroom.upsert({
    where: { batchId: batch.id },
    update: {},
    create: {
      institutionId: institution.id,
      courseId: course.id,
      batchId: batch.id,
      title: "Science Foundation - Morning A"
    }
  });

  await prisma.classroomAnnouncement.upsert({
    where: { id: "seed-announcement-welcome" },
    update: {},
    create: {
      id: "seed-announcement-welcome",
      classroomId: classroom.id,
      authorId: teacherUser.id,
      title: "Welcome to class",
      message: "Please revise the first chapter before the next session."
    }
  });

  const studyMaterial = await prisma.studyMaterial.upsert({
    where: { id: "seed-material-motion" },
    update: {},
    create: {
      id: "seed-material-motion",
      classroomId: classroom.id,
      subjectId: subject.id,
      uploadedById: teacherUser.id,
      title: "Physics Notes - Motion",
      type: "NOTES",
      chapter: "Motion",
      topic: "Speed and velocity",
      notes: "Introductory notes for the first physics topic.",
      publishStatus: "PUBLISHED"
    }
  });

  const assignment = await prisma.assignment.upsert({
    where: { id: "seed-assignment-motion" },
    update: {},
    create: {
      id: "seed-assignment-motion",
      classroomId: classroom.id,
      subjectId: subject.id,
      createdById: teacherUser.id,
      title: "Motion Practice Questions",
      instructions: "Solve the first ten questions in your notebook.",
      dueDate: new Date("2026-07-25"),
      status: "PUBLISHED"
    }
  });

  await Promise.all(
    students.map((student) =>
      prisma.assignmentSubmission.upsert({
        where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
        update: {},
        create: { assignmentId: assignment.id, studentId: student.id }
      })
    )
  );

  const recording = await prisma.recording.upsert({
    where: { id: "seed-recording-motion" },
    update: {},
    create: {
      id: "seed-recording-motion",
      classroomId: classroom.id,
      uploadedById: teacherUser.id,
      title: "Motion - Recorded Class",
      videoUrl: "https://example.com/demo-recording",
      status: "PUBLISHED"
    }
  });

  await prisma.liveSession.upsert({
    where: { id: "seed-live-session" },
    update: {},
    create: {
      id: "seed-live-session",
      classroomId: classroom.id,
      facultyId: teacherUser.id,
      title: "Physics Doubt Session",
      scheduledAt: new Date("2026-07-22T10:00:00.000Z"),
      status: "SCHEDULED"
    }
  });

  const contentFolder = await prisma.contentFolder.upsert({
    where: { id: "seed-content-folder-motion" },
    update: {},
    create: {
      id: "seed-content-folder-motion",
      institutionId: institution.id,
      courseId: course.id,
      subjectId: subject.id,
      chapterId: chapter.id,
      topicId: topic.id,
      name: "Motion Lessons",
      order: 1
    }
  });

  const contentItem = await prisma.contentItem.upsert({
    where: { id: "seed-content-motion-video" },
    update: {},
    create: {
      id: "seed-content-motion-video",
      institutionId: institution.id,
      folderId: contentFolder.id,
      courseId: course.id,
      subjectId: subject.id,
      chapterId: chapter.id,
      topicId: topic.id,
      classroomId: classroom.id,
      batchId: batch.id,
      recordingId: recording.id,
      createdById: teacherUser.id,
      title: "Motion - Lesson Video",
      description: "Recorded explanation for speed and velocity.",
      type: "VIDEO",
      fileUrl: "https://example.com/demo-recording",
      sizeBytes: 52428800,
      durationSeconds: 1800,
      status: "PUBLISHED",
      visibility: "ENROLLED_STUDENTS",
      publishedAt: new Date("2026-07-15"),
      aiReadyNotes: {
        summary: "AI summary can be generated later.",
        quiz: "AI quiz generation can be generated later.",
        flashcards: "AI flashcards can be generated later."
      },
      versions: {
        create: {
          version: 1,
          title: "Motion - Lesson Video",
          fileUrl: "https://example.com/demo-recording",
          sizeBytes: 52428800,
          updatedById: teacherUser.id,
          changeNote: "Initial published lesson."
        }
      },
      analytics: {
        create: {
          views: 18,
          downloads: 2,
          watchTimeSeconds: 7200,
          completionRate: 64,
          bookmarks: 3,
          lastViewedAt: new Date()
        }
      },
      transcript: {
        create: {
          status: "AI_READY",
          language: "en",
          aiSummary: "Transcript generation is ready for AI integration."
        }
      }
    }
  });

  await prisma.contentItem.upsert({
    where: { id: "seed-content-motion-notes" },
    update: {},
    create: {
      id: "seed-content-motion-notes",
      institutionId: institution.id,
      folderId: contentFolder.id,
      courseId: course.id,
      subjectId: subject.id,
      chapterId: chapter.id,
      topicId: topic.id,
      classroomId: classroom.id,
      batchId: batch.id,
      materialId: studyMaterial.id,
      createdById: teacherUser.id,
      title: "Motion Revision Notes",
      description: "Short revision notes for the first physics topic.",
      type: "NOTES",
      fileUrl: "https://example.com/motion-notes.pdf",
      sizeBytes: 1048576,
      status: "SUBMITTED",
      visibility: "TEACHERS",
      versions: {
        create: {
          version: 1,
          title: "Motion Revision Notes",
          fileUrl: "https://example.com/motion-notes.pdf",
          sizeBytes: 1048576,
          updatedById: teacherUser.id,
          changeNote: "Submitted for review."
        }
      },
      analytics: { create: {} }
    }
  });

  await prisma.contentReview.upsert({
    where: { id: "seed-content-review-1" },
    update: {},
    create: {
      id: "seed-content-review-1",
      itemId: contentItem.id,
      reviewerId: teacherUser.id,
      stage: "Video Editor Review",
      decision: "APPROVED",
      notes: "Demo review completed."
    }
  });

  await prisma.learningProgress.upsert({
    where: {
      studentId_classroomId_subjectId: {
        studentId: students[0].id,
        classroomId: classroom.id,
        subjectId: subject.id
      }
    },
    update: {},
    create: {
      studentId: students[0].id,
      classroomId: classroom.id,
      courseId: course.id,
      subjectId: subject.id,
      completion: 18,
      assignmentProgress: 10,
      attendancePercentage: 100,
      studyStreak: 3,
      lastActivityAt: new Date()
    }
  });

  await prisma.videoProgress.upsert({
    where: {
      studentId_recordingId: {
        studentId: students[0].id,
        recordingId: recording.id
      }
    },
    update: {},
    create: {
      studentId: students[0].id,
      classroomId: classroom.id,
      recordingId: recording.id,
      lastPosition: 180,
      duration: 1800,
      playbackSpeed: 1,
      completed: false
    }
  });

  await prisma.studentNote.create({
    data: {
      studentId: students[0].id,
      classroomId: classroom.id,
      targetType: "LESSON",
      title: "Motion doubt",
      body: "Revise difference between speed and velocity."
    }
  });

  await prisma.bookmark.upsert({
    where: {
      studentId_targetType_targetId: {
        studentId: students[0].id,
        targetType: "RECORDING",
        targetId: recording.id
      }
    },
    update: {},
    create: {
      studentId: students[0].id,
      classroomId: classroom.id,
      targetType: "RECORDING",
      targetId: recording.id,
      label: "Continue later"
    }
  });

  const demoQuestion = await prisma.question.upsert({
    where: { id: "seed-question-speed" },
    update: {},
    create: {
      id: "seed-question-speed",
      courseId: course.id,
      subjectId: subject.id,
      chapterId: chapter.id,
      topicId: topic.id,
      authorId: teacherUser.id,
      type: "MCQ",
      difficulty: "EASY",
      visibility: "PUBLISHED",
      question: "What is the unit of speed?",
      correctAnswer: "A",
      explanation: "Speed is measured as distance divided by time.",
      marks: "1",
      negativeMarks: "0"
    }
  });

  await Promise.all([
    prisma.questionOption.upsert({ where: { questionId_label: { questionId: demoQuestion.id, label: "A" } }, update: {}, create: { questionId: demoQuestion.id, label: "A", text: "m/s", isCorrect: true, order: 1 } }),
    prisma.questionOption.upsert({ where: { questionId_label: { questionId: demoQuestion.id, label: "B" } }, update: {}, create: { questionId: demoQuestion.id, label: "B", text: "kg", order: 2 } }),
    prisma.questionOption.upsert({ where: { questionId_label: { questionId: demoQuestion.id, label: "C" } }, update: {}, create: { questionId: demoQuestion.id, label: "C", text: "second", order: 3 } }),
    prisma.questionOption.upsert({ where: { questionId_label: { questionId: demoQuestion.id, label: "D" } }, update: {}, create: { questionId: demoQuestion.id, label: "D", text: "newton", order: 4 } })
  ]);

  const demoExam = await prisma.exam.upsert({
    where: { id: "seed-exam-motion" },
    update: {},
    create: {
      id: "seed-exam-motion",
      institutionId: institution.id,
      createdById: teacherUser.id,
      courseId: course.id,
      subjectId: subject.id,
      chapterId: chapter.id,
      topicId: topic.id,
      batchId: batch.id,
      name: "Motion Practice Test",
      description: "A short practice exam for speed and velocity.",
      instructions: "Answer all questions. You can mark questions for review.",
      durationSeconds: 1800,
      totalMarks: "1",
      passingMarks: "1",
      type: "PRACTICE",
      status: "PUBLISHED",
      selectionMode: "MANUAL",
      publishedAt: new Date()
    }
  });

  await prisma.examQuestion.upsert({
    where: {
      examId_questionId: {
        examId: demoExam.id,
        questionId: demoQuestion.id
      }
    },
    update: {},
    create: {
      examId: demoExam.id,
      questionId: demoQuestion.id,
      order: 1,
      marks: "1",
      negativeMarks: "0"
    }
  });

  const websiteSource = await prisma.campaignSource.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "WEBSITE"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Website",
      code: "WEBSITE",
      isDefault: true
    }
  });

  const referralSource = await prisma.campaignSource.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "PARTNER"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Admission Partner",
      code: "PARTNER"
    }
  });

  const campaign = await prisma.campaign.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "JULY-DEMO"
      }
    },
    update: {},
    create: {
      institutionId: institution.id,
      sourceId: websiteSource.id,
      name: "July Admissions",
      code: "JULY-DEMO",
      description: "Demo campaign for admissions CRM."
    }
  });

  const partner = await prisma.partner.upsert({
    where: { referralCode: "DEMOREF" },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Demo Admission Partner",
      email: "partner@demo.edu",
      phone: "+91 98888 00000",
      referralCode: "DEMOREF",
      referralLink: "/guest-portal?ref=DEMOREF",
      status: "ACTIVE"
    }
  });

  const lead = await prisma.lead.create({
    data: {
      institutionId: institution.id,
      assignedExecutiveId: bdeUser.id,
      sourceId: referralSource.id,
      campaignId: campaign.id,
      interestedCourseId: course.id,
      preferredBatchId: batch.id,
      name: "Aarav Guest",
      email: "aarav.guest@example.com",
      phone: "+91 97777 00000",
      guardianName: "Guest Parent",
      guardianPhone: "+91 96666 00000",
      education: "Class 10",
      stage: "INTERESTED",
      priority: "HIGH",
      remarks: "Interested in Science Foundation.",
      aiSummary: "AI summary placeholder for this lead."
    }
  });

  const referral = await prisma.partnerReferral.create({
    data: {
      partnerId: partner.id,
      leadId: lead.id,
      campaignId: campaign.id,
      referralCode: partner.referralCode,
      campaignSource: "QR"
    }
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      actorId: bdeUser.id,
      title: "Lead Created",
      body: "Demo lead created from admission partner."
    }
  });

  await prisma.leadFollowUp.create({
    data: {
      leadId: lead.id,
      type: "CALL",
      scheduledAt: new Date("2026-07-16T05:00:00.000Z"),
      notes: "Call parent for counselling."
    }
  });

  await prisma.leadTask.create({
    data: {
      leadId: lead.id,
      ownerId: bdeUser.id,
      title: "Share brochure",
      deadline: new Date("2026-07-17")
    }
  });

  const demoApplication = await prisma.application.create({
    data: {
      institutionId: institution.id,
      leadId: lead.id,
      courseId: course.id,
      batchId: batch.id,
      status: "SUBMITTED",
      formData: { source: "seed" }
    }
  });

  await prisma.applicationDocument.create({
    data: {
      applicationId: demoApplication.id,
      leadId: lead.id,
      name: "Previous Marksheet",
      status: "PENDING"
    }
  });

  await prisma.admission.create({
    data: {
      institutionId: institution.id,
      leadId: lead.id,
      applicationId: demoApplication.id,
      courseId: course.id,
      batchId: batch.id,
      status: "PENDING"
    }
  });

  await prisma.partnerCommission.create({
    data: {
      partnerId: partner.id,
      referralId: referral.id,
      courseId: course.id,
      campaignId: campaign.id,
      type: "PERCENTAGE",
      amount: "0",
      percentage: "10",
      status: "PENDING",
      remarks: "Demo commission rule."
    }
  });

  const courseFeeHead = await prisma.feeHead.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: "Course Fee" } },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Course Fee",
      type: "COURSE",
      description: "Main academic course fee."
    }
  });

  const examFeeHead = await prisma.feeHead.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: "Exam Fee" } },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Exam Fee",
      type: "EXAM",
      description: "Assessment and examination fee."
    }
  });

  const feePlan = await prisma.feePlan.upsert({
    where: { id: "seed-fee-plan-science" },
    update: {},
    create: {
      id: "seed-fee-plan-science",
      institutionId: institution.id,
      courseId: course.id,
      batchId: batch.id,
      name: "Science Foundation Standard Plan",
      totalAmount: "45000",
      discount: "2500",
      scholarship: "5000",
      fineRule: { type: "daily", amount: 50, graceDays: 5 }
    }
  });

  await prisma.feeInstallment.upsert({
    where: { id: "seed-fee-installment-1" },
    update: {},
    create: {
      id: "seed-fee-installment-1",
      feePlanId: feePlan.id,
      feeHeadId: courseFeeHead.id,
      name: "First Installment",
      amount: "20000",
      dueDate: new Date("2026-07-30"),
      order: 1
    }
  });

  await Promise.all([
    prisma.paymentMethod.upsert({ where: { name_type: { name: "Cash", type: "CASH" } }, update: {}, create: { name: "Cash", type: "CASH" } }),
    prisma.paymentMethod.upsert({ where: { name_type: { name: "UPI", type: "UPI" } }, update: {}, create: { name: "UPI", type: "UPI" } }),
    prisma.paymentMethod.upsert({ where: { name_type: { name: "Bank Transfer", type: "BANK_TRANSFER" } }, update: {}, create: { name: "Bank Transfer", type: "BANK_TRANSFER" } }),
    prisma.paymentMethod.upsert({ where: { name_type: { name: "Razorpay Ready", type: "RAZORPAY_READY" } }, update: {}, create: { name: "Razorpay Ready", type: "RAZORPAY_READY" } }),
    prisma.paymentMethod.upsert({ where: { name_type: { name: "Stripe Ready", type: "STRIPE_READY" } }, update: {}, create: { name: "Stripe Ready", type: "STRIPE_READY" } })
  ]);

  const upiMethod = await prisma.paymentMethod.findUniqueOrThrow({ where: { name_type: { name: "UPI", type: "UPI" } } });
  const studentFee = await prisma.studentFee.upsert({
    where: { id: "seed-student-fee-1" },
    update: {},
    create: {
      id: "seed-student-fee-1",
      institutionId: institution.id,
      studentId: students[0].id,
      courseId: course.id,
      batchId: batch.id,
      feePlanId: feePlan.id,
      feeHeadId: courseFeeHead.id,
      amount: "20000",
      discount: "1000",
      scholarship: "2000",
      dueDate: new Date("2026-07-30"),
      status: "PARTIAL"
    }
  });

  const payment = await prisma.payment.upsert({
    where: { id: "seed-payment-1" },
    update: {},
    create: {
      id: "seed-payment-1",
      institutionId: institution.id,
      studentId: students[0].id,
      studentFeeId: studentFee.id,
      methodId: upiMethod.id,
      amount: "7500",
      reference: "UPI-DEMO-001"
    }
  });

  const invoice = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-00001" },
    update: {},
    create: {
      institutionId: institution.id,
      invoiceNumber: "INV-2026-00001",
      studentId: students[0].id,
      subtotal: "20000",
      discount: "1000",
      total: "19000",
      dueDate: new Date("2026-07-30"),
      items: {
        create: {
          studentFeeId: studentFee.id,
          description: "Science Foundation first installment",
          amount: "19000"
        }
      }
    }
  });

  await prisma.receipt.upsert({
    where: { receiptNumber: "RCT-2026-00001" },
    update: {},
    create: {
      institutionId: institution.id,
      receiptNumber: "RCT-2026-00001",
      paymentId: payment.id,
      invoiceId: invoice.id
    }
  });

  const expenseCategory = await prisma.expenseCategory.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: "Technology" } },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Technology"
    }
  });

  await prisma.expense.upsert({
    where: { id: "seed-expense-1" },
    update: {},
    create: {
      id: "seed-expense-1",
      institutionId: institution.id,
      categoryId: expenseCategory.id,
      title: "Classroom projector service",
      amount: "3500",
      status: "APPROVED",
      remarks: "Demo operational expense."
    }
  });

  const teacherStaff = await prisma.staffProfile.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      department: "Science",
      designation: "Faculty",
      joiningDate: new Date("2026-06-01")
    }
  });

  await prisma.leaveBalance.upsert({
    where: { staffId_leaveType: { staffId: teacherStaff.id, leaveType: "Casual Leave" } },
    update: {},
    create: {
      staffId: teacherStaff.id,
      leaveType: "Casual Leave",
      balance: "12",
      used: "1"
    }
  });

  await prisma.leaveApplication.upsert({
    where: { id: "seed-leave-1" },
    update: {},
    create: {
      id: "seed-leave-1",
      applicantId: teacherUser.id,
      approverId: facultyUser.id,
      fromDate: new Date("2026-07-28"),
      toDate: new Date("2026-07-28"),
      reason: "Personal work",
      status: "PENDING"
    }
  });

  await prisma.payroll.upsert({
    where: { id: "seed-payroll-july" },
    update: {},
    create: {
      id: "seed-payroll-july",
      institutionId: institution.id,
      name: "July Payroll",
      month: 7,
      year: 2026
    }
  });

  await prisma.visitor.upsert({
    where: { id: "seed-visitor-1" },
    update: {},
    create: {
      id: "seed-visitor-1",
      institutionId: institution.id,
      name: "Meera Parent",
      phone: "+91 95555 00000",
      purpose: "Admission enquiry",
      remarks: "Interested in weekend batch."
    }
  });

  await prisma.appointment.upsert({
    where: { id: "seed-appointment-1" },
    update: {},
    create: {
      id: "seed-appointment-1",
      institutionId: institution.id,
      visitorName: "Ravi Kumar",
      phone: "+91 94444 00000",
      purpose: "Counselling meeting",
      scheduledAt: new Date("2026-07-18T05:30:00.000Z")
    }
  });

  await Promise.all([
    prisma.workspacePreference.upsert({
      where: { userId_workspace: { userId: admin.id, workspace: "ADMIN" } },
      update: {},
      create: { userId: admin.id, workspace: "ADMIN", layout: { density: "calm", commandBar: true } }
    }),
    prisma.workspacePreference.upsert({
      where: { userId_workspace: { userId: facultyUser.id, workspace: "ACADEMIC_HEAD" } },
      update: {},
      create: { userId: facultyUser.id, workspace: "ACADEMIC_HEAD", layout: { plannerFirst: true } }
    }),
    prisma.workspacePreference.upsert({
      where: { userId_workspace: { userId: teacherUser.id, workspace: "TEACHER" } },
      update: {},
      create: { userId: teacherUser.id, workspace: "TEACHER", layout: { classroomsFirst: true } }
    })
  ]);

  await Promise.all([
    prisma.dashboardWidget.upsert({
      where: { id: "seed-widget-director-revenue" },
      update: {},
      create: { id: "seed-widget-director-revenue", userId: admin.id, workspace: "ADMIN", type: "CARD", title: "Today's Revenue", order: 1 }
    }),
    prisma.dashboardWidget.upsert({
      where: { id: "seed-widget-academic-planner" },
      update: {},
      create: { id: "seed-widget-academic-planner", userId: facultyUser.id, workspace: "ACADEMIC_HEAD", type: "TIMELINE", title: "Today's Academic Planner", order: 1 }
    }),
    prisma.dashboardWidget.upsert({
      where: { id: "seed-widget-teacher-classes" },
      update: {},
      create: { id: "seed-widget-teacher-classes", userId: teacherUser.id, workspace: "TEACHER", type: "LIST", title: "Today's Classes", order: 1 }
    })
  ]);

  await Promise.all([
    prisma.activity.upsert({
      where: { id: "seed-activity-admission" },
      update: {},
      create: { id: "seed-activity-admission", institutionId: institution.id, actorId: bdeUser.id, type: "ADMISSION", title: "New lead added", body: "Aarav Guest entered the admissions pipeline.", entity: "Lead", entityId: lead.id, link: "/admissions" }
    }),
    prisma.activity.upsert({
      where: { id: "seed-activity-content" },
      update: {},
      create: { id: "seed-activity-content", institutionId: institution.id, actorId: teacherUser.id, type: "CONTENT", title: "Lesson published", body: "Motion lesson is available for students.", entity: "ContentItem", entityId: contentItem.id, link: "/content-studio" }
    }),
    prisma.activity.upsert({
      where: { id: "seed-activity-finance" },
      update: {},
      create: { id: "seed-activity-finance", institutionId: institution.id, actorId: admin.id, type: "FINANCE", title: "Payment received", body: "Student fee receipt generated.", entity: "Payment", entityId: payment.id, link: "/finance" }
    }),
    prisma.activity.upsert({
      where: { id: "seed-activity-planner" },
      update: {},
      create: { id: "seed-activity-planner", institutionId: institution.id, actorId: facultyUser.id, type: "PLANNER", title: "Timetable ready", body: "Morning A has a scheduled physics class.", entity: "TimetableEntry", entityId: "seed-monday-period-1", link: "/classes" }
    })
  ]);

  await Promise.all([
    prisma.promptTemplate.upsert({
      where: { institutionId_key: { institutionId: institution.id, key: "lesson_plan" } },
      update: {},
      create: {
        institutionId: institution.id,
        key: "lesson_plan",
        scope: "TEACHER",
        name: "Lesson Plan",
        systemPrompt: "Help teachers prepare simple lesson plans for Indian classrooms.",
        userPrompt: "Create a lesson plan for: {{prompt}}",
        model: "gpt-4.1-mini"
      }
    }),
    prisma.promptTemplate.upsert({
      where: { institutionId_key: { institutionId: institution.id, key: "lead_summary" } },
      update: {},
      create: {
        institutionId: institution.id,
        key: "lead_summary",
        scope: "ADMISSIONS",
        name: "Lead Summary",
        systemPrompt: "Summarize admission leads and suggest next follow-up.",
        userPrompt: "Summarize this lead: {{prompt}}",
        model: "gpt-4.1-mini"
      }
    }),
    prisma.promptTemplate.upsert({
      where: { institutionId_key: { institutionId: institution.id, key: "daily_summary" } },
      update: {},
      create: {
        institutionId: institution.id,
        key: "daily_summary",
        scope: "DIRECTOR",
        name: "Director Daily Summary",
        systemPrompt: "Give directors crisp daily operating insights.",
        userPrompt: "Prepare daily summary from this context: {{prompt}}",
        model: "gpt-4.1-mini"
      }
    })
  ]);

  await prisma.communication.upsert({
    where: { id: "seed-communication-parent" },
    update: {},
    create: {
      id: "seed-communication-parent",
      institutionId: institution.id,
      createdById: facultyUser.id,
      kind: "ANNOUNCEMENT",
      title: "Parent Meeting",
      body: "Parent meeting is scheduled for the coming Saturday.",
      priority: "NORMAL",
      status: "SENT",
      channels: ["IN_APP", "EMAIL", "WHATSAPP"],
      batchId: batch.id,
      publishedAt: new Date(),
      recipients: {
        create: [{ userId: parentUser.id }, { batchId: batch.id }]
      },
      logs: {
        create: [
          { userId: parentUser.id, channel: "IN_APP", status: "SENT", provider: "in_app" },
          { userId: parentUser.id, channel: "EMAIL", status: "SCHEDULED", provider: "email_ready" },
          { userId: parentUser.id, channel: "WHATSAPP", status: "SCHEDULED", provider: "whatsapp_ready" }
        ]
      }
    }
  });

  await prisma.automationRule.upsert({
    where: { id: "seed-automation-admission" },
    update: {},
    create: {
      id: "seed-automation-admission",
      institutionId: institution.id,
      name: "Admission Welcome Flow",
      trigger: "ADMISSION_APPROVED",
      status: "ACTIVE",
      conditions: { courseRequired: true },
      actions: [
        "create_student",
        "assign_batch",
        "send_welcome_notification",
        "create_fee_record",
        "notify_teacher"
      ]
    }
  });

  await Promise.all(["ADMISSION", "ASSIGNMENT", "ATTENDANCE", "EXAM", "PLANNER", "FINANCE", "ANNOUNCEMENT", "CONTENT", "LEAVE", "VISITOR"].map((type) =>
    prisma.notificationPreference.upsert({
      where: { userId_type: { userId: admin.id, type: type as never } },
      update: {},
      create: { userId: admin.id, type: type as never, enabled: true, channels: { inApp: true } }
    })
  ));

  await prisma.notification.create({
    data: {
      institutionId: institution.id,
      userId: admin.id,
      title: "Foundation ready",
      body: "Phase 1 architecture is ready for future modules."
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
