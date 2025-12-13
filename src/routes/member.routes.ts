import { Router } from 'express';
import MemberController from '../controllers/member.controller';
import { uploadSingle, uploadExcel } from '../config/multer';
import { 
  validateMemberCreateMiddleware, 
  validateMemberUpdateMiddleware, 
  validateMemberDeleteMiddleware,
  validateMemberGetByIdMiddleware,
  validateMemberListQuery,
  validateMemberLoadMoreQuery,
  validateMemberCreateUserMiddleware,
  handleMemberMulterError,
  handleExcelMulterError,
  validateMemberImportMiddleware
} from '../validation/member.validation';
import { verifyCoreToken } from '../middleware/auth.middleware';

const router = Router();
const memberController = new MemberController();

// Member routes
router.get('/', verifyCoreToken, validateMemberListQuery, memberController.getAllMembers.bind(memberController)); // Get all members with pagination
router.get('/load-more', verifyCoreToken, validateMemberLoadMoreQuery, memberController.loadMoreMembers.bind(memberController)); // Load more members with cursor
router.get('/:id', verifyCoreToken, validateMemberGetByIdMiddleware, memberController.getMemberById.bind(memberController)); // Get member by ID
router.post('/', verifyCoreToken, uploadSingle('photo'), handleMemberMulterError, validateMemberCreateMiddleware, memberController.createMember.bind(memberController)); // Create new member
router.put('/:id', verifyCoreToken, uploadSingle('photo'), handleMemberMulterError, validateMemberUpdateMiddleware, memberController.updateMember.bind(memberController)); // Update member
router.delete('/:id', verifyCoreToken, validateMemberDeleteMiddleware, memberController.deleteMember.bind(memberController)); // Delete member
router.post(
  '/create-user/:id',
  verifyCoreToken,
  validateMemberCreateUserMiddleware,
  memberController.createMemberUser.bind(memberController)
);

// Import members from excel
router.post(
  '/import-excel', 
  verifyCoreToken, 
  uploadExcel('file'), 
  handleExcelMulterError, 
  validateMemberImportMiddleware, 
  memberController.importMembers.bind(memberController)
);

export default router;

