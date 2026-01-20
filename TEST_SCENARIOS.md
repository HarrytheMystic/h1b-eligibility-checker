# Test Scenarios for H1B Eligibility Checker

## Test Case 1: Strong Candidate (Software Engineer with Master's)
**Input:**
```json
{
  "resumeText": "Master of Science in Computer Science from Stanford University (2018-2020). Bachelor of Technology in Computer Science from IIT Delhi (2014-2018). Software Engineer at Google (2020-Present, 5 years). Skills: Python, Java, React, Node.js, AWS, Docker, Kubernetes, TypeScript, PostgreSQL. Led migration of legacy systems to microservices architecture.",
  "jobTitle": "Software Engineer",
  "location": "Mountain View, CA",
  "userType": "applicant",
  "isPremium": false
}
```
**Expected Score:** 95-100%
**Expected Verdict:** ✅ Likely Eligible

---

## Test Case 2: Moderate Candidate (Bachelor's with Related Degree)
**Input:**
```json
{
  "resumeText": "Bachelor of Engineering in Electronics and Communication from Anna University (2016-2020). Software Developer at Infosys (2020-2023, 3 years). Skills: Java, Python, SQL, Git. Worked on web application development.",
  "jobTitle": "Software Developer",
  "location": "Bangalore, India",
  "userType": "applicant",
  "isPremium": false
}
```
**Expected Score:** 65-75%
**Expected Verdict:** ✅ Likely Eligible
**Expected Risk:** "Degree is related but not directly in field - may need strong support letter"

---

## Test Case 3: Edge Case (12-Year Experience, No Degree)
**Input:**
```json
{
  "resumeText": "Senior Software Engineer with 14 years of progressive experience. Worked at Microsoft (2010-2015), Amazon (2015-2020), Meta (2020-Present). Skills: Java, Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes, TypeScript. Led teams of 5-10 engineers.",
  "jobTitle": "Senior Software Engineer",
  "location": "Seattle, WA",
  "userType": "applicant",
  "isPremium": true
}
```
**Expected Score:** 75-85%
**Expected Verdict:** ✅ Likely Eligible
**Expected Risk:** "Using 12-year experience equivalency - requires detailed documentation"

---

## Test Case 4: Weak Candidate (No Degree, Insufficient Experience)
**Input:**
{
  "resumeText": "Junior Developer with 1.5 years of experience. Completed online coding bootcamp. Skills: HTML, CSS, JavaScript. Built personal portfolio website.",
  "jobTitle": "Software Developer",
  "location": "Austin, TX",
  "userType": "applicant",
  "isPremium": false
}
**Expected Score:** 25-35%
**Expected Verdict:** ⚠️ May Face Challenges
**Expected Risk:** "No bachelor degree and insufficient experience (<12 years)"

---

## Test Case 5: Attorney User (Unlimited Access)
**Input:**
```json
{
  "resumeText": "Bachelor of Science in Computer Science from UC Berkeley. Software Engineer at Tesla with 4 years experience. Skills: Python, C++, Java, React, AWS.",
  "jobTitle": "Software Engineer",
  "location": "Palo Alto, CA",
  "userType": "attorney",
  "isPremium": false,
  "attorneyBranding": {
    "firmName": "Smith Immigration Law PC",
    "contactEmail": "contact@smithlaw.com",
    "logo": "https://example.com/logo.png"
  }
}
```
**Expected:** Full premium features unlocked + attorney branding in output

---

## Test Case 6: Data Scientist (Statistics Major)
**Input:**
```json
{
  "resumeText": "PhD in Statistics from MIT (2015-2020). Master of Science in Mathematics from IIT Bombay (2013-2015). Data Scientist at Netflix (2020-Present, 5 years). Skills: Python, R, TensorFlow, PyTorch, SQL, Spark, AWS.",
  "jobTitle": "Data Scientist",
  "location": "Los Gatos, CA",
  "userType": "applicant",
  "isPremium": true
}
```
**Expected Score:** 95-100%
**Expected Lottery Odds:** "~26-30% (master + bachelor pool)"

---

## Test Case 7: Business Analyst (MBA)
**Input:**
```json
{
  "resumeText": "MBA from Wharton School of Business (2020-2022). Bachelor of Arts in Economics from Delhi University (2016-2020). Business Analyst at McKinsey (2022-Present, 3 years). Skills: SQL, Tableau, Excel, Python.",
  "jobTitle": "Business Analyst",
  "location": "New York, NY",
  "userType": "applicant",
  "isPremium": false
}
```
**Expected Score:** 85-95%

---

## Test Case 8: Free Tier Limit Test
**Instructions:**
1. Run 3 analyses with userType: "applicant", isPremium: false
2. 4th run should return error: "FREE_TIER_LIMIT_REACHED"

---

## Error Handling Tests

### Test 9: Empty Resume
**Input:**
```json
{
  "resumeText": "",
  "jobTitle": "Software Engineer",
  "location": "San Francisco, CA"
}
```
**Expected:** Error with message about minimum 50 characters

### Test 10: Missing Job Title
**Input:**
```json
{
  "resumeText": "Bachelor in CS, 5 years experience",
  "location": "Boston, MA"
}
```
**Expected:** Error about missing required fields

### Test 11: Invalid File Upload
**Input:**
```json
{
  "resumeFile": "nonexistent-file.pdf",
  "jobTitle": "Software Engineer",
  "location": "Austin, TX"
}
```
**Expected:** Error about file not found or parsing failure

---

## Performance Benchmarks
- Resume parsing: < 2 seconds
- Eligibility calculation: < 1 second
- Total runtime: < 5 seconds per analysis
- Memory usage: < 100 MB

---

## Manual Testing Checklist
- [ ] Test with real resume PDF (100+ KB)
- [ ] Test with real resume DOCX
- [ ] Test with non-English resume (edge case)
- [ ] Test with very long resume (10+ pages)
- [ ] Test concurrent requests (5+ simultaneous)
- [ ] Verify attorney branding appears in output
- [ ] Verify premium features only in premium/attorney mode
- [ ] Verify free tier counter works correctly
