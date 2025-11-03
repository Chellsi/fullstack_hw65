import { Router } from 'express';
import { connectToDatabase, MongoConfigurationError } from '../config/database.js';

const atlasRouter = Router();

atlasRouter.get('/data', async (req, res, next) => {
  const theme = req.cookies.theme || 'light';
  const viewModel = {
    title: 'Дані з MongoDB Atlas',
    theme,
    user: req.user,
    documents: [],
    collectionName: process.env.MONGODB_COLLECTION || 'samples',
    error: null
  };

  try {
    const { db } = await connectToDatabase();
    const documents = await db
      .collection(viewModel.collectionName)
      .find({})
      .limit(25)
      .toArray();

    viewModel.documents = documents;
    res.render('atlas/index', viewModel);
  } catch (error) {
    if (error instanceof MongoConfigurationError) {
      viewModel.error = error.message;
      res.status(500).render('atlas/index', viewModel);
      return;
    }

    if (error.name === 'MongoServerSelectionError') {
      viewModel.error = 'Не вдалося підключитися до MongoDB Atlas. Перевірте параметри підключення.';
      res.status(502).render('atlas/index', viewModel);
      return;
    }

    next(error);
  }
});

export default atlasRouter;
