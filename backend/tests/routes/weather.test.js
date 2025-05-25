const request = require('supertest');
const app = require('../../app');
const weatherService = require('../../services/weatherService');


jest.mock('../../services/weatherService');
describe('GET /weather/average', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return average temperature for a valid city and days', async () => {
    const mockCoordinates = { latitude: 13.13, longitude: 14.14 };
    const mockAvgTemp = '25.00';

    weatherService.getCityCoordinates.mockResolvedValue(mockCoordinates);
    weatherService.getHistoricalWeather.mockResolvedValue(mockAvgTemp);

    const response = await request(app)
      .get('/weather/average')
      .query({ city: 'New York', days: '7' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      city: 'New York',
      days: 7,
      average_temperature: mockAvgTemp
    });
  });

  it('should return 400 for invalid city parameter', async () => {
    const response = await request(app)
      .get('/weather/average')
      .query({ city: '', days: '7' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'City must be a non-empty string.' });
  });

  it('should return 400 for non integer days parameter', async () => {
    const response = await request(app)
      .get('/weather/average')
      .query({ city: 'New York', days: '0' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Days must be a positive integer.' });
  });

    it('should return 400 for string days parameter', async () => {
    const response = await request(app)
      .get('/weather/average')
      .query({ city: 'New York', days: 'one' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Days must be a positive integer.' });
  });

  it('should return 404 if city is not found', async () => {
    weatherService.getCityCoordinates.mockRejectedValue(new Error('City not found'));

    const response = await request(app)
      .get('/weather/average')
      .query({ city: 'Unknown City', days: '7' });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: 'City not found. Please check the city name.' });
  });
});
