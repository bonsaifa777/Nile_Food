import express from 'express';
import Table from '../models/Table.js';
import QRCode from 'qrcode';
import { apiResponse, generateTableQRCode } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = { isActive: true };
    if (status) query.status = status;
    const tables = await Table.find(query).sort({ tableNumber: 1 });
    res.json(apiResponse(true, '', tables));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch tables'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json(apiResponse(false, 'Table not found'));
    }
    res.json(apiResponse(true, '', table));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch table'));
  }
});

router.get('/qr/:tableId', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableId });
    if (!table) {
      return res.status(404).json(apiResponse(false, 'Table not found'));
    }
    const qrData = generateTableQRCode(table.tableNumber, 'nilefood');
    const qrImage = await QRCode.toDataURL(qrData);
    res.json(apiResponse(true, '', { qrImage, table }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to generate QR code'));
  }
});

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { tableNumber, capacity, floor } = req.body;
    const existing = await Table.findOne({ tableNumber });
    if (existing) {
      return res.status(400).json(apiResponse(false, 'Table number already exists'));
    }
    const table = new Table({ tableNumber, capacity, floor });
    await table.save();
    res.status(201).json(apiResponse(true, 'Table created', table));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create table'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) {
      return res.status(404).json(apiResponse(false, 'Table not found'));
    }
    res.json(apiResponse(true, 'Table updated', table));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update table'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!table) {
      return res.status(404).json(apiResponse(false, 'Table not found'));
    }
    res.json(apiResponse(true, 'Table deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete table'));
  }
});

export default router;