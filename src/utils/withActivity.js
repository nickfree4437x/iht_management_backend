import { logActivity } from "./activityLogger.js";

export const withActivity = (handler, activityConfig) => {
  return async (req, res, next) => {
    try {

      const originalJson = res.json;

      res.json = function (data) {

        const entityId =
          data?.deletedId || req.params?.id || null;

        if (activityConfig) {
          const { type, getMessage, entityType } = activityConfig;

          logActivity({
            type,
            message: getMessage(req),
            entityId,
            entityType,
          });
        }

        return originalJson.call(this, data);
      };

      await handler(req, res, next);

    } catch (error) {
      next(error);
    }
  };
};