import React from 'react';
import type { Topic } from './types';
import { HeartIcon, BookOpenIcon, BeakerIcon, PuzzlePieceIcon, CubeTransparentIcon, ClipboardDocumentListIcon } from './components/IconComponents';

export const AGE_GROUPS = [
  { id: '0-1', label: '0 - 1 Year' },
  { id: '1-3', label: '1 - 3 Years' },
  { id: '3-5', label: '3 - 5 Years' },
  { id: '6-8', label: '6 - 8 Years' },
  { id: '9-12', label: '9 - 12 Years' },
  { id: '13-16', label: '13 - 16+ Years' },
];

export const TOPICS: Topic[] = [
  {
    id: 'care',
    title: 'Health & Daily Care',
    description: 'Guidance on sleep, hygiene, and wellness routines.',
    icon: HeartIcon,
    color: 'rose',
  },
  {
    id: 'food',
    title: 'Food & Nutrition',
    description: 'Tips for balanced meals, feeding schedules, and healthy eating habits.',
    icon: BeakerIcon,
    color: 'amber',
  },
  {
    id: 'teaching',
    title: 'Learning & Education',
    description: 'Strategies for cognitive development, learning activities, and school readiness.',
    icon: BookOpenIcon,
    color: 'indigo',
  },
  {
    id: 'behavior',
    title: 'Behavior & Social Skills',
    description: 'Advice on managing emotions, discipline, and building social connections.',
    icon: PuzzlePieceIcon,
    color: 'teal',
  },
  {
    id: 'games',
    title: 'Games & Activities',
    description: 'Fun, age-appropriate activities to stimulate growth and bonding.',
    icon: CubeTransparentIcon,
    color: 'violet',
  },
  {
    id: 'health',
    title: 'BMI & Health Tracker',
    description: 'Record and track your baby\'s growth milestones like weight, height, and BMI.',
    icon: ClipboardDocumentListIcon,
    color: 'emerald',
  },
];