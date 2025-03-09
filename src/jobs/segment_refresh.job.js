const CustomerSegment = require("../models/customer_segment_model");
const {
  processSegment,
} = require("../modules/segmentation/segment.controllers");
const { logger } = require("../middlewares/logger");
const { addJob } = require("../config/queue");

/**
 * Job to refresh segments that have auto-refresh enabled
 */
const refreshSegmentsJob = async () => {
  try {
    logger.info("Starting segment refresh job");

    const now = new Date();
    const hourOfDay = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get segments that need to be refreshed
    const segments = await CustomerSegment.find({
      status: "active",
      "auto_refresh.enabled": true,
    });

    logger.info(`Found ${segments.length} segments with auto-refresh enabled`);

    // Process each segment based on its refresh frequency
    for (const segment of segments) {
      try {
        const { frequency } = segment.auto_refresh;

        // Check if segment should be refreshed based on frequency
        let shouldRefresh = false;

        if (frequency === "hourly") {
          shouldRefresh = true;
        } else if (frequency === "daily" && hourOfDay === 1) {
          // Run daily at 1 AM
          shouldRefresh = true;
        } else if (
          frequency === "weekly" &&
          dayOfWeek === 1 &&
          hourOfDay === 1
        ) {
          // Run weekly on Monday at 1 AM
          shouldRefresh = true;
        }

        if (shouldRefresh) {
          // Add segment refresh job to queue
          await addJob(
            "segmentRefresh",
            "processSegment",
            { segmentId: segment._id.toString() },
            {
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 5000,
              },
            }
          );

          logger.info(`Queued refresh for segment: ${segment.name}`);
        }
      } catch (error) {
        logger.error(
          `Error processing segment ${segment._id}: ${error.message}`
        );
      }
    }

    logger.info("Segment refresh job completed");
  } catch (error) {
    logger.error(`Segment refresh job error: ${error.message}`);
  }
};

/**
 * Process a single segment (worker function)
 * @param {Object} job - BullMQ job object
 */
const processSegmentWorker = async (job) => {
  const { segmentId } = job.data;

  logger.info(`Processing segment refresh for segment ID: ${segmentId}`);

  try {
    await processSegment(segmentId);
    logger.info(`Successfully refreshed segment ID: ${segmentId}`);
    return { success: true, segmentId };
  } catch (error) {
    logger.error(`Error refreshing segment ${segmentId}: ${error.message}`);
    throw error; // Rethrow to trigger job failure
  }
};

module.exports = {
  refreshSegmentsJob,
  processSegmentWorker,
};
