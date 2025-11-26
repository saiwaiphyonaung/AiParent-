import type React from 'react';

export interface AgeGroup {
  id: string;
  label: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export interface HealthRecord {
  id: number;
  date: string;
  ageGroup: string;
  weight: number;
  height: number;
  bmi: number;
}

export interface QuickTip {
  question: string;
  answer: string;
}