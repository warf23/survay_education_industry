import { supabase } from './supabase';

// Function to fetch survey responses from the database
export async function fetchSurveyResponses() {
  try {
    // Fetch data from the survey_responses_flat1 view
    const { data, error } = await supabase
      .from('survey_responses_flat1')
      .select('*');
    
    if (error) {
      console.error('Error fetching survey responses:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching survey responses:', error);
    return [];
  }
}

// Function to export survey responses as CSV
export function exportToCsv(data: any[], filename: string = 'survey_responses.csv') {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  // Get all column headers
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas by wrapping in quotes
        return value !== null && value !== undefined 
          ? `"${String(value).replace(/"/g, '""')}"` 
          : '';
      }).join(',')
    )
  ];
  
  // Create CSV content
  const csvContent = csvRows.join('\n');
  
  // Create a blob and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to get analytics data from survey responses
export function getAnalytics(data: any[]) {
  if (data.length === 0) {
    return {
      totalResponses: 0,
      responsesByIndustry: {},
      responsesByRegion: {},
      averageResponseLength: 0
    };
  }
  
  // Count responses by industry
  const responsesByIndustry = data.reduce((acc: Record<string, number>, item) => {
    const industry = item.Industry || 'Unknown';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {});
  
  // Count responses by region
  const responsesByRegion = data.reduce((acc: Record<string, number>, item) => {
    const region = item.Region || 'Unknown';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate average response length for text fields
  const textFields = [
    'Strengths', 'Recruitment_Process', 'Market_Opportunities', 'Competitors',
    'Innovation_Measurement', 'Key_Skills', 'Skills_Importance', 'Missing_Skills',
    'Skills_Update_Method', 'Skills_Assessment_Tools', 'Training_Partnerships',
    'Partnership_Influence', 'Collaboration_Difficulties', 'Knowledge_Transfer_Channels',
    'Cooperation_Improvements', 'Future_Essential_Skills', 'Teaching_Methods_Evolution',
    'Technology_Role', 'Skills_Effectiveness_Measurement', 'Education_Industry_Recommendations',
    'Additional_Comments'
  ];
  
  let totalLength = 0;
  let totalFields = 0;
  
  data.forEach(item => {
    textFields.forEach(field => {
      if (item[field]) {
        totalLength += String(item[field]).length;
        totalFields++;
      }
    });
  });
  
  const averageResponseLength = totalFields > 0 ? Math.round(totalLength / totalFields) : 0;
  
  return {
    totalResponses: data.length,
    responsesByIndustry,
    responsesByRegion,
    averageResponseLength
  };
} 