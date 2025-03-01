// Define the ReportHandler type locally
type ReportHandler = (metric: {
  id: string;
  name: string;
  value: number;
  delta?: number;
  entries: any[];
}) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(error => {
      console.error('Error loading web-vitals:', error);
    });
  }
};

export default reportWebVitals; 