const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config(); // Ensure environment variables are loaded

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

const getLatestPredictions = async (req, res, next) => {
  console.log('Fetching latest predictions from S3...');

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

    const bodyContents = await streamToString(data.Body);
    const predictions = JSON.parse(bodyContents);

    console.log(`Successfully fetched and parsed predictions for GW: ${predictions?.[0]?.gameweek || 'Unknown'}`);
    res.status(200).json(predictions); 

  } catch (error) {
    console.error(`Error fetching predictions from S3 (s3://<span class="math-inline">\{bucketName\}/</span>{objectKey}):`, error);
    if (error.name === 'NoSuchKey') {
        return res.status(404).json({ message: 'Prediction data not found.' });
    } else if (error.name === 'CredentialsProviderError' || error.name === 'AccessDenied') {
         return res.status(500).json({ message: 'Server configuration error [S3 Credentials]' });
    } else if (error instanceof SyntaxError) {
         return res.status(500).json({ message: 'Failed to parse prediction data.' });
    }
    res.status(500).json({ message: 'Server error fetching predictions' });
  }
};

module.exports = { getLatestPredictions };