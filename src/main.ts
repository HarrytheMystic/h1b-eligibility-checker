import { Actor } from 'apify';
import * as pdfjsLib from 'pdf-parse';
import * as mammoth from 'mammoth';

// Import rules with proper typing
import rulesData from './rules.json';
const rules = rulesData as any; // Type assertion for JSON import

interface InputSchema {
  resumeText?: string;
  resumeFile?: string;
  jobTitle: string;
  location: string;
  userType?: 'applicant' | 'attorney';
  isPremium?: boolean;
  attorneyBranding?: string;  // ← FIXED: string (JSON) instead of object
}

interface ResumeData {
  degree: string;
  major: string;
  yearsExperience: number;
  skills: string[];
  rawText: string;
}

interface EligibilityResult {
  score: number;
  isEligible: boolean;
  degreeMatch: boolean;
  experienceMatch: boolean;
  missingDocuments: string[];
  riskFactors: string[];
  recommendations: string[];
  lotteryOdds?: string;
  wageLevel?: string;
  timeline?: any;
  supportLetterTemplate?: string;
}

// Simple in-memory usage tracking (for free tier limits)
const usageTracker = new Map<string, number>();

function checkUsageLimit(userId: string, isAttorney: boolean, isPremium: boolean): boolean {
  if (isAttorney || isPremium) {
    return true; // Unlimited for attorneys and premium users
  }
  
  const currentUsage = usageTracker.get(userId) || 0;
  if (currentUsage >= 3) {
    return false; // Free tier limit reached
  }
  
  return true;
}

function incrementUsage(userId: string): void {
  const currentUsage = usageTracker.get(userId) || 0;
  usageTracker.set(userId, currentUsage + 1);
}

// Parse PDF file
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfjsLib(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
  }
}

// Parse DOCX file
async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it is a valid Word document.');
  }
}

// Resume parser
async function parseResume(text: string): Promise<ResumeData> {
  const lowerText = text.toLowerCase();
  
  // Extract degree
  let degree = 'none';
  let major = 'unknown';
  
  if (lowerText.includes('ph.d') || lowerText.includes('phd') || lowerText.includes('doctorate')) {
    degree = 'phd';
  } else if (lowerText.includes('master') || lowerText.includes('m.s') || lowerText.includes('mba') || lowerText.includes('m.tech')) {
    degree = 'master';
  } else if (lowerText.includes('bachelor') || lowerText.includes('b.s') || lowerText.includes('b.e') || lowerText.includes('b.tech') || lowerText.includes('b.a')) {
    degree = 'bachelor';
  }
  
  // Extract major (simple pattern matching)
  const majors: { [key: string]: string[] } = {
    'computer science': ['computer science', 'cs', 'computing'],
    'IT': ['information technology', 'it ', ' it'],
    'ECE': ['electronics', 'electrical', 'ece'],
    'software engineering': ['software engineering'],
    'data science': ['data science', 'machine learning', 'ml'],
    'statistics': ['statistics', 'stats'],
    'mathematics': ['mathematics', 'math'],
    'business': ['business administration', 'mba', 'finance', 'accounting'],
    'engineering': ['engineering']
  };
  
  for (const [key, patterns] of Object.entries(majors)) {
    if (patterns.some(p => lowerText.includes(p))) {
      major = key;
      break;
    }
  }
  
  // Extract years of experience (simple heuristic)
  const expMatch = text.match(/(\d+)\+?\s*years?\s*(of)?\s*experience/i);
  let yearsExperience = 0;
  if (expMatch) {
    yearsExperience = parseInt(expMatch[1]);
  } else {
    // Count job entries as rough estimate
    const jobMarkers = (text.match(/\d{4}\s*-\s*(\d{4}|present|current)/gi) || []).length;
    yearsExperience = Math.min(jobMarkers * 2, 15); // Rough estimate
  }
  
  // Extract skills
  const commonSkills = ['java', 'python', 'javascript', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'angular', 'vue'];
  const skills = commonSkills.filter(skill => lowerText.includes(skill));
  
  return {
    degree,
    major,
    yearsExperience,
    skills,
    rawText: text
  };
}

// Normalize job title to category
function normalizeJobTitle(jobTitle: string): string {
  const lower = jobTitle.toLowerCase();
  
  if (lower.includes('software') || lower.includes('developer') || lower.includes('programmer')) {
    return 'software_engineer';
  }
  if (lower.includes('data scien') || lower.includes('ml engineer') || lower.includes('machine learning')) {
    return 'data_scientist';
  }
  if (lower.includes('business analyst') || lower.includes('ba ')) {
    return 'business_analyst';
  }
  if (lower.includes('accountant')) {
    return 'accountant';
  }
  if (lower.includes('mechanical engineer')) {
    return 'mechanical_engineer';
  }
  
  return 'software_engineer'; // Default fallback
}

// Calculate eligibility
function calculateEligibility(resumeData: ResumeData, jobTitle: string, isPremium: boolean): EligibilityResult {
  const jobCategory = normalizeJobTitle(jobTitle);
  const jobRules = rules.jobCategories[jobCategory];
  
  if (!jobRules) {
    throw new Error(`Job category not found: ${jobCategory}`);
  }
  
  let score = 0;
  let degreeMatch = false;
  let experienceMatch = false;
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  const missingDocuments: string[] = [];
  
  // Check degree match
  if (resumeData.degree === 'phd' || resumeData.degree === 'master') {
    degreeMatch = true;
    score += 40;
  } else if (resumeData.degree === 'bachelor') {
    const acceptedMajors = jobRules.acceptedDegrees.map((d: string) => d.toLowerCase());
    const relatedMajors = jobRules.relatedDegrees.map((d: string) => d.toLowerCase());
    
    if (acceptedMajors.some((m: string) => resumeData.major.toLowerCase().includes(m) || m.includes(resumeData.major.toLowerCase()))) {
      degreeMatch = true;
      score += 40;
    } else if (relatedMajors.some((m: string) => resumeData.major.toLowerCase().includes(m) || m.includes(resumeData.major.toLowerCase()))) {
      degreeMatch = true;
      score += 30;
      riskFactors.push('Degree is related but not directly in field - may need strong support letter');
    } else {
      score += 10;
      riskFactors.push('Degree major does not directly match job requirements');
      recommendations.push('Consider getting degree evaluation from NACES-approved agency');
      recommendations.push('Prepare strong support letter explaining how your degree relates to the position');
    }
  } else if (resumeData.yearsExperience >= 12) {
    // 12 years experience rule
    degreeMatch = true;
    score += 35;
    riskFactors.push('Using 12-year experience equivalency - requires detailed documentation');
    recommendations.push('Prepare detailed employment verification letters for all 12+ years');
  } else {
    riskFactors.push('No bachelor degree and insufficient experience (<12 years)');
    recommendations.push('Complete bachelor degree or gain more experience to reach 12 years');
  }
  
  // Check experience
  if (resumeData.yearsExperience >= 6) {
    experienceMatch = true;
    score += 30;
  } else if (resumeData.yearsExperience >= 2) {
    experienceMatch = true;
    score += 20;
  } else {
    score += 10;
    recommendations.push('Gain more relevant work experience to strengthen application');
  }
  
  // Skills bonus
  if (resumeData.skills.length >= 5) {
    score += 15;
  } else if (resumeData.skills.length >= 3) {
    score += 10;
  } else {
    score += 5;
    recommendations.push('Add more relevant technical skills to your resume');
  }
  
  // Master degree bonus for lottery
  if (resumeData.degree === 'master' || resumeData.degree === 'phd') {
    score += 15;
  }
  
  // Check missing documents
  const requiredDocs = rules.requiredDocuments.employee;
  missingDocuments.push(...requiredDocs);
  
  if (resumeData.degree !== 'none' && !resumeData.rawText.toLowerCase().includes('transcript')) {
    recommendations.push('Ensure you have official transcripts from your university');
  }
  
  const result: EligibilityResult = {
    score: Math.min(score, 100),
    isEligible: score >= 60,
    degreeMatch,
    experienceMatch,
    missingDocuments,
    riskFactors,
    recommendations
  };
  
  // Premium features
  if (isPremium) {
    // Lottery odds
    if (resumeData.degree === 'master' || resumeData.degree === 'phd') {
      result.lotteryOdds = rules.lotteryProcess.oddsEstimate.master;
    } else {
      result.lotteryOdds = rules.lotteryProcess.oddsEstimate.bachelor;
    }
    
    // Wage level
    if (resumeData.yearsExperience >= 6) {
      result.wageLevel = 'Level 3-4 ($100K-$130K+)';
    } else if (resumeData.yearsExperience >= 2) {
      result.wageLevel = 'Level 2 ($80K-$100K)';
    } else {
      result.wageLevel = 'Level 1 ($60K-$80K)';
    }
    
    // Timeline
    result.timeline = {
      registrationPeriod: rules.lotteryProcess.registrationPeriod,
      lotteryDate: rules.lotteryProcess.lotteryDate,
      selectionNotification: rules.lotteryProcess.selectionNotification,
      petitionFilingStart: rules.lotteryProcess.petitionFilingStart,
      startDate: rules.lotteryProcess.startDate
    };
    
    // Support letter template
    result.supportLetterTemplate = generateSupportLetterTemplate(resumeData, jobTitle);
  }
  
  return result;
}

function generateSupportLetterTemplate(resumeData: ResumeData, jobTitle: string): string {
  return `
[COMPANY LETTERHEAD]

Date: [INSERT DATE]

U.S. Citizenship and Immigration Services
[SERVICE CENTER ADDRESS]

RE: H-1B Petition for ${jobTitle}

Dear USCIS Officer,

This letter supports the H-1B petition for [CANDIDATE NAME] for the position of ${jobTitle} at [COMPANY NAME].

POSITION REQUIREMENTS:
The ${jobTitle} position requires a minimum of a bachelor's degree in ${resumeData.major} or a related field. The position involves:
• [INSERT SPECIFIC JOB DUTY 1]
• [INSERT SPECIFIC JOB DUTY 2]
• [INSERT SPECIFIC JOB DUTY 3]

BENEFICIARY QUALIFICATIONS:
[CANDIDATE NAME] holds a ${resumeData.degree} degree in ${resumeData.major} and has ${resumeData.yearsExperience} years of progressive experience in the field. Their qualifications directly match our requirements.

The specialized knowledge and skills required for this position cannot be performed by workers without at least a bachelor's degree in ${resumeData.major}, making this a specialty occupation under INA §214(i)(1).

Sincerely,

[HIRING MANAGER NAME]
[TITLE]
[COMPANY NAME]
`.trim();
}

// Main Actor handler
Actor.main(async () => {
  const input = await Actor.getInput<InputSchema>();
  
  if (!input) {
    throw new Error('Input is required');
  }
  
  const { resumeText, resumeFile, jobTitle, location, userType = 'applicant', isPremium = false, attorneyBranding } = input;
  
  // Check usage limits for free tier
  const isAttorney = userType === 'attorney';
  const userId = 'user-' + Date.now(); // In production, use actual user ID
  
  if (!checkUsageLimit(userId, isAttorney, isPremium)) {
    await Actor.pushData({
      success: false,
      error: 'FREE_TIER_LIMIT_REACHED',
      message: '🔒 You have reached the free tier limit (3 runs/month). Upgrade to Premium or apply for Attorney access for unlimited runs.',
      upgradeUrl: 'https://apify.com/store/h1b-eligibility-checker'
    });
    return;
  }
  
  const hasPremiumAccess = isPremium || isAttorney;
  
  // Parse branding JSON
  let branding = {};
  if (isAttorney && attorneyBranding) {
    try {
      branding = JSON.parse(attorneyBranding);
    } catch (e) {
      console.warn('Invalid attorneyBranding JSON:', e);
    }
  }
  
  // Parse resume
  let resumeContent = resumeText || '';
  
  if (resumeFile && !resumeContent) {
    try {
      // Fetch file directly from Apify URL
      const response = await fetch(resumeFile);
      if (!response.ok) {
        throw new Error('Resume file not found or inaccessible');
      }
      
      const fileBuffer = Buffer.from(await response.arrayBuffer());
      
      // Detect file type and parse accordingly
      if (resumeFile.toLowerCase().endsWith('.pdf')) {
        resumeContent = await parsePDF(fileBuffer);
      } else if (resumeFile.toLowerCase().endsWith('.docx')) {
        resumeContent = await parseDOCX(fileBuffer);
      } else {
        throw new Error('Unsupported file format. Please upload PDF or DOCX files.');
      }
      
      console.log('Successfully parsed resume file');
    } catch (error) {
      console.error('File parsing error:', error);
      await Actor.pushData({
        success: false,
        error: 'FILE_PARSING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to parse resume file. Please paste resume text instead or ensure the file is a valid PDF/DOCX.'
      });
      return;
    }
  }
  
  if (!resumeContent || resumeContent.trim().length < 50) {
    await Actor.pushData({
      success: false,
      error: 'INVALID_RESUME',
      message: 'Please provide resume text (minimum 50 characters) or upload a valid resume file (PDF/DOCX).'
    });
    return;
  }
  
  if (!jobTitle || !location) {
    await Actor.pushData({
      success: false,
      error: 'MISSING_REQUIRED_FIELDS',
      message: 'Job title and location are required fields.'
    });
    return;
  }
  
  try {
    const resumeData = await parseResume(resumeContent);
    const eligibility = calculateEligibility(resumeData, jobTitle, hasPremiumAccess);
    
    // Increment usage for free tier
    if (!isAttorney && !isPremium) {
      incrementUsage(userId);
    }
    
    // Generate output
    const output = {
      success: true,
      userType,
      isPremium: hasPremiumAccess,
      analysis: {
        score: eligibility.score,
        verdict: eligibility.isEligible ? '✅ Likely Eligible' : '⚠️ May Face Challenges',
        degreeMatch: eligibility.degreeMatch ? '✅ Degree matches requirements' : '❌ Degree mismatch',
        experienceMatch: eligibility.experienceMatch ? '✅ Sufficient experience' : '⚠️ Limited experience',
      },
      resumeProfile: {
        degree: resumeData.degree,
        major: resumeData.major,
        yearsExperience: resumeData.yearsExperience,
        keySkills: resumeData.skills
      },
      jobDetails: {
        title: jobTitle,
        location: location,
        category: normalizeJobTitle(jobTitle)
      },
      riskFactors: eligibility.riskFactors,
      recommendations: eligibility.recommendations,
      requiredDocuments: eligibility.missingDocuments,
      ...(hasPremiumAccess && {
        premiumFeatures: {
          lotteryOdds: eligibility.lotteryOdds,
          wageLevel: eligibility.wageLevel,
          timeline: eligibility.timeline,
          supportLetterTemplate: eligibility.supportLetterTemplate
        }
      }),
      ...(isAttorney && Object.keys(branding).length > 0 && {
        branding: branding
      }),
      disclaimer: '⚠️ This is an automated analysis tool. Results are not legal advice. Consult an immigration attorney for your specific case.',
      upgradePrompt: !hasPremiumAccess ? '🚀 Upgrade to Premium for lottery odds, wage lookup, timeline & support letter template! Only ₹99 ($1.19)' : null
    };
    
    await Actor.pushData(output);
    
    console.log(`✅ Analysis complete! Score: ${eligibility.score}/100`);
    console.log(`Eligibility: ${eligibility.isEligible ? 'YES - Likely eligible' : 'NEEDS IMPROVEMENT'}`);
    console.log(`User Type: ${userType} | Premium: ${hasPremiumAccess}`);
  } catch (error) {
    console.error('Analysis error:', error);
    await Actor.pushData({
      success: false,
      error: 'ANALYSIS_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred during analysis. Please try again.'
    });
  }
});
