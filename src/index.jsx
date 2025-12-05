import React, { useState, useEffect } from 'react';
import { validate } from 'json-schema'; // فرض بر import schema validator
import data from './data.json'; // import داده‌ها
import './index.css';

function App() {
  const [scanData, setScanData] = useState(data);
  const [selectedArea, setSelectedArea] = useState(null);
  const [healthReport, setHealthReport] = useState('');

  useEffect(() => {
    // Validate data on load
    const validation = validate(scanData, require('./data.schema.json'));
    if (!validation.valid) {
      console.error('Data validation failed:', validation.errors);
    }
  }, []);

  const handleBodyClick = (event) => {
    const target = event.target;
    const location = target.dataset.location; // e.g., 'upper_arm_left'
    
    if (location && (location.includes('arm') || location.includes('hand'))) {
      // Add or update pain area
      const newPainArea = {
        type: 'muscle_pain', // default, can be prompted later
        location: location,
        severity: Math.floor(Math.random() * 10) + 1 // random for demo, replace with user input
      };

      setScanData(prev => {
        const existingIndex = prev.painAreas.findIndex(pa => pa.location === location);
        let updatedPainAreas;
        if (existingIndex > -1) {
          // Update severity
          updatedPainAreas = [...prev.painAreas];
          updatedPainAreas[existingIndex] = { ...updatedPainAreas[existingIndex], ...newPainArea };
        } else {
          // Add new
          updatedPainAreas = [...prev.painAreas, newPainArea];
        }
        return { ...prev, painAreas: updatedPainAreas };
      });

      // Visual feedback
      setSelectedArea(location);
      setTimeout(() => setSelectedArea(null), 1000); // Reset highlight after 1s

      // Regenerate report
      generateHealthReport({ ...scanData, painAreas: scanData.painAreas });
    }
  };

  const generateHealthReport = (data) => {
    let report = `سلام ${data.userProfile.name}، سن ${data.userProfile.age} سال.\n`;
    report += `نتایج اسکن: ضربان قلب ${data.scanResults.heartRate}، فشار خون ${data.scanResults.bloodPressure}، چربی بدن ${data.scanResults.bodyFat}%.\n`;

    if (data.painAreas.length > 0) {
      report += 'نقاط درد شناسایی شده:\n';
      data.painAreas.forEach(area => {
        const severityText = area.severity > 7 ? 'شدید' : area.severity > 4 ? 'متوسط' : 'خفیف';
        report += `- ${area.location}: ${severityText} (${area.severity}/10).\n`;
        
        // Specific recommendations for arm/hand
        if (area.location.includes('arm') || area.location.includes('hand')) {
          report += `  توصیه: تمرینات کششی روزانه برای ${area.location}، و مشاوره پزشک اگر ادامه داشت.\n`;
        }
      });
    } else {
      report += 'هیچ نقطه دردی شناسایی نشده.\n';
    }

    report += 'توصیه کلی: رژیم متعادل و ورزش منظم.';
    setHealthReport(report);
  };

  useEffect(() => {
    generateHealthReport(scanData);
  }, [scanData]);

  return (
    <div className="app">
      <h1>Volter Body Scanner</h1>
      
      {/* Body Scanner SVG */}
      <div className="body-scanner">
        <svg className="body-svg" viewBox="0 0 200 400" onClick={handleBodyClick}>
          {/* Simplified SVG paths for body parts - add real paths */}
          <path d="M50 50 Q100 100 150 50" data-location="upper_arm_left" className={selectedArea === 'upper_arm_left' ? 'pain-highlight' : ''} />
          <path d="M150 50 Q100 100 50 50" data-location="upper_arm_right" className={selectedArea === 'upper_arm_right' ? 'pain-highlight' : ''} />
          <path d="M30 120 L50 150" data-location="lower_arm_left" className={selectedArea === 'lower_arm_left' ? 'pain-highlight' : ''} />
          <path d="M170 120 L150 150" data-location="lower_arm_right" className={selectedArea === 'lower_arm_right' ? 'pain-highlight' : ''} />
          <circle cx="40" cy="160" r="15" data-location="hand_left" className={selectedArea === 'hand_left' ? 'pain-highlight' : ''} />
          <circle cx="160" cy="160" r="15" data-location="hand_right" className={selectedArea === 'hand_right' ? 'pain-highlight' : ''} />
          {/* Add torso, legs, etc. */}
          <rect x="80" y="100" width="40" height="200" fill="lightblue" />
        </svg>
      </div>

      {/* Pain Areas List */}
      {scanData.painAreas.length > 0 && (
        <div className="analysis-section">
          <h3>نقاط درد:</h3>
          {scanData.painAreas.map((area, index) => (
            <div key={index}>
              <span>{area.location}: </span>
              <div className="severity-bar">
                <div className="severity-fill" style={{ width: `${area.severity * 10}%` }}></div>
              </div>
              <span>{area.severity}/10</span>
            </div>
          ))}
        </div>
      )}

      {/* Health Report */}
      <div className="analysis-section">
        <h3>گزارش سلامت:</h3>
        <pre>{healthReport}</pre>
      </div>
    </div>
  );
}

export default App;
