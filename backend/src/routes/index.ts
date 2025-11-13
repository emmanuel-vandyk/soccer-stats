// ============================================
// MAIN ROUTES INDEX
// Centralized route configuration
// ============================================

import { Router } from 'express';
import authRoutes from './authRoutes';
import playerRoutes from './playerRoutes';
import fifaPlayerRoutes from './fifaPlayerRoutes';
import proxyRoutes from './proxyRoutes';
// import exportRoutes from './exportRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/fifa-players', fifaPlayerRoutes);
router.use('/proxy', proxyRoutes);
// router.use('/export', exportRoutes);

export default router;