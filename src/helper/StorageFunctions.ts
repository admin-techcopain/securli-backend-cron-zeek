import * as fs from 'fs';
import { Request, Response } from "express";
import * as AWS from 'aws-sdk';
import path from 'path';
const { createWriteStream } = require("fs");
export const uploadFileToS3Storage = (filePath: string, scanHeaderId: string) => {

    console.log("File PAth  ", filePath)
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    });
    const fileContent = fs.readFileSync(filePath);

    // Setting up S3 upload parameters
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: scanHeaderId + '_' + path.basename(filePath), // File name you want to save as in S3
        Body: fileContent
    };
    s3.upload(params, function (err, data) {
        if (err) {
            console.log(`Error occurred while uploading file to S3 file ${filePath} upload failed. Error details -> `, err, data);
        }
        console.log(` File uploaded successfully to S3. ${data.Location}`);
    });
}

export const uploadDataAsFileToS3Storage = (fileName: string, fileData: string) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    });
    // Setting up S3 upload parameters
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName, // File name you want to save as in S3
        Body: fileData
    };
    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
}

const downloadFileFromStorage = async (req: Request, res: Response) => {
    const { fileName } = req.query;
    try {
        let filenametostring = fileName.toString()
        console.log('Trying to download file', fileName);
        AWS.config.update(
            {
                accessKeyId: process.env.AWS_ID,
                secretAccessKey: process.env.AWS_SECRET
            }
        );
        var s3 = new AWS.S3();
        var options = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filenametostring, 
        };

        res.attachment(filenametostring);
        var fileStream = s3.getObject(options).createReadStream();
        fileStream.pipe(res);
    }
    catch (error) {
        console.log("Function Name - downloadFileFromStorage", Date(), error);
        res.status(500).send(`Error occurred while downloading file from S3 storage.${error}`)
    }
}
export default downloadFileFromStorage
