CREATE INDEX "Notification_userId_status_createdAt_idx" ON "Notification"("userId", "status", "createdAt");
CREATE INDEX "Notification_institutionId_createdAt_idx" ON "Notification"("institutionId", "createdAt");
CREATE INDEX "UserPreference_key_updatedAt_idx" ON "UserPreference"("key", "updatedAt");
CREATE INDEX "AuditLog_institutionId_createdAt_idx" ON "AuditLog"("institutionId", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_entity_entityId_createdAt_idx" ON "AuditLog"("entity", "entityId", "createdAt");
CREATE INDEX "ContentItem_institutionId_status_updatedAt_idx" ON "ContentItem"("institutionId", "status", "updatedAt");
