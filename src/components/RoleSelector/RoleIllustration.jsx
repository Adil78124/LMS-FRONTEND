import React, { useId } from 'react';

const SchoolkidSvg = () => {
  const id = useId().replace(/:/g, '');
  return (
  <svg viewBox="0 0 200 200" className="role-illustration__svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`grad-schoolkid-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C9A88E" />
        <stop offset="100%" stopColor="#D4B5A0" />
      </linearGradient>
    </defs>
    <g transform="translate(100, 100)">
      <ellipse cx="0" cy="-25" rx="35" ry="40" fill={`url(#grad-schoolkid-${id})`} opacity="0.9" />
      <rect x="-20" y="15" width="40" height="55" rx="8" fill={`url(#grad-schoolkid-${id})`} opacity="0.85" />
      <rect x="-35" y="25" width="25" height="35" rx="4" fill={`url(#grad-schoolkid-${id})`} opacity="0.7" transform="rotate(-15 -35 25)" />
      <circle cx="-15" cy="-35" r="8" fill="#2C2418" opacity="0.6" />
      <path d="M-5 -50 Q0 -70 15 -65" stroke={`url(#grad-schoolkid-${id})`} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
  </svg>
  );
};

const StudentSvg = () => {
  const id = useId().replace(/:/g, '');
  return (
  <svg viewBox="0 0 200 200" className="role-illustration__svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`grad-student-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8967A" />
        <stop offset="100%" stopColor="#C9A88E" />
      </linearGradient>
    </defs>
    <g transform="translate(100, 100)">
      <ellipse cx="0" cy="-30" rx="32" ry="38" fill={`url(#grad-student-${id})`} opacity="0.9" />
      <rect x="-18" y="8" width="36" height="50" rx="6" fill={`url(#grad-student-${id})`} opacity="0.85" />
      <rect x="-40" y="20" width="50" height="35" rx="4" fill={`url(#grad-student-${id})`} opacity="0.6" transform="rotate(-5 -40 20)" />
      <line x1="-25" y1="35" x2="25" y2="35" stroke="#2C2418" strokeWidth="2" opacity="0.3" />
      <line x1="-20" y1="42" x2="20" y2="42" stroke="#2C2418" strokeWidth="1" opacity="0.2" />
      <circle cx="-10" cy="-38" r="7" fill="#2C2418" opacity="0.5" />
    </g>
  </svg>
  );
};

const TeacherSvg = () => {
  const id = useId().replace(/:/g, '');
  return (
  <svg viewBox="0 0 200 200" className="role-illustration__svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`grad-teacher-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A68368" />
        <stop offset="100%" stopColor="#B8967A" />
      </linearGradient>
    </defs>
    <g transform="translate(100, 100)">
      <ellipse cx="0" cy="-28" rx="30" ry="36" fill={`url(#grad-teacher-${id})`} opacity="0.9" />
      <rect x="-22" y="8" width="44" height="55" rx="6" fill={`url(#grad-teacher-${id})`} opacity="0.85" />
      <path d="M-30 20 L30 20 L25 65 L-25 65 Z" fill={`url(#grad-teacher-${id})`} opacity="0.5" transform="rotate(3 0 42)" />
      <line x1="-20" y1="30" x2="20" y2="30" stroke="#2C2418" strokeWidth="2" opacity="0.3" />
      <line x1="-15" y1="38" x2="15" y2="38" stroke="#2C2418" strokeWidth="1" opacity="0.2" />
      <path d="M0 -45 L0 -70 M-8 -55 L8 -55" stroke={`url(#grad-teacher-${id})`} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <circle cx="-8" cy="-35" r="6" fill="#2C2418" opacity="0.5" />
    </g>
  </svg>
  );
};

export const RoleIllustration = ({ role }) => {
  switch (role) {
    case 'schoolkid':
      return <SchoolkidSvg />;
    case 'student':
      return <StudentSvg />;
    case 'teacher':
      return <TeacherSvg />;
    default:
      return null;
  }
};
