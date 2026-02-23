import React from 'react';
import { IconCheck } from '../UI/Icons/Icons';
import './Stepper.css';

const Stepper = ({ steps, currentStep }) => {
  return (
    <nav className="stepper" aria-label="Шаги создания курса">
      <ol className="stepper__list">
        {steps.map((label, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          return (
            <li
              key={step}
              className={`stepper__item ${isActive ? 'stepper__item--active' : ''} ${isCompleted ? 'stepper__item--completed' : ''}`}
            >
              <span className="stepper__number" aria-current={isActive ? 'step' : undefined}>
                {isCompleted ? <IconCheck size={14} /> : step}
              </span>
              <span className="stepper__label">{label}</span>
              {index < steps.length - 1 && <span className="stepper__line" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
