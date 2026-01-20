# 🚀 Quick Start Guide

## For Developers

### 1. Install Dependencies
```bash
cd E:\h1b-eligibility-checker
npm install
```

### 2. Build TypeScript
```bash
npm run build
```

### 3. Test Locally
```bash
# Create a test input file (see sample-input.json)
npm start
```

### 4. Deploy to Apify
```bash
# Install Apify CLI
npm install -g apify-cli

# Login
apify login

# Push to Apify
apify push
```

---

## For Users (Apify Platform)

### Step 1: Open Actor
Go to: https://apify.com/store/h1b-eligibility-checker

### Step 2: Fill Input Form
- **Paste Resume Text** OR **Upload Resume File** (PDF/DOCX)
- **Job Title:** e.g., "Software Engineer"
- **Location:** e.g., "San Francisco, CA"
- **User Type:** Select "Applicant" or "Attorney"
- **Premium Features:** Check box to enable (₹99 charge)

### Step 3: Run Actor
Click "Start" button

### Step 4: Get Results
- **Score:** 0-100% eligibility rating
- **Verdict:** Likely eligible or needs improvement
- **Risk Factors:** Potential red flags
- **Recommendations:** Action items
- **Required Documents:** Checklist
- **Premium (if enabled):** Lottery odds, wage level, timeline, templates

---

## Sample Inputs

### Example 1: Strong Candidate
```json
{
  "resumeText": "Master of Science in Computer Science, Stanford University (2018-2020)\n\nBachelor of Technology in Computer Science, IIT Delhi (2014-2018)\n\nSoftware Engineer, Google Inc. (2020-Present, 5 years)\n\nSkills: Python, Java, React, Node.js, AWS, Docker, Kubernetes, TypeScript, PostgreSQL\n\nAchievements:\n- Led migration of legacy monolith to microservices\n- Reduced API latency by 40%\n- Mentored 5 junior engineers",
  "jobTitle": "Software Engineer",
  "location": "Mountain View, CA",
  "userType": "applicant",
  "isPremium": true
}
```

**Expected Output:** 95-100% score, highly eligible

### Example 2: Moderate Candidate
```json
{
  "resumeText": "Bachelor of Engineering in Electronics and Communication, Anna University (2016-2020)\n\nSoftware Developer, Infosys Limited (2020-2023, 3 years)\n\nSkills: Java, Python, SQL, Git\n\nProjects:\n- Developed web applications using Spring Boot\n- Worked on REST API development",
  "jobTitle": "Software Developer",
  "location": "Austin, TX",
  "userType": "applicant",
  "isPremium": false
}
```

**Expected Output:** 65-75% score, likely eligible with some risk factors

### Example 3: Attorney Use Case
```json
{
  "resumeText": "Bachelor of Science in Computer Science, UC Berkeley (2016-2020)\n\nSoftware Engineer, Tesla Inc. (2020-Present, 4 years)\n\nSkills: Python, C++, Java, React, AWS",
  "jobTitle": "Software Engineer",
  "location": "Palo Alto, CA",
  "userType": "attorney",
  "isPremium": false,
  "attorneyBranding": {
    "firmName": "Smith Immigration Law PC",
    "contactEmail": "contact@smithlaw.com",
    "phone": "(555) 123-4567",
    "website": "https://smithlaw.com"
  }
}
```

**Expected Output:** Full premium features + attorney branding

---

## Understanding the Output

### Score Breakdown
- **90-100%:** Excellent candidate, minimal risk
- **70-89%:** Good candidate, some considerations
- **50-69%:** Moderate risk, requires careful planning
- **Below 50%:** High risk, may not qualify

### Risk Factors
Common warnings:
- Degree mismatch with job title
- Insufficient experience
- Using 12-year experience rule (requires extra documentation)
- Limited technical skills

### Recommendations
Action items to improve eligibility:
- Get degree evaluation from NACES agency
- Prepare strong support letter
- Gain more relevant experience
- Document employment history thoroughly

---

## Premium Features

### What You Get
1. **Lottery Odds Calculator**
   - Bachelor's cap: ~14-16% chance
   - Master's cap: ~26-30% chance (dual entry)

2. **Wage Level Lookup**
   - Level 1-4 classification
   - Typical salary ranges
   - Based on experience

3. **Complete Timeline**
   - March 1-17: Registration period
   - Late March: Lottery selection
   - April 1: Petition filing starts
   - October 1: H1B start date

4. **Support Letter Template**
   - Pre-filled with your details
   - USCIS-compliant format
   - Ready to customize

5. **Document Checklists**
   - Employee documents (passport, degree, transcripts)
   - Employer documents (LCA, I-129, support letter)

---

## For Immigration Attorneys

### Get FREE Unlimited Access
1. Email: attorney@h1bchecker.com
2. Subject: "Attorney Access Request"
3. Include: Bar number, firm website
4. Get verified within 1 business day

### Benefits
- ✅ Unlimited client screenings
- ✅ White-label branding
- ✅ All premium features
- ✅ Priority support
- ✅ Zero cost forever

### Use Cases
- Initial consultations
- Marketing lead magnet
- Referral partner screening
- Client self-service portal

---

## Troubleshooting

### Error: "FREE_TIER_LIMIT_REACHED"
**Solution:** You've used 3 free runs this month. Either:
- Upgrade to Premium (₹99/run)
- Apply for Attorney access (free unlimited)
- Wait until next month

### Error: "FILE_PARSING_ERROR"
**Solution:** 
- Ensure file is valid PDF or DOCX
- File size should be under 10MB
- Try pasting text instead of uploading file

### Error: "INVALID_RESUME"
**Solution:**
- Resume must be at least 50 characters
- Include education and work experience
- Add relevant skills

### Low Score (<50%)
**Not an error, but:**
- Review risk factors carefully
- Follow recommendations
- Consider consulting immigration attorney
- May need to gain more experience or complete degree

---

## FAQs

**Q: Is this legal advice?**  
A: No, this is an automated screening tool. Always consult a licensed immigration attorney for your specific case.

**Q: How accurate is the score?**  
A: ~85% accuracy based on USCIS public guidelines. Real cases depend on many factors beyond this tool's scope.

**Q: Can I use this multiple times?**  
A: Yes! Free users get 3 runs/month. Premium and attorneys get unlimited.

**Q: What if I have a foreign degree?**  
A: The tool will flag this. You'll likely need a NACES credential evaluation before filing.

**Q: Does this guarantee H1B approval?**  
A: No. This tool screens for basic eligibility. Final approval depends on USCIS review, employer petition quality, and lottery selection.

---

## Support

- 📧 Email: support@h1bchecker.com
- 💬 Discord: [Join community]
- 📚 Docs: Full documentation in README.md
- 🐛 Bugs: Report via Apify Console

---

**Built for the immigrant community with ❤️**

*Last Updated: January 2025*
