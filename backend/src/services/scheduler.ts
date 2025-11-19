import cron from 'node-cron';
import { InterviewModel } from '../models/interview';
import { emailService } from './emailService';

export function initializeScheduler() {
  // Run every day at 9:00 AM to check for interviews tomorrow
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily interview reminder check...');

    try {
      const interviews = InterviewModel.findByStatus('scheduled');

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      for (const interview of interviews) {
        const scheduledDate = new Date(interview.scheduled_date);

        // Check if interview is tomorrow (D-1)
        if (scheduledDate >= tomorrow && scheduledDate < dayAfterTomorrow) {
          console.log(`Sending D-1 reminder for interview ${interview.id}`);
          await emailService.sendInterviewReminder(interview);
        }
      }
    } catch (error) {
      console.error('Error in scheduler:', error);
    }
  });

  console.log('Scheduler initialized - will check for D-1 interviews daily at 9:00 AM');
}
