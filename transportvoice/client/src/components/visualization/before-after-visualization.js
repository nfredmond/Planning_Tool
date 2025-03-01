import React, { useState, useRef, useEffect } from 'react';
import { Slider, Button, Tabs, Tab, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PhotoCamera, Upload, Refresh, EditRoad, FormatPaint, DirectionsBike, DirectionsWalk, DirectionsCar } from '@mui/icons-material';

const BeforeAfterVisualization = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [beforeImage, setBeforeImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [mode, setMode] = useState('upload'); // upload, generate, compare
  const [transformations, setTransformations] = useState({
    bikeInfrastructure: 'none', // none, bike-lanes, protected-lanes, cycle-track
    pedestrianImprovements: 'none', // none, wider-sidewalks, crosswalks, pedestrian-plaza
    roadDiet: false,
    greenery: 'none', // none, street-trees, planters, rain-gardens
    transitFeatures: 'none', // none, bus-lane, transit-shelter, brt
    style: 'realistic', // realistic, sketch, blueprint
  });
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  
  const beforeCanvasRef = useRef(null);
  const afterCanvasRef = useRef(null);
  const comparisonCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Load project data if projectId provided
  useEffect(() => {
    if (projectId) {
      // In a real app, fetch project data including saved images
      // For demo, we'll use placeholder images if projectId exists
      setBeforeImage('/path/to/project/before-image.jpg');
      setMode('generate');
    }
  }, [projectId]);
  
  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setBeforeImage(img.src);
        setMode('generate');
        // Draw image on canvas
        drawBeforeImage(img.src);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // Draw before image on canvas
  const drawBeforeImage = (imageSrc) => {
    const canvas = beforeCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      // Resize canvas to match image aspect ratio
      canvas.width = canvas.offsetWidth;
      canvas.height = (img.height / img.width) * canvas.width;
      
      // Draw image to fill canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageSrc;
  };
  
  // Draw generated after image
  const drawAfterImage = (imageSrc) => {
    const canvas = afterCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      // Resize canvas to match image aspect ratio
      canvas.width = canvas.offsetWidth;
      canvas.height = (img.height / img.width) * canvas.width;
      
      // Draw image to fill canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageSrc;
  };
  
  // Handle image generation
  const generateAfterImage = async () => {
    if (!beforeImage) {
      setError('Please upload a before image first');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    
    try {
      // Simulate generation process with progress updates
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 5;
        });
      }, 200);
      
      // In a real application, you would make an API call to an AI service
      // that generates the after image based on the before image and transformations
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // For demo purposes, we'll use a mock generated image
      // In reality, this would be returned from the AI service
      const mockGeneratedImage = getMockGeneratedImage(transformations);
      
      setGeneratedImage(mockGeneratedImage);
      setMode('compare');
      
      // Add to history
      setHistory([
        ...history,
        { 
          date: new Date().toISOString(),
          transformations: { ...transformations },
          afterImage: mockGeneratedImage
        }
      ]);
      
      // Draw the after image
      drawAfterImage(mockGeneratedImage);
      
      // Initialize comparison view
      initializeComparisonView(beforeImage, mockGeneratedImage);
      
      clearInterval(timer);
      setProgress(100);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate after image: ' + err.message);
      setLoading(false);
    }
  };
  
  // Initialize comparison slider view
  const initializeComparisonView = (beforeSrc, afterSrc) => {
    const canvas = comparisonCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const beforeImg = new Image();
    const afterImg = new Image();
    
    beforeImg.onload = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = (beforeImg.height / beforeImg.width) * canvas.width;
      
      if (afterImg.complete) {
        drawComparison(ctx, beforeImg, afterImg, canvas.width, canvas.height, sliderValue);
      }
    };
    
    afterImg.onload = () => {
      if (beforeImg.complete) {
        drawComparison(ctx, beforeImg, afterImg, canvas.width, canvas.height, sliderValue);
      }
    };
    
    beforeImg.src = beforeSrc;
    afterImg.src = afterSrc;
  };
  
  // Draw comparison view based on slider position
  const drawComparison = (ctx, beforeImg, afterImg, width, height, sliderPos) => {
    // Calculate position in pixels
    const sliderPosX = (sliderPos / 100) * width;
    
    // Draw before image
    ctx.drawImage(beforeImg, 0, 0, width, height);
    
    // Draw after image (clipped)
    ctx.beginPath();
    ctx.rect(0, 0, sliderPosX, height);
    ctx.clip();
    ctx.drawImage(afterImg, 0, 0, width, height);
    
    // Draw slider line
    ctx.beginPath();
    ctx.moveTo(sliderPosX, 0);
    ctx.lineTo(sliderPosX, height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw slider handle
    ctx.beginPath();
    ctx.arc(sliderPosX, height / 2, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Label
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Before', sliderPosX - 70, 20);
    ctx.fillText('After', sliderPosX + 70, 20);
  };
  
  // Update comparison when slider changes
  useEffect(() => {
    if (mode === 'compare' && beforeImage && generatedImage) {
      const canvas = comparisonCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      const beforeImg = new Image();
      const afterImg = new Image();
      
      beforeImg.onload = () => {
        if (afterImg.complete) {
          drawComparison(ctx, beforeImg, afterImg, canvas.width, canvas.height, sliderValue);
        }
      };
      
      afterImg.onload = () => {
        if (beforeImg.complete) {
          drawComparison(ctx, beforeImg, afterImg, canvas.width, canvas.height, sliderValue);
        }
      };
      
      beforeImg.src = beforeImage;
      afterImg.src = generatedImage;
    }
  }, [sliderValue, mode, beforeImage, generatedImage]);
  
  // Handle slider change
  const handleSliderChange = (_, newValue) => {
    setSliderValue(newValue);
  };
  
  // Get mock generated image based on transformations
  const getMockGeneratedImage = (transformations) => {
    // In a real application, this would come from an AI service
    // For demo, we'll return different placeholder images based on transformations
    
    let imageUrl = 'https://via.placeholder.com/800x450';
    
    // In a real implementation, you would use actual AI-generated images
    // based on the selected transformations
    
    // Here we're just returning different colored placeholders
    if (transformations.bikeInfrastructure !== 'none') {
      if (transformations.roadDiet) {
        imageUrl = 'https://via.placeholder.com/800x450/9fc5e8/333333?text=Protected+Bike+Lanes+with+Road+Diet';
      } else {
        imageUrl = 'https://via.placeholder.com/800x450/66bb6a/333333?text=Bike+Infrastructure';
      }
    } else if (transformations.pedestrianImprovements !== 'none') {
      imageUrl = 'https://via.placeholder.com/800x450/fff176/333333?text=Pedestrian+Improvements';
    } else if (transformations.roadDiet) {
      imageUrl = 'https://via.placeholder.com/800x450/ef9a9a/333333?text=Road+Diet';
    } else if (transformations.greenery !== 'none') {
      imageUrl = 'https://via.placeholder.com/800x450/81c784/333333?text=Added+Greenery';
    } else if (transformations.transitFeatures !== 'none') {
      imageUrl = 'https://via.placeholder.com/800x450/ffb74d/333333?text=Transit+Features';
    }
    
    return imageUrl;
  };
  
  // Reset everything
  const handleReset = () => {
    setBeforeImage(null);
    setGeneratedImage(null);
    setMode('upload');
    setTransformations({
      bikeInfrastructure: 'none',
      pedestrianImprovements: 'none',
      roadDiet: false,
      greenery: 'none',
      transitFeatures: 'none',
      style: 'realistic',
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Return to edit mode
  const handleEditTransformations = () => {
    setMode('generate');
  };
  
  // Get icon for transformation type
  const getTransformationIcon = (type) => {
    switch (type) {
      case 'bikeInfrastructure':
        return <DirectionsBike />;
      case 'pedestrianImprovements':
        return <DirectionsWalk />;
      case 'roadDiet':
        return <EditRoad />;
      case 'greenery':
        return <FormatPaint color="success" />;
      case 'transitFeatures':
        return <DirectionsCar />;
      default:
        return null;
    }
  };
  
  // Render upload mode
  const renderUploadMode = () => (
    <div className="upload-container">
      <div className="upload-prompt">
        <h3>Upload a Street Image</h3>
        <p>Upload a current street photo to visualize potential improvements</p>
        
        <div className="upload-buttons">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCamera />}
              color="primary"
            >
              Upload Photo
            </Button>
          </label>
          
          <Button
            variant="outlined"
            onClick={() => {
              // Use a sample image for demonstration
              const sampleImage = 'https://via.placeholder.com/800x450/cccccc/333333?text=Sample+Street+Image';
              setBeforeImage(sampleImage);
              setMode('generate');
              drawBeforeImage(sampleImage);
            }}
          >
            Use Sample Image
          </Button>
        </div>
        
        <div className="upload-tips">
          <h4>Tips for best results:</h4>
          <ul>
            <li>Use clear, well-lit daytime photos</li>
            <li>Capture the street from eye level</li>
            <li>Include the full width of the street</li>
            <li>Avoid images with heavy filters or edits</li>
          </ul>
        </div>
      </div>
    </div>
  );
  
  // Render generate mode
  const renderGenerateMode = () => (
    <div className="generate-container">
      <div className="image-preview">
        <h3>Before Image</h3>
        <canvas ref={beforeCanvasRef} className="before-canvas"></canvas>
        <div className="image-actions">
          <Button 
            startIcon={<Refresh />}
            onClick={handleReset}
            variant="outlined"
            size="small"
          >
            Change Image
          </Button>
        </div>
      </div>
      
      <div className="transformations-panel">
        <h3>Design Street Improvements</h3>
        <p>Select the improvements you want to visualize</p>
        
        <div className="transformation-options">
          <div className="transformation-group">
            <div className="transformation-header">
              <DirectionsBike />
              <h4>Bicycle Infrastructure</h4>
            </div>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Select option</InputLabel>
              <Select
                value={transformations.bikeInfrastructure}
                onChange={(e) => setTransformations({
                  ...transformations,
                  bikeInfrastructure: e.target.value
                })}
                label="Select option"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="bike-lanes">Painted Bike Lanes</MenuItem>
                <MenuItem value="protected-lanes">Protected Bike Lanes</MenuItem>
                <MenuItem value="cycle-track">Cycle Track</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="transformation-group">
            <div className="transformation-header">
              <DirectionsWalk />
              <h4>Pedestrian Improvements</h4>
            </div>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Select option</InputLabel>
              <Select
                value={transformations.pedestrianImprovements}
                onChange={(e) => setTransformations({
                  ...transformations,
                  pedestrianImprovements: e.target.value
                })}
                label="Select option"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="wider-sidewalks">Wider Sidewalks</MenuItem>
                <MenuItem value="crosswalks">Enhanced Crosswalks</MenuItem>
                <MenuItem value="pedestrian-plaza">Pedestrian Plaza</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="transformation-group">
            <div className="transformation-header">
              <EditRoad />
              <h4>Lane Configuration</h4>
            </div>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Road Diet</InputLabel>
              <Select
                value={transformations.roadDiet ? 'yes' : 'no'}
                onChange={(e) => setTransformations({
                  ...transformations,
                  roadDiet: e.target.value === 'yes'
                })}
                label="Road Diet"
              >
                <MenuItem value="no">Keep Existing Lanes</MenuItem>
                <MenuItem value="yes">Reduce Lanes (Road Diet)</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="transformation-group">
            <div className="transformation-header">
              <FormatPaint />
              <h4>Greenery & Landscaping</h4>
            </div>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Select option</InputLabel>
              <Select
                value={transformations.greenery}
                onChange={(e) => setTransformations({
                  ...transformations,
                  greenery: e.target.value
                })}
                label="Select option"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="street-trees">Street Trees</MenuItem>
                <MenuItem value="planters">Planters & Bioswales</MenuItem>
                <MenuItem value="rain-gardens">Rain Gardens</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="transformation-group">
            <div className="transformation-header">
              <DirectionsCar />
              <h4>Transit Features</h4>
            </div>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Select option</InputLabel>
              <Select
                value={transformations.transitFeatures}
                onChange={(e) => setTransformations({
                  ...transformations,
                  transitFeatures: e.target.value
                })}
                label="Select option"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="bus-lane">Dedicated Bus Lane</MenuItem>
                <MenuItem value="transit-shelter">Transit Shelter</MenuItem>
                <MenuItem value="brt">BRT Station</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="transformation-group">
            <div className="transformation-header">
              <PhotoCamera />
              <h4>Visualization Style</h4>
            </div>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Select style</InputLabel>
              <Select
                value={transformations.style}
                onChange={(e) => setTransformations({
                  ...transformations,
                  style: e.target.value
                })}
                label="Select style"
              >
                <MenuItem value="realistic">Realistic Photo</MenuItem>
                <MenuItem value="sketch">Architectural Sketch</MenuItem>
                <MenuItem value="blueprint">Blueprint Style</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        
        <div className="generate-actions">
          <Button
            variant="outlined"
            onClick={handleReset}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={generateAfterImage}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PhotoCamera />}
          >
            Generate After Image
          </Button>
        </div>
        
        {loading && (
          <div className="progress-container">
            <p>Generating visualization... {progress}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Render compare mode
  const renderCompareMode = () => (
    <div className="compare-container">
      <Tabs value={0} centered>
        <Tab label="Before & After Comparison" />
      </Tabs>
      
      <div className="slider-view">
        <canvas ref={comparisonCanvasRef} className="comparison-canvas"></canvas>
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          aria-labelledby="continuous-slider"
          min={0}
          max={100}
          className="comparison-slider"
        />
      </div>
      
      <div className="transformation-summary">
        <h3>Improvements Visualized</h3>
        <div className="summary-items">
          {Object.entries(transformations).map(([key, value]) => {
            if (key === 'style' || (value === 'none' && key !== 'roadDiet') || (key === 'roadDiet' && !value)) {
              return null;
            }
            
            let label = '';
            switch (key) {
              case 'bikeInfrastructure':
                label = value === 'bike-lanes' ? 'Painted Bike Lanes' : 
                       value === 'protected-lanes' ? 'Protected Bike Lanes' : 
                       'Cycle Track';
                break;
              case 'pedestrianImprovements':
                label = value === 'wider-sidewalks' ? 'Wider Sidewalks' : 
                       value === 'crosswalks' ? 'Enhanced Crosswalks' : 
                       'Pedestrian Plaza';
                break;
              case 'roadDiet':
                label = 'Road Diet (Lane Reduction)';
                break;
              case 'greenery':
                label = value === 'street-trees' ? 'Street Trees' : 
                       value === 'planters' ? 'Planters & Bioswales' : 
                       'Rain Gardens';
                break;
              case 'transitFeatures':
                label = value === 'bus-lane' ? 'Dedicated Bus Lane' : 
                       value === 'transit-shelter' ? 'Transit Shelter' : 
                       'BRT Station';
                break;
              default:
                label = value;
            }
            
            return (
              <div key={key} className="summary-item">
                {getTransformationIcon(key)}
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="compare-actions">
        <Button 
          variant="outlined"
          onClick={handleEditTransformations}
        >
          Edit Improvements
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // In a real app, save the visualization to the project
            alert('Visualization saved to project!');
          }}
        >
          Save Visualization
        </Button>
      </div>
      
      {history.length > 1 && (
        <div className="history-section">
          <h3>Previous Visualizations</h3>
          <div className="history-items">
            {history.slice(0, -1).map((item, index) => (
              <div key={index} className="history-item">
                <img src={item.afterImage} alt={`Visualization ${index}`} />
                <div className="history-item-info">
                  <p className="history-date">
                    {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                  </p>
                  <Button 
                    size="small"
                    onClick={() => {
                      setGeneratedImage(item.afterImage);
                      setTransformations(item.transformations);
                      initializeComparisonView(beforeImage, item.afterImage);
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="before-after-visualization">
      <div className="visualization-header">
        <h2>Before & After Street Visualization</h2>
        <p>Upload a street photo and visualize potential transportation improvements</p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="visualization-content">
        {mode === 'upload' && renderUploadMode()}
        {mode === 'generate' && renderGenerateMode()}
        {mode === 'compare' && renderCompareMode()}
      </div>
      
      <style jsx>{`
        .before-after-visualization {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        .visualization-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .visualization-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .visualization-header p {
          margin: 0;
          color: #666;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-message button {
          background: none;
          border: none;
          color: #721c24;
          font-weight: bold;
          cursor: pointer;
        }
        
        .visualization-content {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        /* Upload Mode Styles */
        .upload-container {
          padding: 40px;
          text-align: center;
        }
        
        .upload-prompt h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
        }
        
        .upload-prompt p {
          margin-bottom: 30px;
          color: #666;
        }
        
        .upload-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 30px;
        }
        
        .upload-tips {
          max-width: 400px;
          margin: 0 auto;
          text-align: left;
          background-color: #e9f5ff;
          padding: 15px;
          border-radius: 8px;
        }
        
        .upload-tips h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #0066cc;
        }
        
        .upload-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #333;
        }
        
        .upload-tips li {
          margin-bottom: 5px;
        }
        
        /* Generate Mode Styles */
        .generate-container {
          display: flex;
          flex-wrap: wrap;
        }
        
        .image-preview {
          flex: 0 0 40%;
          padding: 20px;
          border-right: 1px solid #eee;
        }
        
        .image-preview h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        }
        
        .before-canvas {
          width: 100%;
          background-color: #f0f0f0;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        
        .image-actions {
          display: flex;
          justify-content: center;
        }
        
        .transformations-panel {
          flex: 1;
          padding: 20px;
        }
        
        .transformations-panel h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
        }
        
        .transformations-panel p {
          margin-bottom: 20px;
          color: #666;
        }
        
        .transformation-options {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .transformation-group {
          margin-bottom: 15px;
        }
        
        .transformation-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .transformation-header h4 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }
        
        .generate-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 20px;
        }
        
        .progress-container {
          margin-top: 20px;
        }
        
        .progress-container p {
          margin-bottom: 5px;
          text-align: center;
        }
        
        .progress-bar {
          height: 6px;
          background-color: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #4caf50;
          transition: width 0.3s ease;
        }
        
        /* Compare Mode Styles */
        .compare-container {
          padding: 20px;
        }
        
        .slider-view {
          position: relative;
          margin: 20px 0;
        }
        
        .comparison-canvas {
          width: 100%;
          background-color: #f0f0f0;
          border-radius: 8px;
        }
        
        .comparison-slider {
          position: relative;
          margin-top: 15px !important;
        }
        
        .transformation-summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .transformation-summary h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        }
        
        .summary-items {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #e9f5ff;
          padding: 8px 12px;
          border-radius: 30px;
          font-size: 14px;
        }
        
        .compare-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 20px 0;
        }
        
        .history-section {
          border-top: 1px solid #eee;
          padding-top: 20px;
          margin-top: 20px;
        }
        
        .history-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        }
        
        .history-items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .history-item {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .history-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }
        
        .history-item-info {
          padding: 10px;
          background-color: #f8f9fa;
        }
        
        .history-date {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .generate-container {
            flex-direction: column;
          }
          
          .image-preview {
            flex: 0 0 100%;
            border-right: none;
            border-bottom: 1px solid #eee;
          }
          
          .transformation-options {
            grid-template-columns: 1fr;
          }
          
          .upload-buttons {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default BeforeAfterVisualization;
