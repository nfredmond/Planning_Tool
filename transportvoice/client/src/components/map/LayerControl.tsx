import React from 'react';
import styled from 'styled-components';
import { Layer } from '../../types/Layer';
import { FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import IconWrapper from '../common/IconWrapper';

interface LayerControlProps {
  layers: Layer[];
  loading: boolean;
  onToggleLayer: (layerId: string, visible: boolean) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  loading,
  onToggleLayer,
  onOpacityChange,
}) => {
  const [expanded, setExpanded] = React.useState(true);

  if (loading) {
    return (
      <Container>
        <Header onClick={() => setExpanded(!expanded)}>
          <Title>Layers</Title>
          {expanded ? <IconWrapper icon={FaChevronUp} /> : <IconWrapper icon={FaChevronDown} />}
        </Header>
        {expanded && (
          <Content>
            <p>Loading layers...</p>
          </Content>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Header onClick={() => setExpanded(!expanded)}>
        <Title>Layers</Title>
        {expanded ? <IconWrapper icon={FaChevronUp} /> : <IconWrapper icon={FaChevronDown} />}
      </Header>
      {expanded && (
        <Content>
          {layers.length === 0 ? (
            <EmptyMessage>No layers available</EmptyMessage>
          ) : (
            layers.map((layer) => (
              <LayerItem key={layer._id}>
                <LayerHeader>
                  <VisibilityToggle
                    onClick={() => onToggleLayer(layer._id, !layer.visible)}
                  >
                    {layer.visible ? <IconWrapper icon={FaEye} /> : <IconWrapper icon={FaEyeSlash} />}
                  </VisibilityToggle>
                  <LayerName>{layer.name}</LayerName>
                </LayerHeader>
                <OpacityControl>
                  <OpacityLabel>Opacity:</OpacityLabel>
                  <OpacitySlider
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layer.opacity}
                    onChange={(e) => 
                      onOpacityChange(layer._id, parseFloat(e.target.value))
                    }
                  />
                  <OpacityValue>{Math.round(layer.opacity * 100)}%</OpacityValue>
                </OpacityControl>
              </LayerItem>
            ))
          )}
        </Content>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f8f8;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const Content = styled.div`
  padding: 10px 15px;
  max-height: 400px;
  overflow-y: auto;
`;

const EmptyMessage = styled.p`
  color: #888;
  text-align: center;
  margin: 20px 0;
`;

const LayerItem = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const LayerHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const VisibilityToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  color: #555;
  margin-right: 10px;
  
  &:hover {
    color: #1e88e5;
  }
`;

const LayerName = styled.div`
  font-weight: 500;
  flex: 1;
`;

const OpacityControl = styled.div`
  display: flex;
  align-items: center;
  margin-left: 40px;
`;

const OpacityLabel = styled.span`
  font-size: 12px;
  color: #777;
  margin-right: 10px;
`;

const OpacitySlider = styled.input`
  flex: 1;
  margin-right: 10px;
`;

const OpacityValue = styled.span`
  font-size: 12px;
  color: #777;
  width: 40px;
  text-align: right;
`;

export default LayerControl; 