import { asyncHandler } from '@/utils/asyncHandler';
import { apiSuccess } from '@/utils/ApiError';
import { getMyProfileService, updateMyProfileService } from '@/services/profile.service';
import type { UpdateProfileDTO } from '@/validators/profile.schema';

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await getMyProfileService(req.user!.id);
  res.status(200).json(apiSuccess(200, 'Profile retrieved', profile));
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const data = req.validated!.body as UpdateProfileDTO;
  const updated = await updateMyProfileService(req.user!.id, data);
  res.status(200).json(apiSuccess(200, 'Profile updated', updated));
});
