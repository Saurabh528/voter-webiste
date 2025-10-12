// API service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface SearchByEnrollmentParams {
  enrollmentNumber: string;
  phoneNumber?: string;
}

interface SearchByNameDistrictParams {
  name: string;
  district: string;
  phoneNumber?: string;
}

interface PhoneCaptureParams {
  phoneNumber: string;
  source?: string;
}

interface VoterResult {
  name: string;
  enrollmentNumber: string;
  copNumber: string;
  address: string;
  district: string;
  fatherName?: string;
  mobile?: string;
}

interface SearchResponse {
  found: boolean;
  data?: VoterResult;
  message?: string;
  totalMatches?: number;
}

// Search by enrollment number
export async function searchByEnrollment(
  params: SearchByEnrollmentParams
): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search/enrollment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching by enrollment:', error);
    throw error;
  }
}

// Search by name and district
export async function searchByNameDistrict(
  params: SearchByNameDistrictParams
): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search/name-district`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching by name and district:', error);
    throw error;
  }
}

// Capture phone number
export async function capturePhone(
  params: PhoneCaptureParams
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/phone-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error capturing phone:', error);
    throw error;
  }
}

// Check API health
export async function checkHealth(): Promise<{
  status: string;
  message: string;
  totalRecords: number;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
}

export type { VoterResult, SearchResponse };

