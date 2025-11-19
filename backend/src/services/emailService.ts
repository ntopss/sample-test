import nodemailer from 'nodemailer';
import { InterviewWithCandidate } from '../models/interview';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.office365.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const emailService = {
  async sendInterviewReminder(interview: InterviewWithCandidate): Promise<void> {
    const scheduledDate = new Date(interview.scheduled_date);
    const dateStr = scheduledDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
    const timeStr = scheduledDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: interview.interviewer_email,
      subject: `[면접 안내] 내일 ${timeStr} ${interview.candidate_name} 님 면접 운영 안내`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>안녕하세요, ${interview.interviewer_name}님</h2>
          <p>내일 면접 일정을 안내드립니다.</p>

          <div style="border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 20px; margin: 20px 0;">
            <p><strong>일시:</strong> ${dateStr} ${timeStr}</p>
            <p><strong>지원자:</strong> ${interview.candidate_name}</p>
            <p><strong>직무:</strong> ${interview.candidate_position}</p>
          </div>

          <div style="margin: 30px 0;">
            ${interview.candidate_resume_url ? `
              <p>
                📄 <a href="${interview.candidate_resume_url}" style="color: #0066cc; text-decoration: none;">
                  이력서 보기
                </a>
              </p>
            ` : ''}
            <p>
              🎯 <a href="${frontendUrl}/admin/interviews/${interview.id}/questions" style="color: #0066cc; text-decoration: none;">
                면접 질문 미리 선택하기
              </a>
            </p>
          </div>

          <p style="color: #666; font-size: 14px;">
            * 질문을 미리 선택해두시면 당일 태블릿에서 바로 확인하실 수 있습니다.
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Interview reminder sent to ${interview.interviewer_email}`);
    } catch (error) {
      console.error('Failed to send interview reminder:', error);
      throw error;
    }
  },

  async sendFeedbackSurvey(interview: InterviewWithCandidate): Promise<void> {
    // In a real scenario, you would get the candidate's email from the database
    // For now, we'll just log this
    const surveyUrl = `${frontendUrl}/survey/${interview.id}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: 'candidate@example.com', // Should be from candidate data
      subject: '[T&L] 면접에 대한 의견을 들려주세요',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${interview.candidate_name} 님, 안녕하세요.</h2>
          <p>오늘 면접에 참여해주셔서 감사합니다.</p>
          <p>더 나은 채용 프로세스를 위해 솔직한 의견 부탁드립니다.</p>
          <p style="color: #666;">(소요 시간: 2분)</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${surveyUrl}" style="background-color: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              설문 시작하기
            </a>
          </div>

          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
            <p style="font-weight: bold;">설문 내용:</p>
            <ol>
              <li>면접관의 태도는 어떠셨나요? (1-5점)</li>
              <li>질문이 직무와 관련성이 있었나요? (1-5점)</li>
              <li>회사에 대한 인상은? (1-5점)</li>
              <li>개선이 필요한 부분이 있다면? (자유 서술)</li>
            </ol>
          </div>
        </div>
      `
    };

    try {
      console.log(`Feedback survey would be sent to candidate (${interview.candidate_name})`);
      // await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send feedback survey:', error);
    }
  }
};
