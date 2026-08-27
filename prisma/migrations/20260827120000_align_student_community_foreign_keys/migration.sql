-- Prisma's migration engine compares foreign-key names as part of the schema.
-- The original Student Community migration used explicit legacy names while
-- the Prisma datamodel uses its canonical column-based names. Rename only
-- when the legacy constraint exists, so this is safe for existing databases
-- that may already have the canonical names.
DO $$
DECLARE item record;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('StudentAcceptedAnswer','StudentAcceptedAnswer_institution_fkey','StudentAcceptedAnswer_institutionId_fkey'),
      ('StudentAcceptedAnswer','StudentAcceptedAnswer_discussion_fkey','StudentAcceptedAnswer_discussionId_fkey'),
      ('StudentAcceptedAnswer','StudentAcceptedAnswer_reply_fkey','StudentAcceptedAnswer_replyId_fkey'),
      ('StudentAcceptedAnswer','StudentAcceptedAnswer_actor_fkey','StudentAcceptedAnswer_acceptedById_fkey'),
      ('StudentAcceptedAnswerHistory','StudentAcceptedAnswerHistory_institution_fkey','StudentAcceptedAnswerHistory_institutionId_fkey'),
      ('StudentAcceptedAnswerHistory','StudentAcceptedAnswerHistory_discussion_fkey','StudentAcceptedAnswerHistory_discussionId_fkey'),
      ('StudentAcceptedAnswerHistory','StudentAcceptedAnswerHistory_previous_reply_fkey','StudentAcceptedAnswerHistory_previousReplyId_fkey'),
      ('StudentAcceptedAnswerHistory','StudentAcceptedAnswerHistory_next_reply_fkey','StudentAcceptedAnswerHistory_nextReplyId_fkey'),
      ('StudentAcceptedAnswerHistory','StudentAcceptedAnswerHistory_actor_fkey','StudentAcceptedAnswerHistory_actorId_fkey'),
      ('StudentCommunityBlock','StudentCommunityBlock_institution_fkey','StudentCommunityBlock_institutionId_fkey'),
      ('StudentCommunityBlock','StudentCommunityBlock_blocker_fkey','StudentCommunityBlock_blockerId_fkey'),
      ('StudentCommunityBlock','StudentCommunityBlock_blocked_fkey','StudentCommunityBlock_blockedId_fkey'),
      ('StudentCommunityReport','StudentCommunityReport_institution_fkey','StudentCommunityReport_institutionId_fkey'),
      ('StudentCommunityReport','StudentCommunityReport_reporter_fkey','StudentCommunityReport_reporterId_fkey'),
      ('StudentCommunityReport','StudentCommunityReport_moderator_fkey','StudentCommunityReport_moderatorId_fkey'),
      ('StudentCommunityReputation','StudentCommunityReputation_institution_fkey','StudentCommunityReputation_institutionId_fkey'),
      ('StudentCommunityReputation','StudentCommunityReputation_user_fkey','StudentCommunityReputation_userId_fkey'),
      ('StudentCommunityRequest','StudentCommunityRequest_institution_fkey','StudentCommunityRequest_institutionId_fkey'),
      ('StudentCommunityRequest','StudentCommunityRequest_requester_fkey','StudentCommunityRequest_requesterId_fkey'),
      ('StudentCommunityRequest','StudentCommunityRequest_recipient_fkey','StudentCommunityRequest_recipientId_fkey'),
      ('StudentCommunityRequest','StudentCommunityRequest_community_fkey','StudentCommunityRequest_communityId_fkey'),
      ('StudentCommunityRequest','StudentCommunityRequest_subject_fkey','StudentCommunityRequest_subjectId_fkey'),
      ('StudentCommunityResourceShare','StudentCommunityResourceShare_institution_fkey','StudentCommunityResourceShare_institutionId_fkey'),
      ('StudentCommunityResourceShare','StudentCommunityResourceShare_owner_fkey','StudentCommunityResourceShare_ownerId_fkey'),
      ('StudentCommunityResourceShare','StudentCommunityResourceShare_community_fkey','StudentCommunityResourceShare_communityId_fkey'),
      ('StudentCommunityResourceShare','StudentCommunityResourceShare_conversation_fkey','StudentCommunityResourceShare_conversationId_fkey'),
      ('StudentCommunityResourceShare','StudentCommunityResourceShare_content_fkey','StudentCommunityResourceShare_contentItemId_fkey'),
      ('StudentCommunityResourceShare','StudentCommunityResourceShare_supersedes_fkey','StudentCommunityResourceShare_supersedesId_fkey'),
      ('StudentCommunityVote','StudentCommunityVote_institution_fkey','StudentCommunityVote_institutionId_fkey'),
      ('StudentCommunityVote','StudentCommunityVote_user_fkey','StudentCommunityVote_userId_fkey'),
      ('StudentGroupChallenge','StudentGroupChallenge_institution_fkey','StudentGroupChallenge_institutionId_fkey'),
      ('StudentGroupChallenge','StudentGroupChallenge_community_fkey','StudentGroupChallenge_communityId_fkey'),
      ('StudentGroupChallenge','StudentGroupChallenge_subject_fkey','StudentGroupChallenge_subjectId_fkey'),
      ('StudentGroupChallenge','StudentGroupChallenge_creator_fkey','StudentGroupChallenge_createdById_fkey'),
      ('StudentGroupChallengeParticipant','StudentGroupChallengeParticipant_challenge_fkey','StudentGroupChallengeParticipant_challengeId_fkey'),
      ('StudentGroupChallengeParticipant','StudentGroupChallengeParticipant_user_fkey','StudentGroupChallengeParticipant_userId_fkey'),
      ('StudentGroupEvent','StudentGroupEvent_institution_fkey','StudentGroupEvent_institutionId_fkey'),
      ('StudentGroupEvent','StudentGroupEvent_community_fkey','StudentGroupEvent_communityId_fkey'),
      ('StudentGroupEvent','StudentGroupEvent_subject_fkey','StudentGroupEvent_subjectId_fkey'),
      ('StudentGroupEvent','StudentGroupEvent_creator_fkey','StudentGroupEvent_createdById_fkey'),
      ('StudentGroupEventRsvp','StudentGroupEventRsvp_event_fkey','StudentGroupEventRsvp_eventId_fkey'),
      ('StudentGroupEventRsvp','StudentGroupEventRsvp_user_fkey','StudentGroupEventRsvp_userId_fkey')
    ) AS names(table_name, old_name, new_name)
  LOOP
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = item.old_name)
      AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = item.new_name) THEN
      EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I', item.table_name, item.old_name, item.new_name);
    END IF;
  END LOOP;
END $$;
