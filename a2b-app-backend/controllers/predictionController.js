// backend/controllers/predictionController.js
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config(); // Ensure environment variables are loaded

// Initialize S3 Client
// Reads region and credentials from environment variables automatically
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Helper function to convert stream to string
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

// @desc    Get latest FPL predictions
// @route   GET /api/predictions/latest
// @access  Private (requires login)
const getLatestPredictions = async (req, res, next) => {
  console.log('Fetching latest predictions from S3...'); // Log entry

  const bucketName = process.env.PREDICTIONS_S3_BUCKET;
  const objectKey = process.env.PREDICTIONS_S3_KEY;

  if (!bucketName || !objectKey) {
    console.error('S3 bucket name or key not configured in environment variables.');
    return res.status(500).json({ message: 'Server configuration error [S3]' });
  }

  const getObjectParams = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const data = await s3Client.send(command);

    // data.Body is a readable stream
    const bodyContents = await streamToString(data.Body);
    const predictions = JSON.parse(bodyContents);

    console.log(`Successfully fetched and parsed predictions for GW: ${predictions?.[0]?.gameweek || 'Unknown'}`); // Log success

    res.status(200).json(predictions); // Send the parsed JSON data

  } catch (error) {
    console.error(`Error fetching predictions from S3 (s3://<span class="math-inline">\{bucketName\}/</span>{objectKey}):`, error);
    if (error.name === 'NoSuchKey') {
        return res.status(404).json({ message: 'Prediction data not found.' });
    } else if (error.name === 'CredentialsProviderError' || error.name === 'AccessDenied') {
         return res.status(500).json({ message: 'Server configuration error [S3 Credentials]' });
    } else if (error instanceof SyntaxError) {
        // Handle JSON parsing error
         return res.status(500).json({ message: 'Failed to parse prediction data.' });
    }
    // Generic server error for other issues
    res.status(500).json({ message: 'Server error fetching predictions' });
    // next(error); // Or pass to global error handler
  }
};

module.exports = { getLatestPredictions };