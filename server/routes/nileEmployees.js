import express from 'express';
import NileEmployee from '../models/NileEmployee.js';
import uploadEmployeeDocs from '../middleware/employeeUpload.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

const pickFiles = (req) => {
  const files = req.files || {};
  return {
    avatar: files.avatar?.[0]?.filename || null,
    nationalIdFront: files.nationalIdFront?.[0]?.filename || null,
    nationalIdBack: files.nationalIdBack?.[0]?.filename || null,
    experienceDocument: files.experienceDocument?.[0]?.filename || null
  };
};

const runUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadEmployeeDocs(req, res, (err) => (err ? reject(err) : resolve()));
  });

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const query = { isActive: true };
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: regex },
        { email: regex },
        { employeeCode: regex },
        { position: regex },
        { phone: regex }
      ];
    }
    if (department) query.department = department;
    if (status) query.status = status;
    const employees = await NileEmployee.find(query).sort({ createdAt: -1 });
    res.json(apiResponse(true, '', employees));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch employees'));
  }
});

router.get('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const employee = await NileEmployee.findById(req.params.id);
    if (!employee) return res.status(404).json(apiResponse(false, 'Employee not found'));
    res.json(apiResponse(true, '', employee));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch employee'));
  }
});

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    await runUpload(req, res);
    const { avatar, nationalIdFront, nationalIdBack, experienceDocument } = pickFiles(req);
    const body = req.body || {};
    const payload = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      position: body.position,
      department: body.department || 'General',
      gender: body.gender || 'Male',
      dateOfBirth: body.dateOfBirth || undefined,
      address: body.address || '',
      city: body.city || '',
      emergencyContact: {
        name: body.emergencyName || '',
        phone: body.emergencyPhone || '',
        relationship: body.emergencyRelationship || ''
      },
      employmentType: body.employmentType || 'Full-time',
      monthlySalary: Number(body.monthlySalary || 0),
      hireDate: body.hireDate || Date.now(),
      status: body.status || 'Active',
      nationalId: {
        number: body.nationalIdNumber,
        frontImage: nationalIdFront || '',
        backImage: nationalIdBack || ''
      },
      experienceDocument: experienceDocument || '',
      avatar: avatar || '',
      notes: body.notes || ''
    };
    const employee = new NileEmployee(payload);
    await employee.save();
    res.status(201).json(apiResponse(true, 'Employee created', employee));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(apiResponse(false, 'Employee code collision, please retry'));
    }
    if (error.message?.includes('Only image files')) {
      return res.status(400).json(apiResponse(false, error.message));
    }
    res.status(500).json(apiResponse(false, 'Failed to create employee'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    await runUpload(req, res);
    const employee = await NileEmployee.findById(req.params.id);
    if (!employee) return res.status(404).json(apiResponse(false, 'Employee not found'));
    const { avatar, nationalIdFront, nationalIdBack, experienceDocument } = pickFiles(req);
    const body = req.body || {};

    const usable = (field) => field === 'undefined' || field === '' || field === undefined || field === null ? undefined : field;

    const updates = {
      name: usable(body.name) ?? employee.name,
      email: usable(body.email) ?? employee.email,
      phone: usable(body.phone) ?? employee.phone,
      position: usable(body.position) ?? employee.position,
      department: usable(body.department) ?? employee.department,
      gender: usable(body.gender) ?? employee.gender,
      dateOfBirth: usable(body.dateOfBirth) ?? employee.dateOfBirth,
      address: usable(body.address) ?? employee.address,
      city: usable(body.city) ?? employee.city,
      employmentType: usable(body.employmentType) ?? employee.employmentType,
      monthlySalary: usable(body.monthlySalary) !== undefined ? Number(body.monthlySalary) : employee.monthlySalary,
      hireDate: usable(body.hireDate) ?? employee.hireDate,
      status: usable(body.status) ?? employee.status,
      notes: usable(body.notes) ?? employee.notes,
      emergencyContact: {
        name: usable(body.emergencyName) ?? employee.emergencyContact?.name,
        phone: usable(body.emergencyPhone) ?? employee.emergencyContact?.phone,
        relationship: usable(body.emergencyRelationship) ?? employee.emergencyContact?.relationship
      },
      nationalId: {
        number: usable(body.nationalIdNumber) ?? employee.nationalId?.number,
        frontImage: nationalIdFront || employee.nationalId?.frontImage || '',
        backImage: nationalIdBack || employee.nationalId?.backImage || ''
      },
      experienceDocument: experienceDocument || employee.experienceDocument || '',
      avatar: avatar || employee.avatar || ''
    };

    Object.assign(employee, updates);
    await employee.save();
    res.json(apiResponse(true, 'Employee updated', employee));
  } catch (error) {
    if (error.message?.includes('Only image files')) {
      return res.status(400).json(apiResponse(false, error.message));
    }
    res.status(500).json(apiResponse(false, 'Failed to update employee'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const employee = await NileEmployee.findById(req.params.id);
    if (!employee) return res.status(404).json(apiResponse(false, 'Employee not found'));
    employee.isActive = false;
    await employee.save();
    res.json(apiResponse(true, 'Employee removed'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to remove employee'));
  }
});

export default router;