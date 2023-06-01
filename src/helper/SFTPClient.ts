import * as path from "path";
import * as fs from "fs";
let Client = require('ssh2-sftp-client');

class SFTPClient {
    client: any;

    constructor() {
        this.client = new Client();
    }

    async connect(options) {
        console.log(`Connecting to ${options.host}:${options.port}`);
        try {
            await this.client.connect(options);
        } catch (err) {
            console.log("Function Name - SFTPClient-connect ", Date(), err);
        }
    }

    async disconnect() {
        await this.client.end();
    }

    async listFiles(remoteDir) {
        console.log(`Listing ${remoteDir} ...`);
        let fileObjects;
        try {
            fileObjects = await this.client.list(remoteDir);
        } catch (err) {
            console.log("Function Name - SFTPClient-disconnect ", Date(), err);
        }

        const fileNames = [];
        for (const file of fileObjects) {
            console.log("FILE", file);
            if (file.type === 'd') {
                console.log(`${new Date(file.modifyTime).toISOString()} PRE ${file.name}`);
            } else {
                console.log(`${new Date(file.modifyTime).toISOString()} ${file.size} ${file.name}`);
            }

            fileNames.push(file.name);
        }

        return fileNames;
    }

    async uploadFile(localFile, remoteFile) {
        console.log(`Uploading ${localFile} to ${remoteFile} ...`);
        try {
            await this.client.put(localFile, remoteFile);
        } catch (err) {
            console.log("Function Name - uploadFile ", Date(), err);
        }
    }

    async downloadFile(remoteFile, localFile) {
        console.log(`Downloading ${remoteFile} to ${localFile} ...`);
        try {
            await this.client.fastGet(remoteFile, localFile);
        } catch (err) {
            console.log("Function Name - downloadFile", Date(), err);
        }
    }

    async deleteFile(remoteFile) {
        console.log(`Deleting ${remoteFile}`);
        try {
            await this.client.delete(remoteFile);
        } catch (err) {
            console.log("Function Name - deleteFile", Date(), err);
        }
    }
}
export const deleteFilefromSFTP = async (directoryName, subdirectoryName, file) => {
    try {

        console.log("deleteFilefromSFTP", directoryName, subdirectoryName, file)
        const parsedURL = new URL(process.env.SFTP_URL);
        const port = process.env.SFTPport;
        const { host, username, password } = parsedURL;

        let client = new Client();
        await client.connect({ host, port, username, password });
        await client.delete(`${directoryName}/${subdirectoryName}/${file}`);
        console.log("File deleted successfully.", `${directoryName}/${subdirectoryName}/${file}`);
        if (subdirectoryName) {
            try {
                const files = await client.list(`${directoryName}/${subdirectoryName}`);
                if (!files.some(e => e.startsWith("conn."))) {
                    console.log(`Removing directory ${directoryName}/${subdirectoryName} as no files found with name starting with conn.`, Date());
                    await client.rmdir(`${directoryName}/${subdirectoryName}`, true);
                }
            }
            catch (err) {
                console.log("Function Name - deleteFilefromSFTP", Date(), err);
            }
        }
    } catch (error) {
        console.log("Function Name - deleteFilefromSFTP", Date(), error);
    }
}
export const uploadFileFromLocalToSFTP = async (directoryName, localFilePath) => {
    console.log("uploadFileFromLocalToSFTP", directoryName, localFilePath)
    const parsedURL = new URL(process.env.SFTP_URL);
    const port = process.env.SFTPport;
    const { host, username, password } = parsedURL;
    let client = new SFTPClient();

    try {
        await client.connect({ host, port, username, password });

        await client.uploadFile(localFilePath, `${directoryName}/${path.basename(localFilePath)}`);
        console.log("File uploaded successfully", `${directoryName}/${path.basename(localFilePath)}`);
    } catch (error) {
        console.log("Function Name - uploadFileFromLocalToSFTP", Date(), error);
    }
}
export const downloadFilesFromSFTPwithSubdirectory = async (sftppath, localFilePath) => {
    let client = new Client();
    const parsedURL = new URL(process.env.SFTP_URL);
    const port = process.env.SFTPport;
    const { host, username, password } = parsedURL;
    try {
        await client.connect({ host, port, username, password });
        let fileObjects;
        try {
            fileObjects = await client.list(sftppath);
        } catch (err) {
            console.log("Function Name - SFTPClient-disconnect ", Date(), err);
        }
        for (const file of fileObjects) {
            if (file.type === 'd') {
                //console.log(`${new Date(file.modifyTime).toISOString()} Directory found with ${file.name}`);
                var subdirFileObjects = await client.list(`${sftppath}/${file.name}`)
                if (!subdirFileObjects || subdirFileObjects.length <= 0 || !subdirFileObjects.some(e => e.name.startsWith("conn."))) {
                    console.log("Deleting directory has o conn files;", file.name)
                    await client.rmdir(sftppath + "/" + file.name, true);
                }
                else {
                    console.log("Diretory files;", subdirFileObjects)
                }
                for (const subdirFile of subdirFileObjects) {
                    if (subdirFile.name.startsWith("conn.")) {
                        var dir = `${localFilePath}/${file.name}/`;
                        console.log("prepare the folders if doesn't exists. ", dir)
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }
                        await client.fastGet(`${sftppath}/${file.name}/${subdirFile.name}`, `${dir}/${subdirFile.name}`);
                    }
                }
                continue;
            } else {
                console.log(`${new Date(file.modifyTime).toISOString()} ${file.size} ${file.name}`);
                await client.fastGet(`${sftppath}/${file.name}`, `${dir}/${file.name}`);
            }
        }
        client.end();
    }
    catch (error) {
        console.log("Function Name - downloadFilesFromSFTPwithSubdirectory", Date(), error);
    }
}
export const uploadFilesToSFTPwithSubdirectory = async (sftprootPath, localFilePath, subdirectoryName, fileName) => {
    let client = new Client();
    const parsedURL = new URL(process.env.SFTP_URL);
    const port = process.env.SFTPport;
    const { host, username, password } = parsedURL;
    try {
        await client.connect({ host, port, username, password });
        try {
            var response = await client.list(`${sftprootPath}/${subdirectoryName}`)
        }
        catch (err) {
            await client.mkdir(`${sftprootPath}/${subdirectoryName}`)
        }
        const files = await client.put(localFilePath, `${sftprootPath}/${subdirectoryName}/${fileName}`);
        client.end();
    } catch (error) {
        console.log("Function Name - uploadFilesToSFTP", Date(), error);
    }
}

