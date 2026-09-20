const API_BASE_URL = 'http://localhost:3000/api';

// Ambil semua data taman dari backend
export const getTamanList = async (search = '') => {
  const url = search 
    ? `${API_BASE_URL}/locations?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/locations`;
  
  const response = await fetch(url);
  return response.json();
};

// Ambil detail taman by ID
export const getTamanById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`);
  return response.json();
};

// Ambil list kecamatan
export const getKecamatanList = async () => {
  const response = await fetch(`${API_BASE_URL}/locations/kecamatan/list`);
  return response.json();
};