
import express from 'express';
import { requireAuth, requireRole, requirePermission } from '../middleware/auth.middleware';
import { successResponse } from '../utils/response';

const router = express.Router();

// Example 1: Only authenticated users can access
router.get('/protected', requireAuth, (req, res) => {
  return successResponse(res, { user: req.user }, 'Protected route accessed successfully');
});

// Example 2: Only ADMIN and SUPER_ADMIN can access
router.get('/admin-only', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res) => {
  return successResponse(res, { user: req.user }, 'Admin-only route accessed successfully');
});

// Example 3: Only users with CREATE_PRODUCT permission can access
router.post('/products', requireAuth, requirePermission('CREATE_PRODUCT'), (req, res) => {
  return successResponse(res, { product: req.body }, 'Product created (example)');
});

// Example 4: Only users with UPDATE_PRODUCT or DELETE_PRODUCT can access
router.put('/products/:id', requireAuth, requirePermission('UPDATE_PRODUCT', 'DELETE_PRODUCT'), (req, res) => {
  return successResponse(res, { productId: req.params.id }, 'Product updated (example)');
});

export default router;
