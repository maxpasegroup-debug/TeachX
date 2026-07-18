import { createCommunication, getCommunicationCenter } from "@/services/communication-service";

export async function getAnnouncements(institutionId?: string | null) {
  const center = await getCommunicationCenter(institutionId);
  return center.communications.filter((item) => item.kind === "ANNOUNCEMENT");
}

export async function createAnnouncement(input: Parameters<typeof createCommunication>[0]) {
  return createCommunication({ ...input, kind: "ANNOUNCEMENT" });
}
