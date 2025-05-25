const express = require('express')
const router = express.Router()
const weatherService = require('../services/weatherService');
const redis = require('../services/redisClient');

router.get('/weather/average', async (req, res) => {
  const { city, days } = req.query;

  if (typeof city !== 'string' || city.trim() === '') {
    return res.status(400).json({ error: 'City must be a non-empty string.' });
  }

  const parsedDays = Number(days);
  if (!Number.isInteger(parsedDays) || parsedDays < 1) {
    return res.status(400).json({ error: 'Days must be a positive integer.' });
  }

  const cacheKey = `avgTemp:${city.toLowerCase()}:${parsedDays}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit');
      return res.json(JSON.parse(cached));
    }

    console.log('Cache miss');
    const { latitude, longitude } = await weatherService.getCityCoordinates(city);
    const avgTemp = await weatherService.getHistoricalWeather(latitude, longitude, days);
    
    const result = {
      city,
      days: parsedDays,
      average_temperature: avgTemp
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60); // Cache for 1 hour

    res.json(result);

  } catch (err) {
    if (err.message === 'City not found') {
      return res.status(404).json({ error: 'City not found. Please check the city name.' });
    }

    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching weather data.' });
  }
});

module.exports = router
