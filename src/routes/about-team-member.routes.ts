import { Router } from 'express';
import AboutTeamMemberController from '../controllers/about-team-member.controller';
import { verifyCoreToken } from '../middleware/auth.middleware';
import {
  validateAboutTeamMemberCreateMiddleware,
  validateAboutTeamMemberDeleteMiddleware,
  validateAboutTeamMemberDetailMiddleware,
  validateAboutTeamMemberListQuery,
  validateAboutTeamMemberSortMiddleware,
  validateAboutTeamMemberUpdateMiddleware,
} from '../validation/about-team-member.validation';

const router = Router();
const aboutTeamMemberController = new AboutTeamMemberController();

router.get(
  '/landing',
  aboutTeamMemberController.listAboutTeamMembersLanding.bind(aboutTeamMemberController)
);

router.get(
  '/',
  verifyCoreToken,
  validateAboutTeamMemberListQuery,
  aboutTeamMemberController.listAboutTeamMembersCms.bind(aboutTeamMemberController)
);

router.get(
  '/:id',
  verifyCoreToken,
  validateAboutTeamMemberDetailMiddleware,
  aboutTeamMemberController.detailAboutTeamMember.bind(aboutTeamMemberController)
);

router.post(
  '/',
  verifyCoreToken,
  validateAboutTeamMemberCreateMiddleware,
  aboutTeamMemberController.createAboutTeamMember.bind(aboutTeamMemberController)
);

router.put(
  '/sort',
  verifyCoreToken,
  validateAboutTeamMemberSortMiddleware,
  aboutTeamMemberController.sortAboutTeamMembers.bind(aboutTeamMemberController)
);

router.put(
  '/:id',
  verifyCoreToken,
  validateAboutTeamMemberUpdateMiddleware,
  aboutTeamMemberController.updateAboutTeamMember.bind(aboutTeamMemberController)
);

router.delete(
  '/:id',
  verifyCoreToken,
  validateAboutTeamMemberDeleteMiddleware,
  aboutTeamMemberController.deleteAboutTeamMember.bind(aboutTeamMemberController)
);

export default router;

