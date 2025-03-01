import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaLayerGroup, FaFireAlt, FaShare, FaSignOutAlt } from 'react-icons/fa';
import IconWrapper from '../common/IconWrapper';

interface MapToolbarProps {
  onAddComment: () => void;
  onToggleSettings: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  isAddingComment: boolean;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  onAddComment,
  onToggleSettings,
  showHeatmap,
  onToggleHeatmap,
  isAddingComment,
}) => {
  return (
    <Container>
      <ToolButton
        onClick={onAddComment}
        disabled={isAddingComment}
        title="Add Comment"
        className={isAddingComment ? 'active' : ''}
      >
        <IconWrapper icon={FaPlus} />
      </ToolButton>
      
      <ToolButton
        onClick={onToggleHeatmap}
        title={showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        className={showHeatmap ? 'active' : ''}
      >
        <IconWrapper icon={FaFireAlt} />
      </ToolButton>
      
      <ToolButton
        onClick={onToggleSettings}
        title="Map Settings"
      >
        <IconWrapper icon={FaLayerGroup} />
      </ToolButton>
      
      <ToolButton
        onClick={() => {
          // Create share URL
          const shareUrl = window.location.href;
          
          // Create temporary input element to copy URL
          const tempInput = document.createElement('input');
          document.body.appendChild(tempInput);
          tempInput.value = shareUrl;
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          
          // Show notification (implement this separately)
          alert('Link copied to clipboard!');
        }}
        title="Share Map"
      >
        <IconWrapper icon={FaShare} />
      </ToolButton>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
`;

const ToolButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  &.active {
    background-color: #e0e0e0;
    border-color: #999;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default MapToolbar; 