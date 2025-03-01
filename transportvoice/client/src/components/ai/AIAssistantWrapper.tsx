import React from 'react';
import AIAssistant from './AIAssistant';

// Explicitly define the props interface here
interface AIAssistantWrapperProps {
  context?: string;
  projectId?: string;
}

const AIAssistantWrapper: React.FC<AIAssistantWrapperProps> = (props) => {
  return <AIAssistant {...props} />;
};

export default AIAssistantWrapper; 