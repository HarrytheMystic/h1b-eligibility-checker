# ✅ Pre-Launch Verification Checklist

## Step 1: Verify File Structure ✅

Run this in your terminal:
```bash
cd E:\h1b-eligibility-checker
dir
```

**You should see:**
- ✅ .actor (folder)
- ✅ src (folder)
- ✅ package.json
- ✅ tsconfig.json
- ✅ Dockerfile
- ✅ README.md
- ✅ All other .md files

---

## Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 150+ packages
```

**If you see errors:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

---

## Step 3: Build TypeScript

```bash
npm run build
```

**Expected output:**
```
> h1b-eligibility-checker@1.0.0 build
> tsc
```

**Success = No errors shown!**

**You should now see:**
- New `dist` folder created
- `dist/main.js` file exists
- `dist/rules.json` file exists

---

## Step 4: Test Locally (Critical!)

Create a file `test-input.json` with this content:

```json
{
  "resumeText": "Master of Science in Computer Science, Stanford University (2018-2020)\n\nBachelor of Technology in Computer Science, IIT Delhi (2014-2018)\n\nSoftware Engineer, Google Inc. (2020-Present, 5 years)\n\nSkills: Python, Java, React, Node.js, AWS, Docker, Kubernetes",
  "jobTitle": "Software Engineer",
  "location": "Mountain View, CA",
  "userType": "applicant",
  "isPremium": true
}
```

Then run:
```bash
# This won't work perfectly locally (needs Apify env)
# But should show no compilation errors
npm start
```

**If you see TypeScript errors** → Something is wrong, let me know  
**If it runs** → Great! (Will fail on Apify.getInput() locally - that's OK)

---

## Step 5: Manual Code Review

Open these files and verify:

### package.json
```json
"main": "dist/main.js"  ✅ Should be dist/main.js
"start": "npm run build && node dist/main.js"  ✅ Should compile first
```

### src/main.ts
Check these exist:
- ✅ `import { Actor } from 'apify';`
- ✅ `async function parsePDF(buffer: Buffer)`
- ✅ `async function parseDOCX(buffer: Buffer)`
- ✅ `function checkUsageLimit()`
- ✅ `Actor.main(async () => {`

### Dockerfile
```dockerfile
FROM apify/actor-node:20  ✅ Should be Node 20
RUN npm run build  ✅ Should build TypeScript
```

---

## Step 6: Test Sample Inputs

Copy from `sample-inputs.json` and test each scenario:

### Quick Test - Strong Candidate
```json
{
  "resumeText": "Master of Science in Computer Science, Stanford University (2018-2020)\n\nBachelor of Technology in Computer Science, IIT Delhi (2014-2018)\n\nSoftware Engineer, Google Inc. (2020-Present, 5 years)\n\nSkills: Python, Java, JavaScript, React, Node.js, AWS, Docker, Kubernetes, TypeScript, PostgreSQL",
  "jobTitle": "Software Engineer",
  "location": "Mountain View, CA",
  "userType": "applicant",
  "isPremium": true
}
```

**Expected Output:**
```json
{
  "success": true,
  "analysis": {
    "score": 95-100,
    "verdict": "✅ Likely Eligible"
  },
  "premiumFeatures": {
    "lotteryOdds": "~26-30%",
    "wageLevel": "Level 3-4 ($100K-$130K+)"
  }
}
```

---

## Step 7: Deploy to Apify

### Option A: CLI (Recommended)
```bash
# Install Apify CLI
npm install -g apify-cli

# Login (you'll need Apify account)
apify login

# Push to Apify
apify push
```

### Option B: Manual Upload
1. Zip entire folder (exclude node_modules)
2. Go to Apify Console
3. Create new Actor
4. Upload ZIP
5. Click "Build"

---

## Step 8: Test on Apify Platform

After successful build:

1. **Go to Actor page** in Apify Console
2. **Click "Try it"**
3. **Fill input form:**
   - Paste resume text from sample-inputs.json
   - Job title: "Software Engineer"
   - Location: "San Francisco, CA"
   - User type: "Applicant"
   - Premium: Check the box
4. **Click "Start"**
5. **Wait 10-30 seconds**
6. **Check results:**
   - Should show success: true
   - Should show score (0-100)
   - Should show premium features

---

## Step 9: Test All Scenarios

Run these tests on Apify:

1. ✅ **Strong candidate** (Master's + 5 years) → Should get 90-100%
2. ✅ **Moderate candidate** (Bachelor's + 3 years) → Should get 65-75%
3. ✅ **Weak candidate** (No degree + 1 year) → Should get 25-35%
4. ✅ **Attorney user** → Should get unlimited access + branding
5. ✅ **Free tier limit** → Run 4 times, 4th should fail with limit error

---

## Step 10: Common Issues & Solutions

### Issue: "Cannot find module 'apify'"
**Solution:** Run `npm install` again

### Issue: "dist folder not found"
**Solution:** Run `npm run build`

### Issue: "TypeScript compilation failed"
**Solution:** 
- Check tsconfig.json exists
- Check no syntax errors in main.ts
- Run `npm install typescript -g`

### Issue: "PDF parsing failed"
**Solution:** This is OK if testing locally. Will work on Apify platform.

### Issue: "Actor build failed on Apify"
**Solution:**
- Check Dockerfile syntax
- Verify package.json has correct dependencies
- Check build logs for specific error

---

## ✅ Ready to Launch Checklist

- [ ] All files present in folder
- [ ] `npm install` successful
- [ ] `npm run build` successful (dist folder created)
- [ ] No TypeScript compilation errors
- [ ] Tested 5+ scenarios on Apify platform
- [ ] All tests passing
- [ ] Error rate < 5%
- [ ] Demo video recorded (2-3 min)
- [ ] 6 screenshots captured
- [ ] README.md reviewed
- [ ] Input schema has clear descriptions
- [ ] Actor published to Apify Store

---

## 🚨 Red Flags (Do NOT Launch If...)

- ❌ TypeScript won't compile
- ❌ More than 50% of tests failing
- ❌ PDF/DOCX parsing completely broken
- ❌ Actor crashes on every run
- ❌ Cannot build on Apify platform

---

## 🎯 Success Indicators (Safe to Launch)

- ✅ TypeScript compiles cleanly
- ✅ 80%+ test scenarios passing
- ✅ Runs successfully on Apify
- ✅ Error messages are clear
- ✅ Premium features work
- ✅ Attorney features work

---

## Final Verification Command

Run this full sequence:

```bash
cd E:\h1b-eligibility-checker
npm install
npm run build
dir dist
```

**You should see:**
```
dist/
  main.js
  main.js.map
  main.d.ts
  rules.json
```

**If you see all 4 files → YOU'RE READY! 🚀**

---

## Next Steps After Verification

1. Deploy to Apify (`apify push`)
2. Test on platform (5+ scenarios)
3. Add store assets (video + screenshots)
4. Publish to store
5. Start marketing!

**Estimated time to launch: 1-2 days**

---

## Need Help?

If something doesn't work:
1. Check error messages carefully
2. Review PROJECT_STATUS.md
3. Check TEST_SCENARIOS.md
4. Ask for help with specific error message

**Good luck! 🍀**
