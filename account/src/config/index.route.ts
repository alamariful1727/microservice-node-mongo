import express, { Router } from 'express';
import { accountRoutes } from '../routes/route';

const router: Router = express.Router();

router.use('/accounts', accountRoutes);

export const rootRoute = router;
