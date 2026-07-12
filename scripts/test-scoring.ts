import { calculateOverallScore } from '../src/scripts/scoring-engine.ts';

const resumeText = `John Doe
john.doe@email.com | 123-456-7890 | linkedin.com/in/johndoe

Summary
Experienced Software Engineer with 5 years of experience building scalable applications using React and Node.js. Proven track record of optimizing performance and leading agile teams.

Experience
Software Engineer at Tech Corp (2024 - Present)
- Led the migration of legacy services to React, enhancing user satisfaction and engagement.
- Developed rest APIs in Python and PostgreSQL to serve concurrent users.
- Reduced deployment time by 80% using Docker pipelines.

Education
Bachelor of Science in Computer Science, State University (2018 - 2022)

Skills
JavaScript, React, Node.js, Python, Docker, SQL, Git`;

const jdText = `Software Engineer
We are looking for a Software Engineer to join our team.

Requirements:
- 5+ years of experience in software development.
- Deep expertise in React, Node.js, and SQL databases.
- Experience with Docker, Git, and CI/CD pipelines.
- Strong communication and teamwork skills.

Preferred:
- AWS, Kubernetes, and GraphQL experience.`;

function runTests() {
  console.log('--- Running ATS Scoring Stability Tests ---');
  
  // Baseline run
  const baseResult = calculateOverallScore(resumeText, jdText);
  const baseScore = baseResult.overall;
  console.log(`Baseline score: ${baseScore}`);

  // Test 1: Adding one keyword changes score <= 3 points
  // Add a non-hiring keyword like "PostgreSQL" as a plain word
  const resumeWithKeyword = resumeText + "\nPostgreSQL";
  const keywordResult = calculateOverallScore(resumeWithKeyword, jdText);
  const keywordDiff = Math.abs(keywordResult.overall - baseScore);
  console.log(`1. Add keyword score: ${keywordResult.overall} (Diff: ${keywordDiff})`);
  if (keywordDiff > 3) {
    throw new Error(`Stability check failed: Adding one keyword changed score by ${keywordDiff} (expected <= 3)`);
  }

  // Test 2: Adding one skill changes score <= 5 points
  // Add "AWS" to the skills list
  const resumeWithSkill = resumeText + "\nAWS";
  const skillResult = calculateOverallScore(resumeWithSkill, jdText);
  const skillDiff = Math.abs(skillResult.overall - baseScore);
  console.log(`2. Add skill score: ${skillResult.overall} (Diff: ${skillDiff})`);
  if (skillDiff > 5) {
    throw new Error(`Stability check failed: Adding one skill changed score by ${skillDiff} (expected <= 5)`);
  }

  // Test 3: Rewriting one bullet changes score <= 5 points
  // Rewrite a bullet to remove metrics
  const resumeWithRewrittenBullet = resumeText.replace(
    "- Reduced deployment time by 80% using Docker pipelines.",
    "- Worked on docker pipelines deployment."
  );
  const bulletResult = calculateOverallScore(resumeWithRewrittenBullet, jdText);
  const bulletDiff = Math.abs(bulletResult.overall - baseScore);
  console.log(`3. Rewrite bullet score: ${bulletResult.overall} (Diff: ${bulletDiff})`);
  if (bulletDiff > 5) {
    throw new Error(`Stability check failed: Rewriting one bullet changed score by ${bulletDiff} (expected <= 5)`);
  }

  // Test 4: Removing an entire section changes score significantly
  // Remove the "Skills" section
  const resumeWithoutSkillsSection = resumeText.replace(/Skills[\s\S]*/i, "");
  const noSkillsResult = calculateOverallScore(resumeWithoutSkillsSection, jdText);
  const noSkillsDiff = Math.abs(noSkillsResult.overall - baseScore);
  console.log(`4. Remove Skills Section score: ${noSkillsResult.overall} (Diff: ${noSkillsDiff})`);
  if (noSkillsDiff < 8) {
    throw new Error(`Stability check failed: Removing Skills section changed score by only ${noSkillsDiff} (expected >= 8)`);
  }

  console.log('--- All ATS scoring stability tests passed successfully! ---');
}

runTests();
