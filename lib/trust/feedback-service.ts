export type FeedbackType = 'correct' | 'incorrect' | 'not_relevant' | 'needs_review';

export interface FindingFeedbackRecord {
  id: string;
  findingId: string;
  userId: string;
  feedbackType: FeedbackType;
  comments?: string;
  submittedAt: string;
}

const feedbackStore: FindingFeedbackRecord[] = [];

export function recordFindingFeedback(
  findingId: string,
  userId: string,
  feedbackType: FeedbackType,
  comments?: string
): FindingFeedbackRecord {
  const record: FindingFeedbackRecord = {
    id: `fb-${Date.now()}`,
    findingId,
    userId,
    feedbackType,
    comments,
    submittedAt: new Date().toISOString(),
  };

  feedbackStore.push(record);
  return record;
}

export function getFindingFeedback(findingId?: string): FindingFeedbackRecord[] {
  if (findingId) {
    return feedbackStore.filter(f => f.findingId === findingId);
  }
  return feedbackStore;
}
