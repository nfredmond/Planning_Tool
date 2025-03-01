import React, { useState, useEffect } from 'react';

interface CommentAIScores {
  toxic: number;
  spam: number;
  harassment: number;
  hate: number;
  sexual: number;
  violence: number;
  [key: string]: number;
}

interface Comment {
  id: string;
  username: string;
  content: string;
  timestamp: string | Date;
  aiScores: CommentAIScores;
  moderationStatus: 'pending' | 'flagged' | 'approved' | 'rejected';
  flaggedCategories: string[];
}

// Component for displaying and moderating comments with AI assistance
const CommentModerationSystem = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [moderationThreshold, setModerationThreshold] = useState<number>(0.7);
  const [autoModeration, setAutoModeration] = useState<boolean>(false);
  
  // Fetch comments from API
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/comments/pending');
        const data = await response.json();
        
        // Add AI moderation scores for demo purposes
        // In a real implementation, these would come from the server
        const commentsWithScores = data.map((comment: any) => ({
          ...comment,
          aiScores: {
            toxic: Math.random(),
            spam: Math.random(),
            harassment: Math.random(),
            hate: Math.random(),
            sexual: Math.random(),
            violence: Math.random()
          },
          moderationStatus: 'pending',
          flaggedCategories: []
        }));
        
        // Pre-process comments with AI scores
        const processedComments = commentsWithScores.map((comment: any) => 
          processCommentWithAI(comment, moderationThreshold)
        );
        
        setComments(processedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [moderationThreshold]);
  
  // Process comment with AI scoring
  const processCommentWithAI = (comment: Comment, threshold: number): Comment => {
    const { aiScores } = comment;
    const flaggedCategories: string[] = [];
    
    // Check each category against threshold
    Object.entries(aiScores).forEach(([category, score]) => {
      if (score > threshold) {
        flaggedCategories.push(category);
      }
    });
    
    // Determine overall status
    let status: 'pending' | 'flagged' | 'rejected' = 'pending';
    if (flaggedCategories.length > 0) {
      status = autoModeration ? 'rejected' : 'flagged';
    }
    
    return {
      ...comment,
      moderationStatus: status,
      flaggedCategories
    };
  };
  
  // Handle manual moderation actions
  const handleModerateComment = async (commentId: string, action: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/comments/${commentId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      // Update local state
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, moderationStatus: action } 
          : comment
      ));
    } catch (error) {
      console.error('Error moderating comment:', error);
    }
  };
  
  // Toggle auto-moderation
  const toggleAutoModeration = () => {
    setAutoModeration(!autoModeration);
    
    if (!autoModeration) {
      // Apply auto-moderation to all currently flagged comments
      setComments(comments.map(comment => 
        comment.moderationStatus === 'flagged'
          ? { ...comment, moderationStatus: 'rejected' } 
          : comment
      ));
    }
  };
  
  // Adjust moderation threshold
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newThreshold = parseFloat(e.target.value);
    setModerationThreshold(newThreshold);
    
    // Re-process comments with new threshold
    setComments(comments.map(comment => 
      processCommentWithAI(
        { ...comment, moderationStatus: 'pending', flaggedCategories: [] },
        newThreshold
      )
    ));
  };
  
  // Calculate highest risk category for a comment
  const getHighestRiskCategory = (comment: Comment): [string, number] | null => {
    if (!comment.aiScores || Object.keys(comment.aiScores).length === 0) {
      return null;
    }
    
    return Object.entries(comment.aiScores)
      .sort((a, b) => b[1] - a[1])[0];
  };
  
  return (
    <div className="comment-moderation-system">
      <div className="moderation-controls">
        <h2>AI Comment Moderation</h2>
        
        <div className="controls">
          <div className="threshold-control">
            <label htmlFor="threshold">AI Sensitivity Threshold: {moderationThreshold}</label>
            <input
              type="range"
              id="threshold"
              min="0"
              max="1"
              step="0.05"
              value={moderationThreshold}
              onChange={handleThresholdChange}
            />
          </div>
          
          <div className="auto-moderation-toggle">
            <label>
              <input
                type="checkbox"
                checked={autoModeration}
                onChange={toggleAutoModeration}
              />
              Enable Auto-Moderation
            </label>
          </div>
        </div>
        
        <div className="stats">
          <div>Total: {comments.length}</div>
          <div>Flagged: {comments.filter(c => c.moderationStatus === 'flagged').length}</div>
          <div>Approved: {comments.filter(c => c.moderationStatus === 'approved').length}</div>
          <div>Rejected: {comments.filter(c => c.moderationStatus === 'rejected').length}</div>
          <div>Pending: {comments.filter(c => c.moderationStatus === 'pending').length}</div>
        </div>
      </div>
      
      <div className="comments-list">
        {isLoading ? (
          <div className="loading">Loading comments...</div>
        ) : (
          comments.map(comment => {
            const highestRisk = getHighestRiskCategory(comment);
            return (
              <div 
                key={comment.id} 
                className={`comment-item ${comment.moderationStatus}`}
              >
                <div className="comment-header">
                  <div className="user-info">
                    <span className="username">{comment.username}</span>
                    <span className="timestamp">{new Date(comment.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div className="risk-indicators">
                    {comment.flaggedCategories.map((category: string) => (
                      <span 
                        key={category} 
                        className={`risk-tag ${category}`}
                        title={`${category}: ${(comment.aiScores[category] * 100).toFixed(1)}%`}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="comment-content">{comment.content}</div>
                
                <div className="comment-footer">
                  <div className="ai-confidence">
                    {highestRisk && (
                      <div className="highest-risk">
                        Highest risk: {highestRisk[0]} ({(highestRisk[1] * 100).toFixed(1)}%)
                      </div>
                    )}
                  </div>
                  
                  <div className="moderation-actions">
                    <button 
                      onClick={() => handleModerateComment(comment.id, 'approved')}
                      className="approve-btn"
                      disabled={comment.moderationStatus === 'approved'}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleModerateComment(comment.id, 'rejected')}
                      className="reject-btn"
                      disabled={comment.moderationStatus === 'rejected'}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentModerationSystem;

// API Functions for integrating with backend
export const commentModerationApi = {
  // Train the AI model with feedback from moderators
  trainModel: async (commentId: string, moderatorDecision: string, aiScores: CommentAIScores) => {
    try {
      const response = await fetch('/api/ai/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commentId,
          moderatorDecision,
          aiScores
        })
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error training AI model:', error);
      return { success: false, error: error.message };
    }
  }
}; 