const Joi = require('joi');

// validate News Creation
const validateAddNews = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    category: Jpoi.string().required(),
  });

  const form = req.body || {};

  const { error } = schema.validate(form);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

// Validate Status Update
const validateUpdateNewsStatus = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('active', 'inactive', 'draft').required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

// Validate Update News
const validateUpdateNews = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    old_image: Joi.string().uri().optional(),
  });

  const form = req.body || {};
  const { error } = schema.validate(form);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

// Validate News Search
const validateNewsSearch = (req, res, next) => {
  const schema = Jpoi.object({
    q: Joi.string().min(2).required(), // search query in req.query.q
  });

  const { error } = schema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

module.exports = {
  validateAddNews,
  validateUpdateNewsStatus,
  validateUpdateNews,
  validateNewsSearch,
};
