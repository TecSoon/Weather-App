const axios = require('axios');
const axiosInstance = axios.create({
  timeout: 10000,
  family: 4 // Force IPv4 to avoid ENETUNREACH issues
});

const getCityCoordinates = async (city) => {
  const response = await axiosInstance.get(`${process.env.GEOCODATA_API_URL}/v1/search`, {
    params: { name: city, count: 1 }
  });

  if (!response.data.results || response.data.results.length === 0) {
    throw new Error('City not found');
  }

  const { latitude, longitude } = response.data.results[0];
  return { latitude, longitude };
};

const getHistoricalWeather = async (latitude, longitude, days) => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1); // yesterday

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - Number(days) + 1);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const response = await axiosInstance.get(`${process.env.OPEN_METEO_HISTORICAL_API_URL}/v1/archive`, {
    params: {
      latitude,
      longitude,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'auto'
    }
  });

  const daily = response.data.daily;
  const avgTemps = daily.temperature_2m_max.map((max, i) => (max + daily.temperature_2m_min[i]) / 2);
  const totalAvg = avgTemps.reduce((a, b) => a + b, 0) / avgTemps.length;

  return totalAvg.toFixed(2);
};

module.exports = {
  getCityCoordinates,
  getHistoricalWeather
};
