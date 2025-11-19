import { useEffect, useState } from 'react';

function Timer() {
  const [elapsed, setElapsed] = useState(0);
  const [reminded30, setReminded30] = useState(false);
  const [reminded45, setReminded45] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const minutes = Math.floor(elapsed / 60);

    if (minutes >= 30 && !reminded30) {
      setReminded30(true);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('면접 시간 알림', {
          body: '30분이 경과했습니다.'
        });
      }
    }

    if (minutes >= 45 && !reminded45) {
      setReminded45(true);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('면접 시간 알림', {
          body: '45분이 경과했습니다.'
        });
      }
    }
  }, [elapsed, reminded30, reminded45]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div>
      <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>⏱️ 경과 시간</h3>
      <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#0066cc' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <p>⏰ 리마인드:</p>
        <p style={{ marginTop: '5px' }}>
          {reminded30 ? '✅' : '⬜'} 30분 {reminded45 ? '✅' : '⬜'} 45분
        </p>
      </div>
    </div>
  );
}

export default Timer;
