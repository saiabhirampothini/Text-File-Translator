const express = require("express");
const multer = require("multer");
const cors = require("cors");
const app = express();
const port = 5050;

app.use(cors());

const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

AWS.config.update({
  accessKeyId: "AccessKey",
  secretAccessKey: "SecretKey",
  region: "ap-south-1", 
});
let fileNameOriginal = "";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "original/"); // Set the destination directory
  },
  filename: function (req, file, cb) {
    fileNameOriginal = file.originalname;
    cb(null, "x.txt"); // Use the original filename with .txt extension
  },
});
const upload = multer({ storage: storage });

app.post("/api/translate", upload.single("file"), (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const s3 = new AWS.S3();

  const bucketName = "sourcetranslate";
  const txtFilePath = "./original/x.txt"; 
  const baseFile = path.basename(txtFilePath);

  fs.readFile(txtFilePath, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    const params = {
      Bucket: bucketName,
      Key: fileNameOriginal, // Name of the file in the bucket
      Body: data,
      ContentType: "text/plain", // Specify the content type
    };
    const awsUpload = async () => {
      await s3
        .upload(params, (err, data) => {
          if (err) {
            console.error("Error uploading file:", err);
            return;
          }
          console.log("File uploaded successfully. Location:", data.Location);
        })
        .promise();
    };
    awsUpload();
  });

  const translate = new AWS.Translate();
  const txtFileKey = baseFile.toString();

  const targetLanguageCode = req.body.targetLanguage.toString(); 

  const translatedTxtFilePath = "./translated/" + baseFile;

  const params = {
    Bucket: bucketName,
    Key: fileNameOriginal,
  };
  ///
  const translateFunction = async () => {
    s3.getObject(params, (err, data) => {
      if (err) {
        console.error("Error downloading text file:", err);
        return;
      }

      const txtContent = data.Body.toString(); // Convert binary to string

      translate.translateText(
        {
          Text: txtContent,
          SourceLanguageCode: "auto", // Auto-detect the source language
          TargetLanguageCode: targetLanguageCode,
        },
        (err, translatedData) => {
          if (err) {
            console.error("Error translating text content:", err);
            return;
          }

          const translatedText = translatedData.TranslatedText;

          fs.writeFile(translatedTxtFilePath, translatedText, (err) => {
            if (err) {
              console.error("Error writing translated text file:", err);
              return;
            }
            console.log("Translated text file saved:", translatedTxtFilePath);
            sendToClient();
          });
        }
      );
    });
  };
  setTimeout(translateFunction, 3000);
  //
  const sendToClient = async () => {
    const bucketNameDest = "destinationtranslate";
    const txtFilePathDest = "./translated/" + baseFile;

    fs.readFile(txtFilePathDest, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const params = {
        Bucket: bucketNameDest,
        Key: fileNameOriginal + "_translated", // Name of the file in the bucket
        Body: data,
        ContentType: "text/plain", // Specify the content type
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error("Error uploading file:", err);
          return;
        }

        console.log("File uploaded successfully. Location:", data.Location);
      });
    });

    res.setHeader("Content-Type", "text/plain");

    return res.download("./translated/x.txt", fileNameOriginal, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res
          .status(500)
          .json({ error: "An error occurred while downloading the file." });
      }
    });
  };
});

app.listen(port, () => {
  console.log("Server Listening on port 5050");
});
