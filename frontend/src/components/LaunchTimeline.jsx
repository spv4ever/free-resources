import React from 'react';
import '../styles/LaunchTimeline.css';
import {
  Clock,
  Rocket,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Activity
} from 'lucide-react';

const getIcon = (abbrev = '') => {
  const map = {
    'Liftoff': <Rocket size={20} />,
    'Ignition': <Zap size={20} />,
    'GO': <CheckCircle size={20} />,
    'MECO': <Activity size={20} />,
    'SECO': <Activity size={20} />,
    'Payload': <Info size={20} />,
    'Max-Q': <AlertCircle size={20} />,
  };

  return map[abbrev] || <Clock size={20} />;
};

function formatRelativeTime(code) {
      if (!code) return '';
      if (code === 'P0D') return 'T 0';

      const isNegative = code.startsWith('-');
      const clean = code.replace('-', '').replace('PT', '');

      const match = clean.match(/(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return code;

      const [, hours, minutes, seconds] = match.map(v => parseInt(v) || 0);

      let result = `T ${isNegative ? '-' : '+'}`;
      if (hours) result += `${hours} h `;
      if (minutes) result += `${minutes} min `;
      if (seconds) result += `${seconds} s`;

      return result.trim() || 'T 0';
    }


const LaunchTimeline = ({ timeline = [], isPast = false }) => {
  return (
    <div className="launch-timeline">
      {timeline.map((event, index) => (
        <div className="timeline-item" key={index}>
          <div className="timeline-dot" />
          <div className="timeline-type">
            {getIcon(event.type?.abbrev)}
            <span>{event.type?.abbrev || 'Evento'}</span>
          </div>
          <div className="timeline-description">
            {event.type?.description || 'Sin descripción'}
          </div>
          <div className="timeline-time">{formatRelativeTime(event.relative_time)}</div>
        </div>
      ))}
    </div>
  );
};

export default LaunchTimeline;
