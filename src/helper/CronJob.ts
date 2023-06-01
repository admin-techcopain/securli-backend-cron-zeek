import * as fs from "fs";
const moment = require('moment');
import path from "path";
import ZeekController from "../controller/ZeekController";
import { Zeek } from "../entity/Zeek";
import { deleteFilefromSFTP, downloadFilesFromSFTPwithSubdirectory, uploadFilesToSFTPwithSubdirectory } from "./SFTPClient";
import { ZeekParser } from "./ZeekParser";


export const zeekcron = async () => {

    let isJobRunning = false;
    const CronJob = require("cron").CronJob;
    const job = new CronJob(
        ' 0 */1 * * * *',
        () => ZeekCronJob(),
        null,
        true,
        'America/Los_Angeles',
    );


    async function ZeekCronJob() {
        console.log("ZeekCronJob isJobRunning is running", isJobRunning)
        if (isJobRunning) {
            console.log("Inside isJobRunning", isJobRunning)
            // Skip
            return;
        }

        isJobRunning = true;

        console.log("Starting ZeekCronJob. isJobRunning timestamp.", moment().format("DD MMM YYYY hh:mm:ss"))
        // run stuff
        isJobRunning = await GetDatazeekcron(isJobRunning)
        // Once is finished
        console.log(" Ending ZeekCronJob. isJobRunning is ", isJobRunning)

        // isJobRunning = false;
    }
    const getAllFiles = function (dirPath, arrayOfFiles) {
        let files = fs.readdirSync(dirPath)
        arrayOfFiles = arrayOfFiles || []
        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                if (arrayOfFiles.length <= 0) {
                    console.log("Deleting directory as its empty;")
                    fs.rmdirSync(dirPath + "/" + file, { recursive: true });
                }
                else {
                    console.log("directory not empty;", arrayOfFiles)
                }
            } else {
                arrayOfFiles.push(path.join(dirPath, "/", file))
            }
        })
        return arrayOfFiles;
    }

    const GetDatazeekcron = async (isJobRunning) => {
        var dir = path.join(__dirname, process.env.LocalPathForSFTP)
        console.log("prepare the folders if doesn't exists ", dir)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await downloadFilesFromSFTPwithSubdirectory(process.env.ZeeksftpPath, dir);
        const fileDir = path.join(__dirname, process.env.LocalPathForSFTP);

        try {
            let arrayOfFiles = [];
            const files = getAllFiles(fileDir, arrayOfFiles);
            if (files.length === 0) {
                console.log("Zeek Parser: No files found in the directory.");
                return isJobRunning = false;
            } else {
                for (let i = 0; i < files.length; i++) {
                    const zeekData: Zeek[] = await ZeekParser(files[i]);
                    let queryData = await ZeekController.InsertZeekData(zeekData);
                    if (queryData) {
                        var sudirectories = files[i].split('/');
                        console.log("subdirectories", sudirectories);
                        console.log("files[i]", files[i]);

                        console.log("sudirectories[sudirectories.length-2]", sudirectories[sudirectories.length - 2]);
                        await uploadFilesToSFTPwithSubdirectory(process.env.ZeeksftpArchivePath, files[i], sudirectories[sudirectories.length - 2], path.basename(files[i]));
                        await deleteFilefromSFTP(process.env.ZeeksftpPath, sudirectories[sudirectories.length - 2], path.basename(files[i]));
                        await fs.unlinkSync(files[i]);
                        console.log("Insert done.")
                    }

                }
                return isJobRunning = false;
            }
        } catch (error) {
            console.log("Function Name - GetDataciscron ", Date(), error);
            return isJobRunning = false
        }

    }
}