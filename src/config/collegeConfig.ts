import { CollegeConfig } from '../types';

/**
 * =========================================================================
 * COLLEGE_CONFIG
 * =========================================================================
 * Centralized Branding and Institutional Configuration.
 * Both Sarhad University SSC Mailsi and The Physio College Mailsi are
 * officially represented here. Administrators can update these details via
 * the Settings panel or by updating this configuration object.
 */
export const COLLEGE_CONFIG: CollegeConfig = {
  universityName: 'Sarhad University SSC Mailsi',
  collegeName: 'The Physio College Mailsi',
  phone: '0323 8091599',
  address: 'Faddah Chungi Chowk, Vehari Road, Mailsi, 61200',
  email: 'thephysiocollegemailsi@gmail.com',
  website: 'www.thephysiocollege.edu.pk',
  footerNote: 'Affiliated with Sarhad University of Science & Information Technology (SUIT). Recognized for excellence in Physical Therapy & Allied Health Sciences.',
  bankName: 'The Bank of Punjab / Allied Bank Mailsi',
  accountTitle: 'The Physio College Mailsi',
  accountNumber: '6580-00129384-001',
  challanInstructions: [
    'Fees must be deposited on or before the due date at any designated bank branch or online.',
    'A late fee fine of Rs. 50/day will be charged after the due date.',
    'Keep the student copy safe for official semester exam clearance.',
    'Fees once paid are non-refundable and non-transferable.'
  ]
};
