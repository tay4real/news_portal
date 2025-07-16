const router = require('express').Router();
const newsController = require('../controllers/newsController');
const middleware = require('../middlewares/middleware');
const {
  validateAddNews,
  validateUpdateNewsStatus,
  validateNewsSearch,
  validateUpdateNews,
} = require('../middlewares/validation');

// Dashboard Routes (auth required)
router.post(
  '/api/news',
  middleware.auth,
  validateAddNews,
  newsController.addNews
);

router.put(
  '/api/news/:news_id',
  middleware.auth,
  validateUpdateNews,
  newsController.updateNews
);
router.patch(
  '/api/news/:news_id/status',
  middleware.auth,
  validateUpdateNewsStatus,
  newsController.updateNewsStatus
);
router.get(
  '/api/gallery/images',
  middleware.auth,
  newsController.getGalleryImages
);
router.post('/api/gallery/images', middleware.auth, newsController.addImages);

router.get('/api/news', middleware.auth, newsController.getDashboardNews);
router.get(
  '/api/news/:news_id',
  middleware.auth,
  newsController.getDashboardSingleNews
);

// Website Routes (public)
router.get('/api/all/news', newsController.getAllNews);
router.get('/api/popular/news', newsController.getPopularNews);
router.get('/api/latest/news', newsController.getLatestNews);
router.get('/api/images/news', newsController.getRandomImages);
router.get('/api/recent/news', newsController.getRecentNews);
router.get('/api/news/:slug', newsController.getNews);
router.get('/api/category/all', newsController.getCategories);
router.get('/api/category/news/:category', newsController.getCategoryNews);
router.get('/api/search/news', validateNewsSearch, newsController.newsSearch);

module.exports = router;
