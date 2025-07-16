const { formidable } = require('formidable');
const cloudinary = require('../utils/cloudinaryConfig');
const newsModel = require('../models/newsModel');
const galleryModel = require('../models/galleryModel');
const {
  mongo: { ObjectId },
} = require('mongoose');
const dayjs = require('dayjs');
const { CLOUDINARY_FOLDER } = require('../utils/constants');

// Helper to parse form with promise
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    formidable().parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve([fields, files]);
    });
  });

class newsController {
  async addNews(req, res) {
    const { id, category, name } = req.userInfo;

    try {
      const { fields, files } = await parseForm(req);
      const { url } = await cloudinary.uploader.upload(
        files.image[0].filepath,
        {
          folder: CLOUDINARY_FOLDER,
        }
      );

      const title = fields.title[0].trim();
      const description = fields.description[0];

      const news = await newsModel.create({
        writerId: id,
        title: title[0].trim(),
        slug: title.split(' ').join('-'),
        category,
        description,
        date: dayjs().format('LL'),
        writerName: name,
        image: url,
      });
      return res.status(201).json({ message: 'News added successfully', news });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateNews(req, res) {
    const { news_id } = req.params;
    const { id } = req.userInfo;

    try {
      const { fields, files } = await parseForm(req);
      let url = fields.old_image[0];

      if (files.new_image) {
        const oldPublicId = url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(oldPublicId);
        const data = await cloudinary.uploader.upload(
          files.new_image[0].filepath,
          {
            folder: CLOUDINARY_FOLDER,
          }
        );
        url = data.url;
      }

      const title = fields.title[0].trim();
      const description = fields.description[0];

      const news = await newsModel.findByIdAndUpdate(
        news_id,
        {
          title,
          slug: title.split(' ').join('-'),
          description,
          image: url,
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ message: 'News updated successfully', news });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateNewsStatus(req, res) {
    const { news_id } = req.params;
    const { status } = req.body;
    const { role } = req.userInfo;

    if (role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const news = await newsModel.findByIdAndUpdate(
        news_id,
        { status },
        { new: true }
      );
      return res.status(200).json({ message: 'Status updated', news });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async addImages(req, res) {
    const { id } = req.userInfo;

    try {
      const { files } = await parseForm(req);
      const { images } = files;
      const imageUploads = [];

      for (const file of images) {
        const { url } = await cloudinary.uploader.upload(file.filepath, {
          folder: CLOUDINARY_FOLDER,
        });
        imageUploads.push({ writerId: id, url });
      }

      const savedImages = await galleryModel.insertMany(imageUploads);

      return res
        .status(201)
        .json({ images: savedImages, message: 'Upload successful' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getGalleryImages(req, res) {
    const { id } = req.userInfo;

    try {
      const images = await galleryModel
        .find({ writerId: new ObjectId(id) })
        .sort({ createdAt: -1 });
      return res.status(201).json({ images });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDashboardNews(req, res) {
    const { id, role } = req.userInfo;

    try {
      const filter = role === 'admin' ? {} : { writerId: new ObjectId(id) };
      const news = await newsModel.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({ news });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDashboardSingleNews(req, res) {
    const { news_id } = req.params;

    try {
      const news = await newsModel.findById(news_id);
      return res.status(200).json({ news });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // website

  async getAllNews(req, res) {
    try {
      const result = await newsModel.aggregate([
        {
          $match: {
            status: 'active',
          },
        },
        {
          $sort: { createdAt: -1 },
        },

        {
          $group: {
            _id: '$category',
            news: {
              $push: {
                _id: '$_id',
                title: '$title',
                slug: '$slug',
                writerName: '$writerName',
                image: '$image',
                description: '$description',
                date: '$date',
                category: '$category',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            news: {
              $slice: ['$news', 5],
            },
          },
        },
      ]);

      const news = {};

      for (const item of result) {
        news[item.category] = item.news;
      }

      res.status(200).json({ news });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getNews(req, res) {
    const { slug } = req.params;

    try {
      const news = await newsModel.findOneAndUpdate(
        { slug },
        { $inc: { count: 1 } },
        { new: true }
      );
      const relateNews = await newsModel
        .find({
          $and: [
            {
              slug: {
                $ne: slug,
              },
            },
            {
              category: news.category,
            },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(4);

      return res.status(200).json({ news, relateNews });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await newsModel.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
          },
        },
      ]);

      res.status(200).json({ categories });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPopularNews(req, res) {
    try {
      const popularNews = await newsModel
        .find({ status: 'active' })
        .sort({ count: -1 })
        .limit(4);
      return res.status(200).json({ popularNews });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getLatestNews(req, res) {
    try {
      const news = await newsModel
        .find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(6);
      return res.status(200).json({ news });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRandomImages(req, res) {
    try {
      const images = await newsModel.aggregate([
        {
          $match: {
            status: 'active',
          },
        },
        {
          $sample: {
            size: 9,
          },
        },
        {
          $project: {
            image: 1,
          },
        },
      ]);

      return res.status(200).json({ images });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRecentNews(req, res) {
    try {
      const news = await newsModel
        .find({ status: 'active' })
        .sort({ createdAt: -1 })
        .skip(6)
        .limit(6);
      return res.status(201).json({ news });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCategoryNews(req, res) {
    const { category } = req.params;

    try {
      const news = await newsModel.find({
        $and: [
          {
            category: {
              $eq: category,
            },
          },
          {
            status: {
              $eq: 'active',
            },
          },
        ],
      });
      return res.status(201).json({ news });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async newsSearch(req, res) {
    const { value } = req.query;
    try {
      const news = await newsModel.find({
        status: 'active',
        $text: {
          $search: value,
        },
      });
      return res.status(201).json({ news });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new newsController();
