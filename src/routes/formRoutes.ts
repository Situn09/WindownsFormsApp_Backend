import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const dbFilePath = path.join(__dirname, "../../db.json");

interface Submission {
  Name: string;
  Email: string;
  Phone: string;
  GitHub: string;
  Timer: string;
}

// Helper function to read the database file
const readDB = (): { submissions: Submission[] } => {
  const data = fs.readFileSync(dbFilePath, "utf-8");
  return JSON.parse(data);
};

// Helper function to write to the database file
const writeDB = (data: { submissions: Submission[] }) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

router.post("/submit", (req, res) => {
  const { Name, Email, Phone, GitHub, Timer } = req.body;
  const newSubmission: Submission = {
    Name,
    Email,
    Phone,
    GitHub,
    Timer,
  };

  const db = readDB();
  db.submissions.push(newSubmission);
  writeDB(db);

  res
    .status(201)
    .json({ message: "Submission saved successfully.", db, body: req.body });
});

router.get("/read", (req, res) => {
  const db = readDB();
  res.json(db.submissions);
});

router.delete("/delete", (req, res) => {
  const { submissionId } = req.query;
  const idx = parseInt(submissionId as string, 10);

  const db = readDB();
  if (idx < 0 || idx >= db.submissions.length) {
    return res.status(404).json({ message: "Submission form not found." });
  }

  db.submissions.splice(idx, 1);
  writeDB(db);

  res.json({ message: "Submission deleted successfully." });
});

router.put("/edit", (req, res) => {
  const { submissionId, Name, Email, Phone, GitHub, Timer } = req.body;
  const idx = parseInt(submissionId, 10);

  const db = readDB();
  if (idx < 0 || idx >= db.submissions.length) {
    return res.status(404).json({ message: "Submission not found." });
  }

  db.submissions[idx] = { Name, Email, Phone, GitHub, Timer };
  writeDB(db);

  res.json({ message: "Submission edited successfully." });
});

router.get("/search", (req, res) => {
  const { Email } = req.query as { Email: string };

  const db = readDB();
  const results = db.submissions.filter(
    (submission) => submission.Email === Email
  );

  if (results.length === 0) {
    return res
      .status(404)
      .json({ message: "No submissions found for this Email." });
  }

  res.json(results);
});

export default router;
