import { Router } from 'express';
import TrainingScheduleController from '../controllers/training-schedule.controller';
import { verifyCoreToken } from '../middleware/auth.middleware';
import {
  validateTrainingScheduleCreateMiddleware,
  validateTrainingScheduleDeleteMiddleware,
  validateTrainingScheduleDetailMiddleware,
  validateTrainingScheduleListQuery,
  validateTrainingScheduleSortMiddleware,
  validateTrainingScheduleUpdateMiddleware,
} from '../validation/training-schedule.validation';

const router = Router();
const trainingScheduleController = new TrainingScheduleController();

router.get('/landing', trainingScheduleController.listTrainingSchedulesLanding.bind(trainingScheduleController));

router.get(
  '/',
  verifyCoreToken,
  validateTrainingScheduleListQuery,
  trainingScheduleController.listTrainingSchedulesCms.bind(trainingScheduleController)
);

router.get(
  '/:id',
  verifyCoreToken,
  validateTrainingScheduleDetailMiddleware,
  trainingScheduleController.detailTrainingSchedule.bind(trainingScheduleController)
);

router.post(
  '/',
  verifyCoreToken,
  validateTrainingScheduleCreateMiddleware,
  trainingScheduleController.createTrainingSchedule.bind(trainingScheduleController)
);

router.put(
  '/sort',
  verifyCoreToken,
  validateTrainingScheduleSortMiddleware,
  trainingScheduleController.sortTrainingSchedules.bind(trainingScheduleController)
);

router.put(
  '/:id',
  verifyCoreToken,
  validateTrainingScheduleUpdateMiddleware,
  trainingScheduleController.updateTrainingSchedule.bind(trainingScheduleController)
);

router.delete(
  '/:id',
  verifyCoreToken,
  validateTrainingScheduleDeleteMiddleware,
  trainingScheduleController.deleteTrainingSchedule.bind(trainingScheduleController)
);

export default router;

