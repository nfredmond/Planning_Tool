import fs from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { Chart } from 'chart.js';
import ChartJSNodeCanvas from 'chartjs-node-canvas';
import Comment from '../models/Comment';
import { generateSummary } from './ai/summary.service';
import { analyzeSentiment } from './ai/sentiment.service';

interface ReportData {
  name: string;
  project: any;
  type: string;
  parameters: any;
}

/**
 * Generate a PDF report
 */
export const generatePDF = async (report: ReportData): Promise<Buffer> => {
  const { name, project, type, parameters } = report;
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  // Add a page
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  // Add title
  page.drawText(name, {
    x: 50,
    y: height - 50,
    size: 24,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Add project name
  page.drawText(`Project: ${project.name}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Add date
  const date = new Date().toLocaleDateString();
  page.drawText(`Generated on: ${date}`, {
    x: 50,
    y: height - 100,
    size: 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Add content based on report type
  let yPosition = height - 130;
  
  // Add report description
  page.drawText(`Report Type: ${type}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  
  // Fetch data based on report type and parameters
  const reportData = await getReportData(report);
  
  if (reportData.summary) {
    page.drawText('Summary:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: timesRomanBoldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
    
    // Split summary into lines to fit page width
    const summaryLines = splitTextToLines(reportData.summary, 80);
    for (const line of summaryLines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }
    
    yPosition -= 15;
  }
  
  // Add charts if available
  if (reportData.charts && reportData.charts.length > 0) {
    for (const chartData of reportData.charts) {
      if (yPosition < 200) {
        // Add a new page if we're running out of space
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - 50;
      }
      
      const chartImage = await generateChartImage(chartData);
      const chartImageBytes = await fs.promises.readFile(chartImage);
      const image = await pdfDoc.embedPng(chartImageBytes);
      
      const imageDims = image.scale(0.5);
      
      page.drawImage(image, {
        x: 50,
        y: yPosition - imageDims.height,
        width: imageDims.width,
        height: imageDims.height,
      });
      
      yPosition -= (imageDims.height + 30);
      
      // Clean up temp file
      await fs.promises.unlink(chartImage);
    }
  }
  
  // Add data tables if available
  if (reportData.tables && reportData.tables.length > 0) {
    for (const table of reportData.tables) {
      const newPage = pdfDoc.addPage();
      const { width, height } = newPage.getSize();
      
      // Add table title
      newPage.drawText(table.title, {
        x: 50,
        y: height - 50,
        size: 14,
        font: timesRomanBoldFont,
        color: rgb(0, 0, 0),
      });
      
      let tableY = height - 80;
      const colWidth = (width - 100) / table.headers.length;
      
      // Draw headers
      for (let i = 0; i < table.headers.length; i++) {
        newPage.drawText(table.headers[i], {
          x: 50 + i * colWidth,
          y: tableY,
          size: 10,
          font: timesRomanBoldFont,
          color: rgb(0, 0, 0),
        });
      }
      
      tableY -= 20;
      
      // Draw rows
      for (const row of table.rows) {
        if (tableY < 50) {
          // Add a new page if we're running out of space
          const newerPage = pdfDoc.addPage();
          tableY = newerPage.getSize().height - 50;
        }
        
        for (let i = 0; i < row.length; i++) {
          newPage.drawText(String(row[i]), {
            x: 50 + i * colWidth,
            y: tableY,
            size: 10,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });
        }
        
        tableY -= 15;
      }
    }
  }
  
  // Serialize PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

/**
 * Generate an Excel report
 */
export const generateExcel = async (report: ReportData): Promise<Buffer> => {
  const { name, project, type, parameters } = report;
  
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TransportVoice';
  workbook.lastModifiedBy = 'TransportVoice';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Add overview worksheet
  const overviewSheet = workbook.addWorksheet('Overview');
  
  overviewSheet.addRow(['Report Name', name]);
  overviewSheet.addRow(['Project', project.name]);
  overviewSheet.addRow(['Report Type', type]);
  overviewSheet.addRow(['Generated On', new Date().toLocaleString()]);
  overviewSheet.addRow([]);
  
  // Fetch data based on report type and parameters
  const reportData = await getReportData(report);
  
  if (reportData.summary) {
    overviewSheet.addRow(['Summary']);
    overviewSheet.addRow([reportData.summary]);
    overviewSheet.addRow([]);
  }
  
  // Add data tables to separate worksheets
  if (reportData.tables && reportData.tables.length > 0) {
    for (const table of reportData.tables) {
      const tableSheet = workbook.addWorksheet(table.title);
      
      // Add headers
      tableSheet.addRow(table.headers);
      
      // Style headers
      tableSheet.getRow(1).font = { bold: true };
      
      // Add data rows
      for (const row of table.rows) {
        tableSheet.addRow(row);
      }
      
      // Auto-size columns
      tableSheet.columns.forEach(column => {
        column.width = 20;
      });
    }
  }
  
  // Generate Excel binary
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
};

/**
 * Generate a KMZ report
 */
export const generateKMZ = async (report: ReportData): Promise<Buffer> => {
  const { name, project, type, parameters } = report;
  
  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Create KML content
  let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <description>Project: ${project.name}</description>`;
    
  // Fetch data based on report type and parameters
  const reportData = await getReportData(report);
  
  // Add placemarks based on comments
  if (reportData.comments && reportData.comments.length > 0) {
    for (const comment of reportData.comments) {
      if (comment.location && comment.location.coordinates) {
        const [lng, lat] = comment.location.coordinates;
        
        // Determine style based on sentiment or status
        let styleUrl = '#default';
        if (comment.aiModerationScore) {
          if (comment.aiModerationScore < 0.3) {
            styleUrl = '#positive';
          } else if (comment.aiModerationScore > 0.7) {
            styleUrl = '#negative';
          } else {
            styleUrl = '#neutral';
          }
        }
        
        kmlContent += `
    <Placemark>
      <name>Comment ID: ${comment._id}</name>
      <description><![CDATA[
        <div>
          <p><strong>Content:</strong> ${comment.content}</p>
          <p><strong>Status:</strong> ${comment.status}</p>
          <p><strong>Created:</strong> ${new Date(comment.createdAt).toLocaleString()}</p>
        </div>
      ]]></description>
      <styleUrl>${styleUrl}</styleUrl>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>`;
      }
    }
  }
  
  // Add polygon if available
  if (parameters && parameters.polygon) {
    kmlContent += `
    <Placemark>
      <name>Filter Polygon</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>`;
            
    for (const point of parameters.polygon) {
      kmlContent += `${point[0]},${point[1]},0 `;
    }
    
    // Close the polygon by repeating the first point
    if (parameters.polygon.length > 0) {
      kmlContent += `${parameters.polygon[0][0]},${parameters.polygon[0][1]},0`;
    }
    
    kmlContent += `</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
  }
  
  // Add styles
  kmlContent += `
    <Style id="default">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    <Style id="positive">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    <Style id="neutral">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/blu-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    <Style id="negative">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>`;
    
  // Close KML
  kmlContent += `
  </Document>
</kml>`;
  
  // Add the KML file to the zip
  zip.file('doc.kml', kmlContent);
  
  // Generate the KMZ file
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  return buffer;
};

/**
 * Helper function to fetch and process report data
 */
async function getReportData(report: ReportData): Promise<any> {
  const { project, type, parameters } = report;
  const data: any = {};
  
  // Get comments based on report type and parameters
  let query: any = { project: project._id };
  
  // Apply polygon filter if available
  if (parameters.polygon) {
    query.location = {
      $geoWithin: {
        $polygon: parameters.polygon.map((point: number[]) => [point[0], point[1]])
      }
    };
  }
  
  const comments = await Comment.find(query)
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
  
  data.comments = comments;
  
  // Generate charts based on report type
  data.charts = [];
  
  switch (type) {
    case 'comments':
      // Generate comment status chart
      const statusData = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
          data: [
            comments.filter(c => c.status === 'pending').length,
            comments.filter(c => c.status === 'approved').length,
            comments.filter(c => c.status === 'rejected').length
          ],
          backgroundColor: ['#FFC107', '#4CAF50', '#F44336']
        }]
      };
      
      data.charts.push({
        type: 'pie',
        data: statusData,
        options: { plugins: { title: { display: true, text: 'Comments by Status' } } }
      });
      
      // Add comments table
      data.tables = [{
        title: 'Comments',
        headers: ['ID', 'Content', 'User', 'Created', 'Status', 'Moderation Score'],
        rows: comments.map(c => [
          c._id,
          c.content.substring(0, 50) + (c.content.length > 50 ? '...' : ''),
          c.anonymous ? 'Anonymous' : `${c.user?.firstName} ${c.user?.lastName}`,
          new Date(c.createdAt).toLocaleString(),
          c.status,
          c.aiModerationScore || 'N/A'
        ])
      }];
      
      break;
    
    case 'sentiment':
      // Generate sentiment analysis chart
      const sentiments = comments.map(c => c.aiModerationScore || 0.5);
      const positiveCount = sentiments.filter(s => s <= 0.3).length;
      const neutralCount = sentiments.filter(s => s > 0.3 && s < 0.7).length;
      const negativeCount = sentiments.filter(s => s >= 0.7).length;
      
      const sentimentData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [positiveCount, neutralCount, negativeCount],
          backgroundColor: ['#4CAF50', '#2196F3', '#F44336']
        }]
      };
      
      data.charts.push({
        type: 'doughnut',
        data: sentimentData,
        options: { plugins: { title: { display: true, text: 'Comment Sentiment Analysis' } } }
      });
      
      // Generate comment text summary
      data.summary = await generateSummary(comments.map(c => c.content).join('\n'));
      
      break;
      
    case 'engagement':
      // Time series chart of comments over time
      const dateMap = new Map();
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      
      // Initialize with all dates in the range
      for (let d = new Date(oneMonthAgo); d <= today; d.setDate(d.getDate() + 1)) {
        dateMap.set(d.toISOString().split('T')[0], 0);
      }
      
      // Count comments by date
      for (const comment of comments) {
        const dateStr = new Date(comment.createdAt).toISOString().split('T')[0];
        if (dateMap.has(dateStr)) {
          dateMap.set(dateStr, dateMap.get(dateStr) + 1);
        }
      }
      
      const timeLabels = Array.from(dateMap.keys());
      const timeData = Array.from(dateMap.values());
      
      const timeSeriesData = {
        labels: timeLabels,
        datasets: [{
          label: 'Comments',
          data: timeData,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          tension: 0.4
        }]
      };
      
      data.charts.push({
        type: 'line',
        data: timeSeriesData,
        options: { 
          plugins: { title: { display: true, text: 'Comment Engagement Over Time' } },
          scales: { x: { ticks: { maxRotation: 45, minRotation: 45 } } }
        }
      });
      
      break;
  }
  
  return data;
}

/**
 * Helper function to generate a chart image
 */
async function generateChartImage(chartConfig: any): Promise<string> {
  const width = 600;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
  
  const buffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
  
  // Save to a temp file
  const tempFilePath = path.join(os.tmpdir(), `chart-${Date.now()}.png`);
  await fs.promises.writeFile(tempFilePath, buffer);
  
  return tempFilePath;
}

/**
 * Helper function to split text into lines
 */
function splitTextToLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
} 